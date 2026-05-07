import type { ProvinceId } from '../../province'
import type { DistrictId } from '../../district'

export type WeatherProviderId = 'open-meteo' | 'mgm'

export type WeatherConditionCode = number

export type ForecastDay = {
  apparentTemperatureMax?: number
  apparentTemperatureMin?: number
  date: string
  precipitationProbabilityMax?: number
  precipitationSum?: number
  relativeHumidityMean?: number
  temperatureMin: number
  temperatureMax: number
  temperatureMean: number
  windDirectionDominant?: number
  windGustsMax?: number
  windSpeedMax?: number
  weatherCode?: WeatherConditionCode
}

export type WeatherTemperatureSummary = {
  current: number
  currentWeatherCode?: WeatherConditionCode
  min: number
  max: number
}

export type ProvinceForecast = {
  currentApparentTemperature?: number
  currentPrecipitation?: number
  currentRelativeHumidity?: number
  currentTemperature?: number
  currentUpdatedAt?: string
  currentWindDirection?: number
  currentWindGusts?: number
  currentWindSpeed?: number
  currentWeatherCode?: WeatherConditionCode
  provinceId: ProvinceId
  providerId: WeatherProviderId
  updatedAt: string
  days: ForecastDay[]
}

export type DistrictForecast = Omit<ProvinceForecast, 'provinceId'> & {
  districtId: DistrictId
}

export type WeatherProvider = {
  id: WeatherProviderId
  getProvinceForecasts: (
    provinceIds: ProvinceId[],
  ) => Promise<ProvinceForecast[]>
  getDistrictForecasts?: (
    districtIds: DistrictId[],
  ) => Promise<DistrictForecast[]>
}
