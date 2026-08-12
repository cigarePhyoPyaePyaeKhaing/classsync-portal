const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const db = require('./db');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://classsync-portal.vercel.app').replace(/\/$/, '');
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;
const liveClients = new Set();
const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, 'uploads'),
    filename: (_req, file, done) => done(null, `user_${Date.now()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, done) => done(null, /^image\/(png|jpe?g|webp)$/.test(file.mimetype)),
});

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(passport.initialize());

const transporter = process.env.EMAIL_USER && process.env.EMAIL_PASS
  ? nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
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
    role: user.role === 'cr' ? 'cr' : 'student',
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

function broadcast(type, payload) {
  const event = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of liveClients) client.write(event);
}

async function currentUser(userId) {
  const [users] = await db.execute('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
  return users[0] || null;
}

function requireCr(req, res, next) {
  currentUser(req.auth.sub).then((user) => {
    if (!user || user.role !== 'cr') return res.status(403).json({ error: 'Class Rep permission is required.' });
    req.currentUser = user;
    return next();
  }).catch(next);
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
  // Brevo uses HTTPS instead of SMTP, so it works on hosts that block outbound
  // SMTP ports (including many Railway deployments).
  if (process.env.BREVO_API_KEY) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: process.env.BREVO_SENDER_NAME || 'ClassSync Portal',
            email: process.env.BREVO_SENDER_EMAIL,
          },
          to: [{ email }],
          subject: 'Your ClassSync verification code',
          textContent: `Your ClassSync verification code is ${otp}. Enter this code to complete registration.`,
          htmlContent: `<p>Your ClassSync verification code is:</p><h1>${otp}</h1><p>Enter this code to complete registration.</p>`,
        }),
      });
      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Brevo API returned ${response.status}: ${details}`);
      }
      return;
    } finally {
      clearTimeout(timeout);
    }
  }
  if (process.env.RESEND_API_KEY) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'classsync-portal/1.0',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'ClassSync <onboarding@resend.dev>',
          to: [email],
          subject: 'Your ClassSync verification code',
          text: `Your ClassSync verification code is ${otp}.`,
          html: `<p>Your ClassSync verification code is:</p><h1>${otp}</h1><p>Enter this code to complete registration.</p>`,
        }),
      });
      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Resend rejected the email (${response.status}): ${details}`);
      }
      return;
    } finally {
      clearTimeout(timeout);
    }
  }
  if (!transporter) throw new Error('Email delivery is not configured. Set BREVO_API_KEY, RESEND_API_KEY, or Gmail SMTP variables.');
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

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const passwordHash = await bcrypt.hash(password, 12);
    const [matches] = await db.execute('SELECT * FROM users WHERE email = ? OR tnt_no = ? LIMIT 1', [normalizedEmail, tntNo.trim()]);
    const existing = matches[0];
    if (existing?.is_verified || (existing && existing.email !== normalizedEmail)) {
      return res.status(409).json({ error: 'An account already uses this email or TNT number.' });
    }

    if (existing) {
      await db.execute('UPDATE users SET name=?, tnt_no=?, password=?, semester=?, section=?, otp=? WHERE id=?',
        [fullName.trim(), tntNo.trim(), passwordHash, semester || null, section || null, otp, existing.id]);
    } else {
      await db.execute('INSERT INTO users (name, email, tnt_no, password, semester, section, otp, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)',
        [fullName.trim(), normalizedEmail, tntNo.trim(), passwordHash, semester || null, section || null, otp]);
    }
    try {
      await sendOtp(normalizedEmail, otp);
      return res.status(existing ? 200 : 201).json({ message: 'Verification code sent.' });
    } catch (mailError) {
      console.error('OTP email failed:', mailError.message);
      return res.status(502).json({ error: 'Could not send the verification email. Please try again shortly.' });
    }
  } catch (error) {
    return next(error);
  }
});

app.post('/auth/resend-otp', async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const [users] = await db.execute('SELECT id FROM users WHERE email = ? AND is_verified = FALSE LIMIT 1', [email]);
    if (!users.length) return res.status(404).json({ error: 'No unverified account was found for this email.' });
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    await db.execute('UPDATE users SET otp = ? WHERE id = ?', [otp, users[0].id]);
    try {
      await sendOtp(email, otp);
      return res.json({ message: 'A new verification code was sent.' });
    } catch (mailError) {
      console.error('OTP resend failed:', mailError.message);
      return res.status(502).json({ error: 'Could not send the verification email. Please try again shortly.' });
    }
  } catch (error) { return next(error); }
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

app.patch('/auth/profile', authenticateToken, async (req, res, next) => {
  try {
    const allowed = ['name', 'semester', 'section', 'major', 'phone', 'address', 'bio'];
    const values = allowed.filter((field) => typeof req.body[field] === 'string').map((field) => [field, req.body[field].trim()]);
    if (!values.length) return res.status(400).json({ error: 'No valid profile fields were supplied.' });
    const set = values.map(([field]) => `\`${field}\` = ?`).join(', ');
    await db.execute(`UPDATE users SET ${set} WHERE id = ?`, [...values.map(([, value]) => value), req.auth.sub]);
    const user = await currentUser(req.auth.sub);
    broadcast('profile.updated', publicUser(user));
    return res.json({ data: publicUser(user) });
  } catch (error) { return next(error); }
});

