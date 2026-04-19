import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { Province, ProvinceId } from '../../../entities/province'

type ProvinceSearchForm = {
  provinceId: ProvinceId
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
  const { register, setValue } = useForm<ProvinceSearchForm>({
    defaultValues: {
      provinceId: selectedProvinceId,
    },
  })
  const sortedProvinces = useMemo(
    () =>
      [...provinces].sort((first, second) =>
        first.name.localeCompare(second.name, 'tr'),
      ),
    [provinces],
  )

  useEffect(() => {
    setValue('provinceId', selectedProvinceId)
  }, [selectedProvinceId, setValue])

  return (
    <form className="rounded-lg border border-white/10 bg-white/[0.04] p-4 shadow-lg shadow-slate-950/10">
      <label
        className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
        htmlFor="province-search"
      >
        Il sec
      </label>
      <select
        className="mt-3 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-3 text-sm font-medium text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
        id="province-search"
        {...register('provinceId', {
          onChange: (event) => {
            onSelectProvince(event.target.value)
          },
        })}
      >
        {sortedProvinces.map((province) => (
          <option key={province.id} value={province.id}>
            {province.plateCode.toString().padStart(2, '0')} - {province.name}
          </option>
        ))}
      </select>
    </form>
  )
}
