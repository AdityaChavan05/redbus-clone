import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

// Embedded fallback dictionaries ensure instant zero-latency translations and fallback
const EMBEDDED_TRANSLATIONS: { [lang: string]: any } = {
  en: {
    COMMON: {
      APP_NAME: 'TedBus',
      BUS_TICKETS: 'Bus Tickets',
      ROUTE_PLANNER: 'Route Planner',
      COMMUNITY: 'Community & Stories',
      NOTIFICATIONS: 'Notifications',
      ACCOUNT: 'Account',
      LANGUAGE: 'Language',
      THEME: 'Theme',
      SEARCH: 'Search',
      CLOSE: 'Close',
      CANCEL: 'Cancel',
      SUBMIT: 'Submit',
      SAVE: 'Save',
      DELETE: 'Delete',
      EDIT: 'Edit',
      RETRY: 'Retry',
      SHARE: 'Share',
      REPORT: 'Report',
      HELPFUL: 'Helpful',
      VERIFIED: 'Verified Traveler',
      TRUSTED_REVIEWER: 'Trusted Reviewer'
    },
    NAV: {
      BUS_TICKETS: 'Bus Tickets',
      ROUTE_PLANNER: 'Route Planner',
      COMMUNITY: 'Community & Reviews',
      NOTIFICATIONS: 'Notifications',
      LIGHT_MODE: 'Light Mode',
      DARK_MODE: 'Dark Mode'
    },
    HERO: {
      TITLE: "India's No. 1 Online Bus Ticket Booking Site",
      SUBTITLE: "Over 36 million happy customers worldwide",
      FROM: "FROM",
      TO: "TO",
      DATE: "DATE",
      SEARCH_BUSES: "SEARCH BUSES",
      TRENDING_OFFERS: "TRENDING OFFERS",
      SAFETY_TITLE: "SAFETY+",
      SAFETY_DESC: "Sanitized buses, mandatory checks, and verified operators.",
      SERVICE_TITLE: "SUPERIOR SERVICE",
      SERVICE_DESC: "Round-the-clock live support, resolution within 24 hours.",
      PRICE_TITLE: "LOWEST PRICES",
      PRICE_DESC: "Best ticket fares guaranteed across 35+ verified operators."
    },
    PLANNER: {
      TITLE: "Interactive Route Planner & Live Traffic",
      SUBTITLE: "Add stops, compare highway options, and view live highway congestion.",
      ORIGIN: "Origin (Start City)",
      DESTINATION: "Destination (End City)",
      ADD_STOP: "Add Intermediate Stop",
      CALCULATE: "Calculate Best Route",
      SUGGESTED_ROUTES: "Suggested Highway Corridors",
      SAVE_ROUTE: "Save to My Routes",
      SAVED_ROUTES: "Saved Quick Routes",
      SIMULATE_TRAFFIC: "Simulate Live Traffic Fluctuation",
      TRAFFIC_LOW: "Clear Highway (Low Traffic)",
      TRAFFIC_MODERATE: "Moderate Congestion",
      TRAFFIC_HEAVY: "Heavy Traffic Delay"
    },
    COMMUNITY: {
      TITLE: "Traveler Community & Journey Stories",
      SUBTITLE: "Authentic reviews, travel tips, and journey stories shared by verified travelers.",
      SHARE_EXP: "Share Your Bus Experience",
      STORY_TITLE: "Story Title",
      CATEGORY: "Category",
      CONTENT_PLACEHOLDER: "Share your journey experience (punctuality, rest stops, seating comfort)...",
      PHOTO_URL: "Photo URL (Optional)",
      PUBLISH: "Publish Story",
      TRENDING: "🔥 Trending Stories",
      FORUMS: "Discussion Forums",
      TOPIC_ALL: "All Stories",
      TOPIC_STORIES: "Journey Stories",
      TOPIC_TIPS: "Travel Tips",
      TOPIC_DESTINATIONS: "Destinations",
      TOPIC_ROUTES: "Route Advice",
      MODERATION_QUEUE: "Moderation Queue",
      COMMENTS: "Comments",
      ADD_COMMENT: "Write a comment..."
    },
    REVIEWS: {
      TITLE: "Route Ratings & Verified Reviews",
      SUBTITLE: "Only travelers with completed journeys can rate routes.",
      AVG_RATING: "Average Rating",
      TOTAL_REVIEWS: "Verified Reviews",
      WRITE_REVIEW: "Rate & Review This Route",
      SELECT_TRIP: "Select Completed Journey",
      RATING_STARS: "Your Rating",
      REVIEW_TEXT: "Your Travel Feedback (Min. 20 chars)",
      EDIT_WINDOW_NOTE: "You can edit your review within 24 hours of submission.",
      EDIT_EXPIRED: "24-hour edit window has expired.",
      UPVOTE_HELPFUL: "Helpful",
      REPORT_REVIEW: "Report Violation"
    },
    NOTIFICATIONS: {
      TITLE: "Notification Center",
      MARK_ALL_READ: "Mark All as Read",
      NO_NOTIFS: "No notifications yet.",
      CHANNELS: "Channels",
      PREFERENCES: "Notification Preferences",
      EMAIL: "Email Alerts",
      PUSH: "Push Notifications",
      IN_APP: "In-App Alerts",
      PROMOTIONAL: "Promotional Offers",
      TEST_EVENTS: "Simulate Test Alerts"
    }
  },
  hi: {
    COMMON: {
      APP_NAME: 'टेडबस',
      BUS_TICKETS: 'बस टिकट',
      ROUTE_PLANNER: 'रूट प्लानर',
      COMMUNITY: 'कम्युनिटी और कहानियां',
      NOTIFICATIONS: 'सूचनाएं',
      ACCOUNT: 'खाता',
      LANGUAGE: 'भाषा',
      THEME: 'थीम',
      SEARCH: 'खोजें',
      CLOSE: 'बंद करें',
      CANCEL: 'रद्द करें',
      SUBMIT: 'जमा करें',
      SAVE: 'सहेजें',
      DELETE: 'हटाएं',
      EDIT: 'संपादित करें',
      RETRY: 'पुनः प्रयास करें',
      SHARE: 'साझा करें',
      REPORT: 'रिपोर्ट करें',
      HELPFUL: 'उपयोगी',
      VERIFIED: 'सत्यापित यात्री',
      TRUSTED_REVIEWER: 'विश्वसनीय समीक्षक'
    },
    NAV: {
      BUS_TICKETS: 'बस टिकट',
      ROUTE_PLANNER: 'रूट प्लानर',
      COMMUNITY: 'कम्युनिटी और समीक्षाएं',
      NOTIFICATIONS: 'सूचनाएं',
      LIGHT_MODE: 'लाइट मोड',
      DARK_MODE: 'डार्क मोड'
    },
    HERO: {
      TITLE: "भारत की नंबर 1 ऑनलाइन बस टिकट बुकिंग साइट",
      SUBTITLE: "दुनिया भर में 3.6 करोड़ से अधिक संतुष्ट ग्राहक",
      FROM: "कहाँ से",
      TO: "कहाँ तक",
      DATE: "दिनांक",
      SEARCH_BUSES: "बसें खोजें",
      TRENDING_OFFERS: "शानदार ऑफ़र",
      SAFETY_TITLE: "सुरक्षा+",
      SAFETY_DESC: "सैनिटाइज्ड बसें, अनिवार्य जांच और तनाव मुक्त यात्रा के लिए सत्यापित ऑपरेटर।",
      SERVICE_TITLE: "उत्कृष्ट सेवा",
      SERVICE_DESC: "24 घंटे लाइव सहायता, 24 घंटे में समाधान और त्वरित रिफंड।",
      PRICE_TITLE: "सबसे कम किराया",
      PRICE_DESC: "35+ सत्यापित ऑपरेटरों पर बिना किसी छिपे शुल्क के सर्वोत्तम टिकट मूल्य।"
    },
    PLANNER: {
      TITLE: "इंटरएक्टिव रूट प्लानर और लाइव ट्रैफिक",
      SUBTITLE: "स्टॉप जोड़ें, हाईवे विकल्पों की तुलना करें और लाइव ट्रैफिक देखें।",
      ORIGIN: "प्रारंभिक शहर (कहाँ से)",
      DESTINATION: "गंतव्य शहर (कहाँ तक)",
      ADD_STOP: "मध्यवर्ती स्टॉप जोड़ें",
      CALCULATE: "सर्वोत्तम रूट खोजें",
      SUGGESTED_ROUTES: "सुझाए गए हाईवे कॉरिडोर",
      SAVE_ROUTE: "मेरे रूट में सहेजें",
      SAVED_ROUTES: "सहेजे गए त्वरित रूट",
      SIMULATE_TRAFFIC: "लाइव ट्रैफिक में बदलाव सिमुलेट करें",
      TRAFFIC_LOW: "साफ हाईवे (कम ट्रैफिक)",
      TRAFFIC_MODERATE: "मध्यम ट्रैफिक",
      TRAFFIC_HEAVY: "भारी ट्रैफिक जाम"
    },
    COMMUNITY: {
      TITLE: "यात्री कम्युनिटी और यात्रा कहानियां",
      SUBTITLE: "सत्यापित यात्रियों द्वारा साझा की गई प्रामाणिक समीक्षाएं और यात्रा सुझाव।",
      SHARE_EXP: "अपना बस अनुभव साझा करें",
      STORY_TITLE: "कहानी का शीर्षक",
      CATEGORY: "श्रेणी",
      CONTENT_PLACEHOLDER: "अपनी यात्रा का अनुभव साझा करें (समय की पाबंदी, स्टॉप, सीट आराम)...",
      PHOTO_URL: "फोटो लिंक (वैकल्पिक)",
      PUBLISH: "कहानी प्रकाशित करें",
      TRENDING: "🔥 लोकप्रिय कहानियां",
      FORUMS: "चर्चा मंच",
      TOPIC_ALL: "सभी कहानियां",
      TOPIC_STORIES: "यात्रा कहानियां",
      TOPIC_TIPS: "यात्रा सुझाव",
      TOPIC_DESTINATIONS: "गंतव्य गाइड",
      TOPIC_ROUTES: "रूट सलाह",
      MODERATION_QUEUE: "मॉडरेशन कतार",
      COMMENTS: "टिप्पणियां",
      ADD_COMMENT: "टिप्पणी लिखें..."
    },
    REVIEWS: {
      TITLE: "रूट रेटिंग और सत्यापित समीक्षाएं",
      SUBTITLE: "केवल पूर्ण यात्रा वाले यात्री ही रूट की समीक्षा कर सकते हैं।",
      AVG_RATING: "औसत रेटिंग",
      TOTAL_REVIEWS: "सत्यापित समीक्षाएं",
      WRITE_REVIEW: "इस रूट की समीक्षा करें",
      SELECT_TRIP: "पूर्ण यात्रा चुनें",
      RATING_STARS: "आपकी रेटिंग",
      REVIEW_TEXT: "आपकी प्रतिक्रिया (कम से कम 20 अक्षर)",
      EDIT_WINDOW_NOTE: "आप सबमिशन के 24 घंटों के भीतर अपनी समीक्षा संपादित कर सकते हैं।",
      EDIT_EXPIRED: "24 घंटे की संपादन अवधि समाप्त हो गई है।",
      UPVOTE_HELPFUL: "उपयोगी",
      REPORT_REVIEW: "उल्लंघन की रिपोर्ट करें"
    },
    NOTIFICATIONS: {
      TITLE: "सूचना केंद्र",
      MARK_ALL_READ: "सभी को पढ़ा हुआ चिह्नित करें",
      NO_NOTIFS: "अभी कोई सूचना नहीं है।",
      CHANNELS: "माध्यम",
      PREFERENCES: "सूचना प्राथमिकताएं",
      EMAIL: "ईमेल सूचनाएं",
      PUSH: "पुश सूचनाएं",
      IN_APP: "इन-ऐप सूचनाएं",
      PROMOTIONAL: "प्रचारक ऑफ़र",
      TEST_EVENTS: "परीक्षण सूचनाएं सिमुलेट करें"
    }
  },
  kn: {
    COMMON: {
      APP_NAME: 'ಟೆಡ್‌ಬಸ್',
      BUS_TICKETS: 'ಬಸ್ ಟಿಕೆಟ್‌ಗಳು',
      ROUTE_PLANNER: 'ಮಾರ್ಗ ಯೋಜನೆ',
      COMMUNITY: 'ಪ್ರಯಾಣ ಸಮುದಾಯ',
      NOTIFICATIONS: 'ಅಧಿಸೂಚನೆಗಳು',
      ACCOUNT: 'ಖಾತೆ',
      LANGUAGE: 'ಭಾಷೆ',
      THEME: 'ಥೀಮ್',
      SEARCH: 'ಹುಡುಕಿ',
      CLOSE: 'ಮುಚ್ಚಿ',
      CANCEL: 'ರದ್ದುಮಾಡಿ',
      SUBMIT: 'ಸಲ್ಲಿಸಿ',
      SAVE: 'ಉಳಿಸಿ',
      DELETE: 'ಅಳಿಸಿ',
      EDIT: 'ಸಂಪಾದಿಸಿ',
      RETRY: 'ಮರುಪ್ರಯತ್ನಿಸಿ',
      SHARE: 'ಹಂಚಿಕೊಳ್ಳಿ',
      REPORT: 'ವರದಿ ಮಾಡಿ',
      HELPFUL: 'ಉಪಯುಕ್ತ',
      VERIFIED: 'ದೃಢೀಕೃತ ಪ್ರಯಾಣಿಕ',
      TRUSTED_REVIEWER: 'ವಿಶ್ವಾಸಾರ್ಹ ವಿಮರ್ಶಕ'
    },
    NAV: {
      BUS_TICKETS: 'ಬಸ್ ಟಿಕೆಟ್‌ಗಳು',
      ROUTE_PLANNER: 'ಮಾರ್ಗ ಯೋಜನೆ',
      COMMUNITY: 'ಸಮುದಾಯ ಮತ್ತು ವಿಮರ್ಶೆಗಳು',
      NOTIFICATIONS: 'ಅಧಿಸೂಚನೆಗಳು',
      LIGHT_MODE: 'ಲೈಟ್ ಮೋಡ್',
      DARK_MODE: 'ಡಾರ್ಕ್ ಮೋಡ್'
    },
    HERO: {
      TITLE: "ಭಾರತದ ನಂ. 1 ಆನ್‌ಲೈನ್ ಬಸ್ ಟಿಕೆಟ್ ಬುಕಿಂಗ್ ತಾಣ",
      SUBTITLE: "ವಿಶ್ವಾದ್ಯಂತ 3.6 ಕೋಟಿಗೂ ಹೆಚ್ಚು ಸಂತೃಪ್ತ ಗ್ರಾಹಕರು",
      FROM: "ಎಲ್ಲಿಂದ",
      TO: "ಎಲ್ಲಿಗೆ",
      DATE: "ದಿನಾಂಕ",
      SEARCH_BUSES: "ಬಸ್‌ಗಳನ್ನು ಹುಡುಕಿ",
      TRENDING_OFFERS: "ಜನಪ್ರಿಯ ಆಫರ್‌ಗಳು",
      SAFETY_TITLE: "ಸುರಕ್ಷತೆ+",
      SAFETY_DESC: "ಸ್ವಚ್ಛಗೊಳಿಸಿದ ಬಸ್‌ಗಳು ಮತ್ತು ಸುರಕ್ಷಿತ ಪ್ರಯಾಣ.",
      SERVICE_TITLE: "ಉತ್ತಮ ಸೇವೆ",
      SERVICE_DESC: "24 ಗಂಟೆಗಳ ಲೈವ್ ಬೆಂಬಲ ಮತ್ತು ತ್ವರಿತ ಮರುಪಾವತಿ.",
      PRICE_TITLE: "ಕಡಿಮೆ ದರ",
      PRICE_DESC: "ಯಾವುದೇ ಗುಪ್ತ ಶುಲ್ಕಗಳಿಲ್ಲದೆ ಅತ್ಯುತ್ತಮ ಬೆಲೆ."
    },
    PLANNER: {
      TITLE: "ಮಾರ್ಗ ಯೋಜನೆ ಮತ್ತು ಲೈವ್ ಟ್ರಾಫಿಕ್",
      SUBTITLE: "ಸ್ಟಾಪ್‌ಗಳನ್ನು ಸೇರಿಸಿ, ಹೆದ್ದಾರಿ ಮಾರ್ಗಗಳನ್ನು ಹೋಲಿಕೆ ಮಾಡಿ ಮತ್ತು ಲೈವ್ ಟ್ರಾಫಿಕ್ ವೀಕ್ಷಿಸಿ.",
      ORIGIN: "ಪ್ರಾರಂಭ ನಗರ (ಎಲ್ಲಿಂದ)",
      DESTINATION: "ಗಮ್ಯಸ್ಥಾನ ನಗರ (ಎಲ್ಲಿಗೆ)",
      ADD_STOP: "ಮಧ್ಯಂತರ ನಿಲುಗಡೆ ಸೇರಿಸಿ",
      CALCULATE: "ಉತ್ತಮ ಮಾರ್ಗ ಲೆಕ್ಕಹಾಕಿ",
      SUGGESTED_ROUTES: "ಸೂಚಿಸಲಾದ ಹೆದ್ದಾರಿ ಮಾರ್ಗಗಳು",
      SAVE_ROUTE: "ನನ್ನ ಮಾರ್ಗಗಳಿಗೆ ಉಳಿಸಿ",
      SAVED_ROUTES: "ಉಳಿಸಲಾದ ತ್ವರಿತ ಮಾರ್ಗಗಳು",
      SIMULATE_TRAFFIC: "ಲೈವ್ ಟ್ರಾಫಿಕ್ ಬದಲಾವಣೆ ಪರೀಕ್ಷಿಸಿ",
      TRAFFIC_LOW: "ಮುಕ್ತ ಹೆದ್ದಾರಿ (ಕಡಿಮೆ ಟ್ರಾಫಿಕ್)",
      TRAFFIC_MODERATE: "ಮಧ್ಯಮ ದಟ್ಟಣೆ",
      TRAFFIC_HEAVY: "ಭಾರೀ ಟ್ರಾಫಿಕ್ ವಿಳಂಬ"
    },
    COMMUNITY: {
      TITLE: "ಪ್ರಯಾಣಿಕರ ಸಮುದಾಯ ಮತ್ತು ಕಥೆಗಳು",
      SUBTITLE: "ದೃಢೀಕೃತ ಪ್ರಯಾಣಿಕರು ಹಂಚಿಕೊಂಡ ಅಧಿಕೃತ ವಿಮರ್ಶೆಗಳು ಮತ್ತು ಸಲಹೆಗಳು.",
      SHARE_EXP: "ನಿಮ್ಮ ಬಸ್ ಅನುಭವವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ",
      STORY_TITLE: "ಕಥೆಯ ಶೀರ್ಷಿಕೆ",
      CATEGORY: "ವರ್ಗ",
      CONTENT_PLACEHOLDER: "ನಿಮ್ಮ ಪ್ರಯಾಣದ ಅನುಭವವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ...",
      PHOTO_URL: "ಫೋಟೋ ಲಿಂಕ್ (ಐಚ್ಛಿಕ)",
      PUBLISH: "ಕಥೆಯನ್ನು ಪ್ರಕಟಿಸಿ",
      TRENDING: "🔥 ಜನಪ್ರಿಯ ಕಥೆಗಳು",
      FORUMS: "ಚರ್ಚಾ ವೇದಿಕೆಗಳು",
      TOPIC_ALL: "ಎಲ್ಲಾ ಕಥೆಗಳು",
      TOPIC_STORIES: "ಪ್ರಯಾಣ ಕಥೆಗಳು",
      TOPIC_TIPS: "ಪ್ರಯಾಣ ಸಲಹೆಗಳು",
      TOPIC_DESTINATIONS: "ತಾಣಗಳ ಮಾರ್ಗದರ್ಶಿ",
      TOPIC_ROUTES: "ಮಾರ್ಗ ಸಲಹೆ",
      MODERATION_QUEUE: "ಮಾಡರೇಶನ್ ಸಾಲು",
      COMMENTS: "ಕಾಮೆಂಟ್‌ಗಳು",
      ADD_COMMENT: "ಕಾಮೆಂಟ್ ಬರೆಯಿರಿ..."
    },
    REVIEWS: {
      TITLE: "ಮಾರ್ಗ ರೇಟಿಂಗ್ ಮತ್ತು ದೃಢೀಕೃತ ವಿಮರ್ಶೆಗಳು",
      SUBTITLE: "ಪೂರ್ಣಗೊಂಡ ಪ್ರಯಾಣ ಹೊಂದಿರುವ ಪ್ರಯಾಣಿಕರು ಮಾತ್ರ ಮಾರ್ಗಗಳನ್ನು ರೇಟ್ ಮಾಡಬಹುದು.",
      AVG_RATING: "ಸರಾಸರಿ ರೇಟಿಂಗ್",
      TOTAL_REVIEWS: "ದೃಢೀಕೃತ ವಿಮರ್ಶೆಗಳು",
      WRITE_REVIEW: "ಈ ಮಾರ್ಗವನ್ನು ವಿಮರ್ಶಿಸಿ",
      SELECT_TRIP: "ಪೂರ್ಣಗೊಂಡ ಪ್ರಯಾಣವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      RATING_STARS: "ನಿಮ್ಮ ರೇಟಿಂಗ್",
      REVIEW_TEXT: "ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆ (ಕನಿಷ್ಠ 20 ಅಕ್ಷರಗಳು)",
      EDIT_WINDOW_NOTE: "ಸಲ್ಲಿಸಿದ 24 ಗಂಟೆಗಳ ಒಳಗೆ ನಿಮ್ಮ ವಿಮರ್ಶೆಯನ್ನು ನೀವು ಸಂಪಾದಿಸಬಹುದು.",
      EDIT_EXPIRED: "24 ಗಂಟೆಗಳ ಸಂಪಾದನೆ ಅವಧಿ ಮುಗಿದಿದೆ.",
      UPVOTE_HELPFUL: "ಉಪಯುಕ್ತ",
      REPORT_REVIEW: "ಉಲ್ಲಂಘನೆ ವರದಿ ಮಾಡಿ"
    },
    NOTIFICATIONS: {
      TITLE: "ಅಧಿಸೂಚನೆ ಕೇಂದ್ರ",
      MARK_ALL_READ: "ಎಲ್ಲವನ್ನೂ ಓದಿದಂತೆ ಗುರುತಿಸಿ",
      NO_NOTIFS: "ಯಾವುದೇ ಹೊಸ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ.",
      CHANNELS: "ಮಾಧ್ಯಮಗಳು",
      PREFERENCES: "ಅಧಿಸೂಚನೆ ಆದ್ಯತೆಗಳು",
      EMAIL: "ಇಮೇಲ್ ಅಧಿಸೂಚನೆಗಳು",
      PUSH: "ಪುಶ್ ಅಧಿಸೂಚನೆಗಳು",
      IN_APP: "ಇನ್-ಆ್ಯಪ್ ಅಧಿಸೂಚನೆಗಳು",
      PROMOTIONAL: "ಪ್ರಚಾರ ಕೊಡುಗೆಗಳು",
      TEST_EVENTS: "ಪರೀಕ್ಷಾ ಅಧಿಸೂಚನೆಗಳು"
    }
  }
};

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLangSubject = new BehaviorSubject<string>(
    localStorage.getItem('preferred_lang') || 'en'
  );
  currentLang$: Observable<string> = this.currentLangSubject.asObservable();

  private translations: { [key: string]: any } = {};

  constructor(private http: HttpClient) {
    this.loadLanguage(this.currentLangSubject.value);
  }

  get currentLang(): string {
    return this.currentLangSubject.value;
  }

  setLanguage(lang: string): void {
    const validLang = ['en', 'hi', 'kn'].includes(lang) ? lang : 'en';
    localStorage.setItem('preferred_lang', validLang);
    this.loadLanguage(validLang);
  }

  private loadLanguage(lang: string): void {
    // Immediate fallback initialization
    this.translations = EMBEDDED_TRANSLATIONS[lang] || EMBEDDED_TRANSLATIONS['en'];
    this.currentLangSubject.next(lang);

    // Optional dynamic asset fetch to sync updates
    this.http.get(`./assets/i18n/${lang}.json`).subscribe({
      next: (data: any) => {
        if (data) {
          this.translations = data;
          this.currentLangSubject.next(lang);
        }
      },
      error: () => {
        // Fallback already assigned
      }
    });
  }

  translate(key: string): string {
    if (!key) return '';
    const keys = key.split('.');

    // 1. Try active language
    let result: any = this.translations;
    for (const k of keys) {
      if (!result || result[k] === undefined) {
        result = null;
        break;
      }
      result = result[k];
    }

    if (result && typeof result === 'string') return result;

    // 2. Fallback to English
    let fallback: any = EMBEDDED_TRANSLATIONS['en'];
    for (const k of keys) {
      if (!fallback || fallback[k] === undefined) {
        fallback = null;
        break;
      }
      fallback = fallback[k];
    }

    if (fallback && typeof fallback === 'string') return fallback;

    // 3. Fallback to original key
    return key;
  }
}