import { CONFIG } from '@core/config';
import { translations as enTranslations } from './en';
import { translations as idTranslations } from './id';

const translations = {
  en: enTranslations,
  id: idTranslations
};

let currentLanguage = 'en';

export function detectLanguage() {
  const savedLang = localStorage.getItem(CONFIG.I18N_STORAGE_KEY);
  if (savedLang && translations[savedLang]) {
    return savedLang;
  }
    
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('id')) return 'id';
    
  return 'en';
}

export function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem(CONFIG.I18N_STORAGE_KEY, lang);
    return true;
  }
  return false;
}

export function t(key, fallback = key) {
  return translations[currentLanguage]?.[key] || fallback;
}

export function getCurrentLanguage() {
  return currentLanguage;
}

// Initialize language
currentLanguage = detectLanguage();