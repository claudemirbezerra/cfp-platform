export const CFP_THEME_STORAGE_KEY = 'cfp-theme';
export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export type CfpTheme = 'light' | 'night';

export function storedTheme(): CfpTheme | null {
  try {
    const value = localStorage.getItem(CFP_THEME_STORAGE_KEY);
    return value === 'light' || value === 'night' ? value : null;
  } catch {
    return null;
  }
}

export function systemPrefersNight(): boolean {
  return window.matchMedia(DARK_SCHEME_QUERY).matches;
}
