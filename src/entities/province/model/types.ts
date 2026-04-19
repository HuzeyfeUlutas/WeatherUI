export type ProvinceId = string

export type ProvinceRegion =
  | 'Akdeniz'
  | 'Dogu Anadolu'
  | 'Ege'
  | 'Guneydogu Anadolu'
  | 'Ic Anadolu'
  | 'Karadeniz'
  | 'Marmara'

export type GeoPoint = {
  latitude: number
  longitude: number
}

export type MapLabelPosition = {
  x: number
  y: number
}

export type Province = {
  id: ProvinceId
  plateCode: number
  name: string
  slug: string
  region: ProvinceRegion
  coordinates: GeoPoint
  labelPosition: MapLabelPosition
}
