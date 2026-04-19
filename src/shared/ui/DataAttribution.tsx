export function DataAttribution() {
  return (
    <p className="text-xs leading-relaxed text-slate-400">
      Weather data by{' '}
      <a
        className="font-medium text-cyan-300 underline-offset-4 hover:text-cyan-200 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
        href="https://open-meteo.com/"
        rel="noreferrer"
        target="_blank"
      >
        Open-Meteo
      </a>
      , licensed under{' '}
      <a
        className="font-medium text-cyan-300 underline-offset-4 hover:text-cyan-200 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
        href="https://creativecommons.org/licenses/by/4.0/"
        rel="noreferrer"
        target="_blank"
      >
        CC BY 4.0
      </a>
      .
    </p>
  )
}
