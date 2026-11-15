import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';

export type SupportedLanguage = 'en' | 'hi' | 'kn';

export interface RouteStats {
  averageRating: number;
  totalReviews: number;
  punctualityScore: number;
  cleanlinessScore: number;
  staffScore: number;
}

export interface ReviewItem {
  id: string;
  reviewerNameKey: string;
  badgeKey: string;
  operatorKey: string;
  busTypeKey: string;
  routeKey: string;
  dateKey: string;
  rating: number;
  titleKey: string;
  commentKey: string;
  helpfulCount: number;
  hasMarkedHelpful: boolean;
  verifiedTrip: boolean;
  createdAt?: number;
  isEditing?: boolean;
  editComment?: string;
  isReported?: boolean;
  isHidden?: boolean;
  pnr?: string;
}

@Component({
  selector: 'app-route-reviews',
  templateUrl: './route-reviews.component.html',
  styleUrls: ['./route-reviews.component.css']
})
export class RouteReviewsComponent implements OnInit, OnDestroy {

  currentLang: SupportedLanguage = 'en';
  isDarkMode: boolean = false;
  showForm: boolean = false;
  activeOperatorFilter: string = 'all';
  activeSort: 'recent' | 'highest' | 'lowest' = 'recent';

  private langListener: any;

  stats: RouteStats = {
    averageRating: 4.8,
    totalReviews: 4820,
    punctualityScore: 4.9,
    cleanlinessScore: 4.8,
    staffScore: 4.7
  };

  newReview = {
    pnr: '',
    rating: 5,
    title: '',
    comment: '',
    operator: 'VRL Travels'
  };

