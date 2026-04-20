import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './locales/en'
import { tr } from './locales/tr'

export type AppLanguage = 'tr' | 'en'

export const DEFAULT_LANGUAGE: AppLanguage = 'tr'
export const LANGUAGE_STORAGE_KEY = 'weatherui-language'

export function isAppLanguage(language: string): language is AppLanguage {
  return language === 'tr' || language === 'en'
}

export function detectInitialLanguage(): AppLanguage {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE
  }

  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)

  if (storedLanguage && isAppLanguage(storedLanguage)) {
    return storedLanguage
  }

  const browserLanguage = window.navigator.language.toLowerCase()

  return browserLanguage.startsWith('tr') ? 'tr' : DEFAULT_LANGUAGE
}

export function persistLanguage(language: AppLanguage) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
}

export const resources = {
  en: { translation: en },
  tr: { translation: tr },
} as const

void i18n.use(initReactI18next).init({
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false,
  },
  lng: detectInitialLanguage(),
  resources,
  supportedLngs: ['tr', 'en'],
})

export { i18n }
