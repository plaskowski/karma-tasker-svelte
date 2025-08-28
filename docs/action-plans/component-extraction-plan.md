# Component Extraction Plan: MainPane

**Note**: This extraction plan aligns with the [Target Architecture](../target-architecture.md), specifically:
- Pure ViewModel Pattern (all logic in ViewModels)
- No Direct Store Access Rule (all data via props)
- WorkspaceContext Pattern (rich context objects)
- Component hierarchy (route → container → presentation)

## Current Problem
`TaskList.svelte` is doing too much:
- Contains the top bar (title, action buttons)
- Contains the task list content
- Manages inline editing state
- Handles all the actions (new task, cleanup, refresh)

## Proposed Structure

```
MainPane.svelte (Container)
├── TopBar (Header with title and action buttons)
│   ├── Title (computed from current view)
│   └── Action Buttons (New Item, Cleanup, Refresh)
└── TaskList.svelte (Pure list display)
    ├── Task Groups
    ├── Task Items
    └── Inline Editor
```

## Component Responsibilities

### MainPane.svelte (Container Component)
- **Owns**: Overall layout, top bar, action handlers
- **Manages**: Which view to display (could later support different views)
- **Props**: Receives WorkspaceContext and NavigationState from parent
- **Actions**: handleNewTask, handleCleanup, handleRefresh
- **NO direct store access**: All data via props from +page.svelte

### TopBar (Presentation Component)
- **Displays**: View title, action buttons
- **Props**: title, onNewTask, onCleanup, onRefresh
- **Pure presentation**: No business logic, no store access
- **ViewModel**: Uses TopBarViewModel if complex logic needed

### TaskList.svelte (Presentation Component)
- **Owns**: Task display and grouping
- **Manages**: Inline editing state (via ViewModel)
- **Props**: workspace (WorkspaceContext), navigation (NavigationState), tasks, showCompleted
- **Actions**: onTaskToggle, onTaskClick only
- **ViewModel**: TaskListViewModel handles ALL view logic
- **NO direct store access**: All data via props

## Benefits

1. **Single Responsibility**: Each component has one clear job
2. **Reusability**: TaskList can be used without the top bar
3. **Testability**: Can test task display separately from actions
4. **Flexibility**: Easy to add different top bars for different contexts
5. **Clean ViewModel**: TaskList VM only handles task display logic
6. **Follows Architecture**: Aligns with no direct store access rule
7. **WorkspaceContext Pattern**: Uses rich context objects instead of individual props

## Migration Steps

1. Create MainPane.svelte as container component
2. Move top bar HTML and action handlers to MainPane
3. Keep TaskList focused on task display only
4. Update TaskListViewModel to remove action-related logic
5. Update +page.svelte to use MainPane instead of TaskList
6. Ensure MainPane receives WorkspaceContext and NavigationState as props
7. Verify NO direct store access in any component
8. Test everything works

## Future Considerations

- TopBar could become a separate component if reused
- MainPane could support different view modes (list, kanban, calendar)
- Actions could be moved to a toolbar component
- Could add filters/search to TopBar