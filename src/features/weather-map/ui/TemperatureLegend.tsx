import { TEMPERATURE_BANDS } from '../../../shared/lib/temperatureScale'

export function TemperatureLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      {TEMPERATURE_BANDS.map((band) => (
        <div
          className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-200"
          key={band.id}
        >
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: band.hexColor }}
          />
          {band.label}
        </div>
      ))}
    </div>
  )
}
