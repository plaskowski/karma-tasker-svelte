import type { Task, Project, Area, Workspace } from '$lib/types';

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    description: '',
    completed: false,
    starred: true,
    projectId: 'work-projects',
    workspaceId: 'work',

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
    projectId: 'household',
    workspaceId: 'personal',

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
    workspaceId: 'personal',

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
    projectId: 'finances',
    workspaceId: 'personal',

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
    projectId: 'travel',
    workspaceId: 'personal',

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
    projectId: 'work-projects',
    workspaceId: 'work',

    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '7',
    title: 'Read book',
    description: '',
    completed: true,
    starred: false,
    projectId: 'learning',
    workspaceId: 'personal',

    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21'),
  },
  {
    id: '8',
    title: 'Exercise routine',
    description: '',
    completed: false,
    starred: false,
    projectId: 'health',
    workspaceId: 'personal',

    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
  },
  {
    id: '9',
    title: 'Build Arduino robot',
    description: '',
    completed: false,
    starred: false,
    projectId: 'electronics',
    workspaceId: 'hobby',

    createdAt: new Date('2024-01-23'),
    updatedAt: new Date('2024-01-23'),
  },
  {
    id: '10',
    title: 'Team meeting',
    description: '',
    completed: false,
    starred: false,
    workspaceId: 'work',

    createdAt: new Date('2024-01-24'),
    updatedAt: new Date('2024-01-24'),
  },
  {
    id: '11',
    title: 'Learn new skill',
    description: '',
    completed: false,
    starred: false,
    projectId: 'learning',
    workspaceId: 'personal',

    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: '12',
    title: 'Clean workspace',
    description: '',
    completed: false,
    starred: false,
    projectId: 'household',
    workspaceId: 'personal',

    createdAt: new Date('2024-01-26'),
    updatedAt: new Date('2024-01-26'),
  },
  {
    id: '13',
    title: 'Photography workshop',
    description: '',
    completed: false,
    starred: true,
    projectId: 'photography',
    workspaceId: 'hobby',

    createdAt: new Date('2024-01-27'),
    updatedAt: new Date('2024-01-27'),
  },
  {
    id: '14',
    title: 'Quarterly review presentation',
    description: '',
    completed: false,
    starred: false,
    projectId: 'work-projects',
    workspaceId: 'work',

    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-01-28'),
  },
];

export const mockProjects: Project[] = [
  // Personal workspace projects
  { id: 'household', name: 'Household', workspaceId: 'personal', createdAt: new Date() },
  { id: 'finances', name: 'Finances', workspaceId: 'personal', createdAt: new Date() },
  { id: 'health', name: 'Health', workspaceId: 'personal', createdAt: new Date() },
  { id: 'travel', name: 'Travel', workspaceId: 'personal', createdAt: new Date() },
  { id: 'learning', name: 'Learning', workspaceId: 'personal', createdAt: new Date() },

  // Work workspace projects  
  { id: 'work-projects', name: 'Projects', workspaceId: 'work', createdAt: new Date() },
  { id: 'meetings', name: 'Meetings', workspaceId: 'work', createdAt: new Date() },
  
  // Hobby workspace projects
  { id: 'photography', name: 'Photography', workspaceId: 'hobby', createdAt: new Date() },
  { id: 'electronics', name: 'Electronics', workspaceId: 'hobby', createdAt: new Date() },
  { id: 'music', name: 'Music', workspaceId: 'hobby', createdAt: new Date() },
];

export const mockAreas: Area[] = [];

export const mockWorkspaces: Workspace[] = [
  { id: 'personal', name: 'Personal', isActive: true, createdAt: new Date() },
  { id: 'work', name: 'Work', isActive: false, createdAt: new Date() },
  { id: 'hobby', name: 'Hobby', isActive: false, createdAt: new Date() },
];
