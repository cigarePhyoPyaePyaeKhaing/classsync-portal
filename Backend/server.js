const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require('./db');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://classsync-portal.vercel.app').replace(/\/$/, '');
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;

if (process.env.NODE_ENV === 'production' && !JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production.');
}

const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:5173',
  FRONTEND_URL,
  ...(process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean),
]);

app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(passport.initialize());

const transporter = process.env.EMAIL_USER && process.env.EMAIL_PASS
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    })
  : null;

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    tntNo: user.tnt_no,
    semester: user.semester,
    section: user.section,
    major: user.major,
    phone: user.phone,
    address: user.address,
    bio: user.bio,
    avatarUrl: user.avatar_url,
    role: 'student',
  };
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET || 'development-only-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
}

function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  try {
    req.auth = jwt.verify(token, JWT_SECRET || 'development-only-secret');
    return next();
  } catch {
    return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }
}

function validPassword(password) {
  return typeof password === 'string'
    && password.length >= 8
    && /[A-Z]/.test(password)
    && /[a-z]/.test(password)
    && /\d/.test(password)
    && /[^A-Za-z0-9]/.test(password);
}

async function sendOtp(email, otp) {
  if (!transporter) throw new Error('Email delivery is not configured.');
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your ClassSync verification code',
    text: `Your ClassSync verification code is ${otp}. It expires when you request another code.`,
  });
}

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.BACKEND_URL || `http://localhost:${PORT}`}/auth/google/callback`,
}, async (_accessToken, _refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value?.toLowerCase();
    if (!email) return done(new Error('Google did not return an email address.'));

    const [existing] = await db.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length) {
      await db.execute(
        'UPDATE users SET provider = ?, provider_id = ?, is_verified = TRUE WHERE id = ?',
        ['google', profile.id, existing[0].id],
      );
      return done(null, { ...existing[0], provider: 'google', provider_id: profile.id, is_verified: true });
    }

    const [result] = await db.execute(
      'INSERT INTO users (name, email, provider, provider_id, is_verified) VALUES (?, ?, ?, ?, TRUE)',
      [profile.displayName || email, email, 'google', profile.id],
    );
    const [created] = await db.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
    return done(null, created[0]);
  } catch (error) {
    return done(error);
  }
}));

app.get('/', (_req, res) => res.json({ name: 'ClassSync API', status: 'ok' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.post('/auth/register', async (req, res, next) => {
  try {
    const { fullName, email, tntNo, password, semester, section } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!fullName?.trim() || !normalizedEmail || !tntNo?.trim() || !validPassword(password)) {
      return res.status(400).json({ error: 'Provide a name, email, TNT number, and a strong password.' });
    }
    if (!transporter) return res.status(503).json({ error: 'Email verification is not configured yet.' });

    const [matches] = await db.execute('SELECT id FROM users WHERE email = ? OR tnt_no = ? LIMIT 1', [normalizedEmail, tntNo.trim()]);
    if (matches.length) return res.status(409).json({ error: 'An account already uses this email or TNT number.' });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const passwordHash = await bcrypt.hash(password, 12);
    await db.execute(
      'INSERT INTO users (name, email, tnt_no, password, semester, section, otp, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)',
      [fullName.trim(), normalizedEmail, tntNo.trim(), passwordHash, semester || null, section || null, otp],
    );
    await sendOtp(normalizedEmail, otp);
    return res.status(201).json({ message: 'Verification code sent.' });
  } catch (error) {
    return next(error);
  }
});

app.post('/auth/verify-otp', async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const otp = String(req.body.otp || '');
    const [result] = await db.execute(
      'UPDATE users SET is_verified = TRUE, otp = NULL WHERE email = ? AND otp = ? AND is_verified = FALSE',
      [email, otp],
    );
    if (!result.affectedRows) return res.status(400).json({ error: 'That verification code is invalid or has already been used.' });
    return res.json({ message: 'Account verified. You can now sign in.' });
  } catch (error) {
    return next(error);
  }
});

app.post('/auth/login', async (req, res, next) => {
  try {
    const identifier = typeof req.body.identifier === 'string' ? req.body.identifier.trim() : '';
    const { password } = req.body;
    const [users] = await db.execute('SELECT * FROM users WHERE email = ? OR tnt_no = ? LIMIT 1', [identifier.toLowerCase(), identifier]);
    const user = users[0];
    if (!user || !user.password || !(await bcrypt.compare(password || '', user.password))) {
      return res.status(401).json({ error: 'Invalid email/TNT number or password.' });
    }
    if (!user.is_verified) return res.status(403).json({ error: 'Verify your email before signing in.' });
    return res.json({ user: publicUser(user), token: signToken(user) });
  } catch (error) {
    return next(error);
  }
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
app.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (error, user) => {
    if (error || !user) return res.redirect(`${FRONTEND_URL}/#auth_error=google`);
    const token = signToken(user);
    return res.redirect(`${FRONTEND_URL}/#auth_token=${encodeURIComponent(token)}`);
  })(req, res, next);
});

app.get('/auth/me', authenticateToken, async (req, res, next) => {
  try {
    const [users] = await db.execute('SELECT * FROM users WHERE id = ? LIMIT 1', [req.auth.sub]);
    if (!users.length) return res.status(401).json({ error: 'Account not found.' });
    return res.json({ user: publicUser(users[0]) });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

app.listen(PORT, '0.0.0.0', () => console.log(`ClassSync API listening on port ${PORT}`));
