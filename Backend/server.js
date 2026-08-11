const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cors = require('cors');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const db = require('./db'); // Assumes db.js exports your mysql connection pool

require('dotenv').config();

const app = express();

// Trust proxy for secure cookies on cloud platforms like Railway
app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173', 
    'https://classsync-portal-production.up.railway.app'
  ],
  credentials: true
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Nodemailer transporter for OTP/Email features
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Passport Google Strategy Configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL || "https://classsync-portal-production.up.railway.app/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0].value;
      const name = profile.displayName;

      if (!email) {
        return done(new Error("No email found in Google profile"), null);
      }

      // Check if user already exists
      const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
      
      if (rows.length > 0) {
        return done(null, rows[0]);
      } else {
        // Create new user if not exists
        const [result] = await db.execute(
          'INSERT INTO users (name, email, is_verified) VALUES (?, ?, ?)',
          [name, email, true]
        );
        const [newUser] = await db.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
        return done(null, newUser[0]);
      }
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err, null);
  }
});

// Routes
app.get('/', (req, res) => {
  res.send('ClassSync Backend Server is Running Successfully!');
});

// Google Auth Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to frontend dashboard/home
    res.redirect(`${process.env.BACKEND_URL || 'https://classsync-portal-production.up.railway.app'}/dashboard`);
  }
);

// Basic Health Check / Test Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Dynamic Port Assignment for Railway / Cloud deployment
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running smoothly on port ${PORT}`);
});