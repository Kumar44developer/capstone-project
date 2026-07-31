const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const rateLimit = require('express-rate-limit');

// Initialize environment
dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.use(cors());

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
