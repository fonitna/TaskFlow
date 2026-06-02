import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

const router = Router();
router.use(authenticateToken);

const TASK_INCLUDE = {
  labels: { select: { label: true } },
  _count: { select: { comments: true } },
} as const;

function formatTask(t: {
  id: string; projectId: string; title: string; description: string | null;
  status: string; priority: string; assigneeId: string | null;
  dueDate: string | null; createdAt: Date; updatedAt: Date;
  labels: { label: string }[];
  _count: { comments: number };
}) {
  return {
    id: t.id,
    projectId: t.projectId,
    title: t.title,
    description: t.description ?? undefined,
    status: t.status,
    priority: t.priority,
    assigneeId: t.assigneeId ?? undefined,
    dueDate: t.dueDate ?? undefined,
    createdAt: t.createdAt.toISOString().split('T')[0],
    labels: t.labels.map(l => l.label),
    commentCount: t._count.comments,
  };
}

// GET /tasks?projectId=&assigneeId=&status=&priority=
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { projectId, assigneeId, status, priority } = req.query as Record<string, string | undefined>;

  const tasks = await prisma.task.findMany({
    where: {
      ...(projectId ? { projectId } : {}),
      ...(assigneeId ? { assigneeId } : {}),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
    },
    include: TASK_INCLUDE,
    orderBy: { createdAt: 'asc' },
  });

  res.json({ tasks: tasks.map(formatTask) });
});

// POST /tasks
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { projectId, title, description, status, priority, assigneeId, dueDate, labels } =
    req.body as {
      projectId?: string; title?: string; description?: string;
      status?: string; priority?: string; assigneeId?: string;
      dueDate?: string; labels?: string[];
    };

  if (!projectId || !title?.trim()) {
    res.status(400).json({ error: 'projectId and title are required' });
    return;
  }

  const task = await prisma.task.create({
    data: {
      projectId,
      title: title.trim(),
      description: description?.trim() || null,
      status: status ?? 'todo',
      priority: priority ?? 'normal',
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
      labels: labels?.length ? { create: labels.map(label => ({ label })) } : undefined,
    },
    include: TASK_INCLUDE,
  });

  res.status(201).json({ task: formatTask(task) });
});

// --- Static bulk routes MUST come before /:id ---

// DELETE /tasks/bulk
router.delete('/bulk', async (req: AuthRequest, res: Response): Promise<void> => {
  const { ids } = req.body as { ids?: string[] };
  if (!ids?.length) { res.status(400).json({ error: 'ids array is required' }); return; }

  await prisma.task.deleteMany({ where: { id: { in: ids } } });
  res.status(204).send();
});

// PATCH /tasks/bulk/status
router.patch('/bulk/status', async (req: AuthRequest, res: Response): Promise<void> => {
  const { ids, status } = req.body as { ids?: string[]; status?: TaskStatus };
  if (!ids?.length || !status) { res.status(400).json({ error: 'ids and status are required' }); return; }

  await prisma.task.updateMany({ where: { id: { in: ids } }, data: { status } });
  res.json({ updated: ids.length });
});

// PATCH /tasks/bulk/unassign
router.patch('/bulk/unassign', async (req: AuthRequest, res: Response): Promise<void> => {
  const { ids } = req.body as { ids?: string[] };
  if (!ids?.length) { res.status(400).json({ error: 'ids array is required' }); return; }

  await prisma.task.updateMany({ where: { id: { in: ids } }, data: { assigneeId: null } });
  res.json({ updated: ids.length });
});

// --- Parameterized routes ---

// GET /tasks/:id
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: TASK_INCLUDE,
  });
  if (!task) { res.status(404).json({ error: 'Task not found' }); return; }
  res.json({ task: formatTask(task) });
});

// PATCH /tasks/:id/move  — lightweight status-only update for drag-and-drop
router.patch('/:id/move', async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body as { status?: string };
  if (!status) { res.status(400).json({ error: 'status is required' }); return; }

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: { status },
    include: TASK_INCLUDE,
  });

  res.json({ task: formatTask(task) });
});

// PATCH /tasks/:id
router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!existing) { res.status(404).json({ error: 'Task not found' }); return; }

  const { title, description, status, priority, assigneeId, dueDate, labels } =
    req.body as {
      title?: string; description?: string; status?: string; priority?: string;
      assigneeId?: string | null; dueDate?: string | null; labels?: string[];
    };

  const data: Record<string, unknown> = {};
  if (title?.trim()) data.title = title.trim();
  if (description !== undefined) data.description = description?.trim() || null;
  if (status) data.status = status;
  if (priority) data.priority = priority;
  if (assigneeId !== undefined) data.assigneeId = assigneeId || null;
  if (dueDate !== undefined) data.dueDate = dueDate || null;

  if (labels !== undefined) {
    await prisma.taskLabel.deleteMany({ where: { taskId: req.params.id } });
    if (labels.length > 0) {
      await prisma.taskLabel.createMany({
        data: labels.map(label => ({ taskId: req.params.id, label })),
      });
    }
  }

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data,
    include: TASK_INCLUDE,
  });

  res.json({ task: formatTask(task) });
});

// DELETE /tasks/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!existing) { res.status(404).json({ error: 'Task not found' }); return; }

  await prisma.task.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
