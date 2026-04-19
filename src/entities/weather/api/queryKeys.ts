import type { ProvinceId } from '../../province'
import type { WeatherProviderId } from '../model/types'

export const weatherQueryKeys = {
  provinceForecasts: (
    providerId: WeatherProviderId,
    provinceIds: ProvinceId[],
  ) => ['weather', providerId, 'province-forecasts', provinceIds] as const,
}
