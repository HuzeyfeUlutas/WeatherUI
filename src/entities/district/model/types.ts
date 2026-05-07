import type { GeoPoint, ProvinceId } from '../../province'

export type DistrictId = string

export type District = {
  coordinates: GeoPoint
  id: DistrictId
  name: string
  provinceId: ProvinceId
  slug: string
}
