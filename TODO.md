# Karma Tasker - Current TODO & Roadmap

*Building what Nirvana couldn't deliver: workspace separation and family collaboration for GTD workflows.*
*See [README.md](./README.md) for project overview and motivation.*

### Next steps
- [ ] Complete data loading refactoring - remove persisted stores
  - ✅ load() now reads from persistence API (db.getWorkspaces(), etc.)
  - ✅ Data flows: persistence API -> load() -> components
  - ❌ Still using persisted stores in taskStore.ts (lines 20-22)
  - ❌ Need to remove persisted() wrapper and use localStorage directly in API
  - ❌ Task CRUD operations still update persisted stores
- [ ] Clean up taskStore from unrelated code, maybe it is not needed anymore?
- [ ] questions:
  - what is in src/lib/styles/tokens.css?
  - showTaskDetailsDialog - does it have to be at root page level? same for showCreateEditor.
- [ ] persistence refactor follow-ups:
  - hide PersistenceConfig
  - clean up MIGRATION comments
  - how to clear optional field in update request
  - why update requests dont hold entity ID
  - Workspace type vs WorkspaceContext

### Further Refactor
- [ ] review remaining stores
- [ ] review files sizes and split the big ones
- [ ] setup linter and formatter
- [ ] rename perspective to perspectiveId everywhere
- [ ] rewrite viewModel to canonic SvelteKit approach
- [ ] load only current workspace tasks (drop its workspaceId field)
- [ ] get rid of switching over view type
- [ ] switchWorkspace should not be in workspaceService as it is UI logic
- [ ] emit events instead of onXXXX props?
- [ ] merge $currentWorkspace into $workspaceContext
- [ ] Add semantic labels and test IDs for Playwright automation
  - Add data-testid attributes to all interactive elements (buttons, inputs, checkboxes)
  - Add proper labels and unique IDs to form inputs
  - Add ARIA labels for accessibility and automated testing
  - Add semantic HTML roles where appropriate
  - Ensure task completion buttons are easily selectable
  - Make dropdowns and selects properly identifiable

### Advanced Organization
- [ ] fix Clear Completed button
- [ ] project/perspective badges zamienione
- [ ] remove fallback to 'inbox' (we can't hardcode it)
- [ ] get rid of all fallbaks on projectId and perspectiveId
- [ ] make NavigationService.updateURL() take NavigationState
- [ ] should pageHandlers.ts be in services/ or next it its page.ts file?
- [ ] set NavigationState as whole to store instead of the dedicated methods
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