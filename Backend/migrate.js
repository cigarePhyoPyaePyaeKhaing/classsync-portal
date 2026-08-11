const db = require('./db');

async function hasColumn(table, column) {
  const [rows] = await db.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
  return rows.length > 0;
}

async function addColumnIfMissing(table, column, definition) {
  if (!await hasColumn(table, column)) await db.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
}

async function migrate() {
  await db.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE,
    tnt_no VARCHAR(50) UNIQUE, password VARCHAR(255), semester VARCHAR(50), section VARCHAR(50),
    major VARCHAR(100), phone VARCHAR(50), address TEXT, bio TEXT, avatar_url TEXT,
    provider VARCHAR(50) DEFAULT 'manual', provider_id VARCHAR(255), otp VARCHAR(10),
    is_verified BOOLEAN DEFAULT FALSE, role ENUM('student','cr') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`);
  await addColumnIfMissing('users', 'role', "ENUM('student','cr') NOT NULL DEFAULT 'student'");
  await db.query(`CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY, code VARCHAR(40) NOT NULL, name VARCHAR(255) NOT NULL,
    description TEXT, lecturer VARCHAR(255), room VARCHAR(80), semester VARCHAR(50) NOT NULL,
    section VARCHAR(50) NOT NULL, created_by INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY subject_scope (code,semester,section), FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`);
  await db.query(`CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, body TEXT NOT NULL,
    category VARCHAR(30) NOT NULL DEFAULT 'General', subject_id INT NULL, semester VARCHAR(50) NOT NULL,
    section VARCHAR(50) NOT NULL, is_urgent BOOLEAN NOT NULL DEFAULT FALSE, is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    author_id INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL, FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`);
  await db.query(`CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT, subject_id INT NULL,
    semester VARCHAR(50) NOT NULL, section VARCHAR(50) NOT NULL, due_at DATETIME NOT NULL,
    priority ENUM('High','Medium','Low') NOT NULL DEFAULT 'Medium', created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`);
  await db.query(`CREATE TABLE IF NOT EXISTS assignment_submissions (
    assignment_id INT NOT NULL, student_id INT NOT NULL, submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    grade DECIMAL(5,2) NULL, feedback TEXT, PRIMARY KEY (assignment_id,student_id),
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE, FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`);
  await db.query(`CREATE TABLE IF NOT EXISTS calendar_events (
    id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT,
    category VARCHAR(30) NOT NULL DEFAULT 'Event', event_date DATE NOT NULL, event_time TIME NULL,
    semester VARCHAR(50) NOT NULL, section VARCHAR(50) NOT NULL, created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`);
  await db.query(`CREATE TABLE IF NOT EXISTS attendance_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY, subject_id INT NOT NULL, session_date DATE NOT NULL,
    semester VARCHAR(50) NOT NULL, section VARCHAR(50) NOT NULL, created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY attendance_scope (subject_id,session_date,semester,section),
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE, FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`);
  await db.query(`CREATE TABLE IF NOT EXISTS attendance_records (
    session_id INT NOT NULL, student_id INT NOT NULL, status ENUM('present','absent','late') NOT NULL,
    PRIMARY KEY (session_id,student_id), FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`);
  await db.query(`CREATE TABLE IF NOT EXISTS discussion_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, scope ENUM('section','semester') NOT NULL,
    semester VARCHAR(50) NOT NULL, section VARCHAR(50) NULL, sender_id INT NOT NULL,
    body VARCHAR(1000) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX discussion_channel (scope,semester,section,id), FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`);
  console.log('ClassSync database migration completed.');
}

migrate().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
