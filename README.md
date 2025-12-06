# ProjectFlow

A modern task management application built with Next.js 15, featuring project organization, activity tracking, and AI-powered task summarization using Google Gemini.

## Features

- **Project Management**: Create and organize multiple projects
- **Task Management**: Add, edit, delete, and track task status (Pendiente/En proceso/Listo)
- **Activity History**: Track all changes to tasks with modification history
- **AI Summarization**: Powered by Google Gemini 2.5 Flash
- **Local Storage**: All data persists in browser localStorage
- **Responsive Design**: Built with Tailwind CSS and Radix UI

## Getting Started

### Development

```bash
npm install
npm run dev
```

Visit http://localhost:9002

### Build for Production

```bash
npm run build
npm run deploy  # Deploy to GitHub Pages
```

## Tech Stack

- **Framework**: Next.js 15 (Static Export)
- **UI Library**: Radix UI + Tailwind CSS
- **AI**: Genkit with Google Gemini 2.5 Flash
- **Storage**: Browser localStorage
- **Deployment**: GitHub Pages

## Project Structure

- `src/app/` - Next.js app directory and pages
- `src/components/` - React components
- `src/lib/` - Utilities, types, and storage
- `src/ai/` - Genkit AI configuration

For more details, see `.github/copilot-instructions.md`
