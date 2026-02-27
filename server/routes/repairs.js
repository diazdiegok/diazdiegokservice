import express from 'express';
import db from '../database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Create a new technical repair request
router.post('/', optionalAuth, (req, res) => {
    try {
        const {
            customer_name,
            customer_email,
            customer_phone,
            device_type,
            device_brand,
            device_model,
            issue_description
        } = req.body;

        const userId = req.user ? req.user.id : null;

        if (!customer_name || !customer_email || !device_type || !issue_description) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const result = db.prepare(`
            INSERT INTO service_requests (
                user_id, customer_name, customer_email, customer_phone, 
                device_type, device_brand, device_model, issue_description, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `).run(userId, customer_name, customer_email, customer_phone, device_type, device_brand, device_model, issue_description);

        res.status(201).json({ id: result.lastInsertRowid, message: 'Solicitud recibida' });
    } catch (err) {
        console.error('Create repair request error:', err);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
});

// Admin: Get all repair requests
router.get('/admin/all', authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado' });
        }

        const requests = db.prepare('SELECT * FROM service_requests ORDER BY created_at DESC').all();
        res.json(requests);
    } catch (err) {
        console.error('Get repair requests error:', err);
        res.status(500).json({ error: 'Error al obtener solicitudes' });
    }
});

// Admin: Update repair status
router.put('/:id/status', authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado' });
        }

        const { status } = req.body;
        const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Estado inválido' });
        }

        db.prepare('UPDATE service_requests SET status = ? WHERE id = ?').run(status, req.params.id);
        res.json({ message: 'Estado actualizado' });
    } catch (err) {
        console.error('Update repair status error:', err);
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
});

export default router;
