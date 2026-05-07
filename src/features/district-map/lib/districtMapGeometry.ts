type GeoJsonPolygon = { type: 'Polygon'; coordinates: number[][][] }
type GeoJsonMultiPolygon = { type: 'MultiPolygon'; coordinates: number[][][][] }

export type DistrictMapFeature = {
  geometry: GeoJsonPolygon | GeoJsonMultiPolygon
  properties: {
    center: { latitude: number; longitude: number }
    id: string
    name: string
    provinceId: string
  }
  type: 'Feature'
}

export type DistrictMapGeoJson = {
  features: DistrictMapFeature[]
  type: 'FeatureCollection'
}

export const DISTRICT_MAP_VIEW_BOX = {
  height: 620,
  width: 1000,
  x: 0,
  y: 0,
}

type Bounds = {
  maxLatitude: number
  maxLongitude: number
  minLatitude: number
  minLongitude: number
}

type ProjectedBounds = {
  maxX: number
  maxY: number
  minX: number
  minY: number
}

type DistrictProjection = {
  latitudeCenter: number
  projectedBounds: ProjectedBounds
  scale: number
  xOffset: number
  yOffset: number
}

export function getDistrictMapBounds(features: DistrictMapFeature[]): Bounds {
  const bounds: Bounds = {
    maxLatitude: -90,
    maxLongitude: -180,
    minLatitude: 90,
    minLongitude: 180,
  }

  for (const feature of features) {
    for (const ring of getFeatureRings(feature)) {
      for (const [longitude, latitude] of ring) {
        bounds.minLongitude = Math.min(bounds.minLongitude, longitude)
        bounds.maxLongitude = Math.max(bounds.maxLongitude, longitude)
        bounds.minLatitude = Math.min(bounds.minLatitude, latitude)
        bounds.maxLatitude = Math.max(bounds.maxLatitude, latitude)
      }
    }
  }

  return bounds
}

export function districtFeatureToPath(
  feature: DistrictMapFeature,
  bounds: Bounds,
) {
  const projection = createDistrictProjection(bounds)

  return getFeatureRings(feature)
    .map((ring) => {
      const points = ring.map(([longitude, latitude], index) => {
        const point = projectDistrictPoint(
          { latitude, longitude },
          projection,
        )

        return `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
      })

      return `${points.join(' ')} Z`
    })
    .join(' ')
}

export function projectDistrictPoint(
  point: { latitude: number; longitude: number },
  projectionOrBounds: Bounds | DistrictProjection,
) {
  const projection =
    'scale' in projectionOrBounds
      ? projectionOrBounds
      : createDistrictProjection(projectionOrBounds)
  const projectedPoint = projectGeoPoint(point, projection.latitudeCenter)

  return {
    x: projection.xOffset + (projectedPoint.x - projection.projectedBounds.minX) * projection.scale,
    y: projection.yOffset + (projection.projectedBounds.maxY - projectedPoint.y) * projection.scale,
  }
}

export function getDistrictFeatureLabelPoint(
  feature: DistrictMapFeature,
  bounds: Bounds,
) {
  const centroid = getLargestRingCentroid(feature)

  return projectDistrictPoint(centroid, bounds)
}

function createDistrictProjection(bounds: Bounds): DistrictProjection {
  const padding = 32
  const usableWidth = DISTRICT_MAP_VIEW_BOX.width - padding * 2
  const usableHeight = DISTRICT_MAP_VIEW_BOX.height - padding * 2
  const latitudeCenter = (bounds.minLatitude + bounds.maxLatitude) / 2
  const southWest = projectGeoPoint(
    { latitude: bounds.minLatitude, longitude: bounds.minLongitude },
    latitudeCenter,
  )
  const northEast = projectGeoPoint(
    { latitude: bounds.maxLatitude, longitude: bounds.maxLongitude },
    latitudeCenter,
  )
  const projectedBounds = {
    maxX: Math.max(southWest.x, northEast.x),
    maxY: Math.max(southWest.y, northEast.y),
    minX: Math.min(southWest.x, northEast.x),
    minY: Math.min(southWest.y, northEast.y),
  }
  const projectedWidth = projectedBounds.maxX - projectedBounds.minX || 1
  const projectedHeight = projectedBounds.maxY - projectedBounds.minY || 1
  const scale = Math.min(usableWidth / projectedWidth, usableHeight / projectedHeight)
  const renderedWidth = projectedWidth * scale
  const renderedHeight = projectedHeight * scale

  return {
    latitudeCenter,
    projectedBounds,
    scale,
    xOffset: (DISTRICT_MAP_VIEW_BOX.width - renderedWidth) / 2,
    yOffset: (DISTRICT_MAP_VIEW_BOX.height - renderedHeight) / 2,
  }
}

function getFeatureRings(feature: DistrictMapFeature): number[][][] {
  return feature.geometry.type === 'Polygon'
    ? feature.geometry.coordinates
    : feature.geometry.coordinates.flat(1)
}

function projectGeoPoint(
  point: { latitude: number; longitude: number },
  latitudeCenter: number,
) {
  const longitudeScale = Math.cos((latitudeCenter * Math.PI) / 180)

  return {
    x: point.longitude * longitudeScale,
    y: point.latitude,
  }
}

function getLargestRingCentroid(feature: DistrictMapFeature) {
  const largestRing = getFeatureRings(feature).reduce((largest, ring) => {
    return Math.abs(ringSignedArea(ring)) > Math.abs(ringSignedArea(largest))
      ? ring
      : largest
  }, getFeatureRings(feature)[0])

  return ringCentroid(largestRing)
}

function ringSignedArea(ring: number[][]) {
  let area = 0
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    area += ring[previous][0] * ring[index][1] - ring[index][0] * ring[previous][1]
  }

  return area / 2
}

function ringCentroid(ring: number[][]) {
  let areaFactor = 0
  let centroidLongitude = 0
  let centroidLatitude = 0

  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const [longitudeA, latitudeA] = ring[previous]
    const [longitudeB, latitudeB] = ring[index]
    const cross = longitudeA * latitudeB - longitudeB * latitudeA
    areaFactor += cross
    centroidLongitude += (longitudeA + longitudeB) * cross
    centroidLatitude += (latitudeA + latitudeB) * cross
  }

  if (Math.abs(areaFactor) < 0.000001) {
    const sums = ring.reduce(
      (total, [longitude, latitude]) => ({
        latitude: total.latitude + latitude,
        longitude: total.longitude + longitude,
      }),
      { latitude: 0, longitude: 0 },
    )

    return {
      latitude: sums.latitude / ring.length,
      longitude: sums.longitude / ring.length,
    }
  }

  return {
    latitude: centroidLatitude / (3 * areaFactor),
    longitude: centroidLongitude / (3 * areaFactor),
  }
}
