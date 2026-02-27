import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'db', 'diazdiegok.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initializeDatabase() {
  const schemaPath = path.join(__dirname, 'db', 'schema.sql');
  const seedPath = path.join(__dirname, 'db', 'seed.sql');

  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);

  // Migrations for existing databases
  const migrations = [
    "ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'mercadopago'",
    "CREATE TABLE IF NOT EXISTS service_requests (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, customer_name TEXT NOT NULL, customer_email TEXT NOT NULL, customer_phone TEXT, device_type TEXT NOT NULL, device_brand TEXT, device_model TEXT, issue_description TEXT NOT NULL, status TEXT DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users (id))"
  ];
  for (const migration of migrations) {
    try { db.exec(migration); } catch (_) { /* Column already exists, skip */ }
  }

  // Check if seed data is needed
  const count = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (count.count === 0) {
    const seed = fs.readFileSync(seedPath, 'utf-8');
    db.exec(seed);

    // Fix admin password hash
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(hash, 'diazdiegonicok@gmail.com');
    console.log('Database seeded successfully!');
  }
}

export default db;
