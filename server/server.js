import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

import { initializeDatabase } from './database.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import repairRoutes from './routes/repairs.js';
import passport from './utils/passport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: false, // Allow loading images from cross-origin if needed
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Further increased for dashboard parallel requests
    skip: (req) => req.method === 'OPTIONS', // Skip OPTIONS to avoid CORS preflight blockers
    message: { error: 'Demasiadas peticiones desde esta IP, por favor intentá de nuevo más tarde.' }
});

// Apply limiter to all requests
app.use('/api/', limiter);

// More strict limiter for Auth
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // Increased to 30 for testing/dev environments
    message: { error: 'Demasiados intentos de inicio de sesión. Por seguridad, intentá de nuevo en una hora.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Initialize Passport
app.use(passport.initialize());

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for product images
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/repairs', repairRoutes); // Technical repairs management

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'DiazDiegokService API running' });
});

// Global Error Handler (prevent information leakage)
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.stack);
    res.status(500).json({
        error: 'Algo salió mal en el servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
    });
});

// Initialize database and start server
initializeDatabase();

app.listen(PORT, () => {
    console.log(`🚀 DiazDiegokService API running on http://localhost:${PORT}`);
    console.log(`📦 Database initialized`);
});
