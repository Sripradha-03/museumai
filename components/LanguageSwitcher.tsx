import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useLanguage();

  const languages = [
    { code: 'en', name: 'EN' },
    { code: 'es', name: 'ES' },
  ];

  return (
    <div className="flex space-x-1 bg-black/30 p-1 rounded-full">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLocale(lang.code)}
          className={`px-3 py-1 text-sm font-bold rounded-full transition-colors ${
            locale === lang.code
              ? 'bg-white text-gray-900'
              : 'bg-transparent text-white hover:bg-white/20'
          }`}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
};
