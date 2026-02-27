import express from 'express';
import db from '../database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { sendOrderConfirmation } from '../utils/mailer.js';

const router = express.Router();

// Create order from cart (Supports both users and guests)
router.post('/', optionalAuth, (req, res) => {
    try {
        const { items: bodyItems, shipping_name, shipping_address, shipping_city, shipping_phone, shipping_email, notes, payment_method } = req.body;
        const userId = req.user ? req.user.id : null;

        let cartItems = [];

        if (userId) {
            // Get cart items from DB for logged-in user
            cartItems = db.prepare(`
          SELECT ci.*, p.price, p.name, p.stock
          FROM cart_items ci
          JOIN products p ON ci.product_id = p.id
          WHERE ci.user_id = ?
        `).all(userId);
        } else {
            // Use items from request body for guest
            if (!bodyItems || bodyItems.length === 0) {
                return res.status(400).json({ error: 'El carrito está vacío' });
            }

            // Validate and fetch current prices/stock from DB for security
            for (const item of bodyItems) {
                const product = db.prepare('SELECT id, name, price, stock FROM products WHERE id = ?').get(item.product_id || item.id);
                if (!product) continue;
                cartItems.push({
                    product_id: product.id,
                    name: product.name,
                    price: product.price,
                    stock: product.stock,
                    quantity: item.quantity
                });
            }
        }

        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'El carrito está vacío' });
        }

        // Validate stock
        for (const item of cartItems) {
            if (item.quantity > item.stock) {
                return res.status(400).json({ error: `Stock insuficiente para ${item.name}` });
            }
        }

        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        console.log('DEBUG: Creating order for userId:', userId);
        console.log('DEBUG: Body items counts:', bodyItems ? bodyItems.length : 0);
        console.log('DEBUG: Total:', total);
        console.log('DEBUG: Email:', shipping_email);
        console.log('DEBUG: Params:', [userId, total, shipping_name, shipping_address, shipping_city, shipping_phone, shipping_email, notes || null]);

        // Create order in transaction
        const createOrder = db.transaction(() => {
            const orderResult = db.prepare(`
        INSERT INTO orders (user_id, total, status, shipping_name, shipping_address, shipping_city, shipping_phone, shipping_email, notes, payment_status, payment_method)
        VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, 'pending', ?)
      `).run(userId, total, shipping_name, shipping_address, shipping_city, shipping_phone, shipping_email, notes || null, payment_method || 'mercadopago');

            const orderId = orderResult.lastInsertRowid;

            // Create order items and update stock
            for (const item of cartItems) {
                db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)').run(orderId, item.product_id, item.quantity, item.price);
                db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.product_id);
            }

            if (userId) {
                // Clear cart in DB for user
                db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
            }

            return orderId;
        });

        const orderId = createOrder();

        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
        // Add shipping_email temporarily for the mailer if guest
        if (!userId) order.shipping_email = shipping_email;

        const items = db.prepare(`
      SELECT oi.*, p.name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(orderId);

        // Send email to guest
        if (!userId && shipping_email) {
            sendOrderConfirmation(order, items);
        }

        res.status(201).json({ ...order, items });
    } catch (err) {
        console.error('Create order error stack:', err.stack);
        console.error('Create order error message:', err.message);
        res.status(500).json({ error: 'Error al crear pedido' });
    }
});

// Get user orders
router.get('/', authenticateToken, (req, res) => {
    try {
        const orders = db.prepare(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.user.id);

        for (const order of orders) {
            order.items = db.prepare(`
        SELECT oi.*, p.name, p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).all(order.id);
        }

        res.json(orders);
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
});

// Get single order
router.get('/:id', authenticateToken, (req, res) => {
    try {
        const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
        if (!order) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        order.items = db.prepare(`
      SELECT oi.*, p.name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(order.id);

        res.json(order);
    } catch (err) {
        console.error('Get order error:', err);
        res.status(500).json({ error: 'Error al obtener pedido' });
    }
});

// Get all orders (admin)
router.get('/admin/all', authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado' });
        }

        const orders = db.prepare(`
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `).all();

        for (const order of orders) {
            order.items = db.prepare(`
        SELECT oi.*, p.name, p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).all(order.id);
        }

        res.json(orders);
    } catch (err) {
        console.error('Get all orders error:', err);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
});

// Update order status (admin)
router.put('/:id/status', authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado' });
        }

        const { status } = req.body;
        const validStatuses = ['pending', 'approved', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Estado inválido' });
        }

        db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
        res.json(order);
    } catch (err) {
        console.error('Update order status error:', err);
        res.status(500).json({ error: 'Error al actualizar estado del pedido' });
    }
});

// Mark order as paid (admin) — for offline payments (transferencia, efectivo)
router.put('/:id/payment-status', authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado' });
        }

        const { payment_status } = req.body;
        const validPaymentStatuses = ['pending', 'approved', 'rejected', 'refunded'];
        if (!validPaymentStatuses.includes(payment_status)) {
            return res.status(400).json({ error: 'Estado de pago inválido' });
        }

        // If marking as paid, also move order status to approved if still pending
        if (payment_status === 'approved') {
            db.prepare(`
                UPDATE orders SET payment_status = ?,
                status = CASE WHEN status = 'pending' THEN 'approved' ELSE status END
                WHERE id = ?
            `).run(payment_status, req.params.id);
        } else {
            db.prepare('UPDATE orders SET payment_status = ? WHERE id = ?').run(payment_status, req.params.id);
        }

        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
        res.json(order);
    } catch (err) {
        console.error('Update payment status error:', err);
        res.status(500).json({ error: 'Error al actualizar estado de pago' });
    }
});

// Public: Track order by ID and Email
router.get('/track/:id', (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ error: 'Se requiere el email para el rastreo' });
        }

        const order = db.prepare('SELECT * FROM orders WHERE id = ? AND (shipping_email = ? OR (SELECT email FROM users WHERE id = orders.user_id) = ?)').get(req.params.id, email, email);

        if (!order) {
            return res.status(404).json({ error: 'Pedido no encontrado o los datos no coinciden' });
        }

        order.items = db.prepare(`
            SELECT oi.*, p.name, p.image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `).all(order.id);

        res.json(order);
    } catch (err) {
        console.error('Track order error:', err);
        res.status(500).json({ error: 'Error al rastrear pedido' });
    }
});

export default router;
