import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

export type SupportedLanguage = 'en' | 'hi' | 'kn';

export interface BusAmenity {
  icon: string;
  name: string;
}

export interface BusPhoto {
  baseName: string;
  url: string;
  title: string;
  category: string;
  tryIndex?: number;
}

export interface BusSeat {
  id: string;
  label: string;
  deck: 'lower' | 'upper';
  type: 'seater' | 'sleeper';
  col: 'left' | 'right-1' | 'right-2';
  row: number;
  price: number;
  isBooked: boolean;
  gender?: 'M' | 'F';
  isFemaleOnlyAvailable?: boolean;
}

export interface BoardingStop {
  time: string;
  date: string;
  name: string;
  landmark: string;
}

export interface PassengerFormItem {
  seatLabel: string;
  deck: 'lower' | 'upper';
  price: number;
  name: string;
  age: number | null;
  gender: 'Male' | 'Female' | 'Other' | '';
  isFemaleReservedSeat?: boolean;
  isSelected?: boolean;
}

export interface BusItem {
  _id: string;
  operatorname: string;
  busname: string;
  bustypename: string;
  superBusBadge?: string;
  busdeparturetime: string;
  busarrivaltime: string;
  seatprivce: number;
  avgrating: number;
  totalreview: number;
  livetracking: number;
  reschedulable: number;
  availableSeats: number;
  singleSeats: number;
  totalSeats: number;
  hasWomenOffer?: boolean;
  womenDiscountPct?: number;
  layoutType: 'volvo-42' | 'sleeper-36' | 'sleeper-30' | 'seater-45' | 'seater-40' | 'semi-51' | 'hybrid-51-18' | 'hybrid-40';
  routedetails: {
    duration: string;
    distanceKm: number;
    viaRoute: string[];
    boardingPoints: BoardingStop[];
    droppingPoints: BoardingStop[];
  };
  amenities: BusAmenity[];
  photos: BusPhoto[];
  seats: BusSeat[];
}

@Component({
  selector: 'app-selectbus-page',
  templateUrl: './selectbus-page.component.html',
  styleUrls: ['./selectbus-page.component.css']
})
export class SelectbusPageComponent implements OnInit, OnDestroy {

  currentLang: SupportedLanguage = 'en';
  isDarkMode: boolean = false;

  fromCity: string = 'Bengaluru';
  toCity: string = 'Mumbai';
  journeyDate: string = '14 Nov, 2026';

  // Special Feature: Booking for Women Mode & Adjacency Note
  isWomenBookingMode: boolean = false;
  femaleSeatNoteMessage: string = '';

  activeBoardingFilter: string = 'ALL';
  busesList: BusItem[] = [];

  // Modal & Multi-Step State
  floatingSelectedBus: BusItem | null = null;
  modalStep: 'seats' | 'board_drop' | 'passenger' | 'payment' = 'seats';
  activeDrawerTab: string = 'highlights';
  showAllStopsDrawer: boolean = false;
  allStopsTab: 'boarding' | 'dropping' = 'boarding';
  toastMessage: string = '';

  selectedSeatsList: BusSeat[] = [];
  selectedBoardingPoint: BoardingStop | null = null;
  selectedDroppingPoint: BoardingStop | null = null;

  // Step 3: Empty & Compulsory Contact & Co-Traveller Details
  contactPhone: string = '';
  contactEmail: string = '';
  contactState: string = '';
  isEditingContact: boolean = true;
  whatsappUpdates: boolean = true;
  passengersList: PassengerFormItem[] = [];
  showFormErrors: boolean = false;

  // Add-on Radio Choices
  freeCancellationChoice: 'yes' | 'no' = 'no';
  tripGuaranteeChoice: 'yes' | 'no' = 'no';
  travelInsuranceChoice: 'yes' | 'no' = 'no';

  // Optional GST Section
  hasGstNumber: boolean = false;
  gstNumberInput: string = '';
  gstBusinessName: string = '';
  gstBusinessAddress: string = '';

