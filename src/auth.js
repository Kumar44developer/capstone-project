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