  // 100% dictionary coverage for every single UI text, label, and review
  dictionary: Record<string, Record<SupportedLanguage, string>> = {
    'hero_kicker': { en: 'REAL PASSENGER EXPERIENCES', hi: 'सच्चे यात्री अनुभव', kn: 'ನೈಜ ಪ್ರಯಾಣಿಕರ ಅನುಭವಗಳು' },
    'hero_heading': { en: 'Ratings & Fleet Route Reviews', hi: 'रेटिंग्स एवं बस मार्ग समीक्षाएं', kn: 'ರೇಟಿಂಗ್‌ಗಳು ಮತ್ತು ಬಸ್ ಮಾರ್ಗ ವಿಮರ್ಶೆಗಳು' },
    'hero_desc': { 
      en: 'Read authentic journey reviews verified by ticket PNR across VRL, KSRTC, IntrCity, and regional routes.',
      hi: 'वीआरएल, केएसआरटीसी, इंटरसिटी और क्षेत्रीय मार्गों के लिए पीएनआर सत्यापित वास्तविक समीक्षाएं पढ़ें।',
      kn: 'ವಿಆರ್‌ಎಲ್, ಕೆಎಸ್‌ಆರ್‌ಟಿಸಿ, ಇಂಟರ್‌ಸಿಟಿ ಮತ್ತು ಇತರ ಮಾರ್ಗಗಳ ಪಿಎನ್‌ಆರ್ ದೃಢೀಕೃತ ನೈಜ ವಿಮರ್ಶೆಗಳನ್ನು ಓದಿ.'
    },

    // Overall Scorecard
    'overall_rating_title': { en: 'Overall Experience Score', hi: 'समग्र अनुभव स्कोर', kn: 'ಒಟ್ಟಾರೆ ಅನುಭವದ ಸ್ಕೋರ್' },
    'based_on_txt': { en: 'Based on 48,200+ verified ticket bookings', hi: '48,200+ सत्यापित टिकट बुकिंग पर आधारित', kn: '48,200+ ದೃಢೀಕೃತ ಬುಕಿಂಗ್‌ಗಳ ಆಧಾರದ ಮೇಲೆ' },
    'metric_punctuality': { en: 'On-Time Departure', hi: 'समय पर प्रस्थान', kn: 'ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ನಿರ್ಗಮನ' },
    'metric_cleanliness': { en: 'Cleanliness & Hygiene', hi: 'सफाई एवं स्वच्छता', kn: 'ಸ್ವಚ್ಛತೆ ಮತ್ತು ನೈರ್ಮಲ್ಯ' },
    'metric_staff': { en: 'Crew & Driving Safety', hi: 'ड्राइवर व स्टाफ व्यवहार', kn: 'ಸಿಬ್ಬಂದಿ ಮತ್ತು ಚಾಲನಾ ಸುರಕ್ಷತೆ' },
    'metric_comfort': { en: 'Berth / Seat Comfort', hi: 'बर्थ / सीट आराम', kn: 'ಬರ್ತ್ / ಆಸನ ಸೌಕರ್ಯ' },

    // Operator Filters
    'filter_all_operators': { en: 'All Operators', hi: 'सभी ऑपरेटर', kn: 'ಎಲ್ಲಾ ಆಪರೇಟರ್‌ಗಳು' },
    'filter_vrl': { en: 'VRL Travels (4.9 ★)', hi: 'वीआरएल ट्रैवल्स (4.9 ★)', kn: 'ವಿಆರ್‌ಎಲ್ ಟ್ರಾವೆಲ್ಸ್ (4.9 ★)' },
    'filter_ksrtc': { en: 'KSRTC Airavat (4.8 ★)', hi: 'केएसआरटीसी ऐरावत (4.8 ★)', kn: 'ಕೆಎಸ್‌ಆರ್‌ಟಿಸಿ ಐರಾವತ (4.8 ★)' },
    'filter_intrcity': { en: 'IntrCity SmartBus (4.7 ★)', hi: 'इन्टरसिटी स्मार्टबस (4.7 ★)', kn: 'ಇಂಟರ್‌ಸಿಟಿ ಸ್ಮಾರ್ಟ್‌ಬಸ್ (4.7 ★)' },

    // Sorting Bar
    'sort_label': { en: 'Sort Reviews By:', hi: 'समीक्षा क्रमबद्ध करें:', kn: 'ವಿಮರ್ಶೆ ವಿಂಗಡಿಸಿ:' },
    'sort_recent': { en: 'Most Recent', hi: 'नवीनतम', kn: 'ಇತ್ತೀಚಿನವು' },
    'sort_highest': { en: 'Highest Rated', hi: 'उच्चतम रेटिंग', kn: 'ಗರಿಷ್ಠ ರೇಟಿಂಗ್' },
    'sort_lowest': { en: 'Lowest Rated', hi: 'न्यूनतम रेटिंग', kn: 'ಕನಿಷ್ಠ ರೇಟಿಂಗ್' },

    // Form & Buttons
    'btn_write_review': { en: 'Write a Review', hi: 'समीक्षा लिखें', kn: 'ವಿಮರ್ಶೆ ಬರೆಯಿರಿ' },
    'btn_cancel': { en: 'Cancel', hi: 'रद्द करें', kn: 'ರದ್ದುಮಾಡಿ' },
    'form_note': { en: 'Enter your 10-digit ticket PNR to verify your feedback', hi: 'अपनी समीक्षा सत्यापित करने के लिए अपना 10 अंकों का टिकट पीएनआर दर्ज करें', kn: 'ನಿಮ್ಮ ವಿಮರ್ಶೆಯನ್ನು ದೃಢೀಕರಿಸಲು 10-ಅಂಕಿಯ ಟಿಕೆಟ್ ಪಿಎನ್‌ಆರ್ ನಮೂದಿಸಿ' },
    'form_pnr_placeholder': { en: '10-Digit PNR (e.g. 1048291034)', hi: '10 अंकों का पीएनआर (उदा. 1048291034)', kn: '10-ಅಂಕಿಯ ಪಿಎನ್‌ಆರ್ (ಉದಾ. 1048291034)' },
    'form_title_placeholder': { en: 'Headline (e.g., Clean sleeper berth, punctual departure)', hi: 'शीर्षक (उदा. साफ स्लीपर बर्थ, समय पर प्रस्थान)', kn: 'ಶೀರ್ಷಿಕೆ (ಉದಾ. ಸ್ವಚ್ಛವಾದ ಸ್ಲೀಪರ್ ಬರ್ತ್, ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ನಿರ್ಗಮನ)' },
    'form_comment_placeholder': { en: 'Share details on cabin hygiene, A/C cooling, food stop quality, and driving safety...', hi: 'केबिन की सफाई, एसी कूलिंग, भोजन पड़ाव और ड्राइविंग सुरक्षा पर विस्तृत अनुभव लिखें...', kn: 'ಕ್ಯಾಬಿನ್ ನೈರ್ಮಲ್ಯ, ಎಸಿ ಕೂಲಿಂಗ್, ಊಟದ ನಿಲ್ದಾಣದ ಗುಣಮಟ್ಟ ಮತ್ತು ಚಾಲನಾ ಸುರಕ್ಷತೆಯ ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ...' },
    'form_rating_lbl': { en: 'Rating:', hi: 'रेटिंग:', kn: 'ರೇಟಿಂಗ್:' },
    'form_btn_publish': { en: 'Publish Verified Review ➔', hi: 'सत्यापित समीक्षा प्रकाशित करें ➔', kn: 'ದೃಢೀಕೃತ ವಿಮರ್ಶೆ ಪ್ರಕಟಿಸಿ ➔' },

    // Review Cards
    'verified_badge': { en: 'Verified PNR Booking', hi: 'सत्यापित पीएनआर बुकिंग', kn: 'ದೃಢೀಕೃತ ಪಿಎನ್‌ಆರ್ ಬುಕಿಂಗ್' },
    'btn_helpful': { en: 'Helpful', hi: 'मददगार', kn: 'ಉಪಯುಕ್ತ' },
    'btn_share': { en: 'Share', hi: 'साझा करें', kn: 'ಹಂಚಿಕೊಳ್ಳಿ' },
    'empty_reviews_msg': { en: 'No reviews found for this selection.', hi: 'इस चयन के लिए कोई समीक्षा नहीं मिली।', kn: 'ಈ ಆಯ್ಕೆಗೆ ಯಾವುದೇ ವಿಮರ್ಶೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.' },

    // Review 1: Aditya Chavan
    'rev1_name': { en: 'Aditya Chavan', hi: 'आदित्य चव्हाण', kn: 'ಆದಿತ್ಯ ಚೌವ್ಹಾಣ್' },
    'rev1_badge': { en: 'Gold Tier Commuter', hi: 'गोल्ड टियर यात्री', kn: 'ಗೋಲ್ಡ್ ಟೈರ್ ಪ್ರಯಾಣಿಕ' },
    'rev1_operator': { en: 'VRL Travels', hi: 'वीआरएल ट्रैवल्स', kn: 'ವಿಆರ್‌ಎಲ್ ಟ್ರಾವೆಲ್ಸ್' },
    'rev1_bustype': { en: 'Volvo 9600 Multi-Axle A/C Sleeper', hi: 'वोल्वो 9600 मल्टी-एक्सल एसी स्लीपर', kn: 'ವೋಲ್ವೋ 9600 ಮಲ್ಟಿ-ಆಕ್ಸಲ್ ಎಸಿ ಸ್ಲೀಪರ್' },
    'rev1_route': { en: 'Bengaluru ➔ Mumbai', hi: 'बेंगलुरु ➔ मुंबई', kn: 'ಬೆಂಗಳೂರು ➔ ಮುಂಬೈ' },
    'rev1_date': { en: 'Yesterday', hi: 'कल', kn: 'ನಿನ್ನೆ' },
    'rev1_title': { 
      en: 'Remarkable suspension and punctual arrival at Borivali', 
      hi: 'शानदार सस्पेंशन और बोरीवली में समय पर आगमन', 
      kn: 'ಅತ್ಯುತ್ತಮ ಸಸ್ಪೆನ್ಷನ್ ಮತ್ತು ಬೊರಿವಲಿಗೆ ನಿಖರ ಸಮಯಕ್ಕೆ ಆಗಮನ' 
    },
    'rev1_comment': { 
      en: 'The 15m chassis absorbs highway bumps effortlessly. The 65W charging port in berth L7 charged my laptop directly without heating, and fresh sanitised linens were provided.', 
      hi: '15 मीटर का चेसिस हाईवे के गड्ढों को आसानी से संभालता है। बर्थ L7 में 65W चार्जिंग पोर्ट ने लैपटॉप को बिना गर्म किए चार्ज कर दिया और साफ चादरें दी गईं।', 
      kn: '15 ಮೀಟರ್ ಚಾಸಿಸ್ ಹೆದ್ದಾರಿಯ ರಸ್ತೆಗುಂಡಿಗಳನ್ನು ಸುಲಭವಾಗಿ ನಿಭಾಯಿಸುತ್ತದೆ. ಬರ್ತ್ L7 ನಲ್ಲಿನ 65W ಚಾರ್ಜಿಂಗ್ ಪೋರ್ಟ್ ಲ್ಯಾಪ್‌ಟಾಪ್ ಅನ್ನು ತ್ವರಿತವಾಗಿ ಚಾರ್ಜ್ ಮಾಡಿದೆ ಮತ್ತು ಸ್ವಚ್ಛವಾದ ಬೆಡ್‌ಶೀಟ್ ನೀಡಲಾಯಿತು.' 
    },

    // Review 2: Pooja Hegde
    'rev2_name': { en: 'Pooja Hegde', hi: 'पूजा हेगड़े', kn: 'ಪೂಜಾ ಹೆಗ್ಡೆ' },
    'rev2_badge': { en: 'Solo Female Traveler', hi: 'एकल महिला यात्री', kn: 'ಏಕವ್ಯಕ್ತಿ ಮಹಿಳಾ ಪ್ರಯಾಣಿಕ' },
    'rev2_operator': { en: 'KSRTC Airavat 2.0', hi: 'केएसआरटीसी ऐरावत 2.0', kn: 'ಕೆಎಸ್‌ಆರ್‌ಟಿಸಿ ಐರಾವತ 2.0' },
    'rev2_bustype': { en: 'Volvo Semi-Sleeper 51-Seater', hi: 'वोल्वो सेमी-स्लीपर 51-सीटर', kn: 'ವೋಲ್ವೋ ಸೆಮಿ-ಸ್ಲೀಪರ್ 51-ಸೀಟರ್' },
    'rev2_route': { en: 'Bengaluru ➔ Udupi', hi: 'बेंगलुरु ➔ उडुपी', kn: 'ಬೆಂಗಳೂರು ➔ ಉಡುಪಿ' },
    'rev2_date': { en: '3 days ago', hi: '3 दिन पहले', kn: '3 ದಿನಗಳ ಹಿಂದೆ' },
    'rev2_title': { 
      en: 'Extremely safe driving in the Shiradi Ghat sector', 
      hi: 'शिराडी घाट खंड में बेहद सुरक्षित और कुशल ड्राइविंग', 
      kn: 'ಶಿರಾಡಿ ಘಾಟ್ ಪ್ರದೇಶದಲ್ಲಿ ಅತ್ಯಂತ ಸುರಕ್ಷಿತ ಚಾಲನೆ' 
    },
    'rev2_comment': { 
      en: 'The black semi-sleeper bucket seats with calf support made the 8-hour journey comfortable. Driver adhered to speed regulations throughout the night and staff assisted with luggage safely.', 
      hi: 'काफ सपोर्ट वाली ब्लैक सेमी-स्लीपर बकेट सीटों ने 8 घंटे की यात्रा को आरामदायक बना दिया। चालक ने रात भर गति नियमों का पालन किया और कर्मचारियों ने सामान रखने में मदद की।', 
      kn: 'ಕಾಲು ವಿಶ್ರಾಂತಿ ಹೊಂದಿರುವ ಕಪ್ಪು ಸೆಮಿ-ಸ್ಲೀಪರ್ ಬಕೆಟ್ ಆಸನಗಳು 8 ಗಂಟೆಗಳ ಪ್ರಯಾಣವನ್ನು ಆರಾಮದಾಯಕವಾಗಿಸಿದವು. ಚಾಲಕರು ನಿಯಮಿತ ವೇಗದಲ್ಲಿ ಚಲಾಯಿಸಿದರು ಮತ್ತು ಸಿಬ್ಬಂದಿ ಲಗೇಜ್‌ಗೆ ಸಹಾಯ ಮಾಡಿದರು.' 
    },

    // Review 3: Rohan Deshmukh
    'rev3_name': { en: 'Rohan Deshmukh', hi: 'रोहन देशमुख', kn: 'ರೋಹನ್ ದೇಶಮುಖ್' },
    'rev3_badge': { en: 'Frequent Commuter', hi: 'नियमित यात्री', kn: 'ಖಾಯಂ ಪ್ರಯಾಣಿಕ' },
    'rev3_operator': { en: 'IntrCity SmartBus', hi: 'इन्टरसिटी स्मार्टबस', kn: 'ಇಂಟರ್‌ಸಿಟಿ ಸ್ಮಾರ್ಟ್‌ಬಸ್' },
    'rev3_bustype': { en: 'BharatBenz AC Sleeper with Washroom', hi: 'भारतबेंज एसी स्लीपर (वॉशरूम सहित)', kn: 'ಭಾರತ್‌ಬೆಂಜ್ ಎಸಿ ಸ್ಲೀಪರ್ (ವಾಶ್‌ರೂಮ್ ಸಹಿತ)' },
    'rev3_route': { en: 'Bengaluru ➔ Hyderabad', hi: 'बेंगलुरु ➔ हैदराबाद', kn: 'ಬೆಂಗಳೂರು ➔ ಹೈದರಾಬಾದ್' },
    'rev3_date': { en: '5 days ago', hi: '5 दिन पहले', kn: '5 ದಿನಗಳ ಹಿಂದೆ' },
    'rev3_title': { 
      en: 'Hygienic onboard washroom and comfortable AC lounge', 
      hi: 'साफ-सुथरा ऑनबोर्ड वॉशरूम और आरामदायक एसी लाउंज', 
      kn: 'ಸ್ವಚ್ಛವಾದ ಆನ್‌ಬೋರ್ಡ್ ವಾಶ್‌ರೂಮ್ ಮತ್ತು ಆರಾಮದಾಯಕ ಎಸಿ ಲೌಂಜ್' 
    },
    'rev3_comment': { 
      en: 'The boarding lounge at Anand Rao circle had clean seating and water dispensers. The onboard toilet is well maintained with working exhaust fans and fresh water supply.', 
      hi: 'आनंद राव सर्कल के बोर्डिंग लाउंज में बैठने की अच्छी व्यवस्था और पीने का पानी उपलब्ध था। ऑनबोर्ड शौचालय का रखरखाव अच्छा था और पानी की पूरी व्यवस्था थी।', 
      kn: 'ಆನಂದ್ ರಾವ್ ಸರ್ಕಲ್‌ನ ಬೋರ್ಡಿಂಗ್ ಲೌಂಜ್‌ನಲ್ಲಿ ಸ್ವಚ್ಛವಾದ ಆಸನಗಳು ಮತ್ತು ನೀರಿನ ವ್ಯವಸ್ಥೆ ಇತ್ತು. ಬಸ್‌ನಲ್ಲಿರುವ ಶೌಚಾಲಯವು ಸ್ವಚ್ಛವಾಗಿದೆ ಮತ್ತು ನೀರು ಲಭ್ಯವಿತ್ತು.' 
    },

    // Sidebar Widgets
    'widget_verify_badge': { en: 'VERIFY PNR', hi: 'पीएनआर सत्यापित करें', kn: 'ಪಿಎನ್‌ಆರ್ ದೃಢೀಕರಿಸಿ' },
    'widget_write_review_title': { en: 'Traveled on this Route?', hi: 'क्या आपने इस रूट पर यात्रा की?', kn: 'ನೀವು ಈ ಮಾರ್ಗದಲ್ಲಿ ಪ್ರಯಾಣಿಸಿದ್ದೀರಾ?' },
    'widget_write_review_desc': { 
      en: 'Enter your 10-digit PNR to rate vehicle cleanliness, driver behavior, and route stops.', 
      hi: 'गाड़ी की सफाई, ड्राइवर के व्यवहार और रूट स्टॉप को रेट करने के लिए अपना 10 अंकों का पीएनआर दर्ज करें।', 
      kn: 'ವಾಹನದ ಸ್ವಚ್ಛತೆ, ಚಾಲಕರ ನಡವಳಿಕೆ ಮತ್ತು ಮಾರ್ಗ ನಿಲ್ದಾಣಗಳನ್ನು ರೇಟ್ ಮಾಡಲು ನಿಮ್ಮ 10 ಅಂಕಿಗಳ ಪಿಎನ್‌ಆರ್ ನಮೂದಿಸಿ.' 
    },
    'pnr_input_placeholder': { en: 'Enter 10-digit Ticket PNR', hi: '10 अंकों का टिकट पीएनआर दर्ज करें', kn: '10 ಅಂಕಿಯ ಟಿಕೆಟ್ ಪಿಎನ್‌ಆರ್ ನಮೂದಿಸಿ' },
    'btn_submit_pnr': { en: 'Start Review ➔', hi: 'समीक्षा शुरू करें ➔', kn: 'ವಿಮರ್ಶೆ ಪ್ರಾರಂಭಿಸಿ ➔' },

    'widget_trust_title': { en: 'redBus Route Review Assurance', hi: 'रेडबस रूट समीक्षा आश्वासन', kn: 'ರೆಡ್‌ಬಸ್ ಮಾರ್ಗ ವಿಮರ್ಶೆ ಭರವಸೆ' },
    'trust_head_1': { en: 'Verified Travelers Only', hi: 'केवल सत्यापित यात्री', kn: 'ದೃಢೀಕೃತ ಪ್ರಯಾಣಿಕರು ಮಾತ್ರ' },
    'trust_sub_1': { en: '100% Verified Ticket Holders only', hi: 'केवल 100% सत्यापित टिकट धारक', kn: 'ಕೇವಲ 100% ದೃಢೀಕೃತ ಟಿಕೆಟ್ ಹೊಂದಿರುವವರು' },
    'trust_head_2': { en: 'Quality Assurance', hi: 'गुणवत्ता आश्वासन', kn: 'ಗುಣಮಟ್ಟದ ಭರವಸೆ' },
    'trust_sub_2': { en: 'Direct Operator Performance Penalties', hi: 'खराब सेवा पर ऑपरेटर पर प्रत्यक्ष कार्रवाई', kn: 'ಕಳಪೆ ಸೇವೆಗೆ ಆಪರೇಟರ್‌ಗಳ ವಿರುದ್ಧ ನೇರ ಕ್ರಮ' },
    'trust_head_3': { en: 'Telematics Accuracy', hi: 'सटीक ट्रैकिंग', kn: 'ನಿಖರ ಟ್ರ್ಯಾಕಿಂಗ್' },
    'trust_sub_3': { en: 'Transparent Punctuality Tracking', hi: 'पारदर्शी समय की पाबंदी ट्रैकिंग', kn: 'ನಿಖರ ಸಮಯಪಾಲನೆ ಟ್ರ್ಯಾಕಿಂಗ್' }
  };

