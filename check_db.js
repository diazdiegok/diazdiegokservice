import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'server', 'db', 'diazdiegok.db'));
const products = db.prepare('SELECT COUNT(*) as count FROM products').get();
const categories = db.prepare('SELECT COUNT(*) as count FROM categories').get();
const users = db.prepare('SELECT COUNT(*) as count FROM users').get();
const admins = db.prepare("SELECT email FROM users WHERE role = 'admin'").all();

console.log(`Categories: ${categories.count}`);
console.log(`Products: ${products.count}`);
console.log(`Users: ${users.count}`);
console.log(`Admins: ${JSON.stringify(admins)}`);

if (products.count === 0) {
    console.log('Forcing seed...');
    const seedSql = fs.readFileSync(path.join(__dirname, 'server', 'db', 'seed.sql'), 'utf-8');
    db.exec(seedSql);
    console.log('Seed executed.');
}
