import { useTranslation } from 'react-i18next'
import { useAppStore, type ThemeMode } from '../../app/store/useAppStore'

const themeModes: ThemeMode[] = ['light', 'dark']

export function ThemeSwitcher() {
  const { t } = useTranslation()
  const themeMode = useAppStore((state) => state.themeMode)
  const setThemeMode = useAppStore((state) => state.setThemeMode)

  return (
    <div
      aria-label={t('theme.label')}
      className="flex rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-1"
      role="group"
    >
      {themeModes.map((mode) => (
        <button
          aria-pressed={themeMode === mode}
          className={[
            'h-8 rounded px-3 text-xs font-semibold transition',
            themeMode === mode
              ? 'bg-[var(--color-accent)] text-white shadow-sm'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]',
          ].join(' ')}
          key={mode}
          onClick={() => setThemeMode(mode)}
          type="button"
        >
          {t(`theme.${mode}`)}
        </button>
      ))}
    </div>
  )
}
