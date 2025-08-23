import type { Task, Project, Area, Workspace } from '$lib/types';

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    description: '',
    completed: false,
    starred: true,
    projectId: 'work',

    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    dueDate: new Date(), // Today
  },
  {
    id: '2',
    title: 'Buy groceries',
    description: '',
    completed: false,
    starred: true,
    projectId: 'personal',

    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    dueDate: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    })(), // Tomorrow
  },
  {
    id: '3',
    title: 'Call insurance company',
    description: '',
    completed: false,
    starred: true,

    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
    dueDate: (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    })(), // Overdue
  },
  {
    id: '4',
    title: 'Review monthly budget',
    description: '',
    completed: false,
    starred: true,
    projectId: 'personal',

    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    dueDate: (() => {
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() + 3);
      return thisWeek;
    })(), // This Week
  },
  {
    id: '5',
    title: 'Plan vacation',
    description: '',
    completed: false,
    starred: true,
    projectId: 'personal',

    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19'),
    dueDate: (() => {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    })(), // Later
  },
  {
    id: '6',
    title: 'Update software',
    description: '',
    completed: true,
    starred: false,
    projectId: 'work',

    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '7',
    title: 'Read book',
    description: '',
    completed: true,
    starred: false,
    projectId: 'personal',

    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21'),
  },
  {
    id: '8',
    title: 'Exercise routine',
    description: '',
    completed: false,
    starred: false,

    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
  },
  {
    id: '9',
    title: 'Organize files',
    description: '',
    completed: false,
    starred: false,

    createdAt: new Date('2024-01-23'),
    updatedAt: new Date('2024-01-23'),
  },
  {
    id: '10',
    title: 'Team meeting',
    description: '',
    completed: false,
    starred: false,

    createdAt: new Date('2024-01-24'),
    updatedAt: new Date('2024-01-24'),
  },
  {
    id: '11',
    title: 'Learn new skill',
    description: '',
    completed: false,
    starred: false,
    projectId: 'personal',

    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: '12',
    title: 'Clean workspace',
    description: '',
    completed: false,
    starred: false,
    projectId: 'personal',

    createdAt: new Date('2024-01-26'),
    updatedAt: new Date('2024-01-26'),
  },
];

export const mockProjects: Project[] = [
  { id: 'personal', name: 'Personal', createdAt: new Date() },
  { id: 'entertainment', name: 'Entertainment', createdAt: new Date() },
  { id: 'family', name: 'Family', createdAt: new Date() },
  { id: 'work', name: 'Work', createdAt: new Date() },
  { id: 'home-life', name: 'Home Life', createdAt: new Date() },
  { id: 'health', name: 'Health', createdAt: new Date() },
  { id: 'apartment', name: 'Apartment', createdAt: new Date() },
];

export const mockAreas: Area[] = [];

export const mockWorkspaces: Workspace[] = [
  { id: 'default', name: 'Personal', isActive: true, createdAt: new Date() },
];
