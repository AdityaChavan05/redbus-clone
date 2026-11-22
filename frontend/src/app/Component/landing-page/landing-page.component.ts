import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

export type SupportedLanguage = 'en' | 'hi' | 'kn';

export interface OfferCardItem {
  id: string;
  tag: string;
  name: string;
  code: string;
  title: string;
  description: string;
  validText: string;
  badgeColor: 'emerald' | 'pink' | 'blue' | 'amber' | 'purple' | 'rose';
  operatorName: string;
  operatorThumb: string;
  discountBadge: string;
  terms: string[];
}

export interface PopularRouteItem {
  source: string;
  destination: string;
  from: string;
  to: string;
  busName: string;
  busType: string;
  distance: string;
  duration: string;
  startingFare: number;
  dailyBuses: number;
  badge: string;
  thumbUrl: string;
}

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit, OnDestroy {

  currentLang: SupportedLanguage = 'en';
  isDarkMode: boolean = false;

  // Starts empty so From & To are freely changeable
  sourceCity: string = '';
  destinationCity: string = '';
  journeyDate: string = '';

  // Dropdown & Filtered Lists
  showSourceDropdown: boolean = false;
  showDestinationDropdown: boolean = false;
  filteredSources: string[] = [];
  filteredDestinations: string[] = [];

  // Offer Modal & Copy Feedback
  selectedModalOffer: OfferCardItem | null = null;
  copiedCouponCode: string = '';
  toastMessage: string = '';

  popularCitiesList: string[] = [
    'Bengaluru', 'Mumbai', 'Hyderabad', 'Chennai', 'Pune', 'Goa',
    'Humnabad', 'Kalaburagi', 'Bidar', 'Delhi', 'Kolkata', 'Ahmedabad',
    'Vijayawada', 'Visakhapatnam', 'Mysuru', 'Mangaluru', 'Hubballi',
    'Belagavi', 'Solapur', 'Nagpur', 'Indore', 'Jaipur', 'Kochi',
    'Coimbatore', 'Tirupati', 'Madurai', 'Siliguri', 'Bhubaneswar',
    'Surat', 'Vadodara', 'Udaipur', 'Jodhpur', 'Lucknow', 'Varanasi',
    'Patna', 'Ranchi', 'Guwahati', 'Chandigarh', 'Dehradun', 'Manali',
    'Davangere', 'Shivamogga', 'Udupi', 'Ballari', 'Raichur', 'Vijayapura',
    'Kolhapur', 'Nashik', 'Aurangabad', 'Nanded', 'Latur', 'Warangal',
    'Nizamabad', 'Khammam', 'Karimnagar', 'Guntur', 'Nellore', 'Kurnool'
  ];

  // Offers with clear Offer Names + Promo Codes
  offers: OfferCardItem[] = [
    {
      id: 'OFF-WOMEN-10',
      tag: 'WOMEN SPECIAL • 10% OFF',
      name: 'Women Traveler Privilege Offer',
      code: 'WOMEN10',
      title: 'Flat 10% OFF for Women Travelers',
      description: 'Save flat 10% on female seat bookings across VRL, Airavat, Shyamoli & Primo partner coaches',
      validText: 'Valid every day • Priority Female Seat Lock',
      badgeColor: 'pink',
      operatorName: 'VRL & Primo Partners',
      operatorThumb: 'assets/vrl-photos/front.png',
      discountBadge: '10% OFF',
      terms: [
        'Applicable on all female passenger seat bookings across partner operators.',
        'Automatically enforces adjacent female-only seat lock on 2-sleeper berths.',
        'Use coupon code WOMEN10 on the payment checkout screen.'
      ]
    },
    {
      id: 'OFF-SUPERHIT',
      tag: 'AP & TS ROUTES',
      name: 'SuperHit Intercity Saver',
      code: 'SUPERHIT',
      title: 'Save up to Rs 300 on Intercity Coaches',
      description: 'Save up to Rs 300 on Karnataka, Andhra Pradesh & Telangana AC Sleeper routes',
      validText: 'Valid till 30 Nov 2026',
      badgeColor: 'emerald',
      operatorName: 'KSRTC Airavat & Multi-Axle',
      operatorThumb: 'assets/vrl-photos/airavat1.jpg',
      discountBadge: 'SAVE ₹300',
      terms: [
        'Valid on minimum ticket booking value of Rs 700.',
        'Applicable on AC Sleeper, Multi-Axle Volvo, and Semi-Sleeper coaches.',
        'Apply code SUPERHIT before completing UPI or card payment.'
      ]
    },
    {
      id: 'OFF-BUS300',
      tag: 'ALL ROUTES',
      name: 'All-India Bus Bonanza',
      code: 'BUS300',
      title: 'Instant Rs 300 Savings on Executive Fleet',
      description: 'Save up to Rs 300 on IntrCity SmartBus, BharatBenz Washroom Coaches & Multi-Axle Sleepers',
      validText: 'No minimum booking value',
      badgeColor: 'blue',
      operatorName: 'IntrCity SmartBus',
      operatorThumb: 'assets/vrl-photos/inter1.jpg',
      discountBadge: 'FLAT ₹300',
      terms: [
        'Valid across all intercity routes in India.',
        'Redeemable once per user account during the promotional period.',
        'Enter coupon code BUS300 at checkout.'
      ]
    },
    {
      id: 'OFF-CASH300',
      tag: 'SOUTH SPECIAL',
      name: 'South & West Express Cashback',
      code: 'CASH300',
      title: 'Save up to Rs 300 on South & West Routes',
      description: 'Save up to Rs 300 on Karnataka, Tamil Nadu, Kerala, Maharashtra & Goa routes',
      validText: 'Applicable on 2+1 Sleeper & Seater',
      badgeColor: 'amber',
      operatorName: 'Shyamoli Paribahan',
      operatorThumb: 'assets/vrl-photos/shy1.jpg',
      discountBadge: '₹300 OFF',
      terms: [
        'Applicable on South & West India intercity corridors.',
        'Instant fare deduction applied directly on total ticket value.',
        'Apply coupon code CASH300 before paying.'
      ]
    },
    {
      id: 'OFF-IDFC500',
      tag: 'IDFC BANK',
      name: 'IDFC FIRST Bank Mega Offer',
      code: 'IDFC500',
      title: 'Flat Rs 500 OFF with IDFC Bank Cards',
      description: 'Save flat Rs 500 on IDFC FIRST Credit & Debit card bus ticket bookings',
      validText: 'Min booking Rs 1,500 • Verified Deal',
      badgeColor: 'purple',
      operatorName: 'Eicher Executive Fleet',
      operatorThumb: 'assets/vrl-photos/eicher1.jpeg',
      discountBadge: 'BANK ₹500',
      terms: [
        'Valid on IDFC FIRST Bank Credit and Debit Card transactions.',
        'Minimum base fare of Rs 1,500 required.',
        'Use promo code IDFC500 on the payment page.'
      ]
    }
  ];

  // Popular Intercity Bus Routes with Bus Operator Names & Coach Thumbnails
  popularRoutes: PopularRouteItem[] = [
    {
      source: 'Hyderabad',
      destination: 'Mumbai',
      from: 'Hyderabad',
      to: 'Mumbai',
      busName: 'VRL Travels • Volvo 9600',
      busType: '2+1 A/C Multi-Axle Sleeper',
      distance: '709 km',
      duration: '14h 30m',
      startingFare: 1150,
      dailyBuses: 48,
      badge: 'Most Booked',
      thumbUrl: 'assets/vrl-photos/front.png'
    },
    {
      source: 'Bengaluru',
      destination: 'Mumbai',
      from: 'Bengaluru',
      to: 'Mumbai',
      busName: 'Shyamoli Paribahan • Starz',
      busType: 'Volvo 9600s Multi-Axle Sleeper',
      distance: '984 km',
      duration: '14h 30m',
      startingFare: 1350,
      dailyBuses: 62,
      badge: 'Luxury 9600s',
      thumbUrl: 'assets/vrl-photos/shy1.jpg'
    },
    {
      source: 'Bengaluru',
      destination: 'Hyderabad',
      from: 'Bengaluru',
      to: 'Hyderabad',
      busName: 'KSRTC Airavat Club Class',
      busType: 'Volvo Multi-Axle Semi-Sleeper',
      distance: '575 km',
      duration: '09h 45m',
      startingFare: 950,
      dailyBuses: 74,
      badge: 'Primo On-Time',
      thumbUrl: 'assets/vrl-photos/airavat1.jpg'
    },
    {
      source: 'Humnabad',
      destination: 'Bengaluru',
      from: 'Humnabad',
      to: 'Bengaluru',
      busName: 'Eicher Executive Sleeper',
      busType: '2+1 A/C Sleeper Coach',
      distance: '635 km',
      duration: '11h 15m',
      startingFare: 980,
      dailyBuses: 28,
      badge: 'Night Express',
      thumbUrl: 'assets/vrl-photos/eicher1.jpeg'
    },
    {
      source: 'Kalaburagi',
      destination: 'Bengaluru',
      from: 'Kalaburagi',
      to: 'Bengaluru',
      busName: 'IntrCity SmartBus',
      busType: 'BharatBenz A/C Washroom Sleeper',
      distance: '610 km',
      duration: '10h 45m',
      startingFare: 920,
      dailyBuses: 35,
      badge: 'Washroom Onboard',
      thumbUrl: 'assets/vrl-photos/inter1.jpg'
    },
    {
      source: 'Bengaluru',
      destination: 'Chennai',
      from: 'Bengaluru',
      to: 'Chennai',
      busName: 'TATA Magna Luxury Coach',
      busType: '2+1 A/C Executive Seater/Sleeper',
      distance: '346 km',
      duration: '06h 30m',
      startingFare: 680,
      dailyBuses: 90,
      badge: 'Fastest Corridor',
      thumbUrl: 'assets/vrl-photos/tata1.jpg'
    }
  ];

  private globalEventsListener: any;

  // Complete Translation Dictionary (covers all keys visible in your screenshots)
  dictionary: Record<string, Record<SupportedLanguage, string>> = {
    'hero_title': {
      en: "India's No. 1 Online Bus Ticket Booking Site",
      hi: 'भारत की नंबर 1 ऑनलाइन बस टिकट बुकिंग साइट',
      kn: 'ಭಾರತದ ನಂ. 1 ಆನ್‌ಲೈನ್ ಬಸ್ ಟಿಕೆಟ್ ಬುಕಿಂಗ್ ಸೈಟ್'
    },
    'hero_subtitle': {
      en: 'Book Volvo, AC Sleeper, Semi-Sleeper, and Electric intercity coaches',
      hi: 'वोल्वो, एसी स्लीपर, सेमी-स्लीपर और इलेक्ट्रिक इंटरसिटी बसें बुक करें',
      kn: 'ವೋಲ್ವೋ, ಎಸಿ ಸ್ಲೀಪರ್, ಸೆಮಿ-ಸ್ಲೀಪರ್ ಮತ್ತು ಎಲೆಕ್ಟ್ರಿಕ್ ಬಸ್‌ಗಳನ್ನು ಬುಕ್ ಮಾಡಿ'
    },
    'label_from': {
      en: 'From',
      hi: 'प्रस्थान शहर',
      kn: 'ಹೊರಡುವ ಸ್ಥಳ'
    },
    'label_to': {
      en: 'To',
      hi: 'गंतव्य शहर',
      kn: 'ತಲುಪುವ ಸ್ಥಳ'
    },
    'label_date': {
      en: 'Date of Journey',
      hi: 'यात्रा की तिथि',
      kn: 'ಪ್ರಯಾಣದ ದಿನಾಂಕ'
    },
    'placeholder_from': {
      en: 'Enter source city',
      hi: 'प्रस्थान शहर लिखें',
      kn: 'ಹೊರಡುವ ನಗರ ನಮೂದಿಸಿ'
    },
    'placeholder_to': {
      en: 'Enter destination city',
      hi: 'गंतव्य शहर लिखें',
      kn: 'ತಲುಪುವ ನಗರ ನಮೂದಿಸಿ'
    },
    'chip_today': {
      en: 'Today',
      hi: 'आज',
      kn: 'ಇಂದು'
    },
    'chip_tomorrow': {
      en: 'Tomorrow',
      hi: 'कल',
      kn: 'ನಾಳೆ'
    },
    'btn_today': {
      en: 'Today',
      hi: 'आज',
      kn: 'ಇಂದು'
    },
    'btn_tomorrow': {
      en: 'Tomorrow',
      hi: 'कल',
      kn: 'ನಾಳೆ'
    },
    'btn_search': {
      en: 'SEARCH BUSES',
      hi: 'बसें खोजें',
      kn: 'ಬಸ್‌ಗಳನ್ನು ಹುಡುಕಿ'
    },
    'offers_badge': {
      en: 'TRENDING OFFERS & PROMO CODES',
      hi: 'ट्रेंडिंग ऑफर्स',
      kn: 'ಟ್ರೆಂಡಿಂಗ್ ಆಫರ್‌ಗಳು'
    },
    'offers_title': {
      en: 'Exclusive Bus Booking Offers & Deals',
      hi: 'विशेष बस बुकिंग ऑफर्स और प्रोमो कोड',
      kn: 'ವಿಶೇಷ ಬಸ್ ಬುಕಿಂಗ್ ಕೊಡುಗೆಗಳು'
    },
    'offers_subtitle': {
      en: 'Save up to Rs 500 with verified operator coupons, bank offers & 10% Women booking deals',
      hi: 'सत्यापित ऑपरेटर कूपन, बैंक ऑफर्स और महिला बुकिंग पर 10% छूट के साथ ₹500 तक बचाएं',
      kn: 'ಅಧಿಕೃತ ಕೂಪನ್ ಕೋಡ್‌ಗಳು ಮತ್ತು ಮಹಿಳಾ ಪ್ರಯಾಣಿಕರಿಗೆ 10% ರಿಯಾಯಿತಿಯೊಂದಿಗೆ ₹500 ವರೆಗೆ ಉಳಿಸಿ'
    },
    'view_details': {
      en: 'View Details',
      hi: 'विवरण देखें',
      kn: 'ವಿವರಗಳನ್ನು ನೋಡಿ'
    },
    'btn_copy': {
      en: 'Copy Code',
      hi: 'कोड कॉपी करें',
      kn: 'ಕೋಡ್ ಕಾಪಿ ಮಾಡಿ'
    },
    'routes_heading': {
      en: 'Popular Intercity Bus Routes',
      hi: 'लोकप्रिय इंटरसिटी बस मार्ग',
      kn: 'ಜನಪ್ರಿಯ ಇಂಟರ್‌ಸಿಟಿ ಬಸ್ ಮಾರ್ಗಗಳು'
    },
    'routes_subtitle': {
      en: 'Click any top corridor below to view live Volvo, AC Sleeper & Primo coaches',
      hi: 'लाइव वोल्वो और एसी स्लीपर बसें देखने के लिए नीचे किसी भी मार्ग पर क्लिक करें',
      kn: 'ಲೈವ್ ವೋಲ್ವೋ ಮತ್ತು ಎಸಿ ಸ್ಲೀಪರ್ ಬಸ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಲು ಕೆಳಗಿನ ಯಾವುದೇ ಮಾರ್ಗವನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ'
    }
  };

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.setDateOffset(0);
    this.filteredSources = this.popularCitiesList.slice(0, 12);
    this.filteredDestinations = this.popularCitiesList.slice(0, 12);
    this.syncGlobalState();

    this.globalEventsListener = () => {
      this.syncGlobalState();
      this.cdr.detectChanges();
    };
    window.addEventListener('themeChanged', this.globalEventsListener);
    window.addEventListener('languageChanged', this.globalEventsListener);
    window.addEventListener('storage', this.globalEventsListener);
  }

  ngOnDestroy(): void {
    if (this.globalEventsListener) {
      window.removeEventListener('themeChanged', this.globalEventsListener);
      window.removeEventListener('languageChanged', this.globalEventsListener);
      window.removeEventListener('storage', this.globalEventsListener);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-field-group') && !target.closest('.modern-dropdown-menu')) {
      this.showSourceDropdown = false;
      this.showDestinationDropdown = false;
    }
  }

  syncGlobalState(): void {
    const savedTheme = localStorage.getItem('rb_dark_mode');
    this.isDarkMode = savedTheme === 'true' || document.body.classList.contains('dark-mode');
    if (this.isDarkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');

    const savedLang = localStorage.getItem('rb_language') as SupportedLanguage;
    if (savedLang && ['en', 'hi', 'kn'].includes(savedLang)) {
      this.currentLang = savedLang;
    }
  }

  t(key: string): string {
    return this.dictionary[key]?.[this.currentLang] || this.dictionary[key]?.['en'] || key;
  }

  filterSourceCities(): void {
    const q = (this.sourceCity || '').trim().toLowerCase();
    this.filteredSources = q
      ? this.popularCitiesList.filter(c => c.toLowerCase().includes(q)).slice(0, 12)
      : this.popularCitiesList.slice(0, 12);
    this.showSourceDropdown = true;
    this.showDestinationDropdown = false;
  }

  filterDestinationCities(): void {
    const q = (this.destinationCity || '').trim().toLowerCase();
    const exclude = (this.sourceCity || '').trim().toLowerCase();
    const pool = this.popularCitiesList.filter(c => c.toLowerCase() !== exclude);
    this.filteredDestinations = q
      ? pool.filter(c => c.toLowerCase().includes(q)).slice(0, 12)
      : pool.slice(0, 12);
    this.showDestinationDropdown = true;
    this.showSourceDropdown = false;
  }

  selectSource(city: string): void {
    this.sourceCity = city;
    this.showSourceDropdown = false;
  }

  selectDestination(city: string): void {
    this.destinationCity = city;
    this.showDestinationDropdown = false;
  }

  swapCities(event?: Event): void {
    if (event) event.stopPropagation();
    const temp = this.sourceCity;
    this.sourceCity = this.destinationCity;
    this.destinationCity = temp;
  }

  setDateOffset(days: number): void {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    this.journeyDate = `${yyyy}-${mm}-${dd}`;
  }

  openOfferModal(offer: OfferCardItem): void {
    this.selectedModalOffer = offer;
  }

  closeOfferModal(): void {
    this.selectedModalOffer = null;
  }

  copyCouponCode(code: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.copiedCouponCode = code;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    this.showToast(`Coupon code ${code} copied! Apply it at checkout.`);
  }

  selectQuickRoute(route: PopularRouteItem): void {
    this.sourceCity = route.source;
    this.destinationCity = route.destination;
    this.searchBuses();
  }

  showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }

  handleOfferImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.includes('unsplash.com')) {
      img.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80';
    }
  }

  searchBuses(): void {
    const cleanFrom = (this.sourceCity || '').trim();
    const cleanTo = (this.destinationCity || '').trim();

    if (!cleanFrom) {
      this.filterSourceCities();
      this.showToast('Please enter or select your Source (From) city');
      return;
    }
    if (!cleanTo) {
      this.filterDestinationCities();
      this.showToast('Please enter or select your Destination (To) city');
      return;
    }
    if (cleanFrom.toLowerCase() === cleanTo.toLowerCase()) {
      this.showToast('Source and Destination cities cannot be the same');
      return;
    }

    this.router.navigate(['/select-bus'], {
      queryParams: {
        from: cleanFrom,
        to: cleanTo,
        date: this.journeyDate || '2026-11-22'
      }
    });
  }
}