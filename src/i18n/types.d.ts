import { type MessageFormatElement } from 'react-intl';

export type TLanguageCode = 'en' | 'fr' | 'ar';

export type TLanguageDirection = 'ltr' | 'rtl';

export type TLanguageMessages = Record<string, string> | Record<string, MessageFormatElement[]>;

export interface TLanguage {
  label: string;
  code: TLanguageCode;
  direction: TLanguageDirection;
  flag: string;
  messages?: TLanguageMessages;
}

export interface ITranslationProviderProps {
  currentLanguage: TLanguage;
  isRTL: () => boolean;
  changeLanguage: (lang: TLanguage) => Promise<void>;
}
