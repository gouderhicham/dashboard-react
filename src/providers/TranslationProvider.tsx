/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { IntlProvider } from 'react-intl';

import {
  I18N_CONFIG_KEY,
  I18N_DEFAULT_LANGUAGE,
  getLanguageByCode,
  loadLanguageMessages
} from '@/i18n';
import { type TLanguage, type ITranslationProviderProps } from '@/i18n';
import { getData, setData } from '@/utils';

type StoredLanguageConfig = {
  code?: string;
};

const relativeTimeFormatLocaleLoaders = {
  en: () => import('@formatjs/intl-relativetimeformat/locale-data/en'),
  ar: () => import('@formatjs/intl-relativetimeformat/locale-data/ar'),
  fr: () => import('@formatjs/intl-relativetimeformat/locale-data/fr')
};

const loadRelativeTimeFormatPolyfill = async (language: TLanguage) => {
  if ('RelativeTimeFormat' in Intl) {
    return;
  }

  await import('@formatjs/intl-relativetimeformat/polyfill');
  await relativeTimeFormatLocaleLoaders[language.code]();
};

const getStoredLanguageCode = () => {
  const storedLanguage = getData(I18N_CONFIG_KEY) as StoredLanguageConfig | TLanguage | string | undefined;

  if (typeof storedLanguage === 'string') {
    return storedLanguage;
  }

  return storedLanguage?.code;
};

const getInitialLanguage = (): TLanguage => {
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');

  if (langParam) {
    const matchedLanguage = getLanguageByCode(langParam);
    if (matchedLanguage) {
      setData(I18N_CONFIG_KEY, { code: matchedLanguage.code });
      return matchedLanguage;
    }
  }

  return getLanguageByCode(getStoredLanguageCode()) ?? I18N_DEFAULT_LANGUAGE;
};

const loadLanguage = async (language: TLanguage): Promise<TLanguage> => {
  const [messages] = await Promise.all([
    loadLanguageMessages(language.code),
    loadRelativeTimeFormatPolyfill(language)
  ]);

  return {
    ...language,
    messages
  };
};

const initialProps: ITranslationProviderProps = {
  currentLanguage: getInitialLanguage(),
  changeLanguage: async (_: TLanguage) => {},
  isRTL: () => false
};

const TranslationsContext = createContext<ITranslationProviderProps>(initialProps);
const useLanguage = () => useContext(TranslationsContext);

const I18NProvider = ({ children }: PropsWithChildren) => {
  const { currentLanguage } = useLanguage();

  return (
    <IntlProvider
      messages={currentLanguage.messages ?? {}}
      locale={currentLanguage.code}
      defaultLocale={I18N_DEFAULT_LANGUAGE.code}
    >
      {children as any}
    </IntlProvider>
  );
};

const TranslationProvider = ({ children }: PropsWithChildren) => {
  const [currentLanguage, setCurrentLanguage] = useState<TLanguage | null>(null);

  const changeLanguage = useCallback(async (language: TLanguage) => {
    const nextLanguage = await loadLanguage(language);
    setData(I18N_CONFIG_KEY, { code: nextLanguage.code });
    setCurrentLanguage(nextLanguage);
  }, []);

  const isRTL = useCallback(() => {
    return currentLanguage?.direction === 'rtl';
  }, [currentLanguage?.direction]);

  useEffect(() => {
    let isActive = true;

    loadLanguage(initialProps.currentLanguage).then((language) => {
      if (isActive) {
        setCurrentLanguage(language);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!currentLanguage) {
      return;
    }

    document.documentElement.setAttribute('dir', currentLanguage.direction);
  }, [currentLanguage]);

  const value = useMemo(
    () => ({
      isRTL,
      currentLanguage: currentLanguage ?? initialProps.currentLanguage,
      changeLanguage
    }),
    [changeLanguage, currentLanguage, isRTL]
  );

  return (
    <TranslationsContext.Provider value={value}>
      {currentLanguage ? <I18NProvider>{children}</I18NProvider> : null}
    </TranslationsContext.Provider>
  );
};

export { TranslationProvider, useLanguage };
