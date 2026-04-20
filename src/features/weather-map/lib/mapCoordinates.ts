import type { MapLabelPosition } from '../../../entities/province'

export const TURKEY_MAP_VIEW_BOX = {
  minX: 0,
  minY: 80,
  width: 1050,
  height: 585,
}

export function labelPositionToSvgPoint(position: MapLabelPosition): {
  x: number
  y: number
} {
  return {
    x: TURKEY_MAP_VIEW_BOX.minX + (position.x / 100) * TURKEY_MAP_VIEW_BOX.width,
    y: TURKEY_MAP_VIEW_BOX.minY + (position.y / 100) * TURKEY_MAP_VIEW_BOX.height,
  }
}

export function pathToLabelPoint(path: string): { x: number; y: number } {
  const values = path.match(/-?\d*\.?\d+/g)?.map(Number) ?? []
  const points: Array<{ x: number; y: number }> = []

  for (let index = 0; index < values.length - 1; index += 2) {
    points.push({ x: values[index], y: values[index + 1] })
  }

  if (points.length === 0) {
    return {
      x: TURKEY_MAP_VIEW_BOX.minX + TURKEY_MAP_VIEW_BOX.width / 2,
      y: TURKEY_MAP_VIEW_BOX.minY + TURKEY_MAP_VIEW_BOX.height / 2,
    }
  }

  const bounds = points.reduce(
    (current, point) => ({
      minX: Math.min(current.minX, point.x),
      minY: Math.min(current.minY, point.y),
      maxX: Math.max(current.maxX, point.x),
      maxY: Math.max(current.maxY, point.y),
    }),
    {
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    },
  )

  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  }
}
