import { create } from 'zustand'
import {
  detectInitialLanguage,
  persistLanguage,
  type AppLanguage,
} from '../i18n'
import { DEFAULT_PROVINCE_ID } from '../../entities/province'
import type { CountryId } from '../../entities/country'

export type AppView = 'globe' | 'country-map'
export type ThemeMode = 'light' | 'dark'

const THEME_STORAGE_KEY = 'weatherui-theme'

function isThemeMode(value: string): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark'
}

function detectInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  return storedTheme && isThemeMode(storedTheme)
    ? storedTheme
    : getSystemTheme()
}

function persistThemeMode(themeMode: ThemeMode) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, themeMode)
}

type AppState = {
  activeView: AppView
  hoveredProvinceId?: string
  language: AppLanguage
  selectedCountryId: CountryId
  selectedForecastDate?: string
  selectedProvinceId: string
  themeMode: ThemeMode
  setActiveView: (view: AppView) => void
  setHoveredProvinceId: (provinceId?: string) => void
  setLanguage: (language: AppLanguage) => void
  setSelectedCountryId: (countryId: CountryId) => void
  setSelectedForecastDate: (date?: string) => void
  setSelectedProvinceId: (provinceId: string) => void
  setThemeMode: (themeMode: ThemeMode) => void
}

const initialThemeMode = detectInitialThemeMode()

export const useAppStore = create<AppState>((set) => ({
  activeView: 'globe',
  hoveredProvinceId: undefined,
  language: detectInitialLanguage(),
  selectedCountryId: 'TR',
  selectedForecastDate: undefined,
  selectedProvinceId: DEFAULT_PROVINCE_ID,
  themeMode: initialThemeMode,
  setActiveView: (view) => set({ activeView: view }),
  setHoveredProvinceId: (provinceId) => set({ hoveredProvinceId: provinceId }),
  setLanguage: (language) => {
    persistLanguage(language)
    set({ language })
  },
  setSelectedCountryId: (countryId) => set({ selectedCountryId: countryId }),
  setSelectedForecastDate: (date) => set({ selectedForecastDate: date }),
  setSelectedProvinceId: (provinceId) => set({ selectedProvinceId: provinceId }),
  setThemeMode: (themeMode) => {
    persistThemeMode(themeMode)
    set({ themeMode })
  },
}))
