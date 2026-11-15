import { Component, OnInit } from '@angular/core';

export type SupportedLanguage = 'en' | 'hi' | 'kn';

export interface CommunityCommentItem {
  author: string;
  text: string;
  time: string;
}

export interface CommunityPost {
  id: string;
  authorNameKey: string;
  authorBadgeKey: string;
  avatarUrl: string;
  routeKey: string;
  timeAgoKey: string;
  categoryTagKey: string;
  titleKey: string;
  contentKey: string;
  upvotes: number;
  commentsCount: number;
  hasUpvoted: boolean;
  verifiedTrip: boolean;
  status: 'approved' | 'pending' | 'rejected';
  imageUrl?: string;
  comments?: CommunityCommentItem[];
  showComments?: boolean;
  newCommentText?: string;
  isReported?: boolean;
}

@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.css']
})
export class CommunityComponent implements OnInit {

  currentLang: SupportedLanguage = 'en';
  isDarkMode: boolean = false;
  isModerationView: boolean = false;
  activeFilter: string = 'all';

  // Compose Review Form Model
  newPostTitle: string = '';
  newPostContent: string = '';
  newPostRoute: string = '';
  newPostCategory: string = 'post_tag_review';
  newPostPhotoUrl: string = '';
  submitSuccessMessage: string = '';
  toastMessage: string = '';

  // Exhaustive Multi-Language Dictionary
  dictionary: Record<string, Record<SupportedLanguage, string>> = {
    // Navigation / Header
    'nav_bus_tickets': { en: 'Bus Tickets', hi: 'बस टिकट', kn: 'ಬಸ್ ಟಿಕೆಟ್‌ಗಳು' },
    'nav_route_planner': { en: 'Route Planner', hi: 'मार्ग योजनाकार', kn: 'ಮಾರ್ಗ ಯೋಜಕ' },
    'nav_community': { en: 'Community', hi: 'समुदाय', kn: 'ಸಮುದಾಯ' },
    'nav_reviews': { en: 'Reviews', hi: 'समीक्षाएं', kn: 'ವಿಮರ್ಶೆಗಳು' },
    'nav_account': { en: 'Account', hi: 'खाता', kn: 'ಖಾತೆ' },
    'theme_dark': { en: 'Dark', hi: 'डार्क', kn: 'ಡಾರ್ಕ್' },
    'theme_light': { en: 'Light', hi: 'लाइट', kn: 'ಲೈಟ್' },

    // Hero Section
    'hero_tag': { en: 'TRAVELERS COMMUNITY', hi: 'यात्री समुदाय', kn: 'ಪ್ರಯಾಣಿಕರ ಸಮುದಾಯ' },
    'hero_title': { en: 'Real Bus Stories & Route Advice', hi: 'सच्ची बस यात्रा कहानियां और मार्ग सलाह', kn: 'ನೈಜ ಬಸ್ ಪ್ರಯಾಣದ ಕಥೆಗಳು ಮತ್ತು ಮಾರ್ಗ ಸಲಹೆ' },
    'hero_subtitle': { 
      en: 'Connect with 1.8M verified travelers across India. Share food stops, AC sleeper tips, and punctual routes.', 
      hi: 'भारत भर के 18 लाख सत्यापित यात्रियों से जुड़ें। ढाबा पड़ाव, एसी स्लीपर सुझाव और सटीक रूट साझा करें।', 
      kn: 'ಭಾರತದಾದ್ಯಂತ 18 ಲಕ್ಷಕ್ಕೂ ಹೆಚ್ಚು ದೃಢೀಕೃತ ಪ್ರಯಾಣಿಕರೊಂದಿಗೆ ಸಂಪರ್ಕದಲ್ಲಿರಿ. ಊಟದ ನಿಲುಗಡೆ, ಎಸಿ ಸ್ಲೀಪರ್ ಸಲಹೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.' 
    },

    // Moderation Controls
    'mod_queue_title': { en: 'Moderation Queue', hi: 'मॉडरेशन कतार', kn: 'ಮಾಡರೇಶನ್ ಕ್ಯೂ' },
    'mod_btn_view_feed': { en: 'View Live Feed', hi: 'लाइव फ़ीड देखें', kn: 'ಲೈವ್ ಫೀಡ್ ವೀಕ್ಷಿಸಿ' },
    'mod_btn_view_queue': { en: 'Moderation Queue', hi: 'मॉडरेशन कतार', kn: 'ಮಾಡರೇಶನ್ ಕ್ಯೂ' },
    'mod_sub_text': { en: 'Review passenger submissions before publishing to the live route stream.', hi: 'लाइव रूट स्ट्रीम में प्रकाशित करने से पहले यात्री पोस्ट की समीक्षा करें।', kn: 'ಲೈವ್ ರೂಟ್ ಸ್ಟ್ರೀಮ್‌ನಲ್ಲಿ ಪ್ರಕಟಿಸುವ ಮೊದಲು ಪ್ರಯಾಣಿಕರ ಪೋಸ್ಟ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.' },
    'mod_empty_queue': { en: 'No pending posts in queue!', hi: 'कतार में कोई लंबित पोस्ट नहीं!', kn: 'ಕ್ಯೂನಲ್ಲಿ ಯಾವುದೇ ಬಾಕಿ ಪೋಸ್ಟ್‌ಗಳಿಲ್ಲ!' },
    'btn_approve': { en: 'Approve', hi: 'स्वीकार करें', kn: 'ಅನುಮೋದಿಸಿ' },
    'btn_reject': { en: 'Reject', hi: 'अस्वीकार करें', kn: 'ತಿರಸ್ಕರಿಸಿ' },

    // Compose Form
    'compose_card_title': { en: 'Share Your Bus Journey Experience', hi: 'अपनी बस यात्रा का अनुभव साझा करें', kn: 'ನಿಮ್ಮ ಬಸ್ ಪ್ರಯಾಣದ ಅನುಭವವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ' },
    'compose_input_title_placeholder': { en: 'Give your post a descriptive title...', hi: 'अपनी पोस्ट को एक शीर्षक दें...', kn: 'ನಿಮ್ಮ ಪೋಸ್ಟ್‌ಗೆ ಶೀರ್ಷಿಕೆ ನೀಡಿ...' },
    'compose_input_route_placeholder': { en: 'Route (e.g. Bengaluru to Mumbai)', hi: 'मार्ग (उदा. बेंगलुरु से मुंबई)', kn: 'ಮಾರ್ಗ (ಉದಾ. ಬೆಂಗಳೂರಿನಿಂದ ಮುಂಬೈ)' },
    'compose_input_content_placeholder': { en: 'Write detailed advice on cleanliness, punctuality, food halts, and sleeper comfort...', hi: 'सफाई, समय की पाबंदी, भोजन पड़ाव और स्लीपर आराम पर विस्तृत विवरण लिखें...', kn: 'ಸ್ವಚ್ಛತೆ, ಸಮಯಪಾಲನೆ, ಊಟದ ನಿಲುಗಡೆ ಮತ್ತು ಆರಾಮದಾಯಕತೆಯ ಬಗ್ಗೆ ಬರೆಯಿರಿ...' },
    'compose_btn_submit': { en: 'Publish Post', hi: 'पोस्ट प्रकाशित करें', kn: 'ಪೋಸ್ಟ್ ಪ್ರಕಟಿಸಿ' },
    'compose_msg_success': { en: 'Your post was submitted successfully and is live!', hi: 'आपकी पोस्ट सफलतापूर्वक प्रकाशित हो गई है!', kn: 'ನಿಮ್ಮ ಪೋಸ್ಟ್ ಯಶಸ್ವಿಯಾಗಿ ಪ್ರಕಟವಾಗಿದೆ!' },

    // Category Tags
    'post_tag_review': { en: 'Bus Review', hi: 'बस समीक्षा', kn: 'ಬಸ್ ವಿಮರ್ಶೆ' },
    'post_tag_comfort': { en: 'Seat Comfort', hi: 'सीट आराम', kn: 'ಆಸನ ಸೌಕರ್ಯ' },
    'post_tag_food': { en: 'Highway Halt', hi: 'हाईवे पड़ाव', kn: 'ಹೆದ್ದಾರಿ ನಿಲ್ದಾಣ' },
    'post_tag_safety': { en: 'Safety Advice', hi: 'सुरक्षा सलाह', kn: 'ಸುರಕ್ಷತೆ ಸಲಹೆ' },

    // Filter Pills
    'filter_all': { en: 'All Discussions', hi: 'सभी चर्चाएं', kn: 'ಎಲ್ಲಾ ಚರ್ಚೆಗಳು' },
    'filter_vrl': { en: 'VRL SuperBus', hi: 'वीआरएल सुपरबस', kn: 'ವಿಆರ್‌ಎಲ್ ಸೂಪರ್‌ಬಸ್' },
    'filter_ksrtc': { en: 'KSRTC Airavat', hi: 'केएसआरटीसी ऐरावत', kn: 'ಕೆಎಸ್‌ಆರ್‌ಟಿಸಿ ಐರಾವತ' },
    'filter_intrcity': { en: 'IntrCity SmartBus', hi: 'इन्टरसिटी स्मार्टबस', kn: 'ಇಂಟರ್‌ಸಿಟಿ ಸ್ಮಾರ್ಟ್‌ಬಸ್' },
    'filter_food': { en: 'Highway Food Halts', hi: 'हाईवे भोजन पड़ाव', kn: 'ಹೆದ್ದಾರಿ ಊಟದ ನಿಲ್ದಾಣಗಳು' },
    'filter_safety': { en: 'Solo Female Safety', hi: 'महिला सुरक्षा', kn: 'ಮಹಿಳೆಯರ ಸುರಕ್ಷತೆ' },

    // Actions & Badges
    'verified_commuter': { en: 'Verified Traveler', hi: 'सत्यापित यात्री', kn: 'ದೃಢೀಕೃತ ಪ್ರಯಾಣಿಕ' },
    'btn_upvote': { en: 'Helpful', hi: 'मददगार', kn: 'ಉಪಯುಕ್ತ' },
    'btn_comment': { en: 'Reply', hi: 'उत्तर दें', kn: 'ಪ್ರತಿಕ್ರಿಯಿಸಿ' },
    'btn_share': { en: 'Share', hi: 'साझा करें', kn: 'ಹಂಚಿಕೊಳ್ಳಿ' },
    'empty_feed_msg': { en: 'No posts found in this section.', hi: 'इस अनुभाग में कोई पोस्ट नहीं मिली।', kn: 'ಯಾವುದೇ ಪೋಸ್ಟ್‌ಗಳು ಕಂಡುಬಂದಿಲ್ಲ.' },

    // Post 1 Content
    'post1_author': { en: 'Aditya Chavan', hi: 'आदित्य चव्हाण', kn: 'ಆದಿತ್ಯ ಚೌವ್ಹಾಣ್' },
    'post1_badge': { en: 'Frequent Traveler • Level 4', hi: 'नियमित यात्री • स्तर 4', kn: 'ಖಾಯಂ ಪ್ರಯಾಣಿಕ • ಹಂತ 4' },
    'post1_route': { en: 'Bengaluru ➔ Mumbai (NH 48)', hi: 'बेंगलुरु ➔ मुंबई (एनएच 48)', kn: 'ಬೆಂಗಳೂರು ➔ ಮುಂಬೈ (ಎನ್‌ಎಚ್ 48)' },
    'post1_time': { en: '3 hours ago', hi: '3 घंटे पहले', kn: '3 ಗಂಟೆಗಳ ಹಿಂದೆ' },
    'post1_title': { 
      en: 'Is the new VRL Volvo 9600 Multi-Axle sleeper worth the extra ₹400?', 
      hi: 'क्या नया वीआरएल वोल्वो 9600 मल्टी-एक्सल स्लीपर ₹400 अतिरिक्त किराए के लायक है?', 
      kn: 'ಹೊಸ ವಿಆರ್‌ಎಲ್ ವೋಲ್ವೋ 9600 ಮಲ್ಟಿ-ಆಕ್ಸಲ್ ಸ್ಲೀಪರ್ ಹೆಚ್ಚುವರಿ ₹400 ನೀಡಲು ಯೋಗ್ಯವೇ?' 
    },
    'post1_content': { 
      en: 'Took the 9:00 PM VRL Volvo 9600 SuperBus from Anand Rao Circle to Borivali. The 15m chassis absorbs potholes smoothly, engine vibration is zero in single sleeper L7, and the 65W fast USB-C charged my laptop effortlessly.', 
      hi: 'आनंद राव सर्कल से बोरीवली तक रात 9:00 बजे की वीआरएल वोल्वो 9600 सुपरबस ली। 15 मीटर का चेसिस गड्ढों को आसानी से संभालता है, सिंगल स्लीपर L7 में इंजन कंपन शून्य है और 65W फास्ट यूएसबी-सी ने लैपटॉप को आसानी से चार्ज कर दिया।', 
      kn: 'ಆನಂದ್ ರಾವ್ ಸರ್ಕಲ್‌ನಿಂದ ಬೊರಿವಲಿಗೆ ರಾತ್ರಿ 9:00 ರ ವಿಆರ್‌ಎಲ್ ವೋಲ್ವೋ 9600 ಸೂಪರ್‌ಬಸ್‌ನಲ್ಲಿ ಪ್ರಯಾಣಿಸಿದೆ. 15 ಮೀಟರ್ ಚಾಸಿಸ್ ರಸ್ತೆ ಗುಂಡಿಗಳನ್ನು ಸುಲಭವಾಗಿ ನಿಭಾಯಿಸುತ್ತದೆ, ಸಿಂಗಲ್ ಸ್ಲೀಪರ್ L7 ನಲ್ಲಿ ಕಂಪನ ಶೂನ್ಯ ಮತ್ತು 65W ಯುಎಸ್‌ಬಿ-ಸಿ ಲ್ಯಾಪ್‌ಟಾಪ್ ಅನ್ನು ತ್ವರಿತವಾಗಿ ಚಾರ್ಜ್ ಮಾಡಿದೆ.' 
    },

    // Post 2 Content
    'post2_author': { en: 'Pooja Hegde', hi: 'पूजा हेगड़े', kn: 'ಪೂಜಾ ಹೆಗ್ಡೆ' },
    'post2_badge': { en: 'Solo Traveler', hi: 'एकल यात्री', kn: 'ಏಕವ್ಯಕ್ತಿ ಪ್ರಯಾಣಿಕ' },
    'post2_route': { en: 'Bengaluru ➔ Udupi / Mangaluru', hi: 'बेंगलुरु ➔ उडुपी / मंगलुरु', kn: 'ಬೆಂಗಳೂರು ➔ ಉಡುಪಿ / ಮಂಗಳೂರು' },
    'post2_time': { en: '8 hours ago', hi: '8 घंटे पहले', kn: '8 ಗಂಟೆಗಳ ಹಿಂದೆ' },
    'post2_title': { 
      en: 'KSRTC Airavat 2.0 51-Seater legroom in Shiradi Ghats ride', 
      hi: 'शिराडी घाट में केएसआरटीसी ऐरावत 2.0 51-सीटर का लेगरूम और आराम', 
      kn: 'ಶಿರಾಡಿ ಘಾಟ್ ರಸ್ತೆಯಲ್ಲಿ ಕೆಎಸ್‌ಆರ್‌ಟಿಸಿ ಐರಾವತ 2.0 51-ಸೀಟರ್ ಲೆಗ್‌ರೂಮ್ ಮತ್ತು ಆರಾಮದಾಯಕತೆ' 
    },
    'post2_content': { 
      en: 'The new semi-sleeper black bucket seats are very comfortable with deep recline and adjustable calf rests. Boarded Majestic platform 18 at 10:15 PM and reached sharp at 6:30 AM without back fatigue.', 
      hi: 'नई सेमी-स्लीपर ब्लैक बकेट सीटें गहरी रिक्लाइन और काफ सपोर्ट के साथ बहुत आरामदायक हैं। रात 10:15 बजे मैजेस्टिक से रवाना होकर बिना किसी पीठ दर्द के सुबह 6:30 बजे पहुंच गए।', 
      kn: 'ಹೊಸ ಸೆಮಿ-ಸ್ಲೀಪರ್ ಕಪ್ಪು ಬಕೆಟ್ ಆಸನಗಳು ಉತ್ತಮ ರಿಕ್ಲೈನ್ ಮತ್ತು ಕಾಲು ವಿಶ್ರಾಂತಿಯನ್ನು ಹೊಂದಿವೆ. ರಾತ್ರಿ 10:15 ಕ್ಕೆ ಮೆಜೆಸ್ಟಿಕ್‌ನಿಂದ ಹೊರಟು ಬೆಳಿಗ್ಗೆ 6:30 ಕ್ಕೆ ಸುಲಭವಾಗಿ ತಲುಪಿದೆವು.' 
    },

    // Post 3 Content
    'post3_author': { en: 'Rohan Deshmukh', hi: 'रोहन देशमुख', kn: 'ರೋಹನ್ ದೇಶಮುಖ್' },
    'post3_badge': { en: 'Highway Explorer', hi: 'हाईवे खोजकर्ता', kn: 'ಹೆದ್ದಾರಿ ಪರಿಶೋಧಕ' },
    'post3_route': { en: 'Pune ➔ Bengaluru', hi: 'पुणे ➔ बेंगलुरु', kn: 'ಪುಣೆ ➔ ಬೆಂಗಳೂರು' },
    'post3_time': { en: '1 day ago', hi: '1 दिन पहले', kn: '1 ದಿನದ ಹಿಂದೆ' },
    'post3_title': { 
      en: 'Clean midnight food halts between Kolhapur and Belagavi?', 
      hi: 'कोल्हापुर और बेलगावी के बीच साफ-सुथरा आधी रात का भोजन पड़ाव?', 
      kn: 'ಕೊಲ್ಹಾಪುರ ಮತ್ತು ಬೆಳಗಾವಿ ನಡುವೆ ಸ್ವಚ್ಛವಾದ ಮಧ್ಯರಾತ್ರಿ ಊಟದ ನಿಲ್ದಾಣಗಳು ಯಾವುವು?' 
    },
    'post3_content': { 
      en: 'Most VRL and IntrCity buses stop at Hotel Amar Executive near Kolhapur bypass around 12:45 AM. Restrooms are sanitized, and hot tandoor parathas are served within 8 minutes.', 
      hi: 'अधिकांश वीआरएल और इंटरसिटी बसें रात 12:45 बजे कोल्हापुर बाईपास पर होटल अमर एग्जीक्यूटिव में रुकती हैं। वॉशरूम साफ हैं और 8 मिनट में गर्म पराठे मिल जाते हैं।', 
      kn: 'ಹೆಚ್ಚಿನ ವಿಆರ್‌ಎಲ್ ಮತ್ತು ಇಂಟರ್‌ಸಿಟಿ ಬಸ್‌ಗಳು ಮಧ್ಯರಾತ್ರಿ 12:45 ಕ್ಕೆ ಕೊಲ್ಹಾಪುರ ಬೈಪಾಸ್ ಬಳಿಯ ಹೋಟೆಲ್ ಅಮರ್ ಎಕ್ಸಿಕ್ಯೂಟಿವ್‌ನಲ್ಲಿ ನಿಲ್ಲುತ್ತವೆ. ವಾಶ್‌ರೂಮ್‌ಗಳು ಸ್ವಚ್ಛವಾಗಿವೆ ಮತ್ತು ಬಿಸಿ ತಂದೂರಿ ರೊಟ್ಟಿಗಳು ಸಿಗುತ್ತವೆ.' 
    },

    // Post 4 Content (Pending in Moderation Queue)
    'post4_author': { en: 'Suresh Patil', hi: 'सुरेश पाटिल', kn: 'ಸುರೇಶ್ ಪಾಟೀಲ್' },
    'post4_badge': { en: 'Verified Passenger', hi: 'सत्यापित यात्री', kn: 'ದೃಢೀಕೃತ ಪ್ರಯಾಣಿಕ' },
    'post4_route': { en: 'Hubballi ➔ Bengaluru', hi: 'हुब्बल्ली ➔ बेंगलुरु', kn: 'ಹುಬ್ಬಳ್ಳಿ ➔ ಬೆಂಗಳೂರು' },
    'post4_time': { en: 'Just now', hi: 'अभी-अभी', kn: 'ಈಗಷ್ಟೇ' },
    'post4_title': { 
      en: 'Punctual departure on early morning non-stop service', 
      hi: 'सुबह की नॉन-स्टॉप सेवा पर समय पर प्रस्थान', 
      kn: 'ಮುಂಜಾನೆಯ ತಡೆರಹಿತ ಸೇವೆಯಲ್ಲಿ ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ನಿರ್ಗಮನ' 
    },
    'post4_content': { 
      en: 'Departure was exactly at 6:00 AM from Hubballi new bus stand. Driver drove smoothly without hard braking on NH 48.', 
      hi: 'हुब्बल्ली नए बस स्टैंड से ठीक सुबह 6:00 बजे प्रस्थान हुआ। चालक ने एनएच 48 पर बिना किसी झटके के सुचारू रूप से गाड़ी चलाई।', 
      kn: 'ಹುಬ್ಬಳ್ಳಿ ಹೊಸ ಬಸ್ ನಿಲ್ದಾಣದಿಂದ ನಿಖರವಾಗಿ ಬೆಳಿಗ್ಗೆ 6:00 ಗಂಟೆಗೆ ಹೊರಟಿತು. ಚಾಲಕರು ಎನ್‌ಎಚ್ 48 ರಲ್ಲಿ ಯಾವುದೇ ಹಠಾತ್ ಬ್ರೇಕ್ ಇಲ್ಲದೆ ಸುಗಮವಾಗಿ ಚಾಲನೆ ಮಾಡಿದರು.' 
    },

    // Sidebar Widgets
    'widget_guidelines_title': { en: 'Community Rules', hi: 'समुदाय के नियम', kn: 'ಸಮುದಾಯ ನಿಯಮಗಳು' },
    'rule_1': { en: 'Post verified PNR or bus operator experiences', hi: 'सत्यापित पीएनआर या वास्तविक बस अनुभव पोस्ट करें', kn: 'ದೃಢೀಕೃತ ಪಿಎನ್‌ಆರ್ ಅಥವಾ ನೈಜ ಬಸ್ ಅನುಭವಗಳನ್ನು ಮಾತ್ರ ಹಂಚಿಕೊಳ್ಳಿ' },
    'rule_2': { en: 'Respect female travelers & avoid personal contacts', hi: 'महिला यात्रियों का सम्मान करें और संपर्क विवरण न दें', kn: 'ಮಹಿಳಾ ಪ್ರಯಾಣಿಕರನ್ನು ಗೌರವಿಸಿ ಮತ್ತು ವೈಯಕ್ತಿಕ ವಿವರ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ' },
    'rule_3': { en: 'Tag highway hotels accurately for night halts', hi: 'रात के पड़ाव के लिए हाईवे होटलों को सही टैग करें', kn: 'ರಾತ್ರಿ ನಿಲ್ದಾಣಗಳಿಗಾಗಿ ಹೆದ್ದಾರಿ ಹೋಟೆಲ್‌ಗಳನ್ನು ನಿಖರವಾಗಿ ಟ್ಯಾಗ್ ಮಾಡಿ' },
    'widget_stats_title': { en: 'Live Platform Stats', hi: 'लाइव प्लेटफ़ॉर्म आंकड़े', kn: 'ಲೈವ್ ಅಂಕಿಅಂಶಗಳು' },
    'stat_members': { en: '1,84,200+ Active Travelers', hi: '1,84,200+ सक्रिय यात्री', kn: '1,84,200+ ಸಕ್ರಿಯ ಪ್ರಯಾಣಿಕರು' },
    'stat_routes': { en: '4,200 Verified Highway Routes', hi: '4,200 सत्यापित हाईवे रूट', kn: '4,200 ದೃಢೀಕೃತ ಹೆದ್ದಾರಿ ಮಾರ್ಗಗಳು' },
    'stat_helps': { en: '98% Questions Answered < 15 mins', hi: '98% सवालों के जवाब 15 मिनट में', kn: '98% ಪ್ರಶ್ನೆಗಳಿಗೆ 15 ನಿಮಿಷಗಳಲ್ಲಿ ಉತ್ತರ' }
  };

  posts: CommunityPost[] = [
    {
      id: 'p1',
      authorNameKey: 'post1_author',
      authorBadgeKey: 'post1_badge',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      routeKey: 'post1_route',
      timeAgoKey: 'post1_time',
      categoryTagKey: 'post_tag_review',
      titleKey: 'post1_title',
      contentKey: 'post1_content',
      upvotes: 42,
      commentsCount: 16,
      hasUpvoted: false,
      verifiedTrip: true,
      status: 'approved'
    },
    {
      id: 'p2',
      authorNameKey: 'post2_author',
      authorBadgeKey: 'post2_badge',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      routeKey: 'post2_route',
      timeAgoKey: 'post2_time',
      categoryTagKey: 'post_tag_comfort',
      titleKey: 'post2_title',
      contentKey: 'post2_content',
      upvotes: 28,
      commentsCount: 9,
      hasUpvoted: false,
      verifiedTrip: true,
      status: 'approved'
    },
    {
      id: 'p3',
      authorNameKey: 'post3_author',
      authorBadgeKey: 'post3_badge',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      routeKey: 'post3_route',
      timeAgoKey: 'post3_time',
      categoryTagKey: 'post_tag_food',
      titleKey: 'post3_title',
      contentKey: 'post3_content',
      upvotes: 53,
      commentsCount: 22,
      hasUpvoted: false,
      verifiedTrip: false,
      status: 'approved'
    },
    {
      id: 'p4',
      authorNameKey: 'post4_author',
      authorBadgeKey: 'post4_badge',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      routeKey: 'post4_route',
      timeAgoKey: 'post4_time',
      categoryTagKey: 'post_tag_safety',
      titleKey: 'post4_title',
      contentKey: 'post4_content',
      upvotes: 12,
      commentsCount: 3,
      hasUpvoted: false,
      verifiedTrip: true,
      status: 'pending'
    }
  ];

  ngOnInit(): void {
    // 1. Check saved Dark Mode state from localStorage or document.body
    const savedTheme = localStorage.getItem('rb_dark_mode');
    if (savedTheme !== null) {
      this.isDarkMode = savedTheme === 'true';
    } else {
      this.isDarkMode = document.body.classList.contains('dark-mode');
    }
    this.applyTheme(this.isDarkMode);

    // 2. Check saved Language state
    const savedLang = localStorage.getItem('rb_language') as SupportedLanguage;
    if (savedLang && ['en', 'hi', 'kn'].includes(savedLang)) {
      this.currentLang = savedLang;
    }
  }

  // Get displayed posts based on moderation queue or active category filter
  get displayedPosts(): CommunityPost[] {
    if (this.isModerationView) {
      return this.posts.filter(p => p.status === 'pending');
    }

    const approved = this.posts.filter(p => p.status === 'approved');
    if (this.activeFilter === 'all') {
      return approved;
    } else if (this.activeFilter === 'vrl') {
      return approved.filter(p => p.id === 'p1');
    } else if (this.activeFilter === 'ksrtc') {
      return approved.filter(p => p.id === 'p2');
    } else if (this.activeFilter === 'intrcity') {
      return approved.filter(p => p.id === 'p3');
    } else if (this.activeFilter === 'food') {
      return approved.filter(p => p.categoryTagKey === 'post_tag_food');
    } else if (this.activeFilter === 'safety') {
      return approved.filter(p => p.categoryTagKey === 'post_tag_safety');
    }

    return approved;
  }

