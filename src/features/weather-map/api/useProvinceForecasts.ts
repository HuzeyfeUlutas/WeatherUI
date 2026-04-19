import { useQuery } from '@tanstack/react-query'
import type { ProvinceId } from '../../../entities/province'
import {
  OpenMeteoWeatherProvider,
  weatherQueryKeys,
} from '../../../entities/weather'

export function useProvinceForecasts(provinceIds: ProvinceId[]) {
  return useQuery({
    queryFn: () => OpenMeteoWeatherProvider.getProvinceForecasts(provinceIds),
    queryKey: weatherQueryKeys.provinceForecasts(
      OpenMeteoWeatherProvider.id,
      provinceIds,
    ),
  })
}
