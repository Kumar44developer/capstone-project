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
