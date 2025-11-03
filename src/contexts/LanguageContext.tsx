import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

// Embedded English translations act as a reliable fallback and prevent UI flicker on initial load.
const enTranslations = {
  "scan_artwork_title": "Scan an Artwork",
  "scan_artwork_subtitle": "Position the artwork within the frame.",
  "scan_artwork_button_label": "Scan artwork",
  "camera_starting": "Starting camera...",
  "camera_error": "Could not access the camera. Please check permissions and try again.",
  "loading_text": "Identifying artwork...",
  "scan_failed_title": "Scan Failed",
  "scan_failed_message_generic": "An unexpected error occurred during identification.",
  "scan_failed_message_not_identified": "Could not identify the artwork. Please try again with better lighting and a clearer angle.",
  "try_again_button": "Try Again",
  "exhibit_detail_back_button": "Go back to scanner",
  "exhibit_detail_description_title": "Description",
  "exhibit_detail_read_aloud_button": "Read Aloud",
  "exhibit_detail_stop_button": "Stop",
  "privacy_consent_text": "This app uses anonymous analytics to help the museum understand exhibit popularity. We do not collect any personal information.",
  "privacy_consent_button": "I Understand",
  "error_missing_exhibit": "Exhibit data is missing."
};


interface LanguageContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState('en');
  const [translations, setTranslations] = useState<{ [key: string]: any }>({
    en: enTranslations,
  });

  const loadLanguage = useCallback(async (lang: string) => {
    // Don't re-fetch if already loaded
    if (translations[lang]) {
      setLocale(lang);
      return;
    }
    try {
      const response = await fetch(`/locales/${lang}.json`);
      if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
      const data = await response.json();
      setTranslations(prev => ({ ...prev, [lang]: data }));
      setLocale(lang);
    } catch (error) {
      console.error(error);
      setLocale('en'); // Fallback to English on error
    }
  }, [translations]);

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang !== 'en' && ['es'].includes(browserLang)) {
      loadLanguage(browserLang);
    }
  }, [loadLanguage]);

  const t = (key: string): string => {
    // Use the current locale's translation, fallback to English, then to the key itself.
    return translations[locale]?.[key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale: loadLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
