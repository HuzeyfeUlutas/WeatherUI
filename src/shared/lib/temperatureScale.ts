export type TemperatureBand = {
  id: string
  labelKey: string
  min: number
  max: number
  label: string
  fillClassName: string
  textClassName: string
  hexColor: string
}

export const TEMPERATURE_BANDS: TemperatureBand[] = [
  {
    id: 'freezing',
    labelKey: 'legend.freezing',
    min: Number.NEGATIVE_INFINITY,
    max: 0,
    label: '0°C ve alti',
    fillClassName: 'fill-sky-500',
    textClassName: 'text-sky-950',
    hexColor: '#0ea5e9',
  },
  {
    id: 'cold',
    labelKey: 'legend.cold',
    min: 0,
    max: 10,
    label: '0°C - 10°C',
    fillClassName: 'fill-cyan-400',
    textClassName: 'text-cyan-950',
    hexColor: '#22d3ee',
  },
  {
    id: 'mild',
    labelKey: 'legend.mild',
    min: 10,
    max: 20,
    label: '10°C - 20°C',
    fillClassName: 'fill-emerald-400',
    textClassName: 'text-emerald-950',
    hexColor: '#34d399',
  },
  {
    id: 'warm',
    labelKey: 'legend.warm',
    min: 20,
    max: 30,
    label: '20°C - 30°C',
    fillClassName: 'fill-amber-300',
    textClassName: 'text-amber-950',
    hexColor: '#fcd34d',
  },
  {
    id: 'hot',
    labelKey: 'legend.hot',
    min: 30,
    max: Number.POSITIVE_INFINITY,
    label: '30°C ve ustu',
    fillClassName: 'fill-rose-500',
    textClassName: 'text-rose-50',
    hexColor: '#f43f5e',
  },
]

export function getTemperatureBand(temperature: number): TemperatureBand {
  return (
    TEMPERATURE_BANDS.find(
      (band) => temperature >= band.min && temperature < band.max,
    ) ?? TEMPERATURE_BANDS[TEMPERATURE_BANDS.length - 1]
  )
}

export function formatTemperature(temperature: number): string {
  return `${Math.round(temperature)}°`
}
