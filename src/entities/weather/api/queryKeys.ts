import type { ProvinceId } from '../../province'
import type { DistrictId } from '../../district'
import type { WeatherProviderId } from '../model/types'

export const weatherQueryKeys = {
  provinceForecasts: (
    providerId: WeatherProviderId,
    provinceIds: ProvinceId[],
  ) => ['weather', providerId, 'province-forecasts', provinceIds] as const,
  districtForecasts: (
    providerId: WeatherProviderId,
    districtIds: DistrictId[],
  ) => ['weather', providerId, 'district-forecasts', districtIds] as const,
}
