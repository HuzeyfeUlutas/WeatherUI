import type { ProvinceId } from '../../province'

export type CountryId = string

export type Country = {
  capitalProvinceId?: ProvinceId
  center: {
    latitude: number
    longitude: number
  }
  id: CountryId
  name: string
  regionLabelKey?: string
}
