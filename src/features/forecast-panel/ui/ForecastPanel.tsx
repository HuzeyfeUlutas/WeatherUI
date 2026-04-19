import type { Province } from '../../../entities/province'
import type { ProvinceForecast } from '../../../entities/weather'
import { formatUpdatedAt } from '../../../shared/lib/dateFormat'
import { formatTemperature } from '../../../shared/lib/temperatureScale'
import { ForecastDayCard } from './ForecastDayCard'

type ForecastPanelProps = {
  forecast?: ProvinceForecast
  isError: boolean
  isLoading: boolean
  province: Province
  onRetry: () => void
}

export function ForecastPanel({
  forecast,
  isError,
  isLoading,
  province,
  onRetry,
}: ForecastPanelProps) {
  const today = forecast?.days[0]

  return (
    <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-4 shadow-lg shadow-slate-950/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            5 gunluk tahmin
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {province.name}
          </h2>
        </div>

        <div className="min-w-20 rounded-md bg-cyan-300 px-3 py-2 text-right text-slate-950">
          <p className="text-xs font-semibold">Bugun</p>
          <p className="text-xl font-bold">
            {today ? formatTemperature(today.temperatureMean) : '--'}
          </p>
        </div>
      </div>

      {forecast ? (
        <p className="mt-3 text-xs text-slate-400">
          Guncelleme: {formatUpdatedAt(forecast.updatedAt)}
        </p>
      ) : null}

      {isLoading ? (
        <div className="mt-5 space-y-3">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              className="h-16 animate-pulse rounded-lg bg-slate-800/80"
              key={index}
            />
          ))}
        </div>
      ) : null}

      {isError ? (
        <div className="mt-5 rounded-lg border border-rose-300/30 bg-rose-950/60 p-4">
          <p className="text-sm font-semibold text-rose-100">
            Tahmin bilgisi alinamadi
          </p>
          <button
            className="mt-3 rounded-md bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-950 transition hover:bg-white"
            onClick={onRetry}
            type="button"
          >
            Tekrar dene
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && forecast ? (
        <ul className="mt-5 space-y-3">
          {forecast.days.map((day) => (
            <ForecastDayCard day={day} key={day.date} />
          ))}
        </ul>
      ) : null}
    </aside>
  )
}
