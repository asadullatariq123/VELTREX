export type SupportedLanguage =
  | 'EN'   // English
  | 'HI'   // Hindi
  | 'AS'   // Assamese
  | 'BN'   // Bengali
  | 'MNI'  // Meitei (Manipuri)
  | 'MIZ'  // Mizo
  | 'KHA'  // Khasi
  | 'NE';  // Nepali

export interface LocalizedAlertContent {
  language: SupportedLanguage;
  title: string;
  message: string;
  recommendedAction: string;
  isFallback: boolean;
}