app.post('/auth/upload-avatar', authenticateToken, upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PNG, JPG, or WEBP image no larger than 2 MB.' });
    const avatarUrl = `${process.env.BACKEND_URL || ''}/uploads/${req.file.filename}`;
    await db.execute('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, req.auth.sub]);
    return res.json({ data: { avatarUrl } });
  } catch (error) { return next(error); }
});

// A fetch-based SSE stream keeps every logged-in browser in sync without a polling loop.
app.get('/api/live', authenticateToken, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write('event: connected\ndata: {}\n\n');
  liveClients.add(res);
  req.on('close', () => liveClients.delete(res));
});

async function scopedUser(req) {
  const user = await currentUser(req.auth.sub);
  if (!user || !user.semester || !user.section) return null;
  return user;
}

app.get('/api/announcements', authenticateToken, async (req, res, next) => {
  try {
    const user = await scopedUser(req);
    if (!user) return res.status(400).json({ error: 'Complete your semester and section in your profile first.' });
    const [items] = await db.execute(`SELECT a.*, u.name AS author_name FROM announcements a JOIN users u ON u.id=a.author_id WHERE a.semester=? AND a.section=? ORDER BY a.is_pinned DESC, a.created_at DESC`, [user.semester, user.section]);
    res.json({ data: items });
  } catch (error) { next(error); }
});

app.post('/api/announcements', authenticateToken, requireCr, async (req, res, next) => {
  try {
    const user = req.currentUser; const title = String(req.body.title || '').trim(); const body = String(req.body.body || '').trim();
    if (!user.semester || !user.section || !title || !body) return res.status(400).json({ error: 'Title, message, semester, and section are required.' });
    const [result] = await db.execute('INSERT INTO announcements (title,body,category,semester,section,is_urgent,is_pinned,author_id) VALUES (?,?,?,?,?,?,?,?)', [title, body, req.body.category || 'General', user.semester, user.section, !!req.body.isUrgent, !!req.body.isPinned, user.id]);
    const [rows] = await db.execute('SELECT a.*, ? AS author_name FROM announcements a WHERE a.id=?', [user.name, result.insertId]);
    broadcast('announcement.created', rows[0]); res.status(201).json({ data: rows[0] });
  } catch (error) { next(error); }
});

app.get('/api/assignments', authenticateToken, async (req, res, next) => {
  try { const user = await scopedUser(req); if (!user) return res.status(400).json({ error: 'Complete your profile scope first.' });
    const [items] = await db.execute(`SELECT a.*, s.submitted_at, s.grade, s.feedback FROM assignments a LEFT JOIN assignment_submissions s ON s.assignment_id=a.id AND s.student_id=? WHERE a.semester=? AND a.section=? ORDER BY a.due_at`, [user.id, user.semester, user.section]);
    res.json({ data: items });
  } catch (error) { next(error); }
});

app.post('/api/assignments/:id/submit', authenticateToken, async (req, res, next) => {
  try { const user = await scopedUser(req); if (!user) return res.status(400).json({ error: 'Complete your profile scope first.' });
    const [items] = await db.execute('SELECT id FROM assignments WHERE id=? AND semester=? AND section=?', [req.params.id, user.semester, user.section]);
    if (!items.length) return res.status(404).json({ error: 'Assignment not found.' });
    await db.execute('INSERT INTO assignment_submissions (assignment_id,student_id) VALUES (?,?) ON DUPLICATE KEY UPDATE submitted_at=CURRENT_TIMESTAMP', [req.params.id, user.id]);
    const data={ assignmentId:Number(req.params.id), studentId:user.id, submittedAt:new Date().toISOString() }; broadcast('assignment.submitted', data); res.json({ data });
  } catch (error) { next(error); }
});

