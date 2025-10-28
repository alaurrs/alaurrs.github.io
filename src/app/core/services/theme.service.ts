import {Injectable, signal} from '@angular/core';

@Injectable({providedIn: 'root'})
export class ThemeService {
  private storageKey = 'theme';
  isDark = signal<boolean>(false);

  constructor() {
    const savedTheme = localStorage.getItem(this.storageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
    this.isDark.set(isDark);
  }

  toggle(): void {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.setItem(this.storageKey, isDark ? 'dark' : 'light');
    this.isDark.set(isDark);
  }
}
