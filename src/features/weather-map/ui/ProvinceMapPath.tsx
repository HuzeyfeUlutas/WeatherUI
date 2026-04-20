import type { Province } from '../../../entities/province'
import type { WeatherTemperatureSummary } from '../../../entities/weather'
import { getTemperatureBand } from '../../../shared/lib/temperatureScale'
import { useTranslation } from 'react-i18next'

type ProvinceMapPathProps = {
  province: Province
  path: string
  temperature?: WeatherTemperatureSummary
  isHovered: boolean
  isSelected: boolean
  onFocus: (provinceId: string) => void
  onMouseEnter: (provinceId: string) => void
  onMouseLeave: () => void
  onSelect: (provinceId: string) => void
}

export function ProvinceMapPath({
  province,
  path,
  temperature,
  isHovered,
  isSelected,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  onSelect,
}: ProvinceMapPathProps) {
  const { t } = useTranslation()
  const band = temperature ? getTemperatureBand(temperature.current) : undefined

  return (
    <path
      aria-label={
        temperature
          ? `${province.name} ${temperature.current} ${t('map.degree')}`
          : `${province.name} ${t('map.temperatureLoading')}`
      }
      className="cursor-pointer transition duration-150 outline-none focus-visible:brightness-110"
      d={path}
      fill={band?.hexColor ?? '#334155'}
      fillOpacity={isSelected ? 0.96 : isHovered ? 0.88 : 0.7}
      onClick={() => onSelect(province.id)}
      onFocus={() => onFocus(province.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(province.id)
        }
      }}
      onMouseEnter={() => onMouseEnter(province.id)}
      onMouseLeave={onMouseLeave}
      role="button"
      stroke={
        isSelected
          ? 'var(--color-accent-strong)'
          : isHovered
            ? 'var(--color-accent)'
            : 'var(--color-bg)'
      }
      strokeLinejoin="round"
      strokeWidth={isSelected ? 2.8 : isHovered ? 1.7 : 0.75}
      tabIndex={0}
    />
  )
}
