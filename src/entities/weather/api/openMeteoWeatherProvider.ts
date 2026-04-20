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
  time?: string[]
  temperature_2m_max?: number[]
  temperature_2m_min?: number[]
  weather_code?: number[]
}

type OpenMeteoCurrentResponse = {
  temperature_2m?: number
  time?: string
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
    current: 'temperature_2m,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code',
    forecast_days: FORECAST_DAYS.toString(),
    timezone: 'Europe/Istanbul',
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
    date,
    temperatureMax,
    temperatureMean: Number(((temperatureMax + temperatureMin) / 2).toFixed(1)),
    temperatureMin,
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
    currentTemperature: response.current?.temperature_2m,
    currentUpdatedAt: response.current?.time,
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
