# Claude Slash Commands

Custom slash commands for this project to streamline development workflow.

## Available Commands

### `/next-task` or `/nt`
Takes the first uncompleted task from TODO.md and starts working on it.

### `/resolve-todos` 
Moves all completed items (marked with `[x]`) from TODO.md to RESOLVED.md.

## Usage

Simply type the command in your message to Claude, and it will execute the associated action.

## Adding New Commands

Create a new `.md` file in this directory with:
- Command name
- Description
- The prompt/instructions for Claude to follow