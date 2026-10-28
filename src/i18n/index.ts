import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

const supported = ['en', 'es', 'fr'] as const;
const deviceLanguage = getLocales()[0]?.languageCode ?? 'en';

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, es: { translation: es }, fr: { translation: fr } },
  lng: (supported as readonly string[]).includes(deviceLanguage) ? deviceLanguage : 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
