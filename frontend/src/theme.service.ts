import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type AppTheme = 'theme-light' | 'theme-dark' | 'theme-high-contrast';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private currentThemeSubject = new BehaviorSubject<AppTheme>(
    (localStorage.getItem('app_theme') as AppTheme) || 'theme-light'
  );
  currentTheme$: Observable<AppTheme> = this.currentThemeSubject.asObservable();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.applyTheme(this.currentThemeSubject.value);
  }

  get currentTheme(): AppTheme {
    return this.currentThemeSubject.value;
  }

  get isDark(): boolean {
    return this.currentThemeSubject.value === 'theme-dark';
  }

  setTheme(theme: AppTheme): void {
    const validTheme: AppTheme = ['theme-light', 'theme-dark', 'theme-high-contrast'].includes(theme)
      ? theme
      : 'theme-light';
    localStorage.setItem('app_theme', validTheme);
    this.applyTheme(validTheme);
    this.currentThemeSubject.next(validTheme);
  }

  toggleTheme(): void {
    const nextTheme: AppTheme = this.currentTheme === 'theme-light' ? 'theme-dark' : 'theme-light';
    this.setTheme(nextTheme);
  }

  private applyTheme(theme: AppTheme): void {
    const host = document.body;
    if (!host) return;

    this.renderer.removeClass(host, 'theme-light');
    this.renderer.removeClass(host, 'theme-dark');
    this.renderer.removeClass(host, 'theme-high-contrast');
    this.renderer.addClass(host, theme);
    this.renderer.setAttribute(host, 'data-theme', theme === 'theme-dark' ? 'dark' : 'light');
  }
}