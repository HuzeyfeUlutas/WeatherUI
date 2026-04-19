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
