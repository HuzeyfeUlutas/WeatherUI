import {
  PROVINCES_BY_ID,
  type Province,
  type ProvinceId,
} from '../../province'
import type {
  ForecastDay,
  ProvinceForecast,
  WeatherProvider,
} from '../model/types'

type OpenMeteoDailyResponse = {
  apparent_temperature_max?: number[]
  apparent_temperature_min?: number[]
  precipitation_probability_max?: number[]
  precipitation_sum?: number[]
  relative_humidity_2m_mean?: number[]
  time?: string[]
  temperature_2m_max?: number[]
  temperature_2m_min?: number[]
  wind_direction_10m_dominant?: number[]
  wind_gusts_10m_max?: number[]
  wind_speed_10m_max?: number[]
  weather_code?: number[]
}

type OpenMeteoCurrentResponse = {
  apparent_temperature?: number
  precipitation?: number
  relative_humidity_2m?: number
  temperature_2m?: number
  time?: string
  wind_direction_10m?: number
  wind_gusts_10m?: number
  wind_speed_10m?: number
  weather_code?: number
}

type OpenMeteoForecastResponse = {
  current?: OpenMeteoCurrentResponse
  daily?: OpenMeteoDailyResponse
}

const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const FORECAST_DAYS = 7
const REQUEST_CHUNK_SIZE = 25

function chunkItems<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize))
  }

  return chunks
}

function createForecastUrl(provinces: Province[]): string {
  const params = new URLSearchParams({
    latitude: provinces
      .map((province) => province.coordinates.latitude.toString())
      .join(','),
    longitude: provinces
      .map((province) => province.coordinates.longitude.toString())
      .join(','),
    current:
      'temperature_2m,weather_code,apparent_temperature,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
    daily:
      'temperature_2m_max,temperature_2m_min,weather_code,apparent_temperature_max,apparent_temperature_min,relative_humidity_2m_mean,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant',
    forecast_days: FORECAST_DAYS.toString(),
    timezone: 'Europe/Istanbul',
    wind_speed_unit: 'kmh',
  })

  return `${OPEN_METEO_FORECAST_URL}?${params.toString()}`
}

function normalizeForecastDay(
  daily: OpenMeteoDailyResponse,
  index: number,
): ForecastDay | undefined {
  const date = daily.time?.[index]
  const temperatureMax = daily.temperature_2m_max?.[index]
  const temperatureMin = daily.temperature_2m_min?.[index]

  if (
    date === undefined ||
    temperatureMax === undefined ||
    temperatureMin === undefined
  ) {
    return undefined
  }

  return {
    apparentTemperatureMax: daily.apparent_temperature_max?.[index],
    apparentTemperatureMin: daily.apparent_temperature_min?.[index],
    date,
    precipitationProbabilityMax: daily.precipitation_probability_max?.[index],
    precipitationSum: daily.precipitation_sum?.[index],
    relativeHumidityMean: daily.relative_humidity_2m_mean?.[index],
    temperatureMax,
    temperatureMean: Number(((temperatureMax + temperatureMin) / 2).toFixed(1)),
    temperatureMin,
    windDirectionDominant: daily.wind_direction_10m_dominant?.[index],
    windGustsMax: daily.wind_gusts_10m_max?.[index],
    windSpeedMax: daily.wind_speed_10m_max?.[index],
    weatherCode: daily.weather_code?.[index],
  }
}

function normalizeProvinceForecast(
  provinceId: ProvinceId,
  response: OpenMeteoForecastResponse,
): ProvinceForecast {
  const daily = response.daily ?? {}
  const days = Array.from({ length: FORECAST_DAYS }, (_, index) =>
    normalizeForecastDay(daily, index),
  ).filter((day): day is ForecastDay => day !== undefined)

  return {
    currentApparentTemperature: response.current?.apparent_temperature,
    currentPrecipitation: response.current?.precipitation,
    currentRelativeHumidity: response.current?.relative_humidity_2m,
    currentTemperature: response.current?.temperature_2m,
    currentUpdatedAt: response.current?.time,
    currentWindDirection: response.current?.wind_direction_10m,
    currentWindGusts: response.current?.wind_gusts_10m,
    currentWindSpeed: response.current?.wind_speed_10m,
    currentWeatherCode: response.current?.weather_code,
    days,
    providerId: 'open-meteo',
    provinceId,
    updatedAt: new Date().toISOString(),
  }
}

async function fetchForecastChunk(
  provinces: Province[],
): Promise<ProvinceForecast[]> {
  const response = await fetch(createForecastUrl(provinces))

  if (!response.ok) {
    throw new Error(`Open-Meteo istegi basarisiz: ${response.status}`)
  }

  const json = (await response.json()) as
    | OpenMeteoForecastResponse
    | OpenMeteoForecastResponse[]
  const responses = Array.isArray(json) ? json : [json]

  return provinces.map((province, index) =>
    normalizeProvinceForecast(province.id, responses[index] ?? {}),
  )
}

export const OpenMeteoWeatherProvider: WeatherProvider = {
  id: 'open-meteo',
  async getProvinceForecasts(provinceIds) {
    const provinces = provinceIds
      .map((provinceId) => PROVINCES_BY_ID[provinceId])
      .filter((province): province is Province => province !== undefined)
    const chunks = chunkItems(provinces, REQUEST_CHUNK_SIZE)
    const forecasts = await Promise.all(chunks.map(fetchForecastChunk))

    return forecasts.flat()
  },
}
