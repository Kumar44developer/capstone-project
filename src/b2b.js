const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/profile', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        tier: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        apiKeys: {
          select: {
            id: true,
            dailyLimit: true,
            requestsToday: true,
            lastUsed: true,
            isActive: true,
            expiresAt: true,
            createdAt: true
          },
          where: { isActive: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    
    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.get('/usage', async (req, res) => {
  try {
    const days = Math.min(90, parseInt(req.query.days) || 30);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const logs = await prisma.apiLog.findMany({
      where: {
        userId: req.user.id,
        createdAt: { gte: startDate }
      },
