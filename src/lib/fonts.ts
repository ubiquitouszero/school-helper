const FONT_KEY = 'school-helper-font';

export interface FontOption {
  id: string;
  name: string;
  description: string;
  family: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'comic-sans',
    name: 'Fun (Comic Sans)',
    description: 'Playful and friendly — may look cursive on some tablets',
    family: "'Comic Sans MS', 'Comic Sans', sans-serif",
  },
  {
    id: 'system',
    name: 'Clean (Default)',
    description: 'Easy to read on any device',
    family: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  },
  {
    id: 'rounded',
    name: 'Round & Fun',
    description: 'Bubbly letters that are still easy to read',
    family: "'Nunito', 'Varela Round', 'Quicksand', system-ui, sans-serif",
  },
];

export function getSavedFont(): string {
  if (typeof localStorage === 'undefined') return 'system';
  return localStorage.getItem(FONT_KEY) || 'system';
}

export function saveFont(fontId: string): void {
  localStorage.setItem(FONT_KEY, fontId);
  applyFont(fontId);
}

export function applyFont(fontId?: string): void {
  const id = fontId || getSavedFont();
  const option = FONT_OPTIONS.find(f => f.id === id) || FONT_OPTIONS[1];
  document.documentElement.style.setProperty('--font-fun', option.family);
}

export function getFontFamily(fontId: string): string {
  const option = FONT_OPTIONS.find(f => f.id === fontId);
  return option?.family || FONT_OPTIONS[1].family;
}