app.get('/api/calendar-events', authenticateToken, async (req, res, next) => {
  try { const user = await scopedUser(req); if (!user) return res.status(400).json({ error: 'Complete your profile scope first.' });
    const [items] = await db.execute('SELECT * FROM calendar_events WHERE semester=? AND section=? ORDER BY event_date,event_time', [user.semester, user.section]); res.json({ data: items });
  } catch (error) { next(error); }
});

app.get('/api/subjects', authenticateToken, async (req, res, next) => {
  try { const user = await scopedUser(req); if (!user) return res.status(400).json({ error: 'Complete your profile scope first.' });
    const [items] = await db.execute('SELECT * FROM subjects WHERE semester=? AND section=? ORDER BY code', [user.semester, user.section]); res.json({ data: items });
  } catch (error) { next(error); }
});

app.get('/api/attendance', authenticateToken, async (req, res, next) => {
  try { const user = await scopedUser(req); if (!user) return res.status(400).json({ error: 'Complete your profile scope first.' });
    const [items] = await db.execute(`SELECT s.id,s.session_date,s.subject_id,r.status FROM attendance_sessions s LEFT JOIN attendance_records r ON r.session_id=s.id AND r.student_id=? WHERE s.semester=? AND s.section=? ORDER BY s.session_date DESC`, [user.id,user.semester,user.section]); res.json({ data: items });
  } catch (error) { next(error); }
});

async function discussionChannel(req) {
  const scope = req.params.scope;
  const semester = String(req.query.semester || req.body.semester || '').trim();
  const section = String(req.query.section || req.body.section || '').trim();
  const user = await currentUser(req.auth.sub);
  if (!user) return { error: 'Account not found.' };
  if (!['section', 'semester'].includes(scope) || !semester || (scope === 'section' && !section)) {
    return { error: 'A valid discussion channel is required.' };
  }
  if (user.semester && user.semester !== semester) return { error: 'You cannot access another semester discussion.' };
  if (scope === 'section' && user.section && user.section !== section) return { error: 'You cannot access another section discussion.' };
  return { scope, semester, section: scope === 'section' ? section : null, user };
}

app.get('/api/discussions/:scope/messages', authenticateToken, async (req, res, next) => {
  try {
    const channel = await discussionChannel(req);
    if (channel.error) return res.status(403).json({ error: channel.error });
    const [messages] = await db.execute(
      `SELECT m.id, m.scope, m.semester, m.section, m.body, m.created_at, u.id AS sender_id, u.name AS sender_name, u.avatar_url
       FROM discussion_messages m JOIN users u ON u.id = m.sender_id
       WHERE m.scope = ? AND m.semester = ? AND (m.section <=> ?) ORDER BY m.id DESC LIMIT 100`,
      [channel.scope, channel.semester, channel.section],
    );
    return res.json({ messages: messages.reverse() });
  } catch (error) { return next(error); }
});

app.post('/api/discussions/:scope/messages', authenticateToken, async (req, res, next) => {
  try {
    const channel = await discussionChannel(req);
    const body = typeof req.body.body === 'string' ? req.body.body.trim() : '';
    if (channel.error) return res.status(403).json({ error: channel.error });
    if (!body || body.length > 1000) return res.status(400).json({ error: 'Message must contain 1 to 1000 characters.' });
    const [result] = await db.execute(
      'INSERT INTO discussion_messages (scope, semester, section, sender_id, body) VALUES (?, ?, ?, ?, ?)',
      [channel.scope, channel.semester, channel.section, channel.user.id, body],
    );
    const message = { id: result.insertId, scope: channel.scope, semester: channel.semester, section: channel.section,
      body, created_at: new Date().toISOString(), sender_id: channel.user.id, sender_name: channel.user.name, avatar_url: channel.user.avatar_url };
    broadcast('discussion.message', message);
    return res.status(201).json({ message });
  } catch (error) { return next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

app.listen(PORT, '0.0.0.0', () => console.log(`ClassSync API listening on port ${PORT}`));
