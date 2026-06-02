import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

function formatProject(p: {
  id: string; name: string; color: string; createdAt: Date;
  members: { userId: string }[];
  _count: { tasks: number };
}) {
  return {
    id: p.id,
    name: p.name,
    color: p.color,
    createdAt: p.createdAt.toISOString().split('T')[0],
    members: p.members.map(m => m.userId),
    taskCount: p._count.tasks,
  };
}

const PROJECT_INCLUDE = {
  members: { select: { userId: true } },
  _count: { select: { tasks: true } },
} as const;

// GET /projects
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  const projects = await prisma.project.findMany({
    include: PROJECT_INCLUDE,
    orderBy: { createdAt: 'asc' },
  });
  res.json({ projects: projects.map(formatProject) });
});

// POST /projects
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, color, memberIds } = req.body as { name?: string; color?: string; memberIds?: string[] };

  if (!name?.trim()) { res.status(400).json({ error: 'name is required' }); return; }

  const ids: string[] = memberIds?.length ? memberIds : [req.userId as string];

  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      color: color || '#378ADD',
      members: { create: ids.map(userId => ({ userId })) },
    },
    include: PROJECT_INCLUDE,
  });

  res.status(201).json({ project: formatProject(project) });
});

// --- Static route MUST come before /:id ---

// PATCH /projects/reorder
router.patch('/reorder', async (req: AuthRequest, res: Response): Promise<void> => {
  const { startIndex, endIndex } = req.body as { startIndex?: number; endIndex?: number };

  if (startIndex == null || endIndex == null) {
    res.status(400).json({ error: 'startIndex and endIndex are required' });
    return;
  }

  const projects = await prisma.project.findMany({ orderBy: { createdAt: 'asc' } });

  if (startIndex < 0 || startIndex >= projects.length || endIndex < 0 || endIndex >= projects.length) {
    res.status(400).json({ error: 'Index out of range' });
    return;
  }

  const [a, b] = [projects[startIndex], projects[endIndex]];
  await prisma.$transaction([
    prisma.project.update({ where: { id: a.id }, data: { createdAt: b.createdAt } }),
    prisma.project.update({ where: { id: b.id }, data: { createdAt: a.createdAt } }),
  ]);

  const updated = await prisma.project.findMany({ include: PROJECT_INCLUDE, orderBy: { createdAt: 'asc' } });
  res.json({ projects: updated.map(formatProject) });
});

// --- Parameterized routes ---

// GET /projects/:id
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: PROJECT_INCLUDE,
  });
  if (!project) { res.status(404).json({ error: 'Project not found' }); return; }
  res.json({ project: formatProject(project) });
});

// PATCH /projects/:id
router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, color, memberIds } = req.body as { name?: string; color?: string; memberIds?: string[] };

  const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!existing) { res.status(404).json({ error: 'Project not found' }); return; }

  const data: Record<string, unknown> = {};
  if (name?.trim()) data.name = name.trim();
  if (color?.trim()) data.color = color.trim();

  if (memberIds) {
    await prisma.projectMember.deleteMany({ where: { projectId: req.params.id } });
    await prisma.projectMember.createMany({
      data: memberIds.map(userId => ({ projectId: req.params.id, userId })),
    });
  }

  const project = await prisma.project.update({
    where: { id: req.params.id },
    data,
    include: PROJECT_INCLUDE,
  });

  res.json({ project: formatProject(project) });
});

// DELETE /projects/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!existing) { res.status(404).json({ error: 'Project not found' }); return; }

  await prisma.project.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
