import express from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import db from '../database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Create MercadoPago preference for an order (Supports guests)
router.post('/create-preference', optionalAuth, (req, res) => {
    try {
        const { order_id } = req.body;
        const userId = req.user ? req.user.id : null;

        const order = userId
            ? db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(order_id, userId)
            : db.prepare('SELECT * FROM orders WHERE id = ? AND user_id IS NULL').get(order_id);

        if (!order) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        const items = db.prepare(`
      SELECT oi.*, p.name, p.description, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(order_id);

        // Configure MercadoPago
        const client = new MercadoPagoConfig({
            accessToken: process.env.MP_ACCESS_TOKEN
        });

        const preference = new Preference(client);

        const isLocal = (process.env.FRONTEND_URL || '').includes('localhost');

        const preferenceData = {
            items: items.map(item => ({
                id: String(item.product_id),
                title: item.name,
                description: item.description || item.name,
                picture_url: item.image_url,
                quantity: item.quantity,
                unit_price: item.price / 100, // Convert centavos to pesos
                currency_id: 'ARS'
            })),
            back_urls: {
                success: `${process.env.FRONTEND_URL}/checkout/success?order_id=${order_id}`,
                failure: `${process.env.FRONTEND_URL}/checkout/failure?order_id=${order_id}`,
                pending: `${process.env.FRONTEND_URL}/checkout/pending?order_id=${order_id}`
            },
            auto_return: isLocal ? undefined : 'approved',
            external_reference: String(order_id),
            notification_url: (isLocal || !process.env.BACKEND_URL || process.env.BACKEND_URL.includes('localhost'))
                ? undefined
                : `${process.env.BACKEND_URL}/api/payments/webhook`,
            statement_descriptor: 'DiazDiegokService',
            payer: {
                name: order.shipping_name,
                email: order.shipping_email || (req.user ? req.user.email : null)
            }
        };

        preference.create({ body: preferenceData })
            .then(response => {
                // Update order with payment preference id
                db.prepare('UPDATE orders SET payment_id = ? WHERE id = ?').run(response.id, order_id);

                res.json({
                    id: response.id,
                    init_point: response.init_point,
                    sandbox_init_point: response.sandbox_init_point
                });
            })
            .catch(err => {
                console.error('MercadoPago error:', err);
                res.status(500).json({
                    error: 'Error al crear preferencia de pago',
                    details: 'Verifica tus credenciales de MercadoPago en el archivo .env'
                });
            });
    } catch (err) {
        console.error('Create preference error:', err);
        res.status(500).json({ error: 'Error al procesar pago' });
    }
});

// MercadoPago webhook
router.post('/webhook', (req, res) => {
    try {
        const { type, data } = req.body;

        if (type === 'payment') {
            const client = new MercadoPagoConfig({
                accessToken: process.env.MP_ACCESS_TOKEN
            });

            // Get payment info from MercadoPago
            fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
                headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
            })
                .then(r => r.json())
                .then(payment => {
                    const orderId = payment.external_reference;
                    const status = payment.status === 'approved' ? 'approved' : payment.status;

                    db.prepare('UPDATE orders SET payment_status = ?, status = CASE WHEN ? = \'approved\' THEN \'approved\' ELSE status END WHERE id = ?')
                        .run(status, status, orderId);

                    console.log(`Payment ${data.id} for order ${orderId}: ${status}`);
                })
                .catch(err => console.error('Webhook processing error:', err));
        }

        res.sendStatus(200);
    } catch (err) {
        console.error('Webhook error:', err);
        res.sendStatus(200); // Always respond 200 to webhooks
    }
});

export default router;
