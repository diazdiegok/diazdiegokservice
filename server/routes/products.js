import express from 'express';
import db from '../database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all products (with optional filters)
router.get('/', (req, res) => {
    try {
        const { category, search, featured, sort, limit, offset } = req.query;
        let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.active = 1
    `;
        const params = [];

        if (category) {
            query += ' AND c.slug = ?';
            params.push(category);
        }

        if (search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (featured === 'true') {
            query += ' AND p.featured = 1';
        }

        // Sorting
        if (sort === 'price_asc') {
            query += ' ORDER BY p.price ASC';
        } else if (sort === 'price_desc') {
            query += ' ORDER BY p.price DESC';
        } else if (sort === 'newest') {
            query += ' ORDER BY p.created_at DESC';
        } else {
            query += ' ORDER BY p.featured DESC, p.created_at DESC';
        }

        if (limit) {
            query += ' LIMIT ?';
            params.push(parseInt(limit));
        }

        if (offset) {
            query += ' OFFSET ?';
            params.push(parseInt(offset));
        }

        const products = db.prepare(query).all(...params);

        // Parse specs JSON
        products.forEach(p => {
            try {
                p.specs = p.specs ? JSON.parse(p.specs) : {};
            } catch { p.specs = {}; }
        });

        res.json(products);
    } catch (err) {
        console.error('Get products error:', err);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// Get single product
router.get('/:id', (req, res) => {
    try {
        const product = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        try {
            product.specs = product.specs ? JSON.parse(product.specs) : {};
        } catch { product.specs = {}; }

        res.json(product);
    } catch (err) {
        console.error('Get product error:', err);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

// Create product (admin only)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { category_id, name, description, price, stock, image_url, specs, featured } = req.body;

        if (!name || !price || !category_id) {
            return res.status(400).json({ error: 'Nombre, precio y categoría son requeridos' });
        }

        const result = db.prepare(`
      INSERT INTO products (category_id, name, description, price, stock, image_url, specs, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            category_id, name, description || '', price, stock || 0,
            image_url || '', typeof specs === 'object' ? JSON.stringify(specs) : specs || '{}',
            featured ? 1 : 0
        );

        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(product);
    } catch (err) {
        console.error('Create product error:', err);
        res.status(500).json({ error: 'Error al crear producto' });
    }
});

// Update product (admin only)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { category_id, name, description, price, stock, image_url, specs, featured, active } = req.body;

        db.prepare(`
      UPDATE products SET
        category_id = COALESCE(?, category_id),
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        stock = COALESCE(?, stock),
        image_url = COALESCE(?, image_url),
        specs = COALESCE(?, specs),
        featured = COALESCE(?, featured),
        active = COALESCE(?, active)
      WHERE id = ?
    `).run(
            category_id, name, description, price, stock, image_url,
            typeof specs === 'object' ? JSON.stringify(specs) : specs,
            featured !== undefined ? (featured ? 1 : 0) : undefined,
            active !== undefined ? (active ? 1 : 0) : undefined,
            req.params.id
        );

        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
        res.json(product);
    } catch (err) {
        console.error('Update product error:', err);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

// Delete product (admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
    try {
        db.prepare('UPDATE products SET active = 0 WHERE id = ?').run(req.params.id);
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (err) {
        console.error('Delete product error:', err);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

// Get all categories
router.get('/categories/all', (req, res) => {
    try {
        const categories = db.prepare('SELECT * FROM categories ORDER BY id').all();
        res.json(categories);
    } catch (err) {
        console.error('Get categories error:', err);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
});

export default router;
