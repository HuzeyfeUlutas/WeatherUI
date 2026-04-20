import type { TFunction } from 'i18next'

export type WeatherIconType =
  | 'clear'
  | 'cloudy'
  | 'drizzle'
  | 'fog'
  | 'rain'
  | 'snow'
  | 'thunderstorm'

export function getWeatherIconType(weatherCode?: number): WeatherIconType {
  if (weatherCode === 0) {
    return 'clear'
  }

  if ([45, 48].includes(weatherCode ?? -1)) {
    return 'fog'
  }

  if ([51, 53, 55, 56, 57].includes(weatherCode ?? -1)) {
    return 'drizzle'
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode ?? -1)) {
    return 'rain'
  }

  if ([71, 73, 75, 77, 85, 86].includes(weatherCode ?? -1)) {
    return 'snow'
  }

  if ([95, 96, 99].includes(weatherCode ?? -1)) {
    return 'thunderstorm'
  }

  return 'cloudy'
}

export function getWeatherConditionLabel(
  weatherCode: number | undefined,
  t: TFunction,
): string {
  if (weatherCode === undefined) {
    return t('weatherCode.forecast')
  }

  if (weatherCode === 0) {
    return t('weatherCode.clear')
  }

  if ([1, 2, 3].includes(weatherCode)) {
    return t('weatherCode.partlyCloudy')
  }

  if ([45, 48].includes(weatherCode)) {
    return t('weatherCode.fog')
  }

  if ([51, 53, 55, 56, 57].includes(weatherCode)) {
    return t('weatherCode.drizzle')
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
    return t('weatherCode.rain')
  }

  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return t('weatherCode.snow')
  }

  if ([95, 96, 99].includes(weatherCode)) {
    return t('weatherCode.thunderstorm')
  }

  return t('weatherCode.variable')
}
