import { create } from 'zustand'
import { DEFAULT_PROVINCE_ID } from '../../entities/province'

type AppState = {
  hoveredProvinceId?: string
  selectedProvinceId: string
  setHoveredProvinceId: (provinceId?: string) => void
  setSelectedProvinceId: (provinceId: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  hoveredProvinceId: undefined,
  selectedProvinceId: DEFAULT_PROVINCE_ID,
  setHoveredProvinceId: (provinceId) => set({ hoveredProvinceId: provinceId }),
  setSelectedProvinceId: (provinceId) => set({ selectedProvinceId: provinceId }),
}))