  reviews: ReviewItem[] = [
    {
      id: 'r1',
      reviewerNameKey: 'rev1_name',
      badgeKey: 'rev1_badge',
      operatorKey: 'rev1_operator',
      busTypeKey: 'rev1_bustype',
      routeKey: 'rev1_route',
      dateKey: 'rev1_date',
      rating: 5,
      titleKey: 'rev1_title',
      commentKey: 'rev1_comment',
      helpfulCount: 58,
      hasMarkedHelpful: false,
      verifiedTrip: true
    },
    {
      id: 'r2',
      reviewerNameKey: 'rev2_name',
      badgeKey: 'rev2_badge',
      operatorKey: 'rev2_operator',
      busTypeKey: 'rev2_bustype',
      routeKey: 'rev2_route',
      dateKey: 'rev2_date',
      rating: 5,
      titleKey: 'rev2_title',
      commentKey: 'rev2_comment',
      helpfulCount: 41,
      hasMarkedHelpful: false,
      verifiedTrip: true
    },
    {
      id: 'r3',
      reviewerNameKey: 'rev3_name',
      badgeKey: 'rev3_badge',
      operatorKey: 'rev3_operator',
      busTypeKey: 'rev3_bustype',
      routeKey: 'rev3_route',
      dateKey: 'rev3_date',
      rating: 4,
      titleKey: 'rev3_title',
      commentKey: 'rev3_comment',
      helpfulCount: 33,
      hasMarkedHelpful: false,
      verifiedTrip: true
    }
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.syncFromStorage();

    // Listen for storage changes from the Navbar language or theme switch
    this.langListener = () => {
      this.syncFromStorage();
      this.cdr.detectChanges();
    };

    window.addEventListener('storage', this.langListener);
    window.addEventListener('languageChanged', this.langListener);
    window.addEventListener('themeChanged', this.langListener);
  }

