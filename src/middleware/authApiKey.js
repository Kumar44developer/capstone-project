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
