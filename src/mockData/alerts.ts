import { AlertNotification } from '../types';

export const INITIAL_ALERTS: AlertNotification[] = [
  {
    id: 'ALT-9042',
    title: 'CRITICAL LANDSLIDE EMERGENCY',
    locationName: 'Aizawl Sector 04',
    state: 'Mizoram',
    riskScore: 94,
    recipientCount: 1842,
    channels: { sms: true, push: true, voice: true },
    status: 'Delivered',
    timestamp: '2026-09-04 16:40',
    messageTranslations: {
      en: 'EMERGENCY: Landslide risk is CRITICAL (94/100) in Aizawl Sector 04. Avoid NH-54 bypass. Seek higher stable ground.',
      hi: 'आपातकालीन: आइजोल सेक्टर 04 में भूस्खलन का जोखिम अति-गंभीर (94/100) है। एनएच-54 बाईपास से बचें।',
      as: 'জৰুৰীকালীন: আইজল ছেক্টৰ ০৪ত ভূমিস্খলনৰ বিপদাশংকা অত্যন্ত গুৰুতৰ (৯৪/১০০)। NH-54 বাইপাছ পৰিহাৰ কৰক।',
      bn: 'জরুরী: আইজল সেক্টর ০৪-এ ভূমিধসের ঝুঁকি অত্যন্ত মারাত্মক (৯৪/১০০)। এনএইচ-৫৪ বাইপাস এড়িয়ে চলুন।',
      mni: 'ইমার্জেন্সী: আইজোল সেক্তর ০৪ দা লেন্দস্লাইদ কীবা অসি য়াম্না ফীভম লুপ্লে (৯৪/১০০)। NH-54 বাইপাস নাথোকউ।',
      mzo: 'HRIATTIRNA HPAI: Aizawl Sector 04-ah min lehtling hlauhawm tak (94/100) a thleng thei. NH-54 pumpelh rawh u.',
      kha: 'KYNTU JUBAN: Ka jingma bn hap khyndew ka long ka ba khraw bha (94/100) ha Aizawl Sector 04. Kiap na NH-54 bypass.',
      ne: 'आपत्कालीन: आइजोल सेक्टर ०४ मा पहिरोको जोखिम अति जोखिमपूर्ण (९४/१००) छ। NH-54 बाइपास प्रयोग नगर्नुहोस्।'
    }
  },
  {
    id: 'ALT-9038',
    title: 'HIGH LANDSLIDE ESCALATION WARNING',
    locationName: 'East Khasi Hills',
    state: 'Meghalaya',
    riskScore: 78,
    recipientCount: 2150,
    channels: { sms: true, push: true, voice: false },
    status: 'Delivered',
    timestamp: '2026-09-04 16:15',
    messageTranslations: {
      en: 'WARNING: Landslide risk is HIGH in Shillong Corridor. Heavy rainfall expected over next 6 hours.',
      hi: 'चेतावनी: शिलांग कॉरिडोर में भूस्खलन का जोखिम उच्च है। अगले 6 घंटों में भारी बारिश की संभावना है।',
      as: 'সাঁজপাৰ: শ্বিলং কৰিডৰত ভূমিস্খলনৰ বিপদাশংকা উচ্চ। আগন্তুক ৬ ঘণ্টাত প্ৰবল বৰষুণৰ সম্ভাৱনা।',
      bn: 'সতর্কবার্তা: শিলং করিডোরে ভূমিধসের ঝুঁকি উচ্চ। আগামী ৬ ঘণ্টায় ভারী বৃষ্টির সম্ভাবনা।',
      mni: 'চেকশিনৱা: শিলোং কোরিদোর দা লেন্দস্লাইদ কীবা য়াম্না ৱাংলে।',
      mzo: 'HRIATTIRNA: Shillong Corridor-ah min lehtling hlauhawm a sang. Ruah tui tam tak a sur mezel dawn.',
      kha: 'JINGMA: Ka jingma bn hap khyndew ka long kaba hiew ha Shillong. Slap bn jia ha ki 6 kynta.',
      ne: 'चेतावनी: शिलाङ कोरिडोरमा पहिरोको जोखिम उच्च छ। आगामी ६ घण्टामा भारी वर्षा हुनेछ।'
    }
  },
  {
    id: 'ALT-9031',
    title: 'NH-10 TRAFFIC DISRUPTION ALERT',
    locationName: 'Rangpo Corridor',
    state: 'Sikkim',
    riskScore: 82,
    recipientCount: 3400,
    channels: { sms: true, push: true, voice: true },
    status: 'Delivered',
    timestamp: '2026-09-04 15:50',
    messageTranslations: {
      en: 'ALERT: NH-10 near Rangpo closed due to mudflow landslide. Emergency teams clearing debris.',
      hi: 'अलर्ट: रंगपो के पास एनएच-10 मलबे के कारण बंद है। आपातकालीन टीमें मलबा हटा रही हैं।',
      as: 'সতৰ্কতা: ৰাংপোৰ ওচৰত NH-10 ভূমিস্খলনৰ বাবে বন্ধ।',
      bn: 'সতর্কতা: রংপোর কাছে এনএইচ-১০ কাদা-মাটির ধসে বন্ধ রয়েছে।',
      mni: 'অলর্ত: রংপো মনাক্তা NH-10 থোং হাংদে।',
      mzo: 'HRIATTIRNA: Rangpo bulah NH-10 a ping. SDRF team te an thawk mek.',
      kha: 'ALERT: NH-10 sep ha Rangpo bna hap maw bad khyndew.',
      ne: 'अलर्ट: रंगपो नजिकै NH-10 पहिरोका कारण बन्द छ।'
    }
  }
];
