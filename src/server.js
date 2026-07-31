const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const rateLimit = require('express-rate-limit');

// Initialize environment
dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.use(cors());

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,  // 100 requests per hour for public endpoints
  message: 'Too many requests, please try again later.'
});
app.use('/api/v1', limiter);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.use('/api/v1', require('./routes/v1'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/b2b', require('./middleware/authApiKey'), require('./routes/b2b'));
app.use('/api/admin', require('./middleware/authJwt'), require('./middleware/adminAuth'), require('./routes/admin'));

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
