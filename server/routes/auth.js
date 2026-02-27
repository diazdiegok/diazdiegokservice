import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }), (req, res) => {
    const user = req.user;
    const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
    res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
});

// Facebook Auth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }), (req, res) => {
    const user = req.user;
    const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
    res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
});

// Register
router.post('/register', (req, res) => {
    try {
        const { name, email, password, phone, address, city } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Check existing user
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) {
            return res.status(400).json({ error: 'Ya existe una cuenta con este email' });
        }

        const hash = bcrypt.hashSync(password, 10);
        const result = db.prepare(
            'INSERT INTO users (name, email, password_hash, phone, address, city) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(name, email, hash, phone || null, address || null, city || null);

        const token = jwt.sign(
            { id: result.lastInsertRowid, email, name, role: 'customer' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: { id: result.lastInsertRowid, name, email, phone, role: 'customer' }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// Login
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        const valid = bcrypt.compareSync(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                city: user.city,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// Get current user profile
router.get('/me', authenticateToken, (req, res) => {
    try {
        const user = db.prepare('SELECT id, name, email, phone, address, city, role, created_at FROM users WHERE id = ?').get(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
});

// Update profile
router.put('/me', authenticateToken, (req, res) => {
    try {
        const { name, phone, address, city } = req.body;
        db.prepare(
            'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address), city = COALESCE(?, city) WHERE id = ?'
        ).run(name, phone, address, city, req.user.id);

        const user = db.prepare('SELECT id, name, email, phone, address, city, role FROM users WHERE id = ?').get(req.user.id);
        res.json(user);
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Error al actualizar perfil' });
    }
});

export default router;
