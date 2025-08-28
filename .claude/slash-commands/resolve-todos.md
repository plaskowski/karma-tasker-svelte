# Move completed command

## Command
`/resolve-todos`

## Description
Move all completed tasks (marked with `[x]`) from TODO.md to RESOLVED.md.

## Prompt
1. Find all lines in TODO.md that start with `- [x]`
2. Remove these completed tasks from TODO.md
3. Add them to the appropriate section in RESOLVED.md (usually under "### UI/UX Improvements" or the first available section)
4. Preserve the formatting and indentation
5. Commit the changes with a message like "chore: move completed tasks to RESOLVED.md"

- Only move tasks that are marked as completed with `[x]`
- Do not move tasks marked with `[ ]`
- Maintain the original text of the tasks when moving them
- Place the moved tasks at the beginning of an existing section in RESOLVED.md, right after other completed tasks