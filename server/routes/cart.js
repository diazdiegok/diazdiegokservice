import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get cart items
router.get('/', authenticateToken, (req, res) => {
    try {
        const items = db.prepare(`
      SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image_url, p.stock,
             c.name as category_name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `).all(req.user.id);

        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        res.json({ items, total, count: items.length });
    } catch (err) {
        console.error('Get cart error:', err);
        res.status(500).json({ error: 'Error al obtener carrito' });
    }
});

// Add to cart
router.post('/', authenticateToken, (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;

        if (!product_id) {
            return res.status(400).json({ error: 'ID de producto requerido' });
        }

        // Check product exists and has stock
        const product = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1').get(product_id);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        if (product.stock < quantity) {
            return res.status(400).json({ error: 'Stock insuficiente' });
        }

        // Check if already in cart
        const existing = db.prepare('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?').get(req.user.id, product_id);

        if (existing) {
            const newQty = existing.quantity + quantity;
            if (newQty > product.stock) {
                return res.status(400).json({ error: 'No hay suficiente stock disponible' });
            }
            db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existing.id);
        } else {
            db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)').run(req.user.id, product_id, quantity);
        }

        // Return updated cart
        const items = db.prepare(`
      SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image_url, p.stock
      FROM cart_items ci JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(req.user.id);
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        res.json({ items, total, count: items.length });
    } catch (err) {
        console.error('Add to cart error:', err);
        res.status(500).json({ error: 'Error al agregar al carrito' });
    }
});

// Update cart item quantity
router.put('/:id', authenticateToken, (req, res) => {
    try {
        const { quantity } = req.body;
        const item = db.prepare('SELECT ci.*, p.stock FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = ? AND ci.user_id = ?').get(req.params.id, req.user.id);

        if (!item) {
            return res.status(404).json({ error: 'Item no encontrado en el carrito' });
        }

        if (quantity <= 0) {
            db.prepare('DELETE FROM cart_items WHERE id = ?').run(req.params.id);
        } else {
            if (quantity > item.stock) {
                return res.status(400).json({ error: 'Stock insuficiente' });
            }
            db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, req.params.id);
        }

        const items = db.prepare(`
      SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image_url, p.stock
      FROM cart_items ci JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(req.user.id);
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        res.json({ items, total, count: items.length });
    } catch (err) {
        console.error('Update cart error:', err);
        res.status(500).json({ error: 'Error al actualizar carrito' });
    }
});

// Remove from cart
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);

        const items = db.prepare(`
      SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image_url, p.stock
      FROM cart_items ci JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(req.user.id);
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        res.json({ items, total, count: items.length });
    } catch (err) {
        console.error('Remove from cart error:', err);
        res.status(500).json({ error: 'Error al eliminar del carrito' });
    }
});

// Clear cart
router.delete('/', authenticateToken, (req, res) => {
    try {
        db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
        res.json({ items: [], total: 0, count: 0 });
    } catch (err) {
        console.error('Clear cart error:', err);
        res.status(500).json({ error: 'Error al vaciar carrito' });
    }
});

export default router;
