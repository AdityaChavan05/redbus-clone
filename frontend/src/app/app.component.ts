import { Component, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

export type SupportedLanguage = 'en' | 'hi' | 'kn';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewChecked {
  title = 'redbus-clone';

  // Login / Account Modal Properties
  showLoginModal: boolean = false;
  loginPhone: string = '';
  loginEmail: string = '';
  loginName: string = '';
  loginOtp: string = '';
  otpSent: boolean = false;
  loginError: string = '';
  currentUser: any = null;

  private globalListener: any;
  private isTranslatingDom = false;

  // Cross-page UI dictionary so Hindi & Kannada translate labels across all pages
  private crossPageTranslations: Record<string, { hi: string; kn: string }> = {
    'Bus Tickets': { hi: 'बस टिकट', kn: 'ಬಸ್ ಟಿಕೆಟ್‌ಗಳು' },
    'Route Planner': { hi: 'रूट प्लानर', kn: 'ಮಾರ್ಗ ಯೋಜಕ' },
    'Community': { hi: 'कम्युनिटी', kn: 'ಸಮುದಾಯ' },
    'Reviews': { hi: 'समीक्षाएं', kn: 'ವಿಮರ್ಶೆಗಳು' },
    'Account': { hi: 'खाता', kn: 'ಖಾತೆ' },
    'SEARCH BUSES': { hi: 'बसें खोजें', kn: 'ಬಸ್‌ಗಳನ್ನು ಹುಡುಕಿ' },
    'MODIFY': { hi: 'बदलें', kn: 'ಬದಲಾಯಿಸಿ' },
    'FILTERS': { hi: 'फ़िल्टर', kn: 'ಫಿಲ್ಟರ್‌ಗಳು' },
    'Clear All': { hi: 'सभी साफ़ करें', kn: 'ಎಲ್ಲಾ ತೆರವುಗೊಳಿಸಿ' },
    'Sort by:': { hi: 'क्रमबद्ध करें:', kn: 'ವಿಂಗಡಿಸಿ:' },
    'Departure': { hi: 'प्रस्थान', kn: 'ಹೊರಡುವ ಸಮಯ' },
    'Duration': { hi: 'अवधि', kn: 'ಅವಧಿ' },
    'Arrival': { hi: 'आगमन', kn: 'ತಲುಪುವ ಸಮಯ' },
    'Ratings': { hi: 'रेटिंग', kn: 'ರೇಟಿಂಗ್‌ಗಳು' },
    'Fare': { hi: 'किराया', kn: 'ದರ' },
    'Seats Available': { hi: 'उपलब्ध सीटें', kn: 'ಲಭ್ಯವಿರುವ ಸೀಟುಗಳು' },
    'VIEW SEATS': { hi: 'सीटें देखें', kn: 'ಸೀಟುಗಳನ್ನು ವೀಕ್ಷಿಸಿ' },
    'HIDE SEATS': { hi: 'सीटें छिपाएं', kn: 'ಸೀಟುಗಳನ್ನು ಮರೆಮಾಡಿ' },
    'Booking for women': { hi: 'महिलाओं के लिए बुकिंग', kn: 'ಮಹಿಳೆಯರಿಗಾಗಿ ಬುಕಿಂಗ್' },
    'Exclusive 10% OFF for women': { hi: 'महिलाओं के लिए विशेष 10% छूट', kn: 'ಮಹಿಳೆಯರಿಗೆ ವಿಶೇಷ 10% ರಿಯಾಯಿತಿ' },
    'Lower Deck': { hi: 'निचला डेक', kn: 'ಕೆಳಗಿನ ಡೆಕ್' },
    'Upper Deck': { hi: 'ऊपरी डेक', kn: 'ಮೇಲಿನ ಡೆಕ್' },
    'PROCEED TO BOOK': { hi: 'बुक करने के लिए आगे बढ़ें', kn: 'ಬುಕ್ ಮಾಡಲು ಮುಂದುವರಿಯಿರಿ' },
    'OUR PREMIUM FLEET:': { hi: 'हमारा प्रीमियम बेड़ा:', kn: 'ನಮ್ಮ ಪ್ರೀಮಿಯಂ ಬಸ್‌ಗಳು:' }
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.applySavedTheme();
    this.loadSavedUser();

    this.globalListener = () => {
      this.applySavedTheme();
      this.applyCrossPageLanguage();
    };

    window.addEventListener('themeChanged', this.globalListener);
    window.addEventListener('languageChanged', this.globalListener);
    window.addEventListener('storage', this.globalListener);
    window.addEventListener('openLoginModal', () => {
      this.openLoginModal();
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.applySavedTheme();
        setTimeout(() => this.applyCrossPageLanguage(), 120);
      }
    });
  }

  ngAfterViewChecked(): void {
    const lang = (localStorage.getItem('rb_language') as SupportedLanguage) || 'en';
    if (lang !== 'en' && !this.isTranslatingDom) {
      this.applyCrossPageLanguage();
    }
  }

  ngOnDestroy(): void {
    if (this.globalListener) {
      window.removeEventListener('themeChanged', this.globalListener);
      window.removeEventListener('languageChanged', this.globalListener);
      window.removeEventListener('storage', this.globalListener);
    }
  }

  loadSavedUser(): void {
    try {
      const saved = localStorage.getItem('rb_current_user') || localStorage.getItem('Loggedinuser');
      if (saved) {
        this.currentUser = JSON.parse(saved);
      }
    } catch {
      this.currentUser = null;
    }
  }

  openLoginModal(): void {
    this.showLoginModal = true;
    this.loginError = '';
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
    this.otpSent = false;
    this.loginError = '';
  }

  sendOtp(): void {
    if (!this.loginPhone || this.loginPhone.trim().length < 10) {
      this.loginError = 'Please enter a valid 10-digit mobile number';
      return;
    }
    this.loginError = '';
    this.otpSent = true;
  }

  verifyOtpAndLogin(): void {
    const userObj = {
      name: this.loginName.trim() || 'Traveler',
      phone: this.loginPhone.trim(),
      email: this.loginEmail.trim() || 'traveler@redbus.in'
    };
    this.currentUser = userObj;
    localStorage.setItem('rb_current_user', JSON.stringify(userObj));
    localStorage.setItem('Loggedinuser', JSON.stringify(userObj));
    window.dispatchEvent(new Event('storage'));
    this.closeLoginModal();
  }

  logoutUser(): void {
    this.currentUser = null;
    localStorage.removeItem('rb_current_user');
    localStorage.removeItem('Loggedinuser');
    window.dispatchEvent(new Event('storage'));
  }

  applySavedTheme(): void {
    const isDark = localStorage.getItem('rb_dark_mode') === 'true';
    if (isDark) {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark-mode');
    }
  }

  applyCrossPageLanguage(): void {
    const lang = (localStorage.getItem('rb_language') as SupportedLanguage) || 'en';
    this.isTranslatingDom = true;

    try {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      let node: Node | null;

      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (!parent || ['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA'].includes(parent.tagName)) {
          continue;
        }

        const currentText = (node.nodeValue || '').trim();
        if (!currentText) continue;

        if (!parent.dataset['origEnText'] && this.crossPageTranslations[currentText]) {
          parent.dataset['origEnText'] = currentText;
        }

        const origEn = parent.dataset['origEnText'];
        if (origEn && this.crossPageTranslations[origEn]) {
          const targetText = lang === 'en' ? origEn : this.crossPageTranslations[origEn][lang];
          if (targetText && node.nodeValue?.trim() !== targetText) {
            node.nodeValue = node.nodeValue!.replace(currentText, targetText);
          }
        }
      }
    } finally {
      this.isTranslatingDom = false;
    }
  }
}