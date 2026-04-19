import type { ProvinceId } from '../../province'

export type WeatherProviderId = 'open-meteo' | 'mgm'

export type WeatherConditionCode = number

export type ForecastDay = {
  date: string
  temperatureMin: number
  temperatureMax: number
  temperatureMean: number
  weatherCode?: WeatherConditionCode
  precipitationProbability?: number
}

export type WeatherTemperatureSummary = {
  current: number
  min: number
  max: number
}

export type ProvinceForecast = {
  provinceId: ProvinceId
  providerId: WeatherProviderId
  updatedAt: string
  days: ForecastDay[]
}

export type WeatherProvider = {
  id: WeatherProviderId
  getProvinceForecasts: (
    provinceIds: ProvinceId[],
  ) => Promise<ProvinceForecast[]>
}
