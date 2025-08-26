import type { Task, Project, Workspace } from '$lib/types';

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Finalize client portal requirements',
    description: '',
    completed: false,
    perspective: 'first',
    projectId: 'client-portal',
    workspaceId: 'work',
    order: 1,

    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Buy groceries',
    description: '',
    completed: false,
    perspective: 'first',
    projectId: 'household',
    workspaceId: 'personal',
    order: 1,

    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: '3',
    title: 'Call insurance company',
    description: '',
    completed: false,
    perspective: 'first',
    projectId: 'personal-default',
    workspaceId: 'personal',
    order: 1,

    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
  },
  {
    id: '4',
    title: 'Review monthly budget',
    description: '',
    completed: false,
    perspective: 'first',
    projectId: 'finances',
    workspaceId: 'personal',
    order: 1,

    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '5',
    title: 'Plan vacation',
    description: '',
    completed: false,
    perspective: 'first',
    projectId: 'travel',
    workspaceId: 'personal',
    order: 1,

    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19'),
  },
  {
    id: '6',
    title: 'Upgrade authentication library',
    description: '',
    completed: true,

    projectId: 'api-redesign',
    workspaceId: 'work',
    order: 1,

    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '7',
    title: 'Read book',
    description: '',
    completed: true,

    projectId: 'learning',
    workspaceId: 'personal',
    order: 1,

    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21'),
  },
  {
    id: '8',
    title: 'Exercise routine',
    description: '',
    completed: false,

    projectId: 'health',
    workspaceId: 'personal',
    order: 1,

    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
  },
  {
    id: '9',
    title: 'Build Arduino robot',
    description: '',
    completed: false,

    projectId: 'electronics',
    workspaceId: 'hobby',
    order: 1,

    createdAt: new Date('2024-01-23'),
    updatedAt: new Date('2024-01-23'),
  },
  {
    id: '10',
    title: 'Team meeting',
    description: '',
    completed: false,

    projectId: 'work-default',
    workspaceId: 'work',
    order: 1,

    createdAt: new Date('2024-01-24'),
    updatedAt: new Date('2024-01-24'),
  },
  {
    id: '11',
    title: 'Learn new skill',
    description: '',
    completed: false,

    perspective: 'someday',
    projectId: 'learning',
    workspaceId: 'personal',
    order: 2,

    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: '12',
    title: 'Clean workspace',
    description: '',
    completed: false,

    // No perspective = inbox
    projectId: 'household',
    workspaceId: 'personal',
    order: 2,

    createdAt: new Date('2024-01-26'),
    updatedAt: new Date('2024-01-26'),
  },
  {
    id: '13',
    title: 'Photography workshop',
    description: '',
    completed: false,
    perspective: 'first',
    projectId: 'photography',
    workspaceId: 'hobby',
    order: 1,

    createdAt: new Date('2024-01-27'),
    updatedAt: new Date('2024-01-27'),
  },
  {
    id: '14',
    title: 'Document new API endpoints',
    description: '',
    completed: false,

    projectId: 'api-redesign',
    workspaceId: 'work',
    order: 2,

    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-01-28'),
  },
  // Additional tasks to ensure all perspectives and projects have content
  {
    id: '15',
    title: 'Review quarterly goals',
    description: '',
    completed: false,
    perspective: 'review',
    projectId: 'work-default',
    workspaceId: 'work',
    order: 2,
    createdAt: new Date('2024-01-29'),
    updatedAt: new Date('2024-01-29'),
  },
  {
    id: '16',
    title: 'Prepare sprint retrospective',
    description: '',
    completed: false,
    perspective: 'review',
    projectId: 'meetings',
    workspaceId: 'work',
    order: 1,
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-01-30'),
  },
  {
    id: '17',
    title: 'Brainstorm creative project ideas',
    description: '',
    completed: false,
    perspective: 'ideas',
    projectId: 'photography',
    workspaceId: 'hobby',
    order: 2,
    createdAt: new Date('2024-01-31'),
    updatedAt: new Date('2024-01-31'),
  },
  {
    id: '18',
    title: 'Learn new design pattern',
    description: '',
    completed: false,
    perspective: 'ideas',
    projectId: 'electronics',
    workspaceId: 'hobby',
    order: 2,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: '19',
    title: 'Schedule team lunch',
    description: '',
    completed: false,
    // No perspective = inbox
    projectId: 'meetings',
    workspaceId: 'work',
    order: 2,
    createdAt: new Date('2024-02-02'),
    updatedAt: new Date('2024-02-02'),
  },
  {
    id: '20',
    title: 'Organize studio space',
    description: '',
    completed: false,
    // No perspective = inbox  
    projectId: 'hobby-default',
    workspaceId: 'hobby',
    order: 1,
    createdAt: new Date('2024-02-03'),
    updatedAt: new Date('2024-02-03'),
  },
];

export const mockProjects: Project[] = [
  // Personal workspace projects
  { id: 'personal-default', name: 'Personal Actions', icon: 'user', workspaceId: 'personal', createdAt: new Date() },
  { id: 'household', name: 'Household', icon: 'home', workspaceId: 'personal', createdAt: new Date() },
  { id: 'finances', name: 'Finances', icon: 'building', workspaceId: 'personal', createdAt: new Date() },
  { id: 'health', name: 'Health', icon: 'activity', workspaceId: 'personal', createdAt: new Date() },
  { id: 'travel', name: 'Travel', icon: 'calendar', workspaceId: 'personal', createdAt: new Date() },
  { id: 'learning', name: 'Learning', icon: 'user', workspaceId: 'personal', createdAt: new Date() },

  // Work workspace projects  
  { id: 'work-default', name: 'Work Actions', icon: 'briefcase', workspaceId: 'work', createdAt: new Date() },
  { id: 'client-portal', name: 'Client Portal', icon: 'briefcase', workspaceId: 'work', createdAt: new Date() },
  { id: 'api-redesign', name: 'API Redesign', icon: 'briefcase', workspaceId: 'work', createdAt: new Date() },
  { id: 'meetings', name: 'Meetings', icon: 'users', workspaceId: 'work', createdAt: new Date() },
  
  // Hobby workspace projects
  { id: 'hobby-default', name: 'Hobby Actions', icon: 'heart', workspaceId: 'hobby', createdAt: new Date() },
  { id: 'photography', name: 'Photography', icon: 'heart', workspaceId: 'hobby', createdAt: new Date() },
  { id: 'electronics', name: 'Electronics', icon: 'heart', workspaceId: 'hobby', createdAt: new Date() },
  { id: 'music', name: 'Music', icon: 'heart', workspaceId: 'hobby', createdAt: new Date() },
];

export const mockWorkspaces: Workspace[] = [
  {
    id: 'personal',
    name: 'Personal',
    perspectives: [
      { id: 'inbox', name: 'Inbox', icon: 'inbox', order: 1 },
      { id: 'first', name: 'First', icon: 'zap', order: 2 },
      { id: 'next', name: 'Next', icon: 'clock', order: 3 },
      { id: 'someday', name: 'Someday', icon: 'archive', order: 4 },
    ],
    createdAt: new Date()
  },
  {
    id: 'work',
    name: 'Work',
    perspectives: [
      { id: 'inbox', name: 'Inbox', icon: 'inbox', order: 1 },
      { id: 'first', name: 'First', icon: 'zap', order: 2 },
      { id: 'next', name: 'Next', icon: 'clock', order: 3 },
      { id: 'review', name: 'Review', icon: 'users', order: 4 },
    ],
    createdAt: new Date()
  },
  {
    id: 'hobby',
    name: 'Hobby',
    perspectives: [
      { id: 'inbox', name: 'Inbox', icon: 'inbox', order: 1 },
      { id: 'first', name: 'First', icon: 'zap', order: 2 },
      { id: 'next', name: 'Next', icon: 'clock', order: 3 },
      { id: 'ideas', name: 'Ideas', icon: 'archive', order: 4 },
    ],
    createdAt: new Date()
  },
];
