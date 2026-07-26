const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Please provide email, name, and password'
      });
    }

    const existing = await prisma.user.findUnique({ 
      where: { email } 
    });

    if (existing) {
      return res.status(409).json({ 
        error: 'User already exists',
        message: 'This email is already registered'
      });
    }

    const passwordHash = await bcryptjs.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        tier: 'free'
      },
      select: {
        id: true,
        email: true,
        name: true,
        tier: true,
        createdAt: true
      }
    });
      
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing email or password'
      });
    }

    const user = await prisma.user.findUnique({ 
      where: { email } 
    });

    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    const passwordValid = await bcryptjs.compare(password, user.passwordHash);

    if (!passwordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        tier: user.tier 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tier: user.tier
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/generate-api-key', require('../middleware/authJwt'), async (req, res) => {
  try {
    const apiKey = 'sk_' + Math.random().toString(36).substring(2, 34);
    const apiSecret = 'secret_' + Math.random().toString(36).substring(2, 42);

    const keyHash = await bcryptjs.hash(apiKey, 10);
    const secretHash = await bcryptjs.hash(apiSecret, 10);

    const tierLimits = {
      'free': 1000,
      'premium': 100000,
      'pro': 1000000,
      'unlimited': 999999999
    };

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    const dailyLimit = tierLimits[user.tier] || 1000;

    const record = await prisma.apiKey.create({
      data: {
        userId: req.user.userId,
        keyHash,
        secretHash,
        dailyLimit
      },
      select: {
        id: true,
        createdAt: true,
        dailyLimit: true,
        expiresAt: true
      }
    });


    res.status(201).json({
      success: true,
      message: 'API key generated successfully. Save your credentials securely!',
      credentials: {
        apiKey,  // Show only once
        apiSecret,
        dailyLimit: record.dailyLimit,
        expiresAt: record.expiresAt
      },
      warning: 'You won\'t be able to see your API secret again. Store it securely.'
    });
  } catch (err) {
    console.error('API Key Generation Error:', err);
    res.status(500).json({ error: 'Failed to generate API key' });
  }
