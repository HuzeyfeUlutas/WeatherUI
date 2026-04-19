import type { Province } from '../../../entities/province'
import type { WeatherTemperatureSummary } from '../../../entities/weather'
import { formatTemperature } from '../../../shared/lib/temperatureScale'

type MapTooltipProps = {
  province: Province
  temperature?: WeatherTemperatureSummary
}

export function MapTooltip({ province, temperature }: MapTooltipProps) {
  return (
    <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-lg border border-white/15 bg-slate-950/90 px-4 py-3 text-left shadow-xl shadow-slate-950/30 backdrop-blur">
      <p className="text-sm font-semibold text-white">{province.name}</p>
      {temperature ? (
        <p className="mt-1 text-xs text-slate-300">
          Bugun {formatTemperature(temperature.current)} · Min{' '}
          {formatTemperature(temperature.min)} / Max{' '}
          {formatTemperature(temperature.max)}
        </p>
      ) : (
        <p className="mt-1 text-xs text-slate-300">Sicaklik yukleniyor</p>
      )}
    </div>
  )
}