  ngOnDestroy(): void {
    if (this.langListener) {
      window.removeEventListener('storage', this.langListener);
      window.removeEventListener('languageChanged', this.langListener);
      window.removeEventListener('themeChanged', this.langListener);
    }
  }

  syncFromStorage(): void {
    const savedTheme = localStorage.getItem('rb_dark_mode');
    this.isDarkMode = savedTheme === 'true' || document.body.classList.contains('dark-mode');

    const savedLang = localStorage.getItem('rb_language') as SupportedLanguage;
    if (savedLang && ['en', 'hi', 'kn'].includes(savedLang)) {
      this.currentLang = savedLang;
    }
  }

  // Exact Word-By-Word Multi-Language Lookup
  t(key: string): string {
    if (!key) return '';
    const trimmed = key.trim();
    if (this.dictionary[trimmed]) {
      return this.dictionary[trimmed][this.currentLang] || this.dictionary[trimmed]['en'] || trimmed;
    }
    return trimmed;
  }

  setOperatorFilter(filter: string): void {
    this.activeOperatorFilter = filter;
  }

  setSort(sortType: 'recent' | 'highest' | 'lowest'): void {
    this.activeSort = sortType;
  }

  toggleHelpful(rev: ReviewItem): void {
    rev.hasMarkedHelpful = !rev.hasMarkedHelpful;
    rev.helpfulCount += rev.hasMarkedHelpful ? 1 : -1;
  }

