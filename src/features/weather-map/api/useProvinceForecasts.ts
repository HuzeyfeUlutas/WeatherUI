import { useQuery } from '@tanstack/react-query'
import type { ProvinceId } from '../../../entities/province'
import {
  OpenMeteoWeatherProvider,
  weatherQueryKeys,
} from '../../../entities/weather'

const WEATHER_FORECAST_CACHE_TIME_MS = 1000 * 60 * 60 * 2

export function useProvinceForecasts(provinceIds: ProvinceId[]) {
  return useQuery({
    gcTime: WEATHER_FORECAST_CACHE_TIME_MS,
    queryFn: () => OpenMeteoWeatherProvider.getProvinceForecasts(provinceIds),
    queryKey: weatherQueryKeys.provinceForecasts(
      OpenMeteoWeatherProvider.id,
      provinceIds,
    ),
    staleTime: WEATHER_FORECAST_CACHE_TIME_MS,
  })
}
