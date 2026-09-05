import { SupportedLanguage, LocalizedAlertContent } from './languageTypes';
import { ALERT_TRANSLATION_DICTIONARY } from './alertTranslations';

export class TranslationService {
  public translateAlert(
    alert: {
      alertLevel: string;
      title: string;
      message: string;
      recommendedAction: string;
      locationName?: string;
    },
    requestedLang: string
  ): LocalizedAlertContent {
    const normLang = (requestedLang || 'EN').toUpperCase() as SupportedLanguage;
    const isSupported = Boolean(ALERT_TRANSLATION_DICTIONARY[normLang]);
    const activeLang: SupportedLanguage = isSupported ? normLang : 'EN';
    const dict = ALERT_TRANSLATION_DICTIONARY[activeLang];

    const prefix = dict.titlePrefix[alert.alertLevel] || alert.alertLevel;
    const locationPart = alert.locationName ? ` — ${alert.locationName}` : '';
    
    const localizedTitle = `${prefix}: Landslide Risk Advisory${locationPart}`;
    let localizedAction = alert.recommendedAction;

    // Map common template action patterns to localized string if available
    if (alert.recommendedAction.includes('Inspect road') || alert.recommendedAction.includes('traffic')) {
      localizedAction = dict.actionTemplates.INSPECT_ROAD;
    } else if (alert.recommendedAction.includes('village') || alert.recommendedAction.includes('drainage')) {
      localizedAction = dict.actionTemplates.MONITOR_SETTLEMENT;
    } else if (alert.recommendedAction.includes('evacuation') || alert.recommendedAction.includes('high-risk')) {
      localizedAction = dict.actionTemplates.EVACUATE_PREPARE;
    } else if (alert.recommendedAction.includes('monitoring') || alert.recommendedAction.includes('standard')) {
      localizedAction = dict.actionTemplates.ROUTINE_MONITORING;
    }

    const localizedMessage = `${alert.message}\n\n[${dict.footerNotice}]`;

    return {
      language: activeLang,
      title: localizedTitle,
      message: localizedMessage,
      recommendedAction: localizedAction,
      isFallback: !isSupported
    };
  }
}

export const translationService = new TranslationService();
