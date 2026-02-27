import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'server', 'db', 'diazdiegok.db'));

const products = db.prepare('SELECT id, name, image_url FROM products').all();
console.log(JSON.stringify(products, null, 2));

db.close();
