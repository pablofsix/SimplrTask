# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Custom hooks for project and task management (`useProjectManager`, `useTaskManager`)
- Centralized routing helpers layer (`src/lib/routing.ts`) for GitHub Pages basePath handling
- TypeScript type safety improvements with proper type exports

### Changed
- Refactored task and project management logic out of main component
- Simplified `page.tsx` from 625 lines to ~400 lines
- Improved URL construction for GitHub Pages popout window handling

### Fixed
- Resolved TypeScript errors by exporting `PopoutPosition` type from storage layer
- Fixed `updateTasks()` return type handling to prevent undefined errors
- Added null checks for all `addActivity()` calls

---

## [0.1.0] - 2025-12-06

### Added
- Initial GitHub Pages deployment with static export configuration
- Project management: create, switch, delete, and rename projects
- Task management: create, update, delete tasks with status tracking
- Task history tracking: view modification history per task
- Global activity log: audit trail of all project changes
- Task copying: export tasks to clipboard in HTML or text format
- Popout window: dedicated window for task management with position memory
- Settings dialog: customize task status colors and copy format
- Cross-tab synchronization via StorageEvent listeners
- Responsive UI with Radix UI components and Tailwind CSS
- Dark theme with deep blue color scheme (#3F51B5)

### Features
- **Multi-project support**: Organize tasks into multiple projects
- **Activity tracking**: Complete audit log with timestamps and user actions
- **localStorage persistence**: All data saved locally on client
- **Popout window positioning**: Remember and restore popout position preferences
- **Task status workflow**: Pendiente → En proceso → Listo
- **Inline editing**: Edit task content directly in the UI
- **Batch operations**: Clear completed tasks functionality

### Technical
- Built with Next.js 15 with static export for GitHub Pages
- Client-side only (no backend server required)
- Genkit integration for potential AI-powered task summarization
- TypeScript for type safety
- Custom storage layer with date re-hydration
- Backwards compatibility for data migrations

### Deployment
- GitHub Pages deployment via `gh-pages` branch
- Automatic deployments via GitHub Actions
- Custom routing for GitHub Pages basePath (`/SimplrTask`)
- Static HTML/CSS/JS output

---

## [0.0.1] - Initial Setup

### Added
- Project scaffolding with Next.js 15
- Copilot instructions documentation
- GitHub Actions workflow for automated deployments
- Basic project structure and configuration
