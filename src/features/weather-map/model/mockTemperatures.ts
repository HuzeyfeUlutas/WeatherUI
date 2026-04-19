import { PROVINCES } from '../../../entities/province'
import type { Province, ProvinceId, ProvinceRegion } from '../../../entities/province'
import type { WeatherTemperatureSummary } from '../../../entities/weather'

export type MockTemperature = WeatherTemperatureSummary

const REGION_BASE_TEMPERATURES: Record<ProvinceRegion, number> = {
  Akdeniz: 25,
  'Dogu Anadolu': 10,
  Ege: 22,
  'Guneydogu Anadolu': 27,
  'Ic Anadolu': 16,
  Karadeniz: 15,
  Marmara: 18,
}

function createMockTemperature(province: Province): MockTemperature {
  const seasonalOffset = ((province.plateCode * 7) % 9) - 4
  const current = REGION_BASE_TEMPERATURES[province.region] + seasonalOffset

  return {
    current,
    min: current - 4,
    max: current + 5,
  }
}

export const MOCK_TEMPERATURES_BY_PROVINCE_ID = Object.fromEntries(
  PROVINCES.map((province) => [province.id, createMockTemperature(province)]),
) as Record<ProvinceId, MockTemperature>
