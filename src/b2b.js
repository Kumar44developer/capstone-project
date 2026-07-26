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
