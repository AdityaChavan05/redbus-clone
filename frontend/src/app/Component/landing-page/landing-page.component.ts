import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

export type SupportedLanguage = 'en' | 'hi' | 'kn';

export interface CouponOffer {
  code: string;
  discountAmount: number;
  minFare: number;
  shortDescKey: string;
  badgeKey: string;
  termsKeys: string[];
}

export interface PopularRouteItem {
  fromKey: string;
  toKey: string;
  fareKey: string;
  fromRaw: string;
  toRaw: string;
}

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit, OnDestroy {

  currentLang: SupportedLanguage = 'en';
  isDarkMode: boolean = false;

  // Search Fields
  sourceCity: string = 'Bengaluru';
  destinationCity: string = 'Mumbai';
  journeyDate: string = '';

  // Dropdown States
  showSourceDropdown: boolean = false;
  showDestinationDropdown: boolean = false;
  filteredSources: string[] = [];
  filteredDestinations: string[] = [];

  private storageListener: any;

  allCities: string[] = [
    'Bengaluru',
    'Mysuru',
    'Mangaluru',
    'Hubballi',
    'Belagavi',
    'Kalaburagi',
    'Chennai',
    'Coimbatore',
    'Madurai',
    'Hyderabad',
    'Vijayawada',
    'Visakhapatnam',
    'Mumbai',
    'Pune',
    'Nagpur',
    'Nashik',
    'Delhi',
    'Jaipur',
    'Ahmedabad',
    'Surat',
    'Vadodara',
    'Goa',
    'Kochi',
    'Thiruvananthapuram',
    'Kolkata',
    'Bhubaneswar',
    'Lucknow',
    'Kanpur',
    'Varanasi',
    'Indore',
    'Bhopal',
    'Chandigarh',
    'Amritsar',
    'Dehradun',
    'Guwahati',
    'Patna',
    'Ranchi',
    'Raipur',
    'Jammu',
    'Bidar',
    'Humnabad',
    'Udupi'
  ];

  // Comprehensive multi-language dictionary
  dictionary: Record<string, Record<SupportedLanguage, string>> = {
    // Hero Search
    'hero_title': { 
      en: "India's No. 1 Online Bus Ticket Booking Site", 
      hi: 'भारत की नंबर 1 ऑनलाइन बस टिकट बुकिंग साइट', 
      kn: 'ಭಾರತದ ನಂ. 1 ಆನ್‌ಲೈನ್ ಬಸ್ ಟಿಕೆಟ್ ಬುಕಿಂಗ್ ತಾಣ' 
    },
    'hero_subtitle': { 
      en: 'Book Volvo, AC Sleeper, Semi-Sleeper, and Electric intercity coaches', 
      hi: 'वोल्वो, एसी स्लीपर, सेमी-स्लीपर और इलेक्ट्रिक इंटरसिटी बसें बुक करें', 
      kn: 'ವೋಲ್ವೋ, ಎಸಿ ಸ್ಲೀಪರ್, ಸೆಮಿ-ಸ್ಲೀಪರ್ ಮತ್ತು ಎಲೆಕ್ಟ್ರಿಕ್ ಬಸ್‌ಗಳನ್ನು ಬುಕ್ ಮಾಡಿ' 
    },
    'lbl_from': { en: 'FROM', hi: 'प्रस्थान', kn: 'ಹೊರಡುವ ಸ್ಥಳ' },
    'lbl_to': { en: 'TO', hi: 'गंतव्य', kn: 'ತಲುಪುವ ಸ್ಥಳ' },
    'lbl_date': { en: 'DATE OF JOURNEY', hi: 'यात्रा की तारीख', kn: 'ಪ್ರಯಾಣದ ದಿನಾಂಕ' },
    'placeholder_from': { en: 'Origin City', hi: 'प्रस्थान शहर', kn: 'ಹೊರಡುವ ನಗರ' },
    'placeholder_to': { en: 'Destination City', hi: 'गंतव्य शहर', kn: 'ತಲುಪುವ ನಗರ' },
    'chip_today': { en: 'Today', hi: 'आज', kn: 'ಇಂದು' },
    'chip_tomorrow': { en: 'Tomorrow', hi: 'कल', kn: 'ನಾಳೆ' },
    'btn_search': { en: 'SEARCH BUSES', hi: 'बसें खोजें', kn: 'ಬಸ್ ಹುಡುಕಿ' },

    // Trending Offers
    'badge_trending': { en: '🔥 TRENDING DISCOUNTS', hi: '🔥 ट्रेंडिंग डिस्काउंट्स', kn: '🔥 ಟ್ರೆಂಡಿಂಗ್ ರಿಯಾಯಿತಿಗಳು' },
    'offers_heading': { en: 'Trending Offers & Steal Deals', hi: 'ट्रेंडिंग ऑफर्स और डील्स', kn: 'ಟ್ರೆಂಡಿಂಗ್ ಕೊಡುಗೆಗಳು ಮತ್ತು ಡೀಲ್‌ಗಳು' },
    'offers_sub': { 
      en: 'Save more on intercity travel with verified coupons and bank offers', 
      hi: 'सत्यापित कूपन और बैंक ऑफर्स के साथ इंटरसिटी यात्रा पर अधिक बचत करें', 
      kn: 'ದೃಢೀಕೃತ ಕೂಪನ್‌ಗಳು ಮತ್ತು ಬ್ಯಾಂಕ್ ಕೊಡುಗೆಗಳೊಂದಿಗೆ ಹೆಚ್ಚಿನ ಉಳಿತಾಯ ಮಾಡಿ' 
    },
    'btn_view_details': { en: 'View details', hi: 'विवरण देखें', kn: 'ವಿವರಗಳನ್ನು ನೋಡಿ' },
    'btn_copy': { en: 'Copy', hi: 'कॉपी', kn: 'ಕಾಪಿ' },
    'btn_copied': { en: 'Copied', hi: 'कॉपी किया गया', kn: 'ಕಾಪಿ ಮಾಡಲಾಗಿದೆ' },

    // Coupons
    'badge_superhit': { en: 'AP & TS ROUTES', hi: 'आंध्र और तेलंगाना रूट', kn: 'ಆಂಧ್ರ ಮತ್ತು ತೆಲಂಗಾಣ ಮಾರ್ಗ' },
    'desc_superhit': { 
      en: 'Save up to Rs. 300 in AP, Telangana routes while making your booking', 
      hi: 'बुकिंग करते समय आंध्र प्रदेश, तेलंगाना मार्गों पर ₹300 तक बचाएं', 
      kn: 'ಬುಕಿಂಗ್ ಮಾಡುವಾಗ ಆಂಧ್ರ, ತೆಲಂಗಾಣ ಮಾರ್ಗಗಳಲ್ಲಿ ₹300 ವರೆಗೆ ಉಳಿಸಿ' 
    },
    'badge_bus300': { en: 'ALL ROUTES', hi: 'सभी रूट', kn: 'ಎಲ್ಲಾ ಮಾರ್ಗಗಳು' },
    'desc_bus300': { 
      en: 'Save upto Rs 300 while making your booking', 
      hi: 'अपनी बुकिंग करते समय ₹300 तक बचाएं', 
      kn: 'ಬುಕಿಂಗ್ ಮಾಡುವಾಗ ₹300 ವರೆಗೆ ಉಳಿಸಿ' 
    },
    'badge_cash300': { en: 'SOUTH SPECIAL', hi: 'साउथ स्पेशल', kn: 'ದಕ್ಷಿಣ ವಿಶೇಷ' },
    'desc_cash300': { 
      en: 'Save up to Rs 300 on Karnataka, Tamil Nadu, Kerala routes while making your booking', 
      hi: 'कर्नाटक, तमिलनाडु, केरल मार्गों पर ₹300 तक बचाएं', 
      kn: 'ಕರ್ನಾಟಕ, ತಮಿಳುನಾಡು, ಕೇರಳ ಮಾರ್ಗಗಳಲ್ಲಿ ₹300 ವರೆಗೆ ಉಳಿಸಿ' 
    },
    'badge_idfc500': { en: 'IDFC BANK', hi: 'आईडीएफसी बैंक', kn: 'ಐಡಿಎಫ್‌ಸಿ ಬ್ಯಾಂಕ್' },
    'desc_idfc500': { 
      en: 'Save up to Rs 500 on IDFC FIRST Bank Credit cards while making your booking', 
      hi: 'आईडीएफसी फर्स्ट बैंक क्रेडिट कार्ड पर ₹500 तक बचाएं', 
      kn: 'ಐಡಿಎಫ್‌ಸಿ ಫಸ್ಟ್ ಬ್ಯಾಂಕ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್‌ನಲ್ಲಿ ₹500 ವರೆಗೆ ಉಳಿಸಿ' 
    },
    'badge_rblcc500': { en: 'RBL BANK', hi: 'आरबीएल बैंक', kn: 'ಆರ್‌ಬಿಎಲ್ ಬ್ಯಾಂಕ್' },
    'desc_rblcc500': { 
      en: 'Save upto Rs 500 on RBL Bank Credit card while making your booking', 
      hi: 'आरबीएल बैंक क्रेडिट कार्ड पर ₹500 तक बचाएं', 
      kn: 'ಆರ್‌ಬಿಎಲ್ ಬ್ಯಾಂಕ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್‌ನಲ್ಲಿ ₹500 ವರೆಗೆ ಉಳಿಸಿ' 
    },
    'badge_aubus200': { en: 'AU BANK', hi: 'एयू बैंक', kn: 'ಎಯು ಬ್ಯಾಂಕ್' },
    'desc_aubus200': { 
      en: 'Save upto Rs 200 with AU Bank Credit Cards while making your booking', 
      hi: 'एयू बैंक क्रेडिट कार्ड के साथ ₹200 तक बचाएं', 
      kn: 'ಎಯು ಬ್ಯಾಂಕ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್‌ನೊಂದಿಗೆ ₹200 ವರೆಗೆ ಉಳಿಸಿ' 
    },
    'badge_axis500': { en: 'AXIS BANK', hi: 'एक्सिस बैंक', kn: 'ಆಕ್ಸಿಸ್ ಬ್ಯಾಂಕ್' },
    'desc_axis500': { 
      en: 'Save upto Rs 500 with Axis Bank Credit Cards while making your booking', 
      hi: 'एक्सिस बैंक क्रेडिट कार्ड के साथ ₹500 तक बचाएं', 
      kn: 'ಆಕ್ಸಿಸ್ ಬ್ಯಾಂಕ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್‌ನೊಂದಿಗೆ ₹500 ವರೆಗೆ ಉಳಿಸಿ' 
    },
    'badge_primoday': { en: 'PRIMO OPERATOR', hi: 'प्रिमो ऑपरेटर', kn: 'ಪ್ರಿಮೋ ಆಪರೇಟರ್' },
    'desc_primoday': { 
      en: 'Save up to Rs 200 on Primo operators while making your booking', 
      hi: 'प्रिमो ऑपरेटरों पर बुकिंग करते समय ₹200 तक बचाएं', 
      kn: 'ಪ್ರಿಮೋ ಆಪರೇಟರ್‌ಗಳಲ್ಲಿ ಬುಕಿಂಗ್ ಮಾಡುವಾಗ ₹200 ವರೆಗೆ ಉಳಿಸಿ' 
    },

    // Popular Routes Section
    'routes_heading': { en: 'Popular Bus Routes', hi: 'लोकप्रिय बस मार्ग', kn: 'ಜನಪ್ರಿಯ ಬಸ್ ಮಾರ್ಗಗಳು' },
    'routes_sub': { 
      en: 'High frequency daily routes connecting top metropolitan and tourist hubs', 
      hi: 'शीर्ष महानगरों और पर्यटन केंद्रों को जोड़ने वाले दैनिक मार्ग', 
      kn: 'ಪ್ರಮುಖ ಮಹಾನಗರಗಳನ್ನು ಸಂಪರ್ಕಿಸುವ ಹೆಚ್ಚಿನ ಸಂಖ್ಯೆಯ ದೈನಂದಿನ ಮಾರ್ಗಗಳು' 
    },
    'fare_blr_mum': { en: 'From ₹1,350 onwards', hi: '₹1,350 से शुरू', kn: '₹1,350 ರಿಂದ ಪ್ರಾರಂಭ' },
    'fare_blr_hyd': { en: 'From ₹850 onwards', hi: '₹850 से शुरू', kn: '₹850 ರಿಂದ ಪ್ರಾರಂಭ' },
    'fare_pune_blr': { en: 'From ₹1,200 onwards', hi: '₹1,200 से शुरू', kn: '₹1,200 ರಿಂದ ಪ್ರಾರಂಭ' },
    'fare_blr_goa': { en: 'From ₹950 onwards', hi: '₹950 से शुरू', kn: '₹950 ರಿಂದ ಪ್ರಾರಂಭ' },
    'fare_blr_hub': { en: 'From ₹650 onwards', hi: '₹650 से शुरू', kn: '₹650 ರಿಂದ ಪ್ರಾರಂಭ' },
    'fare_hyd_mum': { en: 'From ₹1,100 onwards', hi: '₹1,100 से शुरू', kn: '₹1,100 ರಿಂದ ಪ್ರಾರಂಭ' },

    // Modal
    'modal_offer_details': { en: 'Offer details', hi: 'ऑफर विवरण', kn: 'ಕೊಡುಗೆ ವಿವರಗಳು' },
    'modal_terms_heading': { en: 'Terms & conditions', hi: 'नियम एवं शर्तें', kn: 'ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು' },
    'modal_btn_copy_code': { en: 'Copy offer code', hi: 'ऑफर कोड कॉपी करें', kn: 'ಆಫರ್ ಕೋಡ್ ಕಾಪಿ ಮಾಡಿ' },
    'modal_copied_msg': { en: 'Code Copied to Clipboard!', hi: 'कोड क्लिपबोर्ड पर कॉपी हो गया!', kn: 'ಕೋಡ್ ಕಾಪಿ ಮಾಡಲಾಗಿದೆ!' }
  };

  offers: CouponOffer[] = [
    {
      code: 'SUPERHIT',
      discountAmount: 300,
      minFare: 200,
      shortDescKey: 'desc_superhit',
      badgeKey: 'badge_superhit',
      termsKeys: [
        'Use code SUPERHIT to get 5% Discount upto Rs 300 off on Andhra Pradesh & Telangana routes.',
        'redBus offer (SUPERHIT) applicable for minimum ticket value of Rs 200.',
        'Offer valid only for bus ticket bookings.',
        'redBus offer is valid only for logged-in users who verify their mobile number with OTP.'
      ]
    },
    {
      code: 'BUS300',
      discountAmount: 300,
      minFare: 200,
      shortDescKey: 'desc_bus300',
      badgeKey: 'badge_bus300',
      termsKeys: [
        'Use code BUS300 to get instant savings up to Rs 300 while making your booking.',
        'redBus offer applicable for minimum ticket value of Rs 200.',
        'Apply the offer code on the payment screen.'
      ]
    },
    {
      code: 'CASH300',
      discountAmount: 300,
      minFare: 200,
      shortDescKey: 'desc_cash300',
      badgeKey: 'badge_cash300',
      termsKeys: [
        'Use code CASH300 to get 5% Cashback upto Rs 300 on Karnataka, Kerala and Tamil Nadu routes.',
        'redBus offer applicable for minimum ticket value of Rs 200.',
        'Cashback will be credited to your redBus wallet post journey.'
      ]
    },
    {
      code: 'IDFC500',
      discountAmount: 500,
      minFare: 1000,
      shortDescKey: 'desc_idfc500',
      badgeKey: 'badge_idfc500',
      termsKeys: [
        'Use IDFC500 to get 10% off upto Rs 500 on booking bus tickets through IDFC FIRST Bank Credit cards.',
        'IDFC500 offer is applicable for a Base fare of Rs 1000.',
        'This offer is valid only on Saturdays and Sundays.'
      ]
    },
    {
      code: 'RBLCC500',
      discountAmount: 500,
      minFare: 1000,
      shortDescKey: 'desc_rblcc500',
      badgeKey: 'badge_rblcc500',
      termsKeys: [
        'Enter coupon code RBLCC500 at the time of booking to be eligible for discount.',
        'Make your payment through RBL Bank Credit card.',
        'Use RBLCC500 to get 15% off of Base fare on booking bus tickets.'
      ]
    },
    {
      code: 'AUBUS200',
      discountAmount: 200,
      minFare: 500,
      shortDescKey: 'desc_aubus200',
      badgeKey: 'badge_aubus200',
      termsKeys: [
        'Use code AUBUS200 to get instant savings up to Rs 200 on AU Bank Credit Cards.',
        'Applicable for base fare starting from Rs 500.'
      ]
    },
    {
      code: 'AXIS500',
      discountAmount: 500,
      minFare: 1000,
      shortDescKey: 'desc_axis500',
      badgeKey: 'badge_axis500',
      termsKeys: [
        'Use AXIS500 to get 10% off upto Rs 500 on Axis Bank Credit Card.',
        'AXIS500 offer is applicable for a Base fare of Rs 1000.'
      ]
    },
    {
      code: 'PRIMODAY',
      discountAmount: 200,
      minFare: 200,
      shortDescKey: 'desc_primoday',
      badgeKey: 'badge_primoday',
      termsKeys: [
        'Use code PRIMODAY to get 5% Discount upto Rs 100 and 5% Cashback upto Rs 100 on Primo operators.',
        'The PRIMODAY offer is applicable for travel on Tuesdays and Wednesdays.'
      ]
    }
  ];

  popularRoutes: PopularRouteItem[] = [
    { fromKey: 'Bengaluru', toKey: 'Mumbai', fareKey: 'fare_blr_mum', fromRaw: 'Bengaluru', toRaw: 'Mumbai' },
    { fromKey: 'Bengaluru', toKey: 'Hyderabad', fareKey: 'fare_blr_hyd', fromRaw: 'Bengaluru', toRaw: 'Hyderabad' },
    { fromKey: 'Pune', toKey: 'Bengaluru', fareKey: 'fare_pune_blr', fromRaw: 'Pune', toRaw: 'Bengaluru' },
    { fromKey: 'Bengaluru', toKey: 'Goa', fareKey: 'fare_blr_goa', fromRaw: 'Bengaluru', toRaw: 'Goa' },
    { fromKey: 'Bengaluru', toKey: 'Hubballi', fareKey: 'fare_blr_hub', fromRaw: 'Bengaluru', toRaw: 'Hubballi' },
    { fromKey: 'Hyderabad', toKey: 'Mumbai', fareKey: 'fare_hyd_mum', fromRaw: 'Hyderabad', toRaw: 'Mumbai' }
  ];

  selectedModalOffer: CouponOffer | null = null;
  copiedCode: string = '';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.syncGlobalState();
    this.setDateOffset(0);
    this.filteredSources = [...this.allCities];
    this.filteredDestinations = [...this.allCities];

    // Listen to theme and language switches dispatched by the navbar
    this.storageListener = () => {
      this.syncGlobalState();
      this.cdr.detectChanges();
    };

    window.addEventListener('storage', this.storageListener);
    window.addEventListener('languageChanged', this.storageListener);
    window.addEventListener('themeChanged', this.storageListener);
  }

  ngOnDestroy(): void {
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
      window.removeEventListener('languageChanged', this.storageListener);
      window.removeEventListener('themeChanged', this.storageListener);
    }
  }

  syncGlobalState(): void {
    const savedTheme = localStorage.getItem('rb_dark_mode');
    this.isDarkMode = savedTheme === 'true' || document.body.classList.contains('dark-mode');

    const savedLang = localStorage.getItem('rb_language') as SupportedLanguage;
    if (savedLang && ['en', 'hi', 'kn'].includes(savedLang)) {
      this.currentLang = savedLang;
    }
  }

  t(key: string): string {
    if (!key) return '';
    const trimmed = key.trim();
    if (this.dictionary[trimmed]) {
      return this.dictionary[trimmed][this.currentLang] || this.dictionary[trimmed]['en'] || trimmed;
    }
    return trimmed;
  }

  @HostListener('document:click', ['\$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-input-pill') && !target.closest('.modern-dropdown-menu')) {
      this.showSourceDropdown = false;
      this.showDestinationDropdown = false;
    }
  }

  filterSourceCities(): void {
    const query = (this.sourceCity || '').trim().toLowerCase();
    this.filteredSources = this.allCities.filter(c => 
      c.toLowerCase().includes(query) && c.toLowerCase() !== this.destinationCity.toLowerCase()
    );
    this.showSourceDropdown = true;
    this.showDestinationDropdown = false;
  }

  selectSourceCity(city: string): void {
    this.sourceCity = city;
    this.showSourceDropdown = false;
  }

  filterDestinationCities(): void {
    const query = (this.destinationCity || '').trim().toLowerCase();
    this.filteredDestinations = this.allCities.filter(c => 
      c.toLowerCase().includes(query) && c.toLowerCase() !== this.sourceCity.toLowerCase()
    );
    this.showDestinationDropdown = true;
    this.showSourceDropdown = false;
  }

  selectDestinationCity(city: string): void {
    this.destinationCity = city;
    this.showDestinationDropdown = false;
  }

  swapCities(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    const temp = this.sourceCity;
    this.sourceCity = this.destinationCity;
    this.destinationCity = temp;
    this.showSourceDropdown = false;
    this.showDestinationDropdown = false;
  }

  setDateOffset(offsetDays: number): void {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    this.journeyDate = `${yyyy}-${mm}-${dd}`;
  }

  searchBuses(): void {
    this.router.navigate(['/select-bus'], {
      queryParams: {
        from: this.sourceCity,
        to: this.destinationCity,
        date: this.journeyDate
      }
    });
  }

  selectPopularRoute(route: PopularRouteItem): void {
    this.sourceCity = route.fromRaw;
    this.destinationCity = route.toRaw;
    this.searchBuses();
  }

  openOfferModal(code: string): void {
    const found = this.offers.find(o => o.code === code);
    if (found) this.selectedModalOffer = found;
  }

  closeOfferModal(): void {
    this.selectedModalOffer = null;
    this.copiedCode = '';
  }

  copyCode(code: string): void {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
    }
    this.copiedCode = code;
    localStorage.setItem('rb_selected_coupon', code);
    setTimeout(() => {
      if (this.copiedCode === code) this.copiedCode = '';
    }, 2500);
  }
}