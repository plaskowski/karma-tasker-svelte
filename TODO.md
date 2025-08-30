# Karma Tasker - Current TODO & Roadmap

*Building what Nirvana couldn't deliver: workspace separation and family collaboration for GTD workflows.*
*See [README.md](./README.md) for project overview and motivation.*

### Next steps
- [ ] rewrite handleTaskToggle into handleUpdateTask
- [ ] get rid of switching over view type
- [ ] emit events instead of onXXXX props?

### Clean-ups
- [ ] fix Clear Completed button
- [ ] rename NewTaskDialog.svelte
- [ ] get rid of all fallbaks on projectId and perspectiveId
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
- [ ] Add semantic labels and test IDs for Playwright automation

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
