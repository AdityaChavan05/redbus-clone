import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private key = 'redbus_theme_preference';
  private isDarkSub = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.isDarkSub.asObservable();

  constructor() {
    const saved = localStorage.getItem(this.key);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setTheme(saved ? saved === 'dark' : prefersDark);
  }

  toggleTheme(): void {
    this.setTheme(!this.isDarkSub.value);
  }

  setTheme(isDark: boolean): void {
    this.isDarkSub.next(isDark);
    localStorage.setItem(this.key, isDark ? 'dark' : 'light');
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  get isDark(): boolean {
    return this.isDarkSub.value;
  }
}