  // All 28 Indian States & 8 Union Territories
  indianStatesList: string[] = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands (UT)', 'Chandigarh (UT)',
    'Dadra and Nagar Haveli and Daman and Diu (UT)', 'Delhi NCR (UT)',
    'Jammu and Kashmir (UT)', 'Ladakh (UT)', 'Lakshadweep (UT)', 'Puducherry (UT)'
  ];

  // Step 4: Payment Gateway & 15-Minute Countdown Timer
  paymentView: 'main' | 'card' | 'netbanking' | 'giftcard' = 'main';
  selectedMainPaymentMethod: 'qr' | 'upi_id' = 'qr';
  upiIdInput: string = '';
  useWallet: boolean = false;
  couponInput: string = '';
  appliedCouponCode: string = '';
  appliedDiscount: number = 0;
  cardNumber: string = '';
  cardName: string = '';
  cardExpiry: string = '';
  cardCvv: string = '';
  giftCardCode: string = '';
  giftCardPin: string = '';
  bankSearch: string = '';

  customQrCodeUrl: string = 'assets/qr-code.png';
  qrFallbackStage: number = 0;

  remainingSeconds: number = 900;
  private timerInterval: any;

  // Confirmed RedBus e-Ticket Metadata
  paymentSuccess: boolean = false;
  generatedPnr: string = '';
  generatedTin: string = '';
  operatorHelpline: string = '';
  bookingTimestamp: string = '';

  popularBanks = [
    'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
    'Kotak Mahindra Bank', 'Indian Bank', 'Standard Chartered Bank',
    'IDBI Bank', 'Canara Bank', 'Bank of Baroda', 'Bank of India', 'Bank of Maharashtra'
  ];

  // Operator photos for Promo Strip & Special Offer Coupon Cards
  promoOperatorPhotos: Record<string, BusPhoto> = {
    vrl: { baseName: 'front', url: 'assets/vrl-photos/front.png', title: 'VRL SuperBus', category: 'Exterior', tryIndex: 0 },
    airavat: { baseName: 'airavat1', url: 'assets/vrl-photos/airavat1.png', title: 'KSRTC Airavat', category: 'Exterior', tryIndex: 0 },
    intrcity: { baseName: 'inter1', url: 'assets/vrl-photos/inter1.png', title: 'IntrCity SmartBus', category: 'Exterior', tryIndex: 0 },
    eicher: { baseName: 'eicher1', url: 'assets/vrl-photos/eicher1.png', title: 'Executive Sleeper', category: 'Exterior', tryIndex: 0 },
    shyamoli: { baseName: 'shy1', url: 'assets/vrl-photos/shy1.jpg', title: 'Shyamoli Paribahan', category: 'Exterior', tryIndex: 0 }
  };

  fallbackBusPhoto: string = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80';
  private globalEventsListener: any;

  dictionary: Record<string, Record<SupportedLanguage, string>> = {
    'buses_label': { en: 'buses found', hi: 'बसें उपलब्ध हैं', kn: 'ಬಸ್‌ಗಳು ಲಭ್ಯವಿವೆ' },
    'lbl_from': { en: 'From', hi: 'प्रस्थान', kn: 'ಹೊರಡುವ ಸ್ಥಳ' },
    'lbl_to': { en: 'To', hi: 'गंतव्य', kn: 'ತಲುಪುವ ಸ್ಥಳ' },
    'lbl_date': { en: 'Date of journey', hi: 'यात्रा की तिथि', kn: 'ಪ್ರಯಾಣದ ದಿನಾಂಕ' },
    'chip_today': { en: 'Today', hi: 'आज', kn: 'ಇಂದು' },
    'chip_tomorrow': { en: 'Tomorrow', hi: 'कल', kn: 'ನಾಳೆ' },
    'sort_by': { en: 'Sort by:', hi: 'क्रमबद्ध करें:', kn: 'ವಿಂಗಡಿಸಿ:' },
    'sort_ratings': { en: 'Ratings', hi: 'रेटिंग्स', kn: 'ರೇಟಿಂಗ್ಸ್' },
    'sort_departure': { en: 'Departure time', hi: 'प्रस्थान समय', kn: 'ಹೊರಡುವ ಸಮಯ' },
    'sort_price': { en: 'Price', hi: 'किराया', kn: 'ಬೆಲೆ' },
    'btn_view_seats': { en: 'View seats', hi: 'सीटें देखें', kn: 'ಆಸನಗಳನ್ನು ನೋಡಿ' },
    'onwards': { en: 'Onwards', hi: 'से शुरू', kn: 'ಇಂದ ಪ್ರಾರಂಭ' },
    'seats_single': { en: 'Seats', hi: 'सीटें', kn: 'ಆಸನಗಳು' },
    'single_lbl': { en: 'Single', hi: 'सिंगल', kn: 'ಸಿಂಗಲ್' },
    'step_select_seats': { en: 'Select seats', hi: 'सीट चुनें', kn: 'ಆಸನ ಆಯ್ಕೆ' },
    'step_board_drop': { en: 'Board/Drop point', hi: 'बोर्ड/ड्रॉप पॉइंट', kn: 'ಹತ್ತುವ/ಇಳಿಯುವ ಸ್ಥಳ' },
    'step_passenger': { en: 'Passenger Info', hi: 'यात्री विवरण', kn: 'ಪ್ರಯಾಣಿಕರ ಮಾಹಿತಿ' },
    'lower_deck': { en: 'Lower deck', hi: 'निचला डेक', kn: 'ಕೆಳಗಿನ ಡೆಕ್' },
    'upper_deck': { en: 'Upper deck', hi: 'ऊपरी डेक', kn: 'ಮೇಲಿನ ಡೆಕ್' },
    'know_seat_types': { en: 'Know your seat types', hi: 'अपनी सीट के प्रकार जानें', kn: 'ನಿಮ್ಮ ಆಸನದ ಪ್ರಕಾರಗಳನ್ನು ತಿಳಿಯಿರಿ' },
    'sold_tag': { en: 'Sold', hi: 'बुक', kn: 'ಬುಕ್' },
    'tab_highlights': { en: 'Highlights', hi: 'मुख्य बातें', kn: 'ಮುಖ್ಯಾಂಶಗಳು' },
    'tab_cancellation': { en: 'Cancellation policy', hi: 'रद्दीकरण नीति', kn: 'ರದ್ದತಿ ನಿಯಮಗಳು' },
    'tab_reschedule': { en: 'Reschedule Policy', hi: 'पुनर्निर्धारण नीति', kn: 'ಮರುನಿಗದಿ ನಿಯಮ' },
    'tab_bus_route': { en: 'Bus route', hi: 'बस मार्ग', kn: 'ಬಸ್ ಮಾರ್ಗ' },
    'tab_boarding': { en: 'Boarding point', hi: 'बोर्डिंग पॉइंट', kn: 'ಹತ್ತುವ ಸ್ಥಳ' },
    'tab_dropping': { en: 'Dropping point', hi: 'ड्रॉपिंग पॉइंट', kn: 'ಇಳಿಯುವ ಸ್ಥಳ' },
    'tab_rest_stop': { en: 'Rest stop', hi: 'आराम पड़ाव', kn: 'ವಿಶ್ರಾಂತಿ ನಿಲ್ದಾಣ' },
    'tab_features': { en: 'Bus Features', hi: 'बस विशेषताएं', kn: 'ಬಸ್ ವೈಶಿಷ್ಟ್ಯಗಳು' },
    'tab_reviews': { en: 'Rating and reviews', hi: 'रेटिंग एवं समीक्षाएं', kn: 'ರೇಟಿಂಗ್ ಮತ್ತು ವಿಮರ್ಶೆಗಳು' },
    'tab_safety': { en: 'Bus Safety', hi: 'बस सुरक्षा', kn: 'ಬಸ್ ಸುರಕ್ಷತೆ' },
    'tab_other_policies': { en: 'Other Policies', hi: 'अन्य नीतियां', kn: 'ಇತರ ನಿಯಮಗಳು' },
    'btn_select_bd': { en: 'Select boarding & dropping points', hi: 'बोर्डिंग और ड्रॉपिंग पॉइंट चुनें', kn: 'ಹತ್ತುವ ಮತ್ತು ಇಳಿಯುವ ಸ್ಥಳಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ' },
    'btn_continue_booking': { en: 'Continue booking', hi: 'बुकिंग जारी रखें', kn: 'ಬುಕಿಂಗ್ ಮುಂದುವರಿಸಿ' },
    'view_all_boarding': { en: 'View all boarding points', hi: 'सभी बोर्डिंग पॉइंट देखें', kn: 'ಎಲ್ಲಾ ಹತ್ತುವ ಸ್ಥಳಗಳನ್ನು ನೋಡಿ' },
    'view_all_dropping': { en: 'View all dropping points', hi: 'सभी ड्रॉपिंग पॉइंट देखें', kn: 'ಎಲ್ಲಾ ಇಳಿಯುವ ಸ್ಥಳಗಳನ್ನು ನೋಡಿ' },
    'offers_heading': { en: 'Special offers just for you', hi: 'विशेष ऑफर्स केवल आपके लिए', kn: 'ನಿಮಗಾಗಿ ವಿಶೇಷ ಕೊಡುಗೆಗಳು' }
  };

  cityPointsDirectory: Record<string, { name: string; landmark: string }[]> = {
    'bengaluru': [
      { name: 'Majestic Kempegowda Bus Stand', landmark: 'Opposite Platform 14, Main Terminal' },
      { name: 'Anand Rao Circle Terminal', landmark: 'Near Race Course Flyover Bridge' },
      { name: 'Yeshwantpur Govardhan Theater', landmark: 'Beside Metro Station Pillar 42' },
      { name: 'Goraguntepalya Signal', landmark: 'Near Taj Vivanta Service Road' },
      { name: 'Jalahalli Cross Junction', landmark: 'NH-48 Tumkur Road Flyover' },
      { name: 'Nelamangala Toll Plaza', landmark: 'After Flyover Toll Booth Lane 2' }
    ],
    'hyderabad': [
      { name: 'PATNY CENTER (Pickup Van/Bus)', landmark: 'Near South Indian shopping mall' },
      { name: 'Lakdikapul DownTown Mall', landmark: 'Beside Srikara Hospital Main Road' },
      { name: 'Ameerpet Value Zone Hyper Mart', landmark: 'Near Metro Pillar No 1081' },
      { name: 'S R Nagar Metro Junction', landmark: 'Opp ICICI Bank Pillar No 1039' },
      { name: 'Kukatpally Housing Board (KPHB)', landmark: 'Near Pillar 780 Main Bus Bay' },
      { name: 'Miyapur Allwyn X Road', landmark: 'Near Bharat Petrol Pump Highway' }
    ],
    'mumbai': [
      { name: 'Kalamboli (Panvel)', landmark: 'Near McDonalds, Below Foot Over Bridge, Mumbai-Pune Express Way' },
      { name: 'Vashi Plaza Signal Junction', landmark: 'After Vashi Flyover Bridge' },
      { name: 'Chembur East Amar Mahal', landmark: 'Near Kake Da Hotel Eastern Freeway' },
      { name: 'Sion Circle Central Bank', landmark: 'Opposite Sion Hospital Gate' },
      { name: 'Andheri East Bisleri Compound', landmark: 'Western Express Highway Metro' },
      { name: 'Borivali East National Park', landmark: 'Next to Axis Bank Main Gate' }
    ],
    'pune': [
      { name: 'Katraj Wonder City Bypass', landmark: 'Near Rajiv Gandhi Zoo Highway' },
      { name: 'Swargate Bus Terminus', landmark: 'Opposite Laxmi Narayan Theater' },
      { name: 'Shivaji Nagar Railway Station', landmark: 'Near Wakdewadi New Bus Stand' },
      { name: 'Wakad Indira College Flyover', landmark: 'Mumbai-Bangalore Highway Service Road' },
      { name: 'Hinjewadi Phase 1 Chowk', landmark: 'Near Ginger Hotel Wakad Bridge' }
    ],
    'chennai': [
      { name: 'Koyambedu CMBT Omni Bus Stand', landmark: 'Platform 4 Inner Ring Road' },
      { name: 'Guindy Kathipara Junction', landmark: 'Near Alandur Metro Station' },
      { name: 'Tambaram Sanatorium', landmark: 'GST Road Opposite MEPZ Gate' },
      { name: 'Kilambakkam New Bus Terminus', landmark: 'KCBT Main Highway Bay' },
      { name: 'Central Railway Station Gate', landmark: 'Poonamallee High Road Terminal' }
    ],
    'goa': [
      { name: 'Madgaon KTC Bus Stand', landmark: 'Main Intercity Platform' },
      { name: 'Ponda Bypass Circle', landmark: 'Near Almeida High School' },
      { name: 'Panaji KTC Bus Terminus', landmark: 'Patto Plaza Bridge Entry' },
      { name: 'Mapusa New Bus Stand', landmark: 'Near Severina Gardens NH66' }
    ],
    'humnabad': [
      { name: 'Humnabad Old Bus Stand', landmark: 'Main Bazar Road Circle' },
      { name: 'Humnabad NH-65 Bypass Cross', landmark: 'Near Kamat Upachar Highway Plaza' },
      { name: 'Humnabad Industrial Gate', landmark: 'Bidar-Solapur Highway Junction' }
    ],
    'kalaburagi': [
      { name: 'Kalaburagi Central Bus Stand', landmark: 'Opposite KSRTC Depot' },
      { name: 'Jewargi Cross Flyover', landmark: 'Ring Road Highway Circle' },
      { name: 'Humnabad Ring Road Checkpost', landmark: 'Near Ram Mandir Circle' }
    ],
    'bidar': [
      { name: 'Bidar New Central Bus Stand', landmark: 'Near Deputy Commissioner Office' },
      { name: 'Naubad Industrial Cross', landmark: 'Humnabad Highway Road' },
      { name: 'Bhalki Cross Ring Road', landmark: 'Main Bypass Circle' }
    ]
  };

  constructor(private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.syncGlobalState();
    this.globalEventsListener = () => {
      this.syncGlobalState();
      this.cdr.detectChanges();
    };
    window.addEventListener('themeChanged', this.globalEventsListener);
    window.addEventListener('languageChanged', this.globalEventsListener);
    window.addEventListener('storage', this.globalEventsListener);

    this.route.queryParams.subscribe(params => {
      if (params['from']) this.fromCity = params['from'];
      if (params['to']) this.toCity = params['to'];
      if (params['date']) this.journeyDate = params['date'];
      this.updateCityContext();
    });
  }

  ngOnDestroy(): void {
    this.stopPaymentTimer();
    if (this.globalEventsListener) {
      window.removeEventListener('themeChanged', this.globalEventsListener);
      window.removeEventListener('languageChanged', this.globalEventsListener);
      window.removeEventListener('storage', this.globalEventsListener);
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

  // Multi-format & multi-folder photo resolver (.jpg, .png, .jpeg, .webp, .avif, .jfif + uppercase & assets/ root)
  handleImageError(event: Event, photo: BusPhoto): void {
    const img = event.target as HTMLImageElement;
    const candidateUrls = [
      `assets/vrl-photos/${photo.baseName}.jpg`,
      `assets/vrl-photos/${photo.baseName}.png`,
      `assets/vrl-photos/${photo.baseName}.jpeg`,
      `assets/vrl-photos/${photo.baseName}.webp`,
      `assets/vrl-photos/${photo.baseName}.avif`,
      `assets/vrl-photos/${photo.baseName}.jfif`,
      `assets/vrl-photos/${photo.baseName}.JPG`,
      `assets/vrl-photos/${photo.baseName}.PNG`,
      `assets/vrl-photos/${photo.baseName}.JPEG`,
      `assets/vrl-photos/${photo.baseName}.WEBP`,
      `assets/${photo.baseName}.jpg`,
      `assets/${photo.baseName}.png`,
      `assets/${photo.baseName}.jpeg`,
      `assets/${photo.baseName}.webp`
    ];

    photo.tryIndex = (photo.tryIndex ?? 0) + 1;

    if (photo.tryIndex < candidateUrls.length) {
      img.src = candidateUrls[photo.tryIndex];
    } else if (img.src !== this.fallbackBusPhoto) {
      img.src = this.fallbackBusPhoto;
    }
  }

  handleQrImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    this.qrFallbackStage++;
    if (this.qrFallbackStage === 1) {
      img.src = 'assets/vrl-photos/qr.png';
    } else if (this.qrFallbackStage === 2) {
      img.src = 'assets/vrl-photos/qr.jpg';
    } else if (this.qrFallbackStage === 3) {
      img.src = 'assets/qr.png';
    } else {
      const upiPayload = encodeURIComponent(`upi://pay?pa=redbus.merchant@axis&pn=RedBus%20Travels&am=${this.finalPayableAmount}&cu=INR`);
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${upiPayload}`;
    }
  }

  buildPhotoSet(prefix: string, names?: string[], defaultExt: string = 'png'): BusPhoto[] {
    if (names && names.length > 0) {
      return names.map((n, i) => ({
        baseName: n,
        url: `assets/vrl-photos/${n}.${defaultExt}`,
        title: `Coach View ${i + 1}`,
        category: i === 0 ? 'Exterior' : 'Interior',
        tryIndex: 0
      }));
    }
    const list: BusPhoto[] = [];
    for (let i = 1; i <= 10; i++) {
      list.push({
        baseName: `${prefix}${i}`,
        url: `assets/vrl-photos/${prefix}${i}.${defaultExt}`,
        title: `${prefix.toUpperCase()} View ${i}`,
        category: i <= 6 ? 'Exterior' : 'Interior',
        tryIndex: 0
      });
    }
    return list;
  }

  updateCityContext(): void {
    this.rebuildBusFleetForRoute();
  }

  computeDynamicRouteMetrics(origin: string, dest: string) {
    const o = (origin || 'Bengaluru').trim();
    const d = (dest || 'Mumbai').trim();
    const oKey = o.toLowerCase();
    const dKey = d.toLowerCase();

    const pairKey = [oKey, dKey].sort().join('-');
    let distanceKm = 620;
    let avgBaseFare = 1150;
    let duration = '14h 30m';
    let viaRoute = [o, `${o} Highway Bypass`, 'Midway Express Plaza', `${d} Outer Ring`, d];

    if (pairKey.includes('bengaluru') && pairKey.includes('mumbai')) {
      distanceKm = 984;
      avgBaseFare = 1450;
      duration = '14h 30m';
      viaRoute = [o, 'Tumakuru', 'Chitradurga', 'Davangere', 'Hubballi', 'Belagavi', 'Kolhapur', 'Pune', d];
    } else if (pairKey.includes('hyderabad') && pairKey.includes('mumbai')) {
      distanceKm = 709;
      avgBaseFare = 1250;
      duration = '15h 36m';
      viaRoute = [o, 'Zaheerabad', 'Humnabad', 'Omerga', 'Solapur', 'Pune', d];
    } else if (pairKey.includes('hyderabad') && pairKey.includes('chennai')) {
      distanceKm = 627;
      avgBaseFare = 1150;
      duration = '11h 15m';
      viaRoute = [o, 'Nalgonda', 'Miryalaguda', 'Ongole', 'Nellore', d];
    } else if (pairKey.includes('bengaluru') && pairKey.includes('hyderabad')) {
      distanceKm = 575;
      avgBaseFare = 1050;
      duration = '09h 45m';
      viaRoute = [o, 'Chikkaballapur', 'Anantapur', 'Kurnool', 'Jadcherla', d];
    } else if (pairKey.includes('bengaluru') && pairKey.includes('chennai')) {
      distanceKm = 346;
      avgBaseFare = 720;
      duration = '06h 30m';
      viaRoute = [o, 'Hosur', 'Krishnagiri', 'Vellore', 'Sriperumbudur', d];
    } else {
      const seed = (o.length * 37 + d.length * 53) % 450;
      distanceKm = 380 + seed;
      avgBaseFare = Math.round((750 + seed * 1.4) / 10) * 10;
      const hrs = Math.max(6, Math.round(distanceKm / 55));
      duration = `${hrs < 10 ? '0' + hrs : hrs}h 30m`;
    }

    const rawOriginStops = this.cityPointsDirectory[oKey] || [
      { name: `${o} Central Bus Terminus`, landmark: `Main Intercity Platform 1, ${o}` },
      { name: `${o} City Railway Junction Circle`, landmark: `Opposite Main Station Gate, ${o}` },
      { name: `${o} Commercial Ring Road Square`, landmark: `Near Metro / Flyover Pillar, ${o}` },
      { name: `${o} National Highway Bypass`, landmark: `Near Highway Petrol Pump, ${o}` },
      { name: `${o} Outer Toll Plaza Exit`, landmark: `After Toll Booth Lane 2, ${o}` }
    ];

    const rawDestStops = this.cityPointsDirectory[dKey] || [
      { name: `${d} Highway Entry Checkpost`, landmark: `Outer Ring Road Bypass, ${d}` },
      { name: `${d} Industrial Corridor Flyover`, landmark: `Main Highway Service Road, ${d}` },
      { name: `${d} City Center Circle`, landmark: `Opposite Central Mall / Metro, ${d}` },
      { name: `${d} Railway Station Road`, landmark: `Near Main Overbridge, ${d}` },
      { name: `${d} Main Intercity Bus Stand`, landmark: `Final Terminus Platform, ${d}` }
    ];

    const boardingTimes = ['04:04 PM', '08:00 PM', '08:20 PM', '08:45 PM', '09:10 PM', '09:30 PM'];
    const droppingTimes = ['07:40 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM'];

    const boardingPoints: BoardingStop[] = rawOriginStops.map((st, idx) => ({
      time: boardingTimes[idx % boardingTimes.length],
      date: this.journeyDate.split(',')[0] || '14 Nov',
      name: st.name,
      landmark: st.landmark
    }));

    const droppingPoints: BoardingStop[] = rawDestStops.map((st, idx) => ({
      time: droppingTimes[idx % droppingTimes.length],
      date: '15 Nov',
      name: st.name,
      landmark: st.landmark
    }));

    return { duration, distanceKm, avgBaseFare, viaRoute, boardingPoints, droppingPoints };
  }

  // Enforces the exact 2-sleeper adjacency rule:
  // Whenever one seat in a 2-sleeper pair (right-1 or right-2) is booked by a Female ('F'),
  // the available seat beside it is automatically restricted to Female passengers only.
  generateSeats(layout: string, baseFare: number): BusSeat[] {
    const list: BusSeat[] = [];
    const rows = layout === 'volvo-42' ? 7 : (layout === 'sleeper-30' ? 5 : 6);

    for (let r = 1; r <= rows; r++) {
      // ================= LOWER DECK =================
      const lLeftBooked = r === 2 || r === 5;
      const lLeftGender: 'M' | 'F' | undefined = r === 2 ? 'M' : (r === 5 ? 'F' : undefined);

      const lR1Booked = r === 1 || r === 4;
      const lR1Gender: 'M' | 'F' | undefined = r === 4 ? 'F' : (r === 1 ? 'M' : undefined);

      const lR2Booked = r === 2 || r === 3;
      const lR2Gender: 'M' | 'F' | undefined = r === 2 || r === 3 ? 'F' : undefined;

      const lR1FemaleOnly = !lR1Booked && lR2Booked && lR2Gender === 'F';
      const lR2FemaleOnly = !lR2Booked && lR1Booked && lR1Gender === 'F';

      list.push({
        id: `L${r}A`,
        label: `L${r * 3 - 2}`,
        deck: 'lower',
        type: 'sleeper',
        col: 'left',
        row: r,
        price: baseFare + 100,
        isBooked: lLeftBooked,
        gender: lLeftGender,
        isFemaleOnlyAvailable: false
      });

      list.push({
        id: `L${r}B`,
        label: `L${r * 3 - 1}`,
        deck: 'lower',
        type: 'sleeper',
        col: 'right-1',
        row: r,
        price: baseFare,
        isBooked: lR1Booked,
        gender: lR1Gender,
        isFemaleOnlyAvailable: lR1FemaleOnly
      });

      list.push({
        id: `L${r}C`,
        label: `L${r * 3}`,
        deck: 'lower',
        type: 'sleeper',
        col: 'right-2',
        row: r,
        price: baseFare,
        isBooked: lR2Booked,
        gender: lR2Gender,
        isFemaleOnlyAvailable: lR2FemaleOnly
      });

      // ================= UPPER DECK =================
      const uLeftBooked = r === 2 || r === 6;
      const uLeftGender: 'M' | 'F' | undefined = r === 2 ? 'F' : (r === 6 ? 'M' : undefined);

      const uR1Booked = r === 1 || r === 3;
      const uR1Gender: 'M' | 'F' | undefined = r === 3 ? 'F' : (r === 1 ? 'M' : undefined);

      const uR2Booked = r === 1 || r === 5;
      const uR2Gender: 'M' | 'F' | undefined = r === 5 ? 'F' : (r === 1 ? 'M' : undefined);

      const uR1FemaleOnly = !uR1Booked && uR2Booked && uR2Gender === 'F';
      const uR2FemaleOnly = !uR2Booked && uR1Booked && uR1Gender === 'F';

      list.push({
        id: `U${r}A`,
        label: `U${r * 3 - 2}`,
        deck: 'upper',
        type: 'sleeper',
        col: 'left',
        row: r,
        price: baseFare + 50,
        isBooked: uLeftBooked,
        gender: uLeftGender,
        isFemaleOnlyAvailable: false
      });

      list.push({
        id: `U${r}B`,
        label: `U${r * 3 - 1}`,
        deck: 'upper',
        type: 'sleeper',
        col: 'right-1',
        row: r,
        price: baseFare - 50,
        isBooked: uR1Booked,
        gender: uR1Gender,
        isFemaleOnlyAvailable: uR1FemaleOnly
      });

      list.push({
        id: `U${r}C`,
        label: `U${r * 3}`,
        deck: 'upper',
        type: 'sleeper',
        col: 'right-2',
        row: r,
        price: baseFare - 50,
        isBooked: uR2Booked,
        gender: uR2Gender,
        isFemaleOnlyAvailable: uR2FemaleOnly
      });
    }
    return list;
  }

  getDeckRows(deck: 'lower' | 'upper'): number[] {
    if (!this.floatingSelectedBus) return [];
    const deckSeats = this.floatingSelectedBus.seats.filter(s => s.deck === deck);
    const maxRow = Math.max(...deckSeats.map(s => s.row), 0);
    return Array.from({ length: maxRow }, (_, i) => i + 1);
  }

  getSeatAt(deck: 'lower' | 'upper', row: number, col: 'left' | 'right-1' | 'right-2'): BusSeat | undefined {
    return this.floatingSelectedBus?.seats.find(s => s.deck === deck && s.row === row && s.col === col);
  }

  rebuildBusFleetForRoute(): void {
    const from = this.fromCity || 'Bengaluru';
    const to = this.toCity || 'Mumbai';
    const metrics = this.computeDynamicRouteMetrics(from, to);
    const avg = metrics.avgBaseFare;

    const dynamicRoute = {
      duration: metrics.duration,
      distanceKm: metrics.distanceKm,
      viaRoute: metrics.viaRoute,
      boardingPoints: metrics.boardingPoints,
      droppingPoints: metrics.droppingPoints
    };

    const vrlVolvoPhotos = this.buildPhotoSet('vrl', ['front', 'chargeport', 'doubleseat', 'seatcompartment', 'seat', 'streeing', 'side1', 'side2', 'side3', 'side4']);
    const airavatPhotos = this.buildPhotoSet('airavat');
    const eicherPhotos = this.buildPhotoSet('eicher');
    const tataPhotos = this.buildPhotoSet('tata');
    const interPhotos = this.buildPhotoSet('inter');
    // Shyamoli Paribahan uploaded photos: shy1.jpg to shy10.jpg
    const shyamoliPhotos = this.buildPhotoSet('shy', ['shy1', 'shy2', 'shy3', 'shy4', 'shy5', 'shy6', 'shy7', 'shy8', 'shy9', 'shy10'], 'jpg');

    const defaultAmenities: BusAmenity[] = [
      { icon: '🛏️', name: 'Blankets' },
      { icon: '🔌', name: 'Charging Point' },
      { icon: '💡', name: 'Reading Light' },
      { icon: '🛌', name: 'Pillow' },
      { icon: '🧺', name: 'Bed Sheet' },
      { icon: '📍', name: 'Live Tracking' }
    ];

    const pVolvo = Math.round((avg * 1.25) / 10) * 10;
    const pClub = Math.round((avg * 1.05) / 10) * 10;
    const pAcSleeper = Math.round((avg * 1.0) / 10) * 10;
    const pNonAc = Math.round((avg * 0.72) / 10) * 10;
    const pHybrid = Math.round((avg * 0.88) / 10) * 10;
    const pSmart = Math.round((avg * 1.15) / 10) * 10;
    const pSeater = Math.round((avg * 0.68) / 10) * 10;

    this.busesList = [
      {
        _id: 'VRL-SB-01', operatorname: 'VRL Travels', busname: 'Volvo 9600 Multi-Axle',
        bustypename: 'Volvo 9600 Multi-Axle A/C Sleeper (2+1)', superBusBadge: 'Business Class',
        busdeparturetime: '09:00 PM', busarrivaltime: '08:30 AM', seatprivce: pVolvo, avgrating: 4.9, totalreview: 4820,
        livetracking: 1, reschedulable: 1, availableSeats: 34, singleSeats: 11, totalSeats: 42,
        hasWomenOffer: true, womenDiscountPct: 10, layoutType: 'volvo-42',
        routedetails: dynamicRoute, amenities: defaultAmenities, photos: vrlVolvoPhotos, seats: this.generateSeats('volvo-42', pVolvo)
      },
      {
        _id: 'KSRTC-01', operatorname: 'KSRTC Airavat Club Class 2.0', busname: 'Airavat Club Class 2.0',
        bustypename: 'Volvo 9600 Multi-Axle AC Semi-Sleeper (2+2)', superBusBadge: 'Primo • Top Rated',
        busdeparturetime: '10:00 PM', busarrivaltime: '09:15 AM', seatprivce: pClub, avgrating: 4.8, totalreview: 5210,
        livetracking: 1, reschedulable: 1, availableSeats: 39, singleSeats: 13, totalSeats: 51,
        hasWomenOffer: true, womenDiscountPct: 10, layoutType: 'semi-51',
        routedetails: dynamicRoute, amenities: defaultAmenities, photos: airavatPhotos, seats: this.generateSeats('volvo-42', pClub)
      },
      {
        _id: 'VRL-EICH-03', operatorname: 'VRL Travels', busname: 'Eicher AC Sleeper',
        bustypename: 'Eicher Executive A/C Sleeper (2+1)', superBusBadge: 'Comfort Line',
        busdeparturetime: '07:45 PM', busarrivaltime: '07:15 AM', seatprivce: pAcSleeper, avgrating: 4.7, totalreview: 2910,
        livetracking: 1, reschedulable: 1, availableSeats: 29, singleSeats: 10, totalSeats: 36,
        hasWomenOffer: false, layoutType: 'sleeper-36',
        routedetails: dynamicRoute, amenities: defaultAmenities, photos: eicherPhotos, seats: this.generateSeats('sleeper-36', pAcSleeper)
      },
      {
        _id: 'VRL-TATA-04', operatorname: 'VRL Travels', busname: 'TATA Magna Non AC Sleeper',
        bustypename: 'TATA Magna Non-A/C Sleeper (2+1)', superBusBadge: 'Value Express',
        busdeparturetime: '06:30 PM', busarrivaltime: '06:45 AM', seatprivce: pNonAc, avgrating: 4.4, totalreview: 1840,
        livetracking: 1, reschedulable: 1, availableSeats: 29, singleSeats: 10, totalSeats: 36,
        hasWomenOffer: false, layoutType: 'sleeper-36',
        routedetails: dynamicRoute, amenities: defaultAmenities, photos: tataPhotos, seats: this.generateSeats('sleeper-36', pNonAc)
      },
      {
        _id: 'VRL-HYB-05', operatorname: 'VRL Travels', busname: 'Executive Seater / Sleeper',
        bustypename: 'Executive AC Seater / Sleeper (2+2 / 2+1)', superBusBadge: '51 Seater + 18 Sleeper',
        busdeparturetime: '08:30 PM', busarrivaltime: '08:00 AM', seatprivce: pHybrid, avgrating: 4.6, totalreview: 3240,
        livetracking: 1, reschedulable: 1, availableSeats: 48, singleSeats: 12, totalSeats: 69,
        hasWomenOffer: false, layoutType: 'hybrid-51-18',
        routedetails: dynamicRoute, amenities: defaultAmenities, photos: tataPhotos, seats: this.generateSeats('sleeper-36', pHybrid)
      },
      {
        _id: 'INTRCITY-06', operatorname: 'IntrCity SmartBus', busname: 'SmartBus BharatBenz',
        bustypename: 'BharatBenz AC Sleeper with Washroom (2+1)', superBusBadge: 'Onboard Washroom',
        busdeparturetime: '09:00 PM', busarrivaltime: '06:40 AM', seatprivce: pSmart, avgrating: 4.8, totalreview: 3140,
        livetracking: 1, reschedulable: 1, availableSeats: 28, singleSeats: 9, totalSeats: 36,
        hasWomenOffer: true, womenDiscountPct: 10, layoutType: 'sleeper-36',
        routedetails: dynamicRoute, amenities: defaultAmenities, photos: interPhotos, seats: this.generateSeats('sleeper-36', pSmart)
      },
      {
        _id: 'SRS-07', operatorname: 'SRS Travels', busname: 'SRS Volvo Multi-Axle',
        bustypename: 'AC Sleeper (2+1)', superBusBadge: '36 Berths',
        busdeparturetime: '06:15 PM', busarrivaltime: '06:30 AM', seatprivce: pAcSleeper - 40, avgrating: 4.5, totalreview: 2890,
        livetracking: 1, reschedulable: 1, availableSeats: 28, singleSeats: 9, totalSeats: 36,
        hasWomenOffer: false, layoutType: 'sleeper-36',
        routedetails: dynamicRoute, amenities: defaultAmenities, photos: vrlVolvoPhotos, seats: this.generateSeats('sleeper-36', pAcSleeper - 40)
      },
      {
        _id: 'ORANGE-08', operatorname: 'Orange Travels', busname: 'Orange Mercedes Coach',
        bustypename: 'AC Sleeper (2+1)', superBusBadge: '36 Berths',
        busdeparturetime: '08:45 PM', busarrivaltime: '08:15 AM', seatprivce: pSmart - 50, avgrating: 4.6, totalreview: 1820,
        livetracking: 1, reschedulable: 1, availableSeats: 30, singleSeats: 10, totalSeats: 36,
        hasWomenOffer: true, womenDiscountPct: 10, layoutType: 'sleeper-36',
        routedetails: dynamicRoute, amenities: defaultAmenities, photos: vrlVolvoPhotos, seats: this.generateSeats('sleeper-36', pSmart - 50)
      },
      {
        _id: 'KALLADA-09', operatorname: 'Kallada Travels', busname: 'Kallada Luxury Coach',
        bustypename: 'AC Sleeper (2+1)', superBusBadge: '30 Berths',
        busdeparturetime: '05:30 PM', busarrivaltime: '06:00 AM', seatprivce: pAcSleeper - 20, avgrating: 4.4, totalreview: 1450,
        livetracking: 1, reschedulable: 1, availableSeats: 24, singleSeats: 8, totalSeats: 30,
        hasWomenOffer: false, layoutType: 'sleeper-30',
        routedetails: dynamicRoute, amenities: defaultAmenities, photos: eicherPhotos, seats: this.generateSeats('sleeper-30', pAcSleeper - 20)
      },
      {
        _id: 'JABBAR-10', operatorname: 'Jabbar Travels', busname: 'Jabbar Express',
        bustypename: 'AC Seater (2+2)', superBusBadge: '45 Seats',
        busdeparturetime: '06:00 PM', busarrivaltime: '06:15 AM', seatprivce: pSeater, avgrating: 4.2, totalreview: 980,
        livetracking: 1, reschedulable: 1, availableSeats: 36, singleSeats: 12, totalSeats: 45,
        hasWomenOffer: false, layoutType: 'seater-45',
        routedetails: dynamicRoute, amenities: defaultAmenities, photos: airavatPhotos, seats: this.generateSeats('sleeper-36', pSeater)
      },
      {
        _id: 'MSTAR-11', operatorname: 'Morning Star Travels', busname: 'Morning Star Deluxe',
        bustypename: 'AC Sleeper (2+1)', superBusBadge: '36 Berths',
        busdeparturetime: '09:15 PM', busarrivaltime: '08:30 AM', seatprivce: pAcSleeper + 30, avgrating: 4.5, totalreview: 2100,
        livetracking: 1, reschedulable: 1, availableSeats: 28, singleSeats: 9, totalSeats: 36,
        hasWomenOffer: false, layoutType: 'sleeper-36',
        routedetails: dynamicRoute, amenities: defaultAmenities, photos: vrlVolvoPhotos, seats: this.generateSeats('sleeper-36', pAcSleeper + 30)
      },
      {
        _id: 'NAT-12', operatorname: 'National Travels', busname: 'National Bharat Benz',
        bustypename: 'AC Sleeper (2+1)', superBusBadge: '36 Berths',
        busdeparturetime: '11:00 PM', busarrivaltime: '09:45 AM', seatprivce: pVolvo - 50, avgrating: 4.9, totalreview: 3890,
        livetracking: 1, reschedulable: 1, availableSeats: 30, singleSeats: 10, totalSeats: 36,
        hasWomenOffer: true, womenDiscountPct: 10, layoutType: 'sleeper-36',
        routedetails: dynamicRoute, amenities: defaultAmenities, photos: interPhotos, seats: this.generateSeats('sleeper-36', pVolvo - 50)
      },
      {
        _id: 'SUGAMA-13', operatorname: 'Sugama Tourist', busname: 'Sugama Executive',
        bustypename: 'Non-AC Sleeper (2+1)', superBusBadge: '30 Berths',
        busdeparturetime: '07:00 PM', busarrivaltime: '07:30 AM', seatprivce: pNonAc - 30, avgrating: 4.1, totalreview: 1120,
        livetracking: 0, reschedulable: 1, availableSeats: 25, singleSeats: 8, totalSeats: 30,
        hasWomenOffer: false, layoutType: 'sleeper-30',
        routedetails: dynamicRoute, amenities: defaultAmenities, photos: tataPhotos, seats: this.generateSeats('sleeper-30', pNonAc - 30)
      },
      {
        _id: 'BHARATHI-14', operatorname: 'Bharathi Travels', busname: 'Bharathi Multi-Axle',
        bustypename: 'AC Seater (2+2)', superBusBadge: '45 Seats',
        busdeparturetime: '07:15 PM', busarrivaltime: '07:45 AM', seatprivce: pSeater + 40, avgrating: 4.3, totalreview: 870,
        livetracking: 1, reschedulable: 1, availableSeats: 37, singleSeats: 12, totalSeats: 45,
        hasWomenOffer: false, layoutType: 'seater-45',
        routedetails: dynamicRoute, amenities: defaultAmenities, photos: airavatPhotos, seats: this.generateSeats('sleeper-36', pSeater + 40)
      },
      {
        _id: 'KPN-15', operatorname: 'KPN Travels', busname: 'KPN Royal Coach',
        bustypename: 'AC Sleeper (2+1)', superBusBadge: '36 Berths',
        busdeparturetime: '08:00 PM', busarrivaltime: '08:15 AM', seatprivce: pAcSleeper, avgrating: 4.4, totalreview: 2340,
        livetracking: 1, reschedulable: 1, availableSeats: 28, singleSeats: 9, totalSeats: 36,
        hasWomenOffer: false, layoutType: 'sleeper-36',
        routedetails: dynamicRoute, amenities: defaultAmenities, photos: eicherPhotos, seats: this.generateSeats('sleeper-36', pAcSleeper)
      },
      {
        _id: 'GREENLINE-16', operatorname: 'GreenLine Travels', busname: 'GreenLine Express',
        bustypename: 'AC Seater (2+2)', superBusBadge: '45 Seats',
        busdeparturetime: '06:30 PM', busarrivaltime: '07:00 AM', seatprivce: pSeater + 20, avgrating: 4.2, totalreview: 760,
        livetracking: 1, reschedulable: 1, availableSeats: 35, singleSeats: 11, totalSeats: 45,
        hasWomenOffer: false, layoutType: 'seater-45',
        routedetails: dynamicRoute, amenities: defaultAmenities, photos: airavatPhotos, seats: this.generateSeats('sleeper-36', pSeater + 20)
      },
      {
        _id: 'PAULO-17', operatorname: 'Paulo Travels', busname: 'Paulo Luxury Coach',
        bustypename: 'AC Sleeper (2+1)', superBusBadge: '36 Berths',
        busdeparturetime: '09:45 PM', busarrivaltime: '09:15 AM', seatprivce: pAcSleeper + 50, avgrating: 4.5, totalreview: 1980,
        livetracking: 1, reschedulable: 1, availableSeats: 27, singleSeats: 9, totalSeats: 36,
        hasWomenOffer: false, layoutType: 'sleeper-36',
        routedetails: dynamicRoute, amenities: defaultAmenities, photos: vrlVolvoPhotos, seats: this.generateSeats('sleeper-36', pAcSleeper + 50)
      },
      {
        _id: 'SHYAMOLI-18', operatorname: 'Shyamoli Paribahan', busname: 'Volvo 9600s Multi-Axle Starz',
        bustypename: 'Volvo 9600s Multi-Axle A/C Sleeper (2+1)', superBusBadge: 'Volvo 9600s • Primo',
        busdeparturetime: '05:30 PM', busarrivaltime: '06:15 AM', seatprivce: pVolvo - 30, avgrating: 4.7, totalreview: 2450,
        livetracking: 1, reschedulable: 1, availableSeats: 32, singleSeats: 10, totalSeats: 42,
        hasWomenOffer: true, womenDiscountPct: 10, layoutType: 'volvo-42',
        routedetails: dynamicRoute, amenities: defaultAmenities, photos: shyamoliPhotos, seats: this.generateSeats('volvo-42', pVolvo - 30)
      },
      {
        _id: 'ZINGBUS-19', operatorname: 'Zingbus', busname: 'Zingbus Premium',
        bustypename: 'AC Sleeper (2+1)', superBusBadge: '36 Berths',
        busdeparturetime: '08:15 PM', busarrivaltime: '08:45 AM', seatprivce: pSmart - 30, avgrating: 4.8, totalreview: 2840,
        livetracking: 1, reschedulable: 1, availableSeats: 29, singleSeats: 10, totalSeats: 36,
        hasWomenOffer: true, womenDiscountPct: 10, layoutType: 'sleeper-36',
        routedetails: dynamicRoute, amenities: defaultAmenities, photos: interPhotos, seats: this.generateSeats('sleeper-36', pSmart - 30)
      },
      {
        _id: 'NUEGO-20', operatorname: 'NueGo', busname: 'NueGo Electric Coach',
        bustypename: 'Electric AC Seater (2+2)', superBusBadge: '40 Seats Electric',
        busdeparturetime: '07:00 PM', busarrivaltime: '07:15 AM', seatprivce: pHybrid - 80, avgrating: 4.7, totalreview: 1540,
        livetracking: 1, reschedulable: 1, availableSeats: 34, singleSeats: 11, totalSeats: 40,
        hasWomenOffer: true, womenDiscountPct: 10, layoutType: 'seater-40',
        routedetails: dynamicRoute, amenities: defaultAmenities, photos: airavatPhotos, seats: this.generateSeats('sleeper-36', pHybrid - 80)
      },
      {
        _id: 'PTC-21', operatorname: 'PTC SkyBus', busname: 'PTC Volvo Eicher',
        bustypename: 'AC Sleeper-Seater', superBusBadge: '40 Berths/Seats',
        busdeparturetime: '07:15 PM', busarrivaltime: '07:45 AM', seatprivce: pHybrid, avgrating: 4.5, totalreview: 1190,
        livetracking: 1, reschedulable: 1, availableSeats: 31, singleSeats: 10, totalSeats: 40,
        hasWomenOffer: false, layoutType: 'hybrid-40',
        routedetails: dynamicRoute, amenities: defaultAmenities, photos: eicherPhotos, seats: this.generateSeats('sleeper-36', pHybrid)
      }
    ];
  }

  openFloatingSeatDrawer(bus: BusItem, initialTab: string = 'highlights'): void {
    this.floatingSelectedBus = bus;
    this.modalStep = 'seats';
    this.activeDrawerTab = initialTab;
    this.showAllStopsDrawer = false;
    this.selectedSeatsList = [];
    this.passengersList = [];
    this.femaleSeatNoteMessage = '';
    this.contactPhone = '';
    this.contactEmail = '';
    this.contactState = '';
    this.isEditingContact = true;
    this.showFormErrors = false;
    this.freeCancellationChoice = 'no';
    this.tripGuaranteeChoice = 'no';
    this.travelInsuranceChoice = 'no';
    this.hasGstNumber = false;
    this.appliedCouponCode = '';
    this.appliedDiscount = 0;
    this.selectedBoardingPoint = bus.routedetails.boardingPoints[0] || null;
    this.selectedDroppingPoint = bus.routedetails.droppingPoints[0] || null;
    this.paymentSuccess = false;
    document.body.style.overflow = 'hidden';
  }

  closeFloatingSeatDrawer(): void {
    this.stopPaymentTimer();
    this.floatingSelectedBus = null;
    document.body.style.overflow = 'auto';
  }

  scrollToSection(tabId: string): void {
    this.activeDrawerTab = tabId;
    const el = document.getElementById('sec-' + tabId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  syncPassengerFormsWithSeats(): void {
    this.passengersList = this.selectedSeatsList.map(seat => {
      const existing = this.passengersList.find(p => p.seatLabel === seat.label);
      const isWomenSeat = Boolean(seat.isFemaleOnlyAvailable || this.isWomenBookingMode);
      return existing || {
        seatLabel: seat.label,
        deck: seat.deck,
        price: seat.price,
        name: '',
        age: null,
        gender: isWomenSeat ? 'Female' : '',
        isFemaleReservedSeat: Boolean(seat.isFemaleOnlyAvailable),
        isSelected: true
      };
    });
  }

  get validPassengersCount(): number {
    return this.passengersList.filter(p => this.isPassengerValid(p)).length;
  }

  goToModalStep(step: 'seats' | 'board_drop' | 'passenger'): void {
    if (step !== 'seats' && this.selectedSeatsList.length === 0) {
      this.showToast('Please select at least one seat first');
      return;
    }
    if (step === 'passenger') {
      this.syncPassengerFormsWithSeats();
      this.showFormErrors = false;
    }
    this.modalStep = step;
  }

  showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => {
      this.toastMessage = '';
    }, 3200);
  }

  toggleSeat(seat: BusSeat | undefined): void {
    if (!seat) return;

    if (seat.isBooked) {
      if (seat.gender === 'F') {
        this.showToast(`Seat ${seat.label} is already booked by a female passenger (👩).`);
      } else {
        this.showToast(`Seat ${seat.label} is already booked.`);
      }
      return;
    }

    const idx = this.selectedSeatsList.findIndex(s => s.id === seat.id);
    if (idx > -1) {
      this.selectedSeatsList.splice(idx, 1);
      if (!this.selectedSeatsList.some(s => s.isFemaleOnlyAvailable)) {
        this.femaleSeatNoteMessage = '';
      }
    } else {
      this.selectedSeatsList.push(seat);
      if (seat.isFemaleOnlyAvailable) {
        this.femaleSeatNoteMessage = `Note: Seat ${seat.label} is beside a female-booked berth. Only a female passenger can book this seat.`;
        this.showToast(`👩 Note: Only female passenger can book Seat ${seat.label} (adjacent seat is booked by a female).`);
      }
    }
    this.syncPassengerFormsWithSeats();
  }

  isSeatSelected(seat: BusSeat | undefined): boolean {
    if (!seat) return false;
    return this.selectedSeatsList.some(s => s.id === seat.id);
  }

  getGenderAvatar(gender: 'Male' | 'Female' | 'Other' | ''): string {
    if (gender === 'Male') return '👨';
    if (gender === 'Female') return '👩';
    if (gender === 'Other') return '🧑';
    return '👤';
  }

  isPhoneValid(): boolean {
    return /^[6-9]\d{9}$/.test((this.contactPhone || '').trim());
  }

  isEmailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((this.contactEmail || '').trim());
  }

  isPassengerValid(p: PassengerFormItem): boolean {
    const validName = (p.name || '').trim().length >= 2;
    const validAge = p.age !== null && Number(p.age) >= 1 && Number(p.age) <= 120;
    const validGender = p.gender === 'Male' || p.gender === 'Female' || p.gender === 'Other';
    return validName && validAge && validGender;
  }

  get baseSeatTotal(): number {
    return this.selectedSeatsList.reduce((acc, s) => acc + s.price, 0);
  }

  get addonsTotal(): number {
    const pax = Math.max(1, this.selectedSeatsList.length);
    let extra = 0;
    if (this.freeCancellationChoice === 'yes') extra += 420 * pax;
    if (this.tripGuaranteeChoice === 'yes') extra += 26 * pax;
    if (this.travelInsuranceChoice === 'yes') extra += 15 * pax;
    return extra;
  }

  get gstAmount(): number {
    return Math.round(this.baseSeatTotal * 0.05);
  }

  get finalPayableAmount(): number {
    const raw = this.baseSeatTotal + this.addonsTotal + this.gstAmount - this.appliedDiscount - (this.useWallet ? 50 : 0);
    return Math.max(0, raw);
  }

  get reportingTimeFormatted(): string {
    const dep = this.selectedBoardingPoint?.time || '09:00 PM';
    const match = dep.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return dep;
    let hrs = parseInt(match[1], 10);
    let mins = parseInt(match[2], 10) - 15;
    let period = match[3].toUpperCase();
    if (mins < 0) {
      mins += 60;
      if (hrs === 12) {
        hrs = 11;
        period = period === 'PM' ? 'AM' : 'PM';
      } else if (hrs === 1) {
        hrs = 12;
      } else {
        hrs -= 1;
      }
    }
    const hStr = hrs < 10 ? '0' + hrs : '' + hrs;
    const mStr = mins < 10 ? '0' + mins : '' + mins;
    return `${hStr}:${mStr} ${period}`;
  }

  proceedToPayment(): void {
    this.showFormErrors = true;

    if (!this.isPhoneValid()) {
      this.showToast('Please enter a valid 10-digit Mobile Number');
      return;
    }
    if (!this.isEmailValid()) {
      this.showToast('Please enter a valid Email Address');
      return;
    }
    if (!this.contactState) {
      this.showToast('Please select your State of Residence');
      return;
    }
    for (let i = 0; i < this.passengersList.length; i++) {
      const p = this.passengersList[i];
      if (!this.isPassengerValid(p)) {
        this.showToast(`Please complete Name, Age & Gender for Co-Traveller ${i + 1} (Seat ${p.seatLabel})`);
        return;
      }
    }

    const hasFemalePassenger = this.passengersList.some(p => p.gender === 'Female');
    if (hasFemalePassenger && (this.isWomenBookingMode || this.floatingSelectedBus?.hasWomenOffer)) {
      this.copyCoupon('WOMEN10');
    }

    this.modalStep = 'payment';
    this.paymentView = 'main';
    this.selectedMainPaymentMethod = 'qr';
    this.qrFallbackStage = 0;
    this.customQrCodeUrl = 'assets/qr-code.png';
    this.startPaymentTimer();
  }

  startPaymentTimer(): void {
    this.stopPaymentTimer();
    this.remainingSeconds = 900;
    this.timerInterval = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        this.cdr.detectChanges();
      } else {
        this.stopPaymentTimer();
        this.showToast('Payment session expired. Please try again.');
      }
    }, 1000);
  }

  stopPaymentTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  get formattedTimer(): string {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    const mStr = mins < 10 ? '0' + mins : '' + mins;
    const sStr = secs < 10 ? '0' + secs : '' + secs;
    return `${mStr}:${sStr}`;
  }

  copyCoupon(code: string): void {
    const cleanCode = (code || '').trim().toUpperCase();
    this.couponInput = cleanCode;
    this.appliedCouponCode = cleanCode;

    if (cleanCode === 'WOMEN10') {
      const pct = this.floatingSelectedBus?.womenDiscountPct || 10;
      const base = this.baseSeatTotal > 0 ? this.baseSeatTotal : 1400;
      const calc = Math.round((base * pct) / 100);
      this.appliedDiscount = Math.max(100, calc);
      this.showToast(`👩 WOMEN10 applied! ${pct}% OFF (₹${this.appliedDiscount} saved).`);
    } else {
      this.appliedDiscount = 200;
      this.showToast(`Coupon ${cleanCode} applied! ₹200 saved.`);
    }
  }

  completeMockPayment(): void {
    this.stopPaymentTimer();
    const randNum = Math.floor(100000 + Math.random() * 900000);
    const randTin = Math.floor(10000000 + Math.random() * 90000000);
    const randPhoneSuffix = Math.floor(10000 + Math.random() * 89999);

    this.generatedPnr = `RB${randNum}`;
    this.generatedTin = `TIN${randTin}`;
    this.operatorHelpline = `080-39412345 / +91 98450${randPhoneSuffix}`;
    this.bookingTimestamp = new Date().toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    this.paymentSuccess = true;
    this.showToast('Booking Confirmed! Your RedBus e-Ticket is ready.');
  }

  downloadPdfTicket(): void {
    if (!this.floatingSelectedBus) return;
    const bus = this.floatingSelectedBus;
    const seatLabels = this.selectedSeatsList.map(s => `${s.label} (${s.deck === 'upper' ? 'Upper' : 'Lower'})`).join(', ') || 'L1';

    const passengerRowsHtml = this.passengersList.map((p, idx) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">${idx + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;">${p.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">${p.gender}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">${p.age} yrs</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:800;color:#d84e55;">${p.seatLabel} (${p.deck === 'upper' ? 'Upper' : 'Lower'})</td>
      </tr>
    `).join('');

    const pdfWindow = window.open('', '_blank', 'width=900,height=1050');
    if (!pdfWindow) {
      this.showToast('Please allow pop-ups to download the PDF ticket.');
      return;
    }

    pdfWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>redBus_eTicket_${this.generatedTin}.pdf</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #f1f5f9;
      color: #1e293b;
      margin: 0;
      padding: 20px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .sheet {
      max-width: 780px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      overflow: hidden;
    }
    .rb-header {
      background: #d84e55;
      color: #ffffff;
      padding: 18px 26px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .rb-logo {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .rb-logo span {
      font-size: 12px;
      font-weight: 600;
      background: rgba(255,255,255,0.2);
      padding: 3px 8px;
      border-radius: 4px;
      margin-left: 8px;
      vertical-align: middle;
    }
    .helpline-box {
      text-align: right;
      font-size: 11px;
      line-height: 1.5;
    }
    .meta-strip {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 12px 26px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
    }
    .route-hero {
      padding: 20px 26px;
      border-bottom: 2px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .city-block h2 {
      margin: 0;
      font-size: 22px;
      color: #0f172a;
    }
    .city-block p {
      margin: 4px 0 0;
      font-size: 12px;
      color: #64748b;
    }
    .arrow-mid {
      text-align: center;
      color: #d84e55;
      font-weight: 800;
      font-size: 13px;
    }
    .info-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      padding: 18px 26px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
    }
    .info-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
    }
    .lbl {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.4px;
    }
    .val {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 3px;
    }
    .section-pad {
      padding: 16px 26px;
    }
    .sec-title {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      color: #d84e55;
      margin: 0 0 10px;
      letter-spacing: 0.5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
    }
    th {
      background: #f1f5f9;
      text-align: left;
      padding: 9px 12px;
      font-size: 11px;
      text-transform: uppercase;
      color: #475569;
    }
    .bd-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .bd-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
      font-size: 12px;
      line-height: 1.5;
    }
    .mticket-banner {
      margin: 0 26px 16px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
    }
    .fare-box {
      margin: 0 26px 18px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 18px;
      background: #f8fafc;
    }
    .fare-line {
      display: flex;
      justify-content: space-between;
      font-size: 12.5px;
      margin-bottom: 6px;
    }
    .fare-total {
      border-top: 1.5px dashed #94a3b8;
      padding-top: 8px;
      margin-top: 8px;
      font-size: 15px;
      font-weight: 900;
      color: #15803d;
      display: flex;
      justify-content: space-between;
    }
    .terms-box {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 14px 26px;
      font-size: 10.5px;
      color: #64748b;
      line-height: 1.5;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .sheet { border: none; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="rb-header">
      <div>
        <div class="rb-logo">redBus <span>e-TICKET</span></div>
        <div style="font-size:11px;margin-top:4px;opacity:0.9;">India's No. 1 Online Bus Ticketing Platform</div>
      </div>
      <div class="helpline-box">
        <div><strong>Need help with your trip?</strong></div>
        <div>redBus 24x7 Support: 080-39412345</div>
        <div>Operator Helpline: ${this.operatorHelpline}</div>
      </div>
    </div>

    <div class="meta-strip">
      <div><strong>Ticket No (TIN):</strong> ${this.generatedTin}</div>
      <div><strong>PNR No:</strong> ${this.generatedPnr}</div>
      <div><strong>Booked On:</strong> ${this.bookingTimestamp}</div>
    </div>

    <div class="route-hero">
      <div class="city-block">
        <div class="lbl">SOURCE</div>
        <h2>${this.fromCity}</h2>
        <p>${this.journeyDate} • Departs ${this.selectedBoardingPoint?.time}</p>
      </div>
      <div class="arrow-mid">
        <div>${bus.routedetails.duration}</div>
        <div style="font-size:20px;">➔</div>
        <div>${bus.routedetails.distanceKm} km</div>
      </div>
      <div class="city-block" style="text-align:right;">
        <div class="lbl">DESTINATION</div>
        <h2>${this.toCity}</h2>
        <p>Arrives ${this.selectedDroppingPoint?.time}</p>
      </div>
    </div>

    <div class="info-grid-3">
      <div class="info-box">
        <div class="lbl">BUS OPERATOR & TYPE</div>
        <div class="val">${bus.operatorname}</div>
        <div style="font-size:11px;color:#475569;">${bus.bustypename}</div>
      </div>
      <div class="info-box">
        <div class="lbl">REPORTING & DEPARTURE TIME</div>
        <div class="val">${this.reportingTimeFormatted} / ${this.selectedBoardingPoint?.time}</div>
        <div style="font-size:11px;color:#475569;">Please arrive 15 mins prior</div>
      </div>
      <div class="info-box">
        <div class="lbl">SEAT NUMBER(S)</div>
        <div class="val" style="color:#d84e55;">${seatLabels}</div>
        <div style="font-size:11px;color:#475569;">Total Passengers: ${this.passengersList.length}</div>
      </div>
    </div>

    <div class="section-pad">
      <h4 class="sec-title">Passenger Details</h4>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Passenger Name</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Seat & Deck</th>
          </tr>
        </thead>
        <tbody>
          ${passengerRowsHtml}
        </tbody>
      </table>
    </div>

    <div class="section-pad" style="padding-top:0;">
      <h4 class="sec-title">Boarding & Dropping Point Details</h4>
      <div class="bd-grid">
        <div class="bd-card">
          <div class="lbl">BOARDING POINT (${this.fromCity})</div>
          <div class="val">${this.selectedBoardingPoint?.name}</div>
          <div><strong>Landmark:</strong> ${this.selectedBoardingPoint?.landmark}</div>
          <div><strong>Reporting Time:</strong> ${this.reportingTimeFormatted} | <strong>Departure:</strong> ${this.selectedBoardingPoint?.time}</div>
        </div>
        <div class="bd-card">
          <div class="lbl">DROPPING POINT (${this.toCity})</div>
          <div class="val">${this.selectedDroppingPoint?.name}</div>
          <div><strong>Landmark:</strong> ${this.selectedDroppingPoint?.landmark}</div>
          <div><strong>Estimated Arrival:</strong> ${this.selectedDroppingPoint?.time} (${this.selectedDroppingPoint?.date})</div>
        </div>
      </div>
    </div>

    <div class="mticket-banner">
      ✔ NOTE: This operator accepts mTicket. You do not need to carry a printout; simply present this digital PDF/SMS along with a valid Government Photo ID during boarding.
    </div>

    <div class="fare-box">
      <div class="sec-title" style="margin-bottom:8px;">Payment & Fare Breakup</div>
      <div class="fare-line"><span>Base Seat Fare (${this.passengersList.length} Passenger)</span><span>₹${this.baseSeatTotal}</span></div>
      ${this.addonsTotal > 0 ? `<div class="fare-line"><span>Trip Protection & Add-ons</span><span>₹${this.addonsTotal}</span></div>` : ''}
      <div class="fare-line"><span>GST (5%)</span><span>₹${this.gstAmount}</span></div>
      ${this.appliedDiscount > 0 ? `<div class="fare-line" style="color:#15803d;"><span>Promo Discount (${this.appliedCouponCode})</span><span>-₹${this.appliedDiscount}</span></div>` : ''}
      ${this.useWallet ? `<div class="fare-line" style="color:#15803d;"><span>redBus Wallet Cashback</span><span>-₹50</span></div>` : ''}
      <div class="fare-total">
        <span>Total Fare Paid (Inclusive of GST) • Contact: +91 ${this.contactPhone} (${this.contactState})</span>
        <span>₹${this.finalPayableAmount}</span>
      </div>
    </div>

    <div class="terms-box">
      <strong>Important Terms & Conditions:</strong><br/>
      1. Passengers must carry a valid government-issued photo ID (Aadhaar Card, Voter ID, Passport, or Driving License) matching the ticket name.<br/>
      2. Baggage Allowance: Up to 20 kg per passenger in underbay storage. Excess luggage may incur operator charges.<br/>
      3. Cancellation Policy: 75% refund before 24 hrs of departure; 50% refund between 12–24 hrs; 0% refund within 12 hrs (unless Free Cancellation add-on was purchased).
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 350);
    };
  </script>
</body>
</html>`);
    pdfWindow.document.close();
  }

  downloadTicketReceipt(): void {
    this.downloadPdfTicket();
  }

  printTicketReceipt(): void {
    this.downloadPdfTicket();
  }

  swapCities(): void {
    const temp = this.fromCity;
    this.fromCity = this.toCity;
    this.toCity = temp;
    this.updateCityContext();
  }
}