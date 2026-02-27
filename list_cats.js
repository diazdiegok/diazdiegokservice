import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'server', 'db', 'diazdiegok.db'));
const categories = db.prepare('SELECT * FROM categories').all();
console.log(JSON.stringify(categories));
