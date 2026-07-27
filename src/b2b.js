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
      orderBy: { createdAt: 'desc' }
    });

    const stats = {
      totalRequests: logs.length,
      avgResponseTime: logs.length > 0 
        ? Math.round(logs.reduce((a, b) => a + b.responseTime, 0) / logs.length)
        : 0,
      totalBytesTransferred: logs.reduce((a, b) => a + b.bytesTransferred, 0),
      byEndpoint: {},
      byDay: {},
      byStatus: {},
      byMethod: {}
    };

    logs.forEach(log => {
      // By endpoint
      stats.byEndpoint[log.endpoint] = (stats.byEndpoint[log.endpoint] || 0) + 1;

      const date = log.createdAt.toISOString().split('T')[0];
      stats.byDay[date] = (stats.byDay[date] || 0) + 1;

      const statusGroup = `${Math.floor(log.status / 100)}xx`;
      stats.byStatus[statusGroup] = (stats.byStatus[statusGroup] || 0) + 1;

      // By method
      stats.byMethod[log.method] = (stats.byMethod[log.method] || 0) + 1;
    });

    res.json({
      success: true,
      period: {
        days,
        from: startDate.toISOString(),
        to: new Date().toISOString()
      },
      stats
    });
  } catch (err) {
    console.error('Error fetching usage stats:', err);
    res.status(500).json({ error: 'Failed to fetch usage statistics' });
  }
});

router.get('/quotas', async (req, res) => {
  try {
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: req.user.id, isActive: true },
      select: {
        id: true,
        dailyLimit: true,
        requestsToday: true,
        lastUsed: true
      }
    });

    const quotas = apiKeys.map(key => ({
      keyId: key.id,
      dailyLimit: key.dailyLimit,
      requestsToday: key.requestsToday,
      remainingRequests: key.dailyLimit - key.requestsToday,
      percentageUsed: Math.round((key.requestsToday / key.dailyLimit) * 100),
      resetTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
      lastUsed: key.lastUsed
    }));

    res.json({
      success: true,
      quotas
    });
  } catch (err) {
    console.error('Error fetching quotas:', err);
    res.status(500).json({ error: 'Failed to fetch quotas' });
  }
});

module.exports = router;
