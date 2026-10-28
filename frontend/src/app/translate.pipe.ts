import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translate',
  pure: false
})
export class TranslatePipe implements PipeTransform {
  private translations: Record<string, Record<string, string>> = {
    en: {
      'NAV.BUS_TICKETS': 'Bus Tickets',
      'NAV.ROUTE_PLANNER': 'Route Planner',
      'NAV.COMMUNITY': 'Community',
      'NAV.REVIEWS': 'Reviews',
      'COMMON.ACCOUNT': 'Account',
      'COMMUNITY.TITLE': 'Traveler Stories & Tips',
      'COMMUNITY.SUBTITLE': 'Share verified journey experiences with fellow redBus travelers',
      'COMMUNITY.MODERATION_QUEUE': 'Moderation Queue',
      'COMMUNITY.SHARE_BTN': 'Share Post',
      'PLANNER.TITLE': 'Smart Route Planner',
      'PLANNER.SUBTITLE': 'Plan multi-stop journeys with real-time route comparisons',
      'PLANNER.ORIGIN': 'Start Location',
      'PLANNER.DESTINATION': 'Destination',
      'PLANNER.CALCULATE': 'Calculate Best Routes',
      'REVIEWS.TITLE': 'Verified Route Reviews',
      'REVIEWS.TOTAL_REVIEWS': 'Verified Reviews',
      'REVIEWS.WRITE_REVIEW': 'Write Review',
      'NOTIF.TITLE': 'Notifications Center',
      'THEME.DARK': 'Dark',
      'THEME.LIGHT': 'Light'
    },
    hi: {
      'NAV.BUS_TICKETS': 'बस टिकट',
      'NAV.ROUTE_PLANNER': 'रूट प्लानर',
      'NAV.COMMUNITY': 'कम्युनिटी',
      'NAV.REVIEWS': 'समीक्षाएं',
      'COMMON.ACCOUNT': 'खाता',
      'COMMUNITY.TITLE': 'यात्री कहानियां और सुझाव',
      'COMMUNITY.SUBTITLE': 'अन्य यात्रियों के साथ अपनी यात्रा के अनुभव साझा करें',
      'COMMUNITY.MODERATION_QUEUE': 'मॉडरेशन कतार',
      'COMMUNITY.SHARE_BTN': 'पोस्ट साझा करें',
      'PLANNER.TITLE': 'स्मार्ट रूट प्लानर',
      'PLANNER.SUBTITLE': 'ट्रैफिक और वैकल्पिक मार्गों के साथ यात्रा की योजना बनाएं',
      'PLANNER.ORIGIN': 'प्रस्थान स्थान',
      'PLANNER.DESTINATION': 'गंतव्य',
      'PLANNER.CALCULATE': 'सर्वश्रेष्ठ मार्ग खोजें',
      'REVIEWS.TITLE': 'सत्यापित मार्ग समीक्षाएं',
      'REVIEWS.TOTAL_REVIEWS': 'सत्यापित समीक्षाएं',
      'REVIEWS.WRITE_REVIEW': 'समीक्षा लिखें',
      'NOTIF.TITLE': 'सूचनाएं',
      'THEME.DARK': 'डार्क',
      'THEME.LIGHT': 'लाइट'
    },
    kn: {
      'NAV.BUS_TICKETS': 'ಬಸ್ ಟಿಕೆಟ್‌ಗಳು',
      'NAV.ROUTE_PLANNER': 'ಮಾರ್ಗ ಯೋಜಕ',
      'NAV.COMMUNITY': 'ಸಮುದಾಯ',
      'NAV.REVIEWS': 'ವಿಮರ್ಶೆಗಳು',
      'COMMON.ACCOUNT': 'ಖಾತೆ',
      'COMMUNITY.TITLE': 'ಪ್ರಯಾಣಿಕರ ಕಥೆಗಳು & ಸಲಹೆಗಳು',
      'COMMUNITY.SUBTITLE': 'ನಿಮ್ಮ ಬಸ್ ಪ್ರಯಾಣದ ಅನುಭವಗಳನ್ನು ಇತರರೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ',
      'COMMUNITY.MODERATION_QUEUE': 'ಮಾಡರೇಶನ್ ಕ್ಯೂ',
      'COMMUNITY.SHARE_BTN': 'ಪೋಸ್ಟ್ ಮಾಡಿ',
      'PLANNER.TITLE': 'ಸ್ಮಾರ್ಟ್ ಮಾರ್ಗ ಯೋಜಕ',
      'PLANNER.SUBTITLE': 'ನೈಜ ಸಮಯದ ಟ್ರಾಫಿಕ್ ಮತ್ತು ಪರ್ಯಾಯ ಮಾರ್ಗಗಳ ಯೋಜನೆ',
      'PLANNER.ORIGIN': 'ಆರಂಭಿಕ ಸ್ಥಳ',
      'PLANNER.DESTINATION': 'ತಲುಪುವ ಸ್ಥಳ',
      'PLANNER.CALCULATE': 'ಮಾರ್ಗವನ್ನು ಲೆಕ್ಕಹಾಕಿ',
      'REVIEWS.TITLE': 'ಪರಿಶೀಲಿಸಿದ ಮಾರ್ಗ ವಿಮರ್ಶೆಗಳು',
      'REVIEWS.TOTAL_REVIEWS': 'ಪರಿಶೀಲಿಸಿದ ವಿಮರ್ಶೆಗಳು',
      'REVIEWS.WRITE_REVIEW': 'ವಿಮರ್ಶೆ ಬರೆಯಿರಿ',
      'NOTIF.TITLE': 'ಅಧಿಸೂಚನೆಗಳು',
      'THEME.DARK': 'ಡಾರ್ಕ್',
      'THEME.LIGHT': 'ಲೈಟ್'
    }
  };

  transform(key: string): string {
    const currentLang = localStorage.getItem('rb_language') || 'en';
    const dict = this.translations[currentLang] || this.translations['en'];
    return dict[key] || this.translations['en'][key] || key.split('.').pop() || key;
  }
}