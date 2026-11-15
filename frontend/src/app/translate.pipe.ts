import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translate',
  pure: false
})
export class TranslatePipe implements PipeTransform {
  private dictionary: Record<string, Record<string, string>> = {
    // Nav & Theme
    'NAV.BUS_TICKETS': { en: 'Bus Tickets', hi: 'बस टिकट', kn: 'ಬಸ್ ಟಿಕೆಟ್‌ಗಳು' },
    'NAV.ROUTE_PLANNER': { en: 'Route Planner', hi: 'मार्ग योजनाकार', kn: 'ಮಾರ್ಗ ಯೋಜಕ' },
    'NAV.COMMUNITY': { en: 'Community', hi: 'समुदाय', kn: 'ಸಮುದಾಯ' },
    'NAV.REVIEWS': { en: 'Reviews', hi: 'समीक्षाएं', kn: 'ವಿಮರ್ಶೆಗಳು' },
    'NAV.ACCOUNT': { en: 'Account', hi: 'खाता', kn: 'ಖಾತೆ' },
    'THEME.LIGHT': { en: 'Light', hi: 'लाइट', kn: 'ಲೈಟ್' },
    'THEME.DARK': { en: 'Dark', hi: 'डार्क', kn: 'ಡಾರ್ಕ್' },

    // Search
    'SEARCH.BTN': { en: 'Search Buses', hi: 'बसें खोजें', kn: 'ಬಸ್ ಹುಡುಕಿ' },

    // Upgraded Offers Section Headings & Content
    'OFFERS.TITLE': { 
      en: 'Exclusive Travel Offers & Flash Deals', 
      hi: 'विशेष यात्रा ऑफर्स और धमाकेदार छूट', 
      kn: 'ವಿಶೇಷ ಪ್ರಯಾಣ ಕೊಡುಗೆಗಳು ಮತ್ತು ರಿಯಾಯಿತಿಗಳು' 
    },
    'OFFERS.SUBTITLE': { 
      en: 'Handpicked savings, coupon codes, and partner cashback on verified bus operators', 
      hi: 'सत्यापित बस ऑपरेटरों पर चुनिंदा बचत, कूपन कोड और कैशबैक', 
      kn: 'ದೃಢೀಕೃತ ಬಸ್ ಆಪರೇಟರ್‌ಗಳ ಮೇಲೆ ಆಯ್ದ ಉಳಿತಾಯ, ಕೂಪನ್ ಕೋಡ್‌ಗಳು ಮತ್ತು ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್' 
    },
    'OFFERS.BADGE_1': { en: 'VRL SUPERBUS', hi: 'वीआरएल सुपरबस', kn: 'ವಿಆರ್‌ಎಲ್ ಸೂಪರ್‌ಬಸ್' },
    'OFFERS.CARD1_TITLE': { en: 'Save Flat ₹300 on Volvo 9600', hi: 'वोल्वो 9600 पर फ्लैट ₹300 बचाएं', kn: 'ವೋಲ್ವೋ 9600 ನಲ್ಲಿ ₹300 ರಿಯಾಯಿತಿ' },
    'OFFERS.CARD1_DESC': { en: 'Apply code VRLSUPER on multi-axle luxury sleeper journeys', hi: 'मल्टी-एक्सल लक्जरी स्लीपर यात्राओं पर कोड VRLSUPER लागू करें', kn: 'ಮಲ್ಟಿ-ಆಕ್ಸಲ್ ಐಷಾರಾಮಿ ಸ್ಲೀಪರ್ ಪ್ರಯಾಣದಲ್ಲಿ VRLSUPER ಕೋಡ್ ಬಳಸಿ' },
    'OFFERS.VALIDITY_1': { en: 'Valid till 30 Nov', hi: '30 नवंबर तक मान्य', kn: '30 ನವೆಂಬರ್ ವರೆಗೆ ಮಾನ್ಯ' },
    'OFFERS.BADGE_2': { en: 'WELCOME BONUS', hi: 'स्वागत बोनस', kn: 'ಸ್ವಾಗತ ಬೋನಸ್' },
    'OFFERS.CARD2_TITLE': { en: 'Flat 15% Off Your First Ride', hi: 'अपनी पहली यात्रा पर 15% की छूट', kn: 'ನಿಮ್ಮ ಮೊದಲ ಪ್ರಯಾಣದಲ್ಲಿ 15% ರಿಯಾಯಿತಿ' },
    'OFFERS.CARD2_DESC': { en: 'Book your maiden journey on redBus PRO with zero convenience fee', hi: 'बिना किसी अतिरिक्त शुल्क के अपनी पहली यात्रा बुक करें', kn: 'ಯಾವುದೇ ಹೆಚ್ಚುವರಿ ಶುಲ್ಕವಿಲ್ಲದೆ ನಿಮ್ಮ ಮೊದಲ ಪ್ರಯಾಣವನ್ನು ಬುಕ್ ಮಾಡಿ' },
    'OFFERS.VALIDITY_2': { en: 'Limited Period', hi: 'सीमित समय', kn: 'ಸೀಮಿತ ಅವಧಿ' },
    'OFFERS.BADGE_3': { en: 'UPI INSTANT', hi: 'यूपीआई तुरंत', kn: 'ಯುಪಿಐ ತ್ವರಿತ' },
    'OFFERS.CARD3_TITLE': { en: 'Instant ₹200 Bank Cashback', hi: 'तुरंत ₹200 बैंक कैशबैक', kn: 'ತ್ವರಿತ ₹200 ಬ್ಯಾಂಕ್ ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್' },
    'OFFERS.CARD3_DESC': { en: 'Pay via Google Pay, PhonePe, or Cred to unlock rewards', hi: 'Google Pay, PhonePe या Cred से भुगतान कर कैशबैक पाएं', kn: 'Google Pay, PhonePe ಅಥವಾ Cred ಮೂಲಕ ಪಾವತಿಸಿ ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್ ಪಡೆಯಿರಿ' },
    'OFFERS.VALIDITY_3': { en: 'All UPI Apps', hi: 'सभी यूपीआई ऐप', kn: 'ಎಲ್ಲಾ ಯುಪಿಐ ಆ್ಯಪ್‌ಗಳು' },

    // Route Reviews
    'REVIEWS.TOTAL_REVIEWS': { en: 'verified ratings', hi: 'सत्यापित रेटिंग्स', kn: 'ದೃಢೀಕೃತ ರೇಟಿಂಗ್‌ಗಳು' },
    'REVIEWS.WRITE_REVIEW': { en: 'Write a Review', hi: 'समीक्षा लिखें', kn: 'ವಿಮರ್ಶೆ ಬರೆಯಿರಿ' },
    'REVIEWS.CANCEL': { en: 'Cancel', hi: 'रद्द करें', kn: 'ರದ್ದುಮಾಡಿ' },

    // Popular Routes & Features
    'ROUTES.HEADING': { en: 'Popular Bus Routes in India', hi: 'भारत में लोकप्रिय बस मार्ग', kn: 'ಭಾರತದ ಜನಪ್ರಿಯ ಬಸ್ ಮಾರ್ಗಗಳು' },
    'ROUTES.SUBTITLE': { en: 'High frequency overnight sleeper & semi-sleeper connections', hi: 'उच्च आवृत्ति वाली रात की स्लीपर और सेमी-स्लीपर बसें', kn: 'ರಾತ್ರಿಯ ಸ್ಲೀಪರ್ ಮತ್ತು ಸೆಮಿ-ಸ್ಲೀಪರ್ ಬಸ್ ಸಂಪರ್ಕಗಳು' },
    'FEAT.TITLE_1': { en: 'Live GPS Tracking', hi: 'लाइव जीपीएस ट्रैकिंग', kn: 'ಲೈವ್ ಜಿಪಿಎಸ್ ಟ್ರ್ಯಾಕಿಂಗ್' },
    'FEAT.DESC_1': { en: 'Share your trip location in real-time with family and friends', hi: 'परिवार और दोस्तों के साथ वास्तविक समय में अपनी यात्रा साझा करें', kn: 'ಕುಟುಂಬ ಮತ್ತು ಸ್ನೇಹಿತರೊಂದಿಗೆ ನೈಜ ಸಮಯದಲ್ಲಿ ಲೈವ್ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ' },
    'FEAT.TITLE_2': { en: 'Free Cancellation', hi: 'मुफ्त रद्दीकरण', kn: 'ಉಚಿತ ರದ್ದತಿ' },
    'FEAT.DESC_2': { en: 'Get instant refunds directly back to your original payment method', hi: 'सीधे अपने मूल भुगतान खाते में त्वरित धनवापसी प्राप्त करें', kn: 'ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ತ್ವರಿತ ಮರುಪಾವತಿ ಪಡೆಯಿರಿ' },
    'FEAT.TITLE_3': { en: 'Primo Top Rated', hi: 'प्रिमो टॉप रेटेड', kn: 'ಪ್ರಿಮೋ ಟಾಪ್ ರೇಟೆಡ್' },
    'FEAT.DESC_3': { en: 'Travel on certified high safety buses with verified punctuality', hi: 'सत्यापित समय की पाबंदी वाली उच्च सुरक्षा बसों में यात्रा करें', kn: 'ಉತ್ತಮ ಸುರಕ್ಷತೆ ಮತ್ತು ಸಮಯಪಾಲನೆಯ ಬಸ್‌ಗಳಲ್ಲಿ ಪ್ರಯಾಣಿಸಿ' },
    'FEAT.TITLE_4': { en: '24/7 Customer Care', hi: '24/7 ग्राहक सहायता', kn: '24/7 ಗ್ರಾಹಕ ಬೆಂಬಲ' },
    'FEAT.DESC_4': { en: 'Dedicated assistance on boarding, stops, baggage, and booking', hi: 'बोर्डिंग, स्टॉप, सामान और बुकिंग पर समर्पित सहायता', kn: 'ಬೋರ್ಡಿಂಗ್, ಲಗೇಜ್ ಮತ್ತು ಬುಕಿಂಗ್ ಕುರಿತು ಸಹಾಯ' }
  };

  transform(key: string): string {
    if (!key) return '';
    const lang = localStorage.getItem('rb_language') || 'en';
    const trimmed = key.trim();
    if (this.dictionary[trimmed]) {
      return this.dictionary[trimmed][lang] || this.dictionary[trimmed]['en'] || trimmed;
    }
    return trimmed;
  }
}