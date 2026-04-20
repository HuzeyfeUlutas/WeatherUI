import type { ProvinceForecast, WeatherTemperatureSummary } from './types'

export function getForecastDayByDate(
  forecast: ProvinceForecast | undefined,
  selectedDate?: string,
) {
  if (!forecast?.days.length) {
    return undefined
  }

  return (
    forecast.days.find((day) => day.date === selectedDate) ?? forecast.days[0]
  )
}

export function getTodayTemperatureSummary(
  forecast?: ProvinceForecast,
): WeatherTemperatureSummary | undefined {
  return getTemperatureSummaryForDate(forecast)
}

export function getTemperatureSummaryForDate(
  forecast?: ProvinceForecast,
  selectedDate?: string,
): WeatherTemperatureSummary | undefined {
  const selectedDay = getForecastDayByDate(forecast, selectedDate)
  const today = forecast?.days[0]

  if (!selectedDay) {
    return undefined
  }
  const isToday = today?.date === selectedDay.date

  return {
    current:
      isToday && forecast?.currentTemperature !== undefined
        ? forecast.currentTemperature
        : selectedDay.temperatureMean,
    currentWeatherCode:
      isToday && forecast?.currentWeatherCode !== undefined
        ? forecast.currentWeatherCode
        : selectedDay.weatherCode,
    min: selectedDay.temperatureMin,
    max: selectedDay.temperatureMax,
  }
}

export function indexForecastsByProvinceId(
  forecasts: ProvinceForecast[],
): Record<string, ProvinceForecast> {
  return Object.fromEntries(
    forecasts.map((forecast) => [forecast.provinceId, forecast]),
  )
}

export function getTemperatureSummariesByProvinceId(
  forecasts: ProvinceForecast[],
  selectedDate?: string,
): Record<string, WeatherTemperatureSummary> {
  return Object.fromEntries(
    forecasts.flatMap((forecast) => {
      const summary = getTemperatureSummaryForDate(forecast, selectedDate)

      return summary ? [[forecast.provinceId, summary]] : []
    }),
  )
}
