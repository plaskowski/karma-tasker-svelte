# Karma Tasker - Current TODO & Roadmap

_Building what Nirvana couldn't deliver: workspace separation and family collaboration for GTD workflows._
_See [README.md](./README.md) for project overview and motivation._

### Next steps

- [X] reformat all files according to editorconfig
- [ ] use ISO string instead of Date object (as it gets serialized)
- [ ] fix remaining failing tests in e2e/keyboard-shortcuts.spec.ts
- [ ] rewrite all interaction tests to use dedicated Page object (have dedicated test() wrapper)
- [ ] rewrite handleTaskToggle into handleUpdateTask
- [ ] get rid of switching over view type
- [ ] emit events instead of onXXXX props?

### Clean-ups

- [ ] rename NewTaskDialog.svelte
- [ ] get rid of all fallbaks on projectId and perspectiveId
- [ ] should pageHandlers.ts be in services/ or next it its page.ts file?
- [ ] name default project better
- [ ] no big chunks of code in svelte files inside the markup part
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
