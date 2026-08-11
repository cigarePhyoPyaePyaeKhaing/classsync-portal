const db = require('./config/db');

async function createTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        tnt_no VARCHAR(50),
        password VARCHAR(255),
        semester VARCHAR(50),
        section VARCHAR(50),
        major VARCHAR(100),
        phone VARCHAR(50),
        address TEXT,
        bio TEXT,
        avatar_url TEXT,
        provider VARCHAR(50) DEFAULT 'manual',
        provider_id VARCHAR(255),
        otp VARCHAR(10),
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Users table verified or created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error creating table:", err);
    process.exit(1);
  }
}

createTable();