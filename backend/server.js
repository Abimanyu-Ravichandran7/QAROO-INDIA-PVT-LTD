import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import mouRoutes from './routes/mouRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import csrRoutes from './routes/csrRoutes.js';
import learningRoutes from './routes/learningRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import clientErrorRoutes from './routes/clientErrorRoutes.js';

const app = express();

connectDB();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});

app.get('/api/health', (req, res) =>
    res.json({ success: true, message: 'Qaroo India Private Limited CMS API is running' })
);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/mous', mouRoutes);
app.use('/api/content', pageRoutes);
app.use('/api/csr', csrRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/client-errors', clientErrorRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Qaroo India Private Limited CMS backend running on http://localhost:${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
  server.close(() => process.exit(1));
});
