import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { Province, ProvinceId } from '../../../entities/province'

type ProvinceSearchForm = {
  query: string
}

type ProvinceSearchProps = {
  provinces: Province[]
  selectedProvinceId: ProvinceId
  onSelectProvince: (provinceId: ProvinceId) => void
}

export function ProvinceSearch({
  provinces,
  selectedProvinceId,
  onSelectProvince,
}: ProvinceSearchProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { register, setValue, watch } = useForm<ProvinceSearchForm>({
    defaultValues: {
      query: '',
    },
  })
  const query = watch('query')
  const sortedProvinces = useMemo(
    () =>
      [...provinces].sort((first, second) =>
        first.name.localeCompare(second.name, 'tr'),
      ),
    [provinces],
  )
  const selectedProvince = provinces.find(
    (province) => province.id === selectedProvinceId,
  )
  const filteredProvinces = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('tr')

    if (!normalizedQuery) {
      return sortedProvinces
    }

    return sortedProvinces.filter((province) => {
      const plateCode = province.plateCode.toString().padStart(2, '0')
      const provinceName = province.name.toLocaleLowerCase('tr')

      return (
        plateCode.includes(normalizedQuery) ||
        provinceName.includes(normalizedQuery)
      )
    })
  }, [query, sortedProvinces])

  useEffect(() => {
    if (!selectedProvince || isOpen) {
      return
    }

    setValue(
      'query',
      `${selectedProvince.plateCode.toString().padStart(2, '0')} - ${
        selectedProvince.name
      }`,
    )
  }, [isOpen, selectedProvince, setValue])

  const selectProvince = (province: Province) => {
    setValue(
      'query',
      `${province.plateCode.toString().padStart(2, '0')} - ${province.name}`,
    )
    setIsOpen(false)
    onSelectProvince(province.id)
  }
  const { onBlur: onQueryBlur, ...queryField } = register('query', {
    onChange: () => setIsOpen(true),
  })

  return (
    <form className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--color-panel-shadow)]">
      <label
        className="text-xs font-semibold text-[var(--color-text-muted)]"
        htmlFor="province-search"
      >
        {t('provinceSearch.label')}
      </label>
      <div className="relative mt-3">
        <input
          autoComplete="off"
          className="h-12 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-4 pr-12 text-sm font-medium text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)]/60 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
          id="province-search"
          onBlur={(event) => {
            void onQueryBlur(event)
            window.setTimeout(() => setIsOpen(false), 120)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={t('provinceSearch.placeholder')}
          type="search"
          {...queryField}
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
          ▾
        </span>

        {isOpen ? (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 max-h-72 overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-[var(--color-panel-shadow)]">
            {filteredProvinces.length > 0 ? (
              filteredProvinces.map((province) => (
                <button
                  className={[
                    'flex w-full items-center justify-between rounded px-3 py-2.5 text-left text-sm transition',
                    province.id === selectedProvinceId
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-accent)]',
                  ].join(' ')}
                  key={province.id}
                  onMouseDown={(event) => {
                    event.preventDefault()
                    selectProvince(province)
                  }}
                  type="button"
                >
                  <span className="font-semibold">{province.name}</span>
                  <span className="font-mono text-xs opacity-70">
                    {province.plateCode.toString().padStart(2, '0')}
                  </span>
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-sm text-[var(--color-text-muted)]">
                {t('provinceSearch.empty')}
              </p>
            )}
          </div>
        ) : null}
      </div>
    </form>
  )
}
