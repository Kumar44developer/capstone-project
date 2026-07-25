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
