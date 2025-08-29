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

### Canon migration follow-ups
- [ ] prepareTaskForCreation#projectId and perspective should be required and defaults not needed
- [ ] filterTasksByNavigation - it makes no sense we filter by workspace, we should ever load only current workspace tasks to start with, the type may not even have this field
- [ ] task.projectId !== null - this field should be required, same with task.perspective
- [ ] refactor src/routes/+page.svelte - move big functions to separate files, check if all things have to be at this layout level
- [ ] src/routes/+page.ts should load all data for WorkspaceContext - projects, perspectives, tasks - and pass them down
- [ ] move the src/routes/+page.ts "Initialize navigation state from URL" to service (it should return new NavigationState), keep only store setting here
- [ ] NavigationState fields should be never set to empty string, use null instead
- [ ] questions:
  - what is in src/lib/styles/tokens.css?
  - showTaskDetailsDialog - does it have to be at root page level? same for showCreateEditor.

### Further Refactor
- [ ] rename perspective to perspectiveId everywhere
- [ ] rewrite viewModel to canonic SvelteKit approach
- [ ] load only current workspace tasks (drop its workspaceId field)
- [x] what happened to passing Navigation to task list view model? (it's passed as navigation prop and spread into viewState)
- [x] view props should extend its view state - or maybe should be unified? (unified - Props now extends TaskListViewState and TaskListActions)
- [ ] get rid of switching over view type
- [ ] what is the point of model logic that is called only by one view model in a delegation manner?
- [ ] is it right that we pass all projects and perspective down to ViewModel and we resolve the current one? maybe the current should be derived in store?
- [x] does it make sense to pass over all projects and perspectives to view model? why not pass single workspace object it can ask to list things. This object would hold most of the model logic
- [ ] maybe we should separate entities loaded from repository and build fully funcitonal models (e.g. workspace containg projects and perpsectives etc.)
- [ ] switchWorkspace should not be in workspaceService as it is UI logic
- [ ] emit events instead of onXXXX props?
- [x] review remaining direct store accesses (created navigation store as single source of truth)
- [ ] move out filteredTasks logic
- [ ] merge $currentWorkspace into $workspaceContext

### Advanced Organization
- [ ] fix Clear Completed button
- [ ] project/perspective badges zamienione
- [ ] remove fallback to 'inbox' (we can't hardcode it)
- [ ] get rid of all fallbaks on projectId and perspectiveId
- [ ] (?) why filterTasksByNavigation was not used
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