# Karma Tasker - Current TODO & Roadmap

*Building what Nirvana couldn't deliver: workspace separation and family collaboration for GTD workflows.*
*See [README.md](./README.md) for project overview and motivation.*

### Next steps
- [X] Clean up taskStore from unrelated code, maybe it is not needed anymore?
- [X] questions:
  - X what is in src/lib/styles/tokens.css?
  - X showTaskDetailsDialog - does it have to be at root page level? same for showCreateEditor.
- [ ] persistence refactor follow-ups:
  - how to clear optional field in update request
  - why update requests dont hold entity ID
  - Workspace type vs WorkspaceContext

### Further Refactor
- [ ] review remaining stores against [svelteKit-app-architecture.md](docs/svelteKit-app-architecture.md)
- [ ] review files sizes and split the big ones
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
- [ ] use parallel routes for sidebar/main pane
   - plus extract main pane page/layout from TaskList.svelte
   - plus move showCreateEditor to main pane
- [ ] why Workspace type has perspectives, what they are used for?

### Clean-ups
- [ ] fix Clear Completed button
- [ ] rename NewTaskDialog.svelte
- [ ] remove TaskDetailsDialog?
- [ ] remove fallback to 'inbox' (we can't hardcode it)
- [ ] get rid of all fallbaks on projectId and perspectiveId
- [ ] make NavigationService.updateURL() take NavigationState
- [ ] should pageHandlers.ts be in services/ or next it its page.ts file?
- [ ] name default project better
- [ ] no big chunks of code in svelte files inside the markup part
- [ ] fold this into one property "badgeText":
  showProjectBadge={vm.showProjectBadge}
  showPerspectiveBadge={vm.showPerspectiveBadge}
  perspectiveName={vm.getTaskPerspectiveName(task)}
  projectName={vm.getTaskProjectName(task)}
- [ ] ...

### Technical improvements
- [ ] setup linter and formatter
- [ ] consolidate all class attribute spagetti into semantic classes
- [ ] Real backend API integration
- [ ] Offline support with sync
- [ ] Backup and restore features

### Advanced features
- [ ] Drag & drop task reordering
- [ ] special markup support in description
  - link in first line
  - checklist
- [ ] Custom perspective creation per workspace
- [ ] Project-specific perspective filtering
- [ ] User authentication and accounts
- [ ] Shared workspaces with family/team members
- [ ] Project sharing and collaboration
- [ ] Real-time updates and notifications
- [ ] Activity feed for shared projects
- [ ] Keyboard shortcuts for power users
- [ ] Mobile responsiveness
