require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./config/db');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors({
    origin: ['http://localhost:8443', 'http://localhost:5173', 'https://classsync-portal.vercel.app'],
    credentials: true 
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err, null);
  }
});

// --- EMAIL TRANSPORTER SETUP ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- UPLOADS FOLDER & MULTER SETUP FOR PROFILE PICTURES ---
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, 'user_' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- GOOGLE STRATEGY ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL || "https://classsync-portal-production.up.railway.app/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      const [existingUsers] = await db.query(
        'SELECT * FROM users WHERE provider = ? AND provider_id = ?', 
        ['google', profile.id]
      );

      if (existingUsers.length > 0) {
        return done(null, existingUsers[0]);
      }

      const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

      const [result] = await db.query(
        'INSERT INTO users (name, email, provider, provider_id, is_verified) VALUES (?, ?, ?, ?, ?)',
        [profile.displayName, email, 'google', profile.id, true]
      );
      
      const newUser = { id: result.insertId, name: profile.displayName, email: email };
      return done(null, newUser);
    } catch (error) {
      return done(error, null);
    }
  }
));

// --- MANUAL REGISTRATION API ---
app.post('/auth/register', async (req, res) => {
  const { fullName, email, tntNo, password, semester, section } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists. Please login.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await db.query(
      'INSERT INTO users (name, email, tnt_no, password, semester, section, provider, otp, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [fullName, email, tntNo, hashedPassword, semester, section, 'manual', otp, false]
    );

    const mailOptions = {
      from: `"ClassSync Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your ClassSync Verification Code',
      text: `Hello ${fullName},\n\nYour Verification Code is: ${otp}`,
      html: `<h3>Hello ${fullName},</h3><p>Your Verification Code is: <b style="font-size:20px; color:#007782;">${otp}</b></p>`
    };
    
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Registration successful. OTP sent to email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database or Email sending error' });
  }
});

// --- OTP VERIFICATION API ---
app.post('/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ? AND otp = ?', [email, otp]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP code.' });
    }

    await db.query('UPDATE users SET is_verified = TRUE, otp = NULL WHERE email = ?', [email]);
    res.status(200).json({ message: 'Account successfully verified!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification error' });
  }
});

// --- MANUAL LOGIN API ---
app.post('/auth/login', async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ? OR tnt_no = ?', [identifier, identifier]);
    
    if (users.length === 0) {
      return res.status(400).json({ error: 'User not found. Please register first.' });
    }

    const user = users[0];
    
    if (!user.password) {
      return res.status(400).json({ error: 'This account was created with Google. Please "Sign in with Google".' });
    }

    if (!user.is_verified) {
      return res.status(400).json({ error: 'Please verify your email first.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.SESSION_SECRET, { expiresIn: '1d' });
    res.status(200).json({ 
        message: 'Login successful', 
        token, 
        user: { 
          id: user.id,
          name: user.name, 
          email: user.email, 
          tnt_no: user.tnt_no || "TNT-2464",
          semester: user.semester || "Semester 4",
          section: user.section || "B",
          major: user.major || null,
          phone: user.phone || "Not provided",
          address: user.address || "Not provided",
          bio: user.bio || "Not provided",
          avatarUrl: user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
        } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- UPDATE PROFILE API ---
app.post('/auth/update-profile', async (req, res) => {
  const { userId, name, studentId, semester, section, major, phone, address, bio } = req.body;
  try {
    const parsedUserId = Number(userId);
    if (!parsedUserId || isNaN(parsedUserId)) {
      return res.status(400).json({ error: 'Invalid User ID' });
    }

    await db.query(
      'UPDATE users SET name = ?, tnt_no = ?, semester = ?, section = ?, major = ?, phone = ?, address = ?, bio = ? WHERE id = ?',
      [
        name, 
        studentId, 
        semester, 
        section, 
        major || null, 
        phone === 'Not provided' || !phone ? null : phone, 
        address === 'Not provided' || !address ? null : address, 
        bio === 'Not provided' || !bio ? null : bio, 
        parsedUserId
      ]
    );
    res.status(200).json({ message: 'Profile updated successfully in database' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// --- PROFILE PICTURE UPLOAD API ---
app.post('/auth/upload-avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.body.userId;
    const backendUrl = process.env.BACKEND_URL || 'https://classsync-portal-production.up.railway.app';
    const avatarUrl = `${backendUrl}/uploads/${req.file.filename}`;

    await db.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, userId]);

    res.status(200).json({ 
      message: 'Profile picture uploaded successfully', 
      avatarUrl 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database or upload error' });
  }
});

// --- GOOGLE AUTHENTICATION API ---
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: 'https://classsync-portal.vercel.app/login' }),
  function(req, res) {
    res.redirect('https://classsync-portal.vercel.app/dashboard');
  }
);

app.get('/', (req, res) => {
    res.send("Backend is running!");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});