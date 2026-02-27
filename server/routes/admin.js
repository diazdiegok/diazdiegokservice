import express from 'express';
import db from '../database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get overall dashboard stats
router.get('/stats', authenticateToken, requireAdmin, (req, res) => {
    try {
        // Total Revenue (approved orders)
        const revenue = db.prepare(`
            SELECT SUM(total) as total
            FROM orders
            WHERE status != 'cancelled'
        `).get();

        // Total Orders
        const ordersCount = db.prepare('SELECT COUNT(*) as count FROM orders').get();

        // Active Products
        const productsCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE active = 1').get();

        // Total Users
        const usersCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get();

        // Pending Orders
        const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get();

        res.json({
            revenue: revenue.total || 0,
            orders: ordersCount.count,
            products: productsCount.count,
            users: usersCount.count,
            pendingOrders: pendingOrders.count
        });
    } catch (err) {
        console.error('Admin stats error:', err);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

// Get sales over time (last 7 days)
router.get('/sales-chart', authenticateToken, requireAdmin, (req, res) => {
    try {
        const sales = db.prepare(`
            SELECT date(created_at) as date, SUM(total) as total
            FROM orders
            WHERE created_at >= date('now', '-7 days')
              AND status != 'cancelled'
            GROUP BY date(created_at)
            ORDER BY date ASC
        `).all();

        res.json(sales);
    } catch (err) {
        console.error('Admin sales chart error:', err);
        res.status(500).json({ error: 'Error al obtener datos del gráfico' });
    }
});

// Get top selling products
router.get('/top-products', authenticateToken, requireAdmin, (req, res) => {
    try {
        const topProducts = db.prepare(`
            SELECT p.name, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.price) as total_revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status != 'cancelled'
            GROUP BY p.id
            ORDER BY total_sold DESC
            LIMIT 5
        `).all();

        res.json(topProducts);
    } catch (err) {
        console.error('Admin top products error:', err);
        res.status(500).json({ error: 'Error al obtener productos populares' });
    }
});

export default router;
