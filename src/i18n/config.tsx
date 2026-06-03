import { toAbsoluteUrl } from '@/utils';
import { type TLanguage, type TLanguageCode, type TLanguageMessages } from './types.d';

const I18N_MESSAGES: Record<
  TLanguageCode,
  () => Promise<{ default: TLanguageMessages }>
> = {
  en: () => import('./messages/en.json'),
  ar: () => import('./messages/ar.json'),
  fr: () => import('./messages/fr.json')
};

const I18N_CONFIG_KEY = 'i18nConfig';

const I18N_LANGUAGES: readonly TLanguage[] = [
  {
    label: 'English',
    code: 'en',
    direction: 'ltr',
    flag: toAbsoluteUrl('/media/flags/united-states.svg')
  },
  {
    label: 'Arabic (Saudi)',
    code: 'ar',
    direction: 'rtl',
    flag: toAbsoluteUrl('/media/flags/saudi-arabia.svg')
  },
  {
    label: 'French',
    code: 'fr',
    direction: 'ltr',
    flag: toAbsoluteUrl('/media/flags/france.svg')
  }
];

const I18N_DEFAULT_LANGUAGE: TLanguage = I18N_LANGUAGES[0];

const loadLanguageMessages = async (code: TLanguageCode): Promise<TLanguageMessages> => {
  const messages = await I18N_MESSAGES[code]();
  return messages.default;
};

const getLanguageByCode = (code: string | null | undefined): TLanguage | undefined => {
  return I18N_LANGUAGES.find((language) => language.code === code);
};

export {
  I18N_CONFIG_KEY,
  I18N_DEFAULT_LANGUAGE,
  I18N_LANGUAGES,
  I18N_MESSAGES,
  getLanguageByCode,
  loadLanguageMessages
};
