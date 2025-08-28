# Karma Tasker - Current TODO & Roadmap

*Building what Nirvana couldn't deliver: workspace separation and family collaboration for GTD workflows.*
*See [README.md](./README.md) for project overview and motivation.*

### Next steps
- [ ] Add semantic labels and test IDs for Playwright automation
  - Add data-testid attributes to all interactive elements (buttons, inputs, checkboxes)
  - Add proper labels and unique IDs to form inputs
  - Add ARIA labels for accessibility and automated testing
  - Add semantic HTML roles where appropriate
  - Ensure task completion buttons are easily selectable
  - Make dropdowns and selects properly identifiable

### Refactor
- [ ] remove unused service methods
- [ ] remove unused repository methods
- [ ] drop workspaceIconMap
- [ ] pack "currentView: ViewType; currentPerspectiveId?: string; currentProjectId?: string;" into object
- [ ] view props should extend its view state - or maybe should be unified?
- [ ] get rid of switching over view type
- [ ] what is the point of model logic that is called only by one view model in a delegation manner?
- [ ] is it right that we pass all projects and perspective down to ViewModel and we resolve the current one? maybe the current should be derived in store?
- [ ] does it make sense to pass over all projects and perspectives to view model? why not pass single workspace object it can ask to list things. This object would hold most of the model logic
- [ ] maybe we should separate entities loaded from repository and build fully funcitonal models (e.g. workspace containg projects and perpsectives etc.)
- [ ] switchWorkspace should not be in workspaceService as it is UI logic

### Advanced Organization
- [ ] fix Clear Completed button
- [ ] project/perspective badges zamienione
- [ ] we should not rely on taskService.loadTasks(), they should be loaded on demand with queries
- [ ] introduce structure into project (kind of MVVM or something, research what is common for SvelteKit)
- [ ] name default project better
- [ ] Drag & drop task reordering
- [ ] consolidate all class attribute spagetti into semantic classes
- [ ] special markup support in description
  - link in first line
  - checklist
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