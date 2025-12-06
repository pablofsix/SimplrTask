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

## Troubleshooting

### Data Issues

#### "I lost all my data after closing the browser"
- **Cause**: Browser cache was cleared or private/incognito mode was used
- **Solution**: ProjectFlow stores data in localStorage. Clearing browser data will delete all projects and tasks
- **Prevention**: Export your data regularly or use a public browser profile (not incognito)

#### "My data is not syncing between tabs"
- **Cause**: Storage event listener may not be active
- **Solution**: 
  - Refresh both tabs/windows
  - Ensure localStorage is enabled in browser settings
  - Check browser console for errors (F12)
- **Technical**: ProjectFlow uses StorageEvent to sync changes across tabs

#### "Projects or tasks disappeared"
- **Cause**: Potential data corruption or browser storage issue
- **Solution**:
  1. Open browser DevTools (F12)
  2. Go to Application > Local Storage
  3. Find entry with key `app-data`
  4. Check if data is present and valid JSON
  5. If corrupted, delete it and create new projects

### Popout Window Issues

#### "Popout window shows 404 or doesn't open"
- **Cause**: Browser popup blocker or incorrect GitHub Pages configuration
- **Solution**:
  - Check popup blocker settings - allow popups from this site
  - Verify you're accessing from correct URL: `https://pablofsix.github.io/SimplrTask`
  - Try opening popout immediately after page loads
- **Technical**: Popout uses dynamic URL construction with basePath `/SimplrTask`

#### "Popout window position is not saved"
- **Cause**: Position localStorage key not being written
- **Solution**:
  - Ensure localStorage is enabled
  - Try moving the popout window to a different position
  - Refresh page and move popout again
- **Technical**: Position stored in localStorage key `popout-position`

### Performance & Storage

#### "App is running slowly or freezing"
- **Cause**: Too many tasks/projects or large activity history
- **Solution**:
  - Archive or clear completed tasks using "Limpiar completadas"
  - Delete inactive projects
  - Check localStorage usage: DevTools > Application > Local Storage > Size
  - localStorage limit is typically 5-10MB per domain

#### "localStorage quota exceeded error"
- **Cause**: Storage quota limit reached (usually 5-10MB)
- **Solution**:
  1. Open DevTools > Application > Local Storage
  2. Check size of `app-data` entry
  3. Archive old projects or clear activity history
  4. Delete completed tasks
  5. Clear unnecessary data

### Browser & Compatibility

#### "App doesn't load or shows blank page"
- **Cause**: 
  - JavaScript disabled
  - Browser doesn't support required APIs
  - CSP (Content Security Policy) violation
- **Solution**:
  - Ensure JavaScript is enabled (Settings > Privacy & security)
  - Try different browser (Chrome, Firefox, Edge, Safari)
  - Clear browser cache: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
  - Check DevTools Console (F12) for error messages

#### "Styling looks broken or colors are wrong"
- **Cause**: CSS not loaded or browser cache issue
- **Solution**:
  - Hard refresh: Ctrl+F5 (Cmd+Shift+R on Mac)
  - Clear browser cache
  - Try incognito window (not for persistent data - use for testing)

### Debugging Tips

#### Enable console logging for debugging
\\\javascript
// Open DevTools (F12) and paste into Console:
localStorage.getItem('app-data') // View all stored data
JSON.parse(localStorage.getItem('app-data')) // Pretty print
localStorage.removeItem('app-data') // Clear all data (careful!)
\\\

#### Check what's consuming localStorage
\\\javascript
// In browser console:
Object.keys(localStorage).forEach(key => {
  const size = new Blob([localStorage[key]]).size;
  console.log(\\: \KB\);
});
\\\

#### Force resync between windows
\\\javascript
// In browser console of one window:
window.dispatchEvent(new StorageEvent('storage', {
  key: 'app-data',
  newValue: localStorage.getItem('app-data')
}));
\\\

### Getting Help

- **GitHub Issues**: Report bugs or request features at [GitHub Issues](https://github.com/pablofsix/SimplrTask/issues)
- **Check Existing Issues**: Search closed issues for solutions
- **Include Details**: 
  - Browser and version
  - Error messages from console (F12)
  - Steps to reproduce
  - Expected vs actual behavior

### Known Limitations

- **No Backend Sync**: Data is local-only (no cloud backup)
- **Single Device**: Each device has separate data
- **Storage Limit**: Browser localStorage limit (usually 5-10MB)
- **No Offline First**: Works in browser only (not PWA yet)
- **No Real-time Collaboration**: Single user per browser
