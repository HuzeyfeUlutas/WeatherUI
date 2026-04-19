import type { Province } from '../../../entities/province'
import type { WeatherTemperatureSummary } from '../../../entities/weather'
import { formatTemperature } from '../../../shared/lib/temperatureScale'
import { labelPositionToSvgPoint } from '../lib/mapCoordinates'

type TemperatureLabelProps = {
  province: Province
  temperature?: WeatherTemperatureSummary
  isSelected: boolean
  onSelect: (provinceId: string) => void
}

export function TemperatureLabel({
  province,
  temperature,
  isSelected,
  onSelect,
}: TemperatureLabelProps) {
  const { x, y } = labelPositionToSvgPoint(province.labelPosition)

  return (
    <g
      aria-hidden="true"
      className="cursor-pointer transition-opacity duration-150"
      onClick={() => onSelect(province.id)}
      transform={`translate(${x} ${y})`}
    >
      <rect
        fill={isSelected ? '#ffffff' : 'rgba(15, 23, 42, 0.86)'}
        height="22"
        rx="5"
        stroke={isSelected ? '#22d3ee' : 'rgba(255,255,255,0.34)'}
        strokeWidth="1.5"
        width="38"
        x="-19"
        y="-13"
      />
      <text
        dominantBaseline="middle"
        fill={isSelected ? '#0f172a' : '#ffffff'}
        fontSize="13"
        fontWeight="700"
        textAnchor="middle"
      >
        {temperature ? formatTemperature(temperature.current) : '--'}
      </text>
    </g>
  )
}
