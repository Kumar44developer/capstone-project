const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/states', async (req, res) => {
  try {
    const states = await prisma.state.findMany({
      select: {
        id: true,
        stateCode: true,
        stateName: true
      },
      orderBy: { stateName: 'asc' }
    });

    res.json({
      success: true,
      count: states.length,
      data: states
    });
  } catch (err) {
    console.error('Error fetching states:', err);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});

router.get('/states/:stateId/districts', async (req, res) => {
  try {
    const stateId = parseInt(req.params.stateId);

    const state = await prisma.state.findUnique({
      where: { id: stateId }
    });
