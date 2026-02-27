import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'server', 'db', 'diazdiegok.db'));

const mbpUrl = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1024&auto=format&fit=crop';
const updateStmt = db.prepare('UPDATE products SET image_url = ? WHERE name LIKE ?');

const result = updateStmt.run(mbpUrl, '%MacBook Pro%');
console.log(`Updated MacBook Pro: ${result.changes} rows affected`);

db.close();
