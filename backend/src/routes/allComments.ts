import { Router, Response, Request } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

// GET /comments  — returns all comments (used by frontend to hydrate context on load)
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  const comments = await prisma.comment.findMany({
    include: { author: { select: { id: true, name: true, initials: true, color: true } } },
    orderBy: { createdAt: 'asc' },
  });
  res.json({ comments });
});

export default router;
