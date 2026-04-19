import type { ForecastDay } from '../../../entities/weather'
import { getWeatherConditionLabel } from '../../../entities/weather'
import { formatForecastDate } from '../../../shared/lib/dateFormat'
import { formatTemperature } from '../../../shared/lib/temperatureScale'

type ForecastDayCardProps = {
  day: ForecastDay
}

export function ForecastDayCard({ day }: ForecastDayCardProps) {
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-lg border border-white/10 bg-slate-950/45 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-white">
          {formatForecastDate(day.date)}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {getWeatherConditionLabel(day.weatherCode)}
        </p>
      </div>

      <div className="text-right">
        <p className="text-lg font-semibold text-cyan-200">
          {formatTemperature(day.temperatureMean)}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {formatTemperature(day.temperatureMin)} /{' '}
          {formatTemperature(day.temperatureMax)}
        </p>
      </div>
    </li>
  )
}
