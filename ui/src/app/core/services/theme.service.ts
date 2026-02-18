import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDarkMode = signal<boolean>(false);

  constructor() {
    const theme = localStorage.getItem('theme');
    const prefersDark = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (!theme && prefersDark);
    this.isDarkMode.set(isDark);
    this.#applyTheme();
  }

  toggleTheme() {
    this.isDarkMode.update((dark) => !dark);
    this.#applyTheme();
  }

  #applyTheme() {
    const html = document.documentElement;
    if (this.isDarkMode()) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}
