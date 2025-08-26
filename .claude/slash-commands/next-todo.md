# Next TODO Command

## Command
`/next-todo` or `/nt`

## Description
Instructs Claude to take and work on the first uncompleted item from TODO.md

## Prompt
Please take the first uncompleted item (marked with `[ ]`) from @TODO.md and start working on it. Follow these steps:

1. Read the TODO.md file
2. Find the first item marked with `[ ]`
3. Create a todo list entry for tracking the task
4. Begin implementing the feature/fix
5. When complete, mark it as `[x]` in TODO.md
6. Move the completed item to RESOLVED.md
7. Commit the changes following the development workflow rules

If the item needs clarification, ask for details before proceeding.