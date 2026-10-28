import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isDarkMode: boolean = false;
  selectedLanguage: string = 'en';
  unreadNotificationsCount: number = 3;

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('rb_theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.body.classList.add('dark-theme');
    }

    const savedLang = localStorage.getItem('rb_language');
    if (savedLang) {
      this.selectedLanguage = savedLang;
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('rb_theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('rb_theme', 'light');
    }
  }

  onLanguageChange(lang: string): void {
    this.selectedLanguage = lang;
    localStorage.setItem('rb_language', lang);
  }
}