import { SupportedLanguage } from './languageTypes';

export interface AlertTranslationTemplate {
  titlePrefix: Record<string, string>;
  severityText: Record<string, string>;
  actionTemplates: Record<string, string>;
  footerNotice: string;
}

export const ALERT_TRANSLATION_DICTIONARY: Record<SupportedLanguage, AlertTranslationTemplate> = {
  EN: {
    titlePrefix: {
      ADVISORY: 'ADVISORY',
      WATCH: 'LANDSLIDE WATCH',
      WARNING: 'LANDSLIDE WARNING',
      EMERGENCY: 'CRITICAL EMERGENCY WARNING'
    },
    severityText: {
      LOW: 'Low risk level',
      MODERATE: 'Moderate risk level',
      HIGH: 'High risk level',
      CRITICAL: 'Critical risk level'
    },
    actionTemplates: {
      INSPECT_ROAD: 'Inspect road corridor, prepare traffic diversions, and alert field officers.',
      MONITOR_SETTLEMENT: 'Initiate village authority notification and verify hillside drainage.',
      EVACUATE_PREPARE: 'Initiate authority verification and prepare evacuation coordination for high-risk slopes.',
      ROUTINE_MONITORING: 'Maintain standard monitoring and record regular observations.'
    },
    footerNotice: 'VELTREX Early Warning Protocol - Deterministic System Advisory.'
  },
  HI: {
    titlePrefix: {
      ADVISORY: 'सलाह (ADVISORY)',
      WATCH: 'भूस्खलन निगरानी (WATCH)',
      WARNING: 'भूस्खलन चेतावनी (WARNING)',
      EMERGENCY: 'आपतकालीन भूस्खलन चेतावनी (EMERGENCY)'
    },
    severityText: {
      LOW: 'कम जोखिम स्तर',
      MODERATE: 'मध्यम जोखिम स्तर',
      HIGH: 'उच्च जोखिम स्तर',
      CRITICAL: 'अत्यंत गंभीर जोखिम स्तर'
    },
    actionTemplates: {
      INSPECT_ROAD: 'सड़क मार्ग का निरीक्षण करें, यातायात मोड़ की तैयारी करें और फील्ड अधिकारियों को सतर्क करें।',
      MONITOR_SETTLEMENT: 'गांव के अधिकारियों को सूचित करें और ढलान जल निकासी की जांच करें।',
      EVACUATE_PREPARE: 'प्राधिकरण सत्यापन शुरू करें और उच्च जोखिम वाले क्षेत्रों के लिए निकासी की तैयारी करें।',
      ROUTINE_MONITORING: 'मानक निगरानी बनाए रखें और नियमित अवलोकनों को दर्ज करें।'
    },
    footerNotice: 'VELTREX प्रारंभिक चेतावनी प्रणाली।'
  },
  AS: {
    titlePrefix: {
      ADVISORY: 'পৰামৰ্শ (ADVISORY)',
      WATCH: 'ভূমিধস সজাগতা (WATCH)',
      WARNING: 'ভূমিধস সকিয়ানী (WARNING)',
      EMERGENCY: 'জৰুৰী ভূমিধস সকিয়ানী (EMERGENCY)'
    },
    severityText: {
      LOW: 'নিম্ন বিপদাশংকা',
      MODERATE: 'মধ্যম বিপদাশংকা',
      HIGH: 'উচ্চ বিপদাশংকা',
      CRITICAL: 'অতি গুৰুতৰ বিপদাশংকা'
    },
    actionTemplates: {
      INSPECT_ROAD: 'পথ পৰিদৰ্শন কৰক আৰু ফিল্ড বিষয়া সকলক সতৰ্ক কৰক।',
      MONITOR_SETTLEMENT: 'গাঁও কৰ্তৃপক্ষক অৱগত কৰক আৰু পাহাৰীয়া পানী ওলোৱা পথ পৰীক্ষা কৰক।',
      EVACUATE_PREPARE: 'উচ্চ বিপদাশংকাপূৰ্ণ অঞ্চলৰ বাবে স্থানান্তৰকৰণৰ প্ৰস্তুতি চলাওক।',
      ROUTINE_MONITORING: 'নিয়মীয়া পৰ্যবেক্ষণ অব্যাহত ৰাখক।'
    },
    footerNotice: 'VELTREX প্ৰাৰম্ভিক সকিয়ানী ব্যৱস্থা।'
  },
  BN: {
    titlePrefix: {
      ADVISORY: 'পরামর্শ (ADVISORY)',
      WATCH: 'পাহাড়ধস নজরদারি (WATCH)',
      WARNING: 'পাহাড়ধস সতর্কবার্তা (WARNING)',
      EMERGENCY: 'জরুরী পাহাড়ধস সতর্কতা (EMERGENCY)'
    },
    severityText: {
      LOW: 'কম ঝুঁকিপূর্ণ',
      MODERATE: 'মাঝারি ঝুঁকিপূর্ণ',
      HIGH: 'উচ্চ ঝুঁকিপূর্ণ',
      CRITICAL: 'সংকটজনক ঝুঁকিপূর্ণ'
    },
    actionTemplates: {
      INSPECT_ROAD: 'সড়ক পথ পরিদর্শণ করুন এবং ফিল্ড অফিসারদের সতর্ক করুন।',
      MONITOR_SETTLEMENT: 'স্থানীয় প্রশাসনকে অবহিত করুন এবং ড্রেনেজ ব্যবস্থা পরীক্ষা করুন।',
      EVACUATE_PREPARE: 'উচ্চ ঝুঁকিপূর্ণ এলাকার জন্য স্থানান্তর প্রস্তুতি গ্রহণ করুন।',
      ROUTINE_MONITORING: 'নিয়মিত নজরদারি বজায় রাখুন।'
    },
    footerNotice: 'VELTREX প্রাথমিক সতর্কতা ব্যবস্থা।'
  },
  MNI: {
    titlePrefix: {
      ADVISORY: 'পাউতাক (ADVISORY)',
      WATCH: 'চিংৰুমবা চেপথাং (WATCH)',
      WARNING: 'চিংৰুমবা চেপথাং চেকশিনবা (WARNING)',
      EMERGENCY: 'অয়াংবা অৱা চেপথাং (EMERGENCY)'
    },
    severityText: {
      LOW: 'নেম্বা খুদোংথিবা',
      MODERATE: 'ময়াই চানবা খুদোংথিবা',
      HIGH: 'ৱাংবা খুদোংথিবা',
      CRITICAL: 'অয়াংবা খুদোংথিবা'
    },
    actionTemplates: {
      INSPECT_ROAD: 'লম্বী পরিংশিং যেংশিনবীয়ু অমসুং ওফিসারশিংদা চেকশিনবীয়ু।',
      MONITOR_SETTLEMENT: 'খুলগী থৌবুয়াইশিংদা খঙহনবীয়ু অমসুং ঈশিং চৎফম যেংশিনবীয়ু।',
      EVACUATE_PREPARE: 'খুদোংথিবা লৈবা মফমশিংগী পোলিচ অমসুং কোওর্ডিনেশন শেম-শাবীয়ু।',
      ROUTINE_MONITORING: 'তোয়াই চৎনবা যেংশিনবা লেপ্তনা থম্বীয়ু।'
    },
    footerNotice: 'VELTREX পাউতাক চেপথাং সিস্টেম।'
  },
  MIZ: {
    titlePrefix: {
      ADVISORY: 'FIMKHURNA (ADVISORY)',
      WATCH: 'TUKKAL MIN CHHINCHHIAH (WATCH)',
      WARNING: 'TUKKAL MIN RENG NA (WARNING)',
      EMERGENCY: 'KUT CHHUAK RENG NA (EMERGENCY)'
    },
    severityText: {
      LOW: 'Chhinchhiah hniam',
      MODERATE: 'Chhinchhiah laihawl',
      HIGH: 'Chhinchhiah sang',
      CRITICAL: 'Chhinchhiah hlauhawm zual'
    },
    actionTemplates: {
      INSPECT_ROAD: 'Kongpui endik ula, officer te hriattir rawh u.',
      MONITOR_SETTLEMENT: 'Khua leh tui hruaitute hriattir ula, tui luankawng endik rawh u.',
      EVACUATE_PREPARE: 'Hmun hlauhawm a mite sawn chhuah inbuatsaihna tan rawh u.',
      ROUTINE_MONITORING: 'Zirchianna tlangpui zawm chhunzawm rawh u.'
    },
    footerNotice: 'VELTREX Fimkhurna Hriattirna Protocol.'
  },
  KHA: {
    titlePrefix: {
      ADVISORY: 'KA JINGKRAP (ADVISORY)',
      WATCH: 'JINGKYNTU SHUN-KHYNDEW (WATCH)',
      WARNING: 'JINGMAH SHUN-KHYNDEW (WARNING)',
      EMERGENCY: 'JINGKHYNWIN BA SHYRTA (EMERGENCY)'
    },
    severityText: {
      LOW: 'Ka jingma ba poh',
      MODERATE: 'Ka jingma ba pdeng',
      HIGH: 'Ka jingma ba jur',
      CRITICAL: 'Ka jingma ba khraw ba shyrta'
    },
    actionTemplates: {
      INSPECT_ROAD: 'Pynleit jingmut ha ki surok ba radbah bad pynkynmaw ha ki briew ka sorkar.',
      MONITOR_SETTLEMENT: 'Pynbna ha ki nongshong shnong bad peit bniah ia ki nur um.',
      EVACUATE_PREPARE: 'Khreh pynkynriah ialade na ki lum ba khraw ka jingma.',
      ROUTINE_MONITORING: 'Paiiah bniah man la ka sngi.'
    },
    footerNotice: 'VELTREX Jingmah Ba Bapaw Portal.'
  },
  NE: {
    titlePrefix: {
      ADVISORY: 'सल्लाह (ADVISORY)',
      WATCH: 'पहिरो निगरानी (WATCH)',
      WARNING: 'पहिरो चेतावनी (WARNING)',
      EMERGENCY: 'आपत्कालीन पहिरो चेतावनी (EMERGENCY)'
    },
    severityText: {
      LOW: 'न्यून जोखिम',
      MODERATE: 'मध्यम जोखिम',
      HIGH: 'उच्च जोखिम',
      CRITICAL: 'अत्यन्त गम्भीर जोखिम'
    },
    actionTemplates: {
      INSPECT_ROAD: 'सडक मार्ग निरीक्षण गर्नुहोस् र क्षेत्र अधिकृतहरूलाई सतर्क गराउनुहोस्।',
      MONITOR_SETTLEMENT: 'गाउँ अधिकारीहरूलाई सूचित गर्नुहोस् र ढलान ढल निकास जाँच गर्नुहोस्।',
      EVACUATE_PREPARE: 'उच्च जोखिम क्षेत्रका लागि स्थानान्तरण तयारी सुरु गर्नुहोस्।',
      ROUTINE_MONITORING: 'नियमित अनुगमन कायम राख्नुहोस्।'
    },
    footerNotice: 'VELTREX प्रारम्भिक चेतावनी प्रणाली।'
  }
};
