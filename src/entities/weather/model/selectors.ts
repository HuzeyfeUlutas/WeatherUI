import type { ProvinceForecast, WeatherTemperatureSummary } from './types'

export function getTodayTemperatureSummary(
  forecast?: ProvinceForecast,
): WeatherTemperatureSummary | undefined {
  const today = forecast?.days[0]

  if (!today) {
    return undefined
  }

  return {
    current: today.temperatureMean,
    min: today.temperatureMin,
    max: today.temperatureMax,
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
): Record<string, WeatherTemperatureSummary> {
  return Object.fromEntries(
    forecasts.flatMap((forecast) => {
      const summary = getTodayTemperatureSummary(forecast)

      return summary ? [[forecast.provinceId, summary]] : []
    }),
  )
}
