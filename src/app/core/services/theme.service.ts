import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';
export type AccentTheme = 'indigo' | 'emerald' | 'violet' | 'ocean';

export interface ThemeOption {
  id: AccentTheme;
  name: string;
  primaryColor: string;
  previewClass: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'indigo', name: 'Indigo Pro', primaryColor: '#6366f1', previewClass: 'theme-preview-indigo' },
  { id: 'emerald', name: 'Emerald Edu', primaryColor: '#10b981', previewClass: 'theme-preview-emerald' },
  { id: 'violet', name: 'Violet Modern', primaryColor: '#8b5cf6', previewClass: 'theme-preview-violet' },
  { id: 'ocean', name: 'Ocean Cyan', primaryColor: '#0ea5e9', previewClass: 'theme-preview-ocean' }
];

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public readonly mode = signal<ThemeMode>('light');
  public readonly accent = signal<AccentTheme>('indigo');

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const savedMode = (localStorage.getItem('smartclass_theme_mode') as ThemeMode) || 'light';
    const savedAccent = (localStorage.getItem('smartclass_accent_theme') as AccentTheme) || 'indigo';

    this.mode.set(savedMode);
    this.accent.set(savedAccent);
    this.applyTheme(savedMode, savedAccent);
  }

  public toggleDarkMode(): void {
    const newMode: ThemeMode = this.mode() === 'light' ? 'dark' : 'light';
    this.setMode(newMode);
  }

  public setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    localStorage.setItem('smartclass_theme_mode', mode);
    this.applyTheme(mode, this.accent());
  }

  public setAccent(accent: AccentTheme): void {
    this.accent.set(accent);
    localStorage.setItem('smartclass_accent_theme', accent);
    this.applyTheme(this.mode(), accent);
  }

  private applyTheme(mode: ThemeMode, accent: AccentTheme): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-theme', mode);
      root.setAttribute('data-accent', accent);
    }
  }
}
