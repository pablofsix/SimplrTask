/**
 * Routing helpers for GitHub Pages basePath handling
 * Centralizes URL construction logic for the application
 */

/**
 * Get the base path segment for GitHub Pages
 * On GitHub Pages, the repo name becomes part of the URL path
 * Returns the first segment of pathname (e.g., '/SimplrTask' -> 'SimplrTask')
 * Returns empty string if not on a sub-path (e.g., localhost)
 */
export function getBasePath(): string {
  if (typeof window === 'undefined') return '';
  
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  // If we have path segments and they don't match common patterns, return first as basePath
  if (pathSegments.length > 0 && !pathSegments[0].includes('.')) {
    return pathSegments[0];
  }
  return '';
}

/**
 * Get the origin with base path
 * Combines origin (protocol + host) with basePath
 * @returns Full origin URL including basePath (e.g., 'https://pablofsix.github.io/SimplrTask')
 */
export function getOriginWithBasePath(): string {
  if (typeof window === 'undefined') return '';
  
  const basePath = getBasePath();
  const origin = window.location.origin;
  
  if (basePath) {
    return `${origin}/${basePath}`;
  }
  return origin;
}

/**
 * Get absolute URL for a route within the app
 * @param route - Route path (e.g., '/', '/popout')
 * @returns Full absolute URL with basePath
 */
export function getAbsoluteUrl(route: string = '/'): string {
  const base = getOriginWithBasePath();
  const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
  return `${base}${normalizedRoute}`;
}

/**
 * Get URL for the popout window
 * @returns Full URL to popout page
 */
export function getPopoutUrl(): string {
  return getAbsoluteUrl('/popout');
}

/**
 * Get URL for the main app page
 * @returns Full URL to main page
 */
export function getMainUrl(): string {
  return getAbsoluteUrl('/');
}

/**
 * Open popout window with standardized dimensions
 * @param width - Window width in pixels (default: 600)
 * @param height - Window height in pixels (default: 800)
 * @returns Reference to opened window or null
 */
export function openPopoutWindow(width = 600, height = 800): Window | null {
  const url = getPopoutUrl();
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  
  return window.open(
    url,
    'popout',
    `width=${width},height=${height},left=${left},top=${top}`
  );
}
