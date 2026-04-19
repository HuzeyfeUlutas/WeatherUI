import type { Province } from '../../../entities/province'
import type { WeatherTemperatureSummary } from '../../../entities/weather'
import { getTemperatureBand } from '../../../shared/lib/temperatureScale'

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
  const band = temperature ? getTemperatureBand(temperature.current) : undefined

  return (
    <path
      aria-label={
        temperature
          ? `${province.name} ${temperature.current} derece`
          : `${province.name} sicaklik yukleniyor`
      }
      className="cursor-pointer transition duration-150 outline-none focus-visible:brightness-125"
      d={path}
      fill={band?.hexColor ?? '#334155'}
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
      stroke={isSelected || isHovered ? '#f8fafc' : '#0f172a'}
      strokeLinejoin="round"
      strokeWidth={isSelected ? 4 : isHovered ? 3 : 1.25}
      tabIndex={0}
    />
  )
}
