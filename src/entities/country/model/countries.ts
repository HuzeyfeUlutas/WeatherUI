import type { Country } from './types'

export const COUNTRIES: Country[] = [
  {
    capitalProvinceId: '06',
    center: {
      latitude: 39.9334,
      longitude: 32.8597,
    },
    id: 'TR',
    name: 'Türkiye',
    regionLabelKey: 'globe.ankaraFocus',
  },
]

export const COUNTRIES_BY_ID = Object.fromEntries(
  COUNTRIES.map((country) => [country.id, country]),
) as Record<Country['id'], Country>