  // Word & Alphabet Translation Method
  t(key: string): string {
    if (!key) return '';
    const trimmed = key.trim();
    if (this.dictionary[trimmed]) {
      return this.dictionary[trimmed][this.currentLang] || this.dictionary[trimmed]['en'] || trimmed;
    }
    return trimmed;
  }

  onLanguageChange(event: any): void {
    const selected = event.target.value as SupportedLanguage;
    this.currentLang = selected;
    localStorage.setItem('rb_language', selected);
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme(this.isDarkMode);
  }

  private applyTheme(isDark: boolean): void {
    localStorage.setItem('rb_dark_mode', String(isDark));
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
  }

  toggleUpvote(post: CommunityPost): void {
    post.hasUpvoted = !post.hasUpvoted;
    post.upvotes += post.hasUpvoted ? 1 : -1;
  }

  onPhotoSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.newPostPhotoUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedPhoto(): void {
    this.newPostPhotoUrl = '';
  }

  toggleComments(post: CommunityPost): void {
    post.showComments = !post.showComments;
    if (post.showComments && !post.comments) {
      post.comments = [
        { author: 'Vikram Sharma', text: 'Great tip! Did the coach have clean blankets?', time: '2 hours ago' },
        { author: 'Priya Patel', text: 'Very useful advice on highway food halts. Thanks for sharing!', time: '1 hour ago' }
      ];
    }
  }

  addComment(post: CommunityPost): void {
    if (!post.newCommentText || !post.newCommentText.trim()) return;
    if (!post.comments) post.comments = [];
    post.comments.push({
      author: 'Aditya Chavan',
      text: post.newCommentText.trim(),
      time: 'Just now'
    });
    post.commentsCount = post.comments.length;
    post.newCommentText = '';
    this.showToast('Reply published successfully!');
  }

  sharePost(post: CommunityPost): void {
    const shareUrl = `${window.location.origin}/community?post=${post.id}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl);
      this.showToast('Post link copied to clipboard!');
    } else {
      this.showToast('Sharing post: ' + this.t(post.titleKey));
    }
  }

  shareWhatsApp(post: CommunityPost): void {
    const text = encodeURIComponent(`Check out this travel review on TedBus: "${this.t(post.titleKey)}" - ${this.t(post.routeKey)}\n${window.location.origin}/community`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }

  reportPost(post: CommunityPost): void {
    post.isReported = true;
    this.showToast('Post reported for admin moderation review.');
  }

  showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }

  submitPost(): void {
    if (!this.newPostTitle.trim() || !this.newPostContent.trim()) {
      return;
    }

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorNameKey: 'post1_author',
      authorBadgeKey: 'post1_badge',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      routeKey: this.newPostRoute.trim() || 'post1_route',
      timeAgoKey: 'post4_time',
      categoryTagKey: this.newPostCategory,
      titleKey: this.newPostTitle.trim(),
      contentKey: this.newPostContent.trim(),
      imageUrl: this.newPostPhotoUrl || undefined,
      upvotes: 1,
      commentsCount: 0,
      hasUpvoted: true,
      verifiedTrip: true,
      status: 'approved',
      comments: []
    };

    this.posts.unshift(newPost);
    this.newPostTitle = '';
    this.newPostContent = '';
    this.newPostRoute = '';
    this.newPostPhotoUrl = '';
    this.submitSuccessMessage = this.t('compose_msg_success');

    setTimeout(() => {
      this.submitSuccessMessage = '';
    }, 4000);
  }

  approvePost(post: CommunityPost): void {
    post.status = 'approved';
    this.showToast('Post approved into public stream.');
  }

  rejectPost(post: CommunityPost): void {
    post.status = 'rejected';
    this.showToast('Post rejected.');
  }
}