import { Component, OnInit } from '@angular/core';

export type SupportedLanguage = 'en' | 'hi' | 'kn';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  selectedLanguage: SupportedLanguage = 'en';
  isDarkMode: boolean = false;
  unreadNotificationsCount: number = 3;

  ngOnInit(): void {
    // 1. Restore Language State from localStorage
    const savedLang = localStorage.getItem('rb_language') as SupportedLanguage;
    if (savedLang && ['en', 'hi', 'kn'].includes(savedLang)) {
      this.selectedLanguage = savedLang;
    } else {
      this.selectedLanguage = 'en';
      localStorage.setItem('rb_language', 'en');
    }

    // 2. Restore Dark Mode State from localStorage
    const savedTheme = localStorage.getItem('rb_dark_mode');
    if (savedTheme !== null) {
      this.isDarkMode = savedTheme === 'true';
    } else {
      this.isDarkMode = document.body.classList.contains('dark-mode');
    }
    this.applyTheme(this.isDarkMode);
  }

  onLanguageChange(event: any): void {
    const lang = (event?.target ? event.target.value : event) as SupportedLanguage;
    this.selectedLanguage = lang;
    localStorage.setItem('rb_language', lang);

    // Broadcast globally to all pages and route views
    window.dispatchEvent(new Event('languageChanged'));
    window.dispatchEvent(new Event('storage'));
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme(this.isDarkMode);

    // Broadcast theme switch across all components
    window.dispatchEvent(new Event('themeChanged'));
    window.dispatchEvent(new Event('storage'));
  }

  private applyTheme(isDark: boolean): void {
    localStorage.setItem('rb_dark_mode', String(isDark));
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}