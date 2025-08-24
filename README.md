# Karma Tasker

A modern, GTD-aligned task management application built with SvelteKit. Organize your tasks across multiple workspaces using flexible, configurable perspectives.

## ✨ Key Features

### 🏢 **Multi-Workspace Organization**
- **Personal**, **Work**, and **Hobby** contexts
- Workspace-specific projects and perspectives
- URL-based state persistence for bookmarkable views

### 🎯 **GTD-Aligned Perspectives**
- **Inbox** - Unprocessed tasks awaiting organization
- **First** - Priority tasks for immediate focus  
- **Next** - Actionable tasks by context
- **Someday/Review/Ideas** - Future considerations (configurable per workspace)

### 📊 **Smart Task Organization**
- Required project assignment for all tasks
- Workspace-aware task and project filtering
- Clean, distraction-free interface

## 🛠️ Tech Stack

- **SvelteKit** + **Svelte 5** (runes mode)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Lucide Svelte** for icons
- **Local Storage** for persistence (mock backend)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
npm run dev -- --open
```

## 🏗️ Development

### Available Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Check for linting errors
```

### Project Structure
```
src/
├── lib/
│   ├── components/     # Svelte components
│   ├── stores/         # State management
│   ├── types/          # TypeScript interfaces
│   └── data/           # Mock data
├── routes/             # SvelteKit routes
└── app.html           # HTML template
```

## 📋 Project Philosophy

Built around **Getting Things Done (GTD)** principles with modern productivity enhancements:

- **Capture everything** in the Inbox
- **Organize by context** using workspaces 
- **Prioritize explicitly** with the First perspective
- **Review regularly** using perspective-based views

## 📚 Documentation

- **[TODO.md](./TODO.md)** - Current roadmap and future features
- **[RESOLVED.md](./RESOLVED.md)** - Completed features and development history

## 💡 Usage Tips

1. **Start with Inbox** - Capture tasks without thinking about organization
2. **Process to First** - Move high-priority items to your First perspective  
3. **Use workspaces** - Switch contexts to stay focused
4. **Assign projects** - All tasks require project assignment for better organization

---

*Simple, focused, and GTD-aligned task management for modern workflows.*