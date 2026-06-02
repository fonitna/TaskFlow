import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
}

function safeUser(user: { id: string; name: string; initials: string; color: string; role: string; email: string; createdAt: Date }) {
  const { ...rest } = user;
  return rest;
}

// POST /auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role, color } = req.body as {
    name?: string; email?: string; password?: string; role?: string; color?: string;
  };

  if (!name?.trim() || !email?.trim() || !password) {
    res.status(400).json({ error: 'name, email, and password are required' });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const initials = name.trim().split(' ').map(n => n[0]).slice(0, 3).join('').toUpperCase() || 'UN';
  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      initials,
      color: color || '#378ADD',
      role: role || 'Developer',
      email: email.trim().toLowerCase(),
      password: hash,
    },
    select: { id: true, name: true, initials: true, color: true, role: true, email: true, createdAt: true },
  });

  res.status(201).json({ token: signToken(user.id), user: safeUser(user) });
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email?.trim() || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const { password: _, ...safeFields } = user;
  res.json({ token: signToken(user.id), user: safeFields });
});

// GET /auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, initials: true, color: true, role: true, email: true, createdAt: true },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ user });
});

export default router;