  submitNewReview(): void {
    if (!this.newReview.title || !this.newReview.comment) return;

    this.reviews.unshift({
      id: `r-${Date.now()}`,
      reviewerNameKey: 'rev1_name',
      badgeKey: 'rev1_badge',
      operatorKey: 'rev1_operator',
      busTypeKey: 'rev1_bustype',
      routeKey: 'rev1_route',
      dateKey: 'rev1_date',
      rating: this.newReview.rating,
      titleKey: this.newReview.title,
      commentKey: this.newReview.comment,
      helpfulCount: 1,
      hasMarkedHelpful: true,
      verifiedTrip: true
    });

    this.showForm = false;
    this.newReview = { pnr: '', rating: 5, title: '', comment: '', operator: 'VRL Travels' };
    this.stats.totalReviews++;
  }

  get displayedReviews(): ReviewItem[] {
    let list = [...this.reviews];

    if (this.activeOperatorFilter === 'vrl') {
      list = list.filter(r => r.id === 'r1');
    } else if (this.activeOperatorFilter === 'ksrtc') {
      list = list.filter(r => r.id === 'r2');
    } else if (this.activeOperatorFilter === 'intrcity') {
      list = list.filter(r => r.id === 'r3');
    }

    if (this.activeSort === 'highest') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (this.activeSort === 'lowest') {
      list.sort((a, b) => a.rating - b.rating);
    }

    return list;
  }
}