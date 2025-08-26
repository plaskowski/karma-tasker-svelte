# Karma Tasker - Current TODO & Roadmap

*Building what Nirvana couldn't deliver: workspace separation and family collaboration for GTD workflows.*
*See [README.md](./README.md) for project overview and motivation.*

## 🐛 Known Issues

### UI/UX Bugs
- [x] make all buttons little bigger
- [x] add new item should inherit project or perspective from current view
- [ ] the top bar buttons stand out too much, change them to outline only style
- [x] default project name ...
- [ ] close editor when leaving the view
- [ ] why "first" perspective is lowercase in list group header?
- [ ] make "first" category use standard category view
- [ ] default project should come first in grouped task list

## 🚀 Active Development Roadmap

### Next Major Features
Next focus: begin Core Features below.

### Core Features
- [ ] Task editing and detailed view
- [ ] "All" view
- [ ] Task notes/descriptions support
- [ ] Drag & drop task reordering

### Advanced Organization
- [ ] Custom perspective creation per workspace
- [ ] Project-specific perspective filtering
- [ ] Areas/contexts for better organization
- [ ] Task templates for common workflows
- [ ] Task due dates and scheduling
- [ ] Bulk task operations

### Collaboration & Sharing
- [ ] User authentication and accounts
- [ ] Shared workspaces with family/team members
- [ ] Project sharing and collaboration
- [ ] Task assignment to other users
- [ ] Real-time updates and notifications
- [ ] Permission levels (view, edit, admin)
- [ ] Activity feed for shared projects
- [ ] Comments and task discussions

### Data & Sync
- [ ] Real backend API integration
- [ ] Data export/import functionality
- [ ] Offline support with sync
- [ ] Backup and restore features

### UI/UX Polish
- [ ] Keyboard shortcuts for power users
- [ ] Task quick actions (right-click menu)
- [ ] Better mobile responsiveness
- [ ] Animations and micro-interactions
- [ ] Custom themes and appearance settings

### Power User Features
- [ ] Advanced filtering and search
- [ ] Task dependencies and blocking
- [ ] Time tracking integration
- [ ] Reports and analytics
- [ ] Task automation rules

### Technical Improvements
- [ ] Better error handling and user feedback
- [ ] Performance optimizations for large datasets
- [ ] Accessibility improvements (ARIA, keyboard nav)
- [ ] Unit and integration tests
- [ ] CI/CD pipeline setup

## 📊 Current Architecture

### Data Model
- **Task**: Required project assignment, optional perspective, workspace-bound
- **Project**: Workspace-specific, default projects (hidden from UI)
- **Workspace**: Personal/Work/Hobby with configurable perspectives
- **Perspective**: Configurable views per workspace (Inbox, Next, Ideas, etc.)

### State Management
- Svelte stores with localStorage persistence
- URL-based state for bookmarkable views
- Derived stores for computed data (filtered tasks, counts)

### Component Structure
- `TaskList.svelte`: Main task display and actions
- `Sidebar.svelte`: Navigation, workspace switcher, perspectives
- `TaskItem.svelte`: Individual task rendering
- `NewTaskDialog.svelte`: Task creation modal

### Tech Stack
- SvelteKit + Svelte 5 (runes mode)
- Tailwind CSS for styling
- Lucide icons
- TypeScript for type safety
- Local storage for persistence (mock backend)

---

*See [RESOLVED.md](./RESOLVED.md) for completed features*
*Status: Ready for next phase of development*