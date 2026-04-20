import { getWeatherIconType } from '../../entities/weather/model/weatherCode'
import clearDayIcon from '@meteocons/svg/fill/clear-day.svg?url'
import cloudyIcon from '@meteocons/svg/fill/partly-cloudy-day.svg?url'
import drizzleIcon from '@meteocons/svg/fill/drizzle.svg?url'
import fogIcon from '@meteocons/svg/fill/fog.svg?url'
import rainIcon from '@meteocons/svg/fill/rain.svg?url'
import snowIcon from '@meteocons/svg/fill/snow.svg?url'
import thunderstormIcon from '@meteocons/svg/fill/thunderstorms.svg?url'

type WeatherIconProps = {
  className?: string
  weatherCode?: number
}

export function WeatherIcon({ className = '', weatherCode }: WeatherIconProps) {
  const iconType = getWeatherIconType(weatherCode)
  const iconSrcByType = {
    clear: clearDayIcon,
    cloudy: cloudyIcon,
    drizzle: drizzleIcon,
    fog: fogIcon,
    rain: rainIcon,
    snow: snowIcon,
    thunderstorm: thunderstormIcon,
  } satisfies Record<typeof iconType, string>

  return (
    <img
      alt=""
      aria-hidden="true"
      className={['h-12 w-12 object-contain', className].join(' ')}
      draggable="false"
      src={iconSrcByType[iconType]}
    />
  )
}
