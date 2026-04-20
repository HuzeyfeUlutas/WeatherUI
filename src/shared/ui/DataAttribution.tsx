import { Trans } from 'react-i18next'

export function DataAttribution() {
  return (
    <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
      <Trans
        components={{
          license: (
            <a
              className="font-medium text-[var(--color-accent)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              href="https://creativecommons.org/licenses/by/4.0/"
              rel="noreferrer"
              target="_blank"
            />
          ),
          source: (
            <a
              className="font-medium text-[var(--color-accent)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              href="https://open-meteo.com/"
              rel="noreferrer"
              target="_blank"
            />
          ),
        }}
        i18nKey="attribution.footer"
      />
    </p>
  )
}
