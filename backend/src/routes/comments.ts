import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router({ mergeParams: true });
router.use(authenticateToken);

// GET /tasks/:taskId/comments
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
  if (!task) { res.status(404).json({ error: 'Task not found' }); return; }

  const comments = await prisma.comment.findMany({
    where: { taskId: req.params.taskId },
    include: { author: { select: { id: true, name: true, initials: true, color: true } } },
    orderBy: { createdAt: 'asc' },
  });

  res.json({ comments });
});

// POST /tasks/:taskId/comments
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { text } = req.body as { text?: string };
  if (!text?.trim()) { res.status(400).json({ error: 'text is required' }); return; }

  const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
  if (!task) { res.status(404).json({ error: 'Task not found' }); return; }

  const comment = await prisma.comment.create({
    data: {
      taskId: req.params.taskId,
      authorId: req.userId as string,
      text: text.trim(),
    },
    include: { author: { select: { id: true, name: true, initials: true, color: true } } },
  });

  res.status(201).json({ comment });
});

export default router;
