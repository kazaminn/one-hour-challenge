export const THEME_KEY = 'theme';

/**
 * Runs inline in <head> before paint so the page never flashes the wrong theme.
 * A fixed string with no user input, so inlining it is not an XSS vector.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.mode=d?'dark':'light'}catch(e){}})()`;
