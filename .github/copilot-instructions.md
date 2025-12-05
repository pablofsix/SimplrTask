# ProjectFlow Copilot Instructions

## Project Overview
ProjectFlow is a Next.js 15 task management application with project organization, activity tracking, and AI-powered task summarization. The app uses client-side localStorage for data persistence and Genkit with Google Gemini 2.5 Flash for AI features.

## Architecture

### Core Data Model (`src/lib/types.ts`)
- **AppData**: Root state containing projects, active project ID, and settings
- **Project**: Contains tasks and activity history; identified by `id`, has `name`
- **Task**: Core unit with `content` (max 150 chars), `status` (Pendiente/En proceso/Listo), `createdAt`, and `modifications` array
- **Modification**: Tracks changes to task content or status with timestamp and `from`/`to` values
- **GlobalActivity**: Project-level audit log for all task operations (created/content/status/deleted/reported)

### State Management
- All state persists via `localStorage` with key `'app-data'` (`src/lib/storage.ts`)
- Client-side only (`useEffect` guard in `page.tsx` checks `typeof window`)
- Date re-hydration required on load (`new Date()` conversions in `getAppData()`)
- No global provider needed; components lift state to `Home` (`src/app/page.tsx`)

### UI Framework
- Radix UI primitives in `src/components/ui/` (fully pre-built)
- Tailwind CSS for styling; colors follow blueprint: Deep blue (#3F51B5), light blue background (#E8EAF6), violet accents (#9575CD)
- Font: Inter from Google Fonts

## Component Patterns

### Main Layout
- **`page.tsx`** (625 lines): Main app root; handles project/task CRUD, settings, and dialog states
- **`main-content.tsx`**: Displays active project tasks and task-form
- **`task-form.tsx`**: Captures new task input with 150-character limit
- **`task-item.tsx`**: Renders individual task with edit/delete/status actions; inline editing via Textarea

### Dialogs
- **`history-dialog.tsx`**: Shows task modification history
- **`global-history-dialog.tsx`**: Shows project-wide activity log
- **`settings-dialog.tsx`**: Manages copy format and custom status colors

## Development Workflow

### Commands
- `npm run dev`: Start dev server on port 9002 with Turbopack
- `npm run build`: Generates static HTML in `out/` directory for GitHub Pages
- `npm run deploy`: Publishes `out/` to gh-pages branch
- `npm run genkit:dev`: Start Genkit server for local AI testing
- `npm run genkit:watch`: Watch mode with auto-reload (preferred for development)
- `npm run typecheck`: Type validation without emit

### Static Export Configuration
- **`next.config.ts`**: Set `output: 'export'` and `images.unoptimized: true` for static generation
- Build generates `/out` directory with pure HTML/CSS/JS (no server runtime)
- All features must be client-side; no API routes (except AI actions in `/app/actions.ts`)

### Build & Deploy to GitHub Pages
1. Ensure `next.config.ts` has `output: 'export'` and correct `basePath`
2. Build generates `/out` directory with pure HTML/CSS/JS (no server runtime)
3. For automatic deployment:
   - Push to GitHub (main/master branch)
   - GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically builds and deploys to gh-pages
   - No manual `npm run deploy` needed
4. Configure GitHub Pages in Settings → Pages → Deploy from branch → `gh-pages`
5. Site available at `https://pablofsix.github.io/SimplrTask`

## Key Patterns & Conventions

### Project-Specific Practices
1. **Status Types**: Spanish terms (`'Pendiente' | 'En proceso' | 'Listo'`) used throughout; never change to English without migrating all instances
2. **Activity Tracking**: Every task change adds entry to `GlobalActivity` array; use `addActivity()` helper in `page.tsx`
3. **Task Editing**: Inline editing with Textarea; save on `Enter`, cancel on `Escape`; display non-editing state with plain text
4. **Settings Persistence**: Per-app customization of status colors (hex values) and copy format (text/html)

### File Organization
- `src/app/`: Next.js route + layout
- `src/components/`: React components; dialogs handle modality, task-item handles row logic
- `src/lib/`: Utilities, types, storage layer
- `src/ai/`: Genkit config (`genkit.ts`) and dev entry point (`dev.ts`)

## Integration Points

### Genkit/AI Setup
- Model: Google Gemini 2.5 Flash via `@genkit-ai/google-genai`
- Config in `src/ai/genkit.ts`; export `ai` instance for use in actions
- Dev entry point at `src/ai/dev.ts`; start with `npm run genkit:watch`

### Storage Layer
- Always use `getAppData()`/`saveAppData()` from `src/lib/storage.ts`; never direct localStorage access
- Backward compatibility built-in (e.g., missing settings auto-generated)

## Common Tasks

### Adding a New Feature
1. Update `src/lib/types.ts` with new data structure
2. Update `storage.ts` migration logic if needed (e.g., `getInitialAppData()`)
3. Add component in `src/components/` following task-item pattern
4. Integrate state/handlers in `page.tsx`

### Debugging State
- Check localStorage via browser dev tools (`Application > Local Storage > app-data`)
- Console log in `useEffect` to verify hydration
- Use `npm run typecheck` for type issues before building

### Working with UI Components
- Import from `src/components/ui/` (pre-configured Radix primitives)
- Use Tailwind classes directly; no custom CSS files needed for basic styling
- Refer to `src/components/task-item.tsx` for status color badge pattern
