import { useTranslation } from 'react-i18next'
import type { AppLanguage } from '../../app/i18n'
import { i18n } from '../../app/i18n'
import { useAppStore } from '../../app/store/useAppStore'

const languages: AppLanguage[] = ['tr', 'en']

export function LanguageSwitcher() {
  const { t } = useTranslation()
  const language = useAppStore((state) => state.language)
  const setLanguage = useAppStore((state) => state.setLanguage)

  const changeLanguage = (nextLanguage: AppLanguage) => {
    setLanguage(nextLanguage)
    void i18n.changeLanguage(nextLanguage)
  }

  return (
    <div
      aria-label={t('language.label')}
      className="flex rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-1"
      role="group"
    >
      {languages.map((item) => (
        <button
          aria-pressed={language === item}
          className={[
            'h-8 min-w-10 rounded px-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition',
            language === item
              ? 'bg-[var(--color-accent)] text-white shadow-sm'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]',
          ].join(' ')}
          key={item}
          onClick={() => changeLanguage(item)}
          type="button"
        >
          {t(`language.${item}`)}
        </button>
      ))}
    </div>
  )
}
