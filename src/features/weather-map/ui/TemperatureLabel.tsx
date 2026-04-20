import type { Province } from '../../../entities/province'
import type { WeatherTemperatureSummary } from '../../../entities/weather'
import { formatTemperature } from '../../../shared/lib/temperatureScale'

type TemperatureLabelProps = {
  province: Province
  point: { x: number; y: number }
  temperature?: WeatherTemperatureSummary
  isSelected: boolean
  onHover: (provinceId?: string) => void
  onSelect: (provinceId: string) => void
}

export function TemperatureLabel({
  province,
  point,
  temperature,
  isSelected,
  onHover,
  onSelect,
}: TemperatureLabelProps) {
  const temperatureText = temperature ? formatTemperature(temperature.current) : '--'
  const labelWidth = temperatureText.length > 3 ? 28 : 24

  return (
    <g
      aria-hidden="true"
      className="cursor-pointer transition-opacity duration-150"
      onClick={() => onSelect(province.id)}
      onMouseEnter={() => onHover(province.id)}
      onMouseLeave={() => onHover(undefined)}
      transform={`translate(${point.x} ${point.y})`}
    >
      <title>
        {province.name} {temperatureText}
      </title>
      <rect
        fill={isSelected ? 'var(--color-accent)' : 'var(--color-surface)'}
        height="16"
        rx="8"
        stroke={isSelected ? 'var(--color-accent-strong)' : 'var(--color-border)'}
        strokeWidth={isSelected ? '1.3' : '0.6'}
        width={labelWidth}
        x={-labelWidth / 2}
        y="-8"
      />
      <text
        dominantBaseline="middle"
        fill={isSelected ? '#ffffff' : 'var(--color-accent)'}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        fontSize="8.6"
        fontWeight="800"
        textAnchor="middle"
        x="0"
      >
        {temperatureText}
      </text>
    </g>
  )
}
