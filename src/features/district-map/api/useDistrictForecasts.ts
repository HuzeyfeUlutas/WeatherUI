import { useQuery } from '@tanstack/react-query'
import type { DistrictId } from '../../../entities/district'
import {
  OpenMeteoWeatherProvider,
  weatherQueryKeys,
} from '../../../entities/weather'

const WEATHER_FORECAST_CACHE_TIME_MS = 1000 * 60 * 60 * 2

export function useDistrictForecasts(districtIds: DistrictId[], enabled = true) {
  return useQuery({
    enabled: enabled && districtIds.length > 0,
    gcTime: WEATHER_FORECAST_CACHE_TIME_MS,
    queryFn: () =>
      OpenMeteoWeatherProvider.getDistrictForecasts?.(districtIds) ??
      Promise.resolve([]),
    queryKey: weatherQueryKeys.districtForecasts(
      OpenMeteoWeatherProvider.id,
      districtIds,
    ),
    staleTime: WEATHER_FORECAST_CACHE_TIME_MS,
  })
}
