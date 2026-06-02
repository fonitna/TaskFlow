import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

const USER_SELECT = {
  id: true, name: true, initials: true, color: true, role: true, email: true, createdAt: true,
} as const;

// GET /users  — public so the login page can show user cards without a token
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  const users = await prisma.user.findMany({ select: USER_SELECT, orderBy: { name: 'asc' } });
  res.json({ users });
});

// All routes below require auth
router.use(authenticateToken);

// GET /users/:id
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: USER_SELECT });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json({ user });
});

// PATCH /users/:id  (own profile only)
router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.params.id !== req.userId) {
    res.status(403).json({ error: 'Cannot update another user\'s profile' });
    return;
  }

  const { name, role, color } = req.body as { name?: string; role?: string; color?: string };
  const data: Record<string, string> = {};
  if (name?.trim()) {
    data.name = name.trim();
    data.initials = name.trim().split(' ').map((n: string) => n[0]).slice(0, 3).join('').toUpperCase() || 'UN';
  }
  if (role?.trim()) data.role = role.trim();
  if (color?.trim()) data.color = color.trim();

  const user = await prisma.user.update({ where: { id: req.params.id }, data, select: USER_SELECT });
  res.json({ user });
});

export default router;
