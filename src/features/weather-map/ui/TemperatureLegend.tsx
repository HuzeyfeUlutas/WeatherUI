import { TEMPERATURE_BANDS } from '../../../shared/lib/temperatureScale'
import { useTranslation } from 'react-i18next'

export function TemperatureLegend() {
  const { t } = useTranslation()

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--color-panel-shadow)]">
      <p className="text-xs font-semibold text-[var(--color-text-muted)]">
        {t('legend.title')}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
      {TEMPERATURE_BANDS.map((band) => (
        <div
          className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-xs text-[var(--color-text-muted)]"
          key={band.id}
        >
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: band.hexColor }}
          />
          {t(band.labelKey)}
        </div>
      ))}
      </div>
    </div>
  )
}
