export function getWeatherConditionLabel(weatherCode?: number): string {
  if (weatherCode === undefined) {
    return 'Tahmin'
  }

  if (weatherCode === 0) {
    return 'Acik'
  }

  if ([1, 2, 3].includes(weatherCode)) {
    return 'Parcali bulutlu'
  }

  if ([45, 48].includes(weatherCode)) {
    return 'Sisli'
  }

  if ([51, 53, 55, 56, 57].includes(weatherCode)) {
    return 'Ciseleme'
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
    return 'Yagmurlu'
  }

  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return 'Karli'
  }

  if ([95, 96, 99].includes(weatherCode)) {
    return 'Gok gurultulu'
  }

  return 'Degisken'
}
