import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../app/store/useAppStore'
import { DataAttribution } from './DataAttribution'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeSwitcher } from './ThemeSwitcher'

type ShellProps = {
  activeSection?: 'global' | 'regional'
  actions?: ReactNode
  children: ReactNode
  footerMeta?: ReactNode
  immersive?: boolean
  title: string
}

export function Shell({
  actions,
  children,
  footerMeta,
  immersive = false,
  title,
}: ShellProps) {
  const { t } = useTranslation()
  const themeMode = useAppStore((state) => state.themeMode)

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode
  }, [themeMode])

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="relative min-h-screen bg-[var(--color-bg)]">
        <header className="sticky left-0 right-0 top-0 z-30 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] px-4 backdrop-blur-xl md:px-8">
          <div className="mx-auto flex h-16 max-w-[1760px] items-center justify-between gap-4">
          <div className="flex items-center gap-7">
            <div>
              <p className="text-lg font-semibold tracking-normal text-[var(--color-text)] md:text-xl">
                {t('app.name')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {actions}
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
          </div>
        </header>

        <section className={immersive ? 'relative z-10' : 'relative z-10 px-4 py-6 md:py-8'}>
          <div className={immersive ? 'flex w-full flex-col' : 'mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-[1760px] flex-col'}>
            {!immersive && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-sm font-semibold tracking-normal text-[var(--color-text-muted)]">
                  {title}
                </h1>
                {footerMeta}
              </div>
            )}
            {children}
          </div>
        </section>

        <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-4">
          <div className="mx-auto flex max-w-[1760px] justify-end">
            <DataAttribution />
          </div>
        </footer>
      </div>
    </main>
  )
}
