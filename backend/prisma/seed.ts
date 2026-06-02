import { PrismaClient } from '@prisma/client';

type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data in dependency order
  await prisma.comment.deleteMany();
  await prisma.taskLabel.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash('password123', 12);

  // Seed users (mirrors src/data.ts USERS)
  const [alex, priya, jordan, marco, sara] = await Promise.all([
    prisma.user.create({ data: { id: 'u1', name: 'Alex Chen',    initials: 'AC', color: '#378ADD', role: 'PM',        email: 'alex@taskflow.dev',   password: defaultPassword } }),
    prisma.user.create({ data: { id: 'u2', name: 'Priya Sharma', initials: 'PS', color: '#1D9E75', role: 'Developer', email: 'priya@taskflow.dev',  password: defaultPassword } }),
    prisma.user.create({ data: { id: 'u3', name: 'Jordan Lee',   initials: 'JL', color: '#D4537E', role: 'Designer',  email: 'jordan@taskflow.dev', password: defaultPassword } }),
    prisma.user.create({ data: { id: 'u4', name: 'Marco Rossi',  initials: 'MR', color: '#BA7517', role: 'Developer', email: 'marco@taskflow.dev',  password: defaultPassword } }),
    prisma.user.create({ data: { id: 'u5', name: 'Sara Kim',     initials: 'SK', color: '#533AB7', role: 'QA',        email: 'sara@taskflow.dev',   password: defaultPassword } }),
  ]);

  // Seed projects
  const [p1, p2, p3] = await Promise.all([
    prisma.project.create({ data: { id: 'p1', name: 'Website Redesign', color: '#378ADD', createdAt: new Date('2026-04-01') } }),
    prisma.project.create({ data: { id: 'p2', name: 'Mobile App v2',    color: '#1D9E75', createdAt: new Date('2026-04-15') } }),
    prisma.project.create({ data: { id: 'p3', name: 'Q3 Marketing',     color: '#D4537E', createdAt: new Date('2026-05-01') } }),
  ]);

  // Seed project members
  await prisma.projectMember.createMany({
    data: [
      { projectId: p1.id, userId: alex.id },
      { projectId: p1.id, userId: priya.id },
      { projectId: p1.id, userId: jordan.id },
      { projectId: p2.id, userId: alex.id },
      { projectId: p2.id, userId: priya.id },
      { projectId: p2.id, userId: marco.id },
      { projectId: p3.id, userId: alex.id },
      { projectId: p3.id, userId: jordan.id },
      { projectId: p3.id, userId: sara.id },
    ],
  });

  // Helper to create a task with its labels
  const createTask = async (data: {
    id: string; projectId: string; title: string; description?: string;
    status: TaskStatus; priority: TaskPriority; assigneeId?: string;
    dueDate?: string; labels: string[]; createdAt: Date;
  }) => {
    const { labels, ...taskData } = data;
    const task = await prisma.task.create({ data: taskData });
    if (labels.length > 0) {
      await prisma.taskLabel.createMany({
        data: labels.map(label => ({ taskId: task.id, label })),
      });
    }
    return task;
  };

  const [t1, , , , , , , t8] = await Promise.all([
    createTask({ id: 't1',  projectId: 'p1', title: 'Redesign homepage hero section',         description: 'Update copy, hero image, and CTA button styles.',                                              status: 'in_progress', priority: 'high',   assigneeId: 'u3', dueDate: '2026-06-10', labels: ['design','frontend'], createdAt: new Date('2026-05-20') }),
    createTask({ id: 't2',  projectId: 'p1', title: 'Accessibility audit (WCAG 2.1 AA)',       description: 'Run axe-core scan and fix all critical issues.',                                               status: 'todo',        priority: 'urgent', assigneeId: 'u2', dueDate: '2026-06-05', labels: ['a11y'],              createdAt: new Date('2026-05-22') }),
    createTask({ id: 't3',  projectId: 'p1', title: 'Implement dark mode toggle',              description: 'Add a simple toggle switch for users to toggle light and dark themes manually.',               status: 'todo',        priority: 'normal', assigneeId: 'u2', dueDate: '2026-06-20', labels: ['frontend'],          createdAt: new Date('2026-05-23') }),
    createTask({ id: 't4',  projectId: 'p1', title: 'Update brand color tokens',               description: 'Adjust all color values in variables file to align with the new corporate palette guidelines.', status: 'in_review',   priority: 'high',   assigneeId: 'u3', dueDate: '2026-06-03', labels: ['design'],            createdAt: new Date('2026-05-15') }),
    createTask({ id: 't5',  projectId: 'p1', title: 'Write component documentation',           description: 'Document all reusable UI widgets, input parameters, and utility style tokens.',                status: 'done',        priority: 'low',    assigneeId: 'u1', dueDate: '2026-05-30', labels: ['docs'],              createdAt: new Date('2026-05-10') }),
    createTask({ id: 't6',  projectId: 'p2', title: 'Build onboarding flow screens',           description: 'Design and implement responsive wizard screens to guide first-time users.',                    status: 'in_progress', priority: 'urgent', assigneeId: 'u3', dueDate: '2026-06-08', labels: ['design','mobile'],   createdAt: new Date('2026-05-18') }),
    createTask({ id: 't7',  projectId: 'p2', title: 'Integrate push notifications',            description: 'Connect FCM tokens to backend notifications queue service.',                                   status: 'todo',        priority: 'high',   assigneeId: 'u4', dueDate: '2026-06-15', labels: ['backend','mobile'],  createdAt: new Date('2026-05-24') }),
    createTask({ id: 't8',  projectId: 'p3', title: 'Draft Q3 email campaign copy',            description: 'Draft newsletter sequences for existing customers detailing product updates.',                  status: 'in_progress', priority: 'normal', assigneeId: 'u1', dueDate: '2026-06-12', labels: ['copy'],              createdAt: new Date('2026-05-20') }),
    createTask({ id: 't9',  projectId: 'p3', title: 'Design social media templates',           description: 'Create vector design banners for key media announcements in Instagram, Twitter formats.',      status: 'todo',        priority: 'normal', assigneeId: 'u3', dueDate: '2026-06-18', labels: ['design','social'],   createdAt: new Date('2026-05-25') }),
    createTask({ id: 't10', projectId: 'p2', title: 'Fix login screen keyboard overlap',       description: 'Adjust input auto-scroll behavior when soft keyboards pop up on tiny devices.',                status: 'done',        priority: 'high',   assigneeId: 'u4', dueDate: '2026-05-28', labels: ['bug','mobile'],      createdAt: new Date('2026-05-14') }),
  ]);

  // Seed comments for t1 and t8
  await prisma.comment.createMany({
    data: [
      { id: 'c1', taskId: t1.id, authorId: 'u1', text: "Let's go with the full-bleed option for mobile.",           createdAt: new Date('2026-05-21T09:14:00Z') },
      { id: 'c2', taskId: t1.id, authorId: 'u3', text: "Agreed. I'll have a mockup ready by EOD Thursday.",         createdAt: new Date('2026-05-21T10:32:00Z') },
      { id: 'c3', taskId: t1.id, authorId: 'u2', text: 'Make sure the CTA passes 4.5:1 contrast ratio.',            createdAt: new Date('2026-05-22T14:05:00Z') },
      { id: 'c4', taskId: t8.id, authorId: 'u5', text: 'First draft looks good, adding subject-line A/B variants.', createdAt: new Date('2026-05-21T11:00:00Z') },
      { id: 'c5', taskId: t8.id, authorId: 'u1', text: 'Approved — send to design for header imagery.',             createdAt: new Date('2026-05-22T08:30:00Z') },
    ],
  });

  console.log('Seed complete. Default password for all users: password123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
