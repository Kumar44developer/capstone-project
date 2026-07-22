const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const apiSecret = req.headers['x-api-secret'];


    if (!apiKey || !apiSecret) {
      return res.status(401).json({ 
        error: 'Missing API credentials',
        message: 'Please include x-api-key and x-api-secret headers'
      });
    }

    const keyRecords = await prisma.apiKey.findMany({
      where: { isActive: true },
      include: { user: true }
    });

    let foundKey = null;
    for (const key of keyRecords) {
      const keyMatch = await bcryptjs.compare(apiKey, key.keyHash);
      const secretMatch = await bcryptjs.compare(apiSecret, key.secretHash);

      if (keyMatch && secretMatch) {
        foundKey = key;
        break;
      }
    }

    
    if (!foundKey) {
      return res.status(401).json({ 
        error: 'Invalid API credentials',
        message: 'API key or secret is incorrect'
      });
    }

    if (foundKey.expiresAt && new Date() > foundKey.expiresAt) {
      return res.status(401).json({ 
        error: 'API key expired',
        message: 'This API key has expired. Please generate a new one.'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (foundKey.requestsToday >= foundKey.dailyLimit) {
      return res.status(429).json({ 
        error: 'Daily API limit exceeded',
        message: `You have exceeded your daily limit of ${foundKey.dailyLimit} requests`,
        resetTime: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
      });
    }

    await prisma.apiKey.update({
      where: { id: foundKey.id },
      data: { 
        requestsToday: foundKey.requestsToday + 1,
        lastUsed: new Date()
      }
    });

    req.user = foundKey.user;
    req.apiKey = foundKey;

    const startTime = Date.now();
    const originalJson = res.json;

    res.json = function(data) {
      const responseTime = Date.now() - startTime;

      prisma.apiLog.create({
        data: {
          userId: foundKey.user.id,
          endpoint: req.path,
          method: req.method,
          status: res.statusCode,
          responseTime,
          bytesTransferred: JSON.stringify(data).length
        }
      }).catch(err => console.error('Failed to log API request:', err));
