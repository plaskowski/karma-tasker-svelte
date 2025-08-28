# Perspectives are required

This project treats every perspective as a real, explicit perspective with a concrete id. Inbox is not a special case.

Key rules:

- Task.perspective is required (string). No blank/undefined/sentinel value.
- Each workspace defines its own perspectives, ordered by `order`. The first item is the default (often Inbox) for that workspace.
- The app never relies on a magic id like `inbox`. It always uses the actual perspective ids from the workspace configuration.
- Default behavior:
  - Default view is the first perspective of the current workspace.
  - New tasks default to the current perspective when in a perspective view, otherwise to the first perspective of the current workspace.
- Filtering and counts always compare `task.perspective === <currentPerspectiveId>` for perspective views.
- UI lists perspectives using the workspace-defined order; the first is shown first.
- Seed/mock data should set a real perspective id on every task.

Implementation notes:

- Derived stores provide ordered perspective lists and the first perspective id (default).
- Editor selects bind to real perspective ids.
- Legacy logic that treated undefined perspective as Inbox is removed.
