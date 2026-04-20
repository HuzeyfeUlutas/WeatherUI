# Hava Atlasi

An interactive React weather dashboard that shows current and 7-day forecast temperatures for all 81 provinces in Turkey on a map.

Hava Atlasi is designed as a fast, readable province-level weather map. Temperature badges are always visible without hover, users can switch between 7 forecast days, and a detail panel shows the selected province forecast.

## Features

- Interactive Turkey map covering all 81 provinces
- Always-visible temperature badge for every province
- 7-day forecast date selector that updates the map temperatures
- Current-day temperature from Open-Meteo `current.temperature_2m`
- Future-day map temperatures calculated from daily forecast summaries
- Selected province detail panel with 7-day forecast
- Province search/select control
- Dark and light theme support
- Turkish and English UI support
- Mobile-friendly horizontally scrollable map that centers the selected province
- 2-hour in-memory cache with TanStack React Query
- Three.js globe entry screen with country borders and click-to-focus animation
- Country selection panel with all world countries; Turkey enters the full map, others show coming-soon state

## Screens

- Globe view: entry screen for selecting Turkey and transitioning to the map.
- Turkey map view: province-level temperature map, forecast date selector, province search, and detail panel.

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS v4
- Zustand
- TanStack React Query
- React Hook Form
- i18next + react-i18next
- Three.js
- turkey-map-react
- @meteocons/svg

## Getting Started

Requirements:

- Node.js
- npm

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Data Source

The active weather data source is the [Open-Meteo](https://open-meteo.com/) Forecast API.

Used fields:

- `current.temperature_2m`
- `current.weather_code`
- `daily.temperature_2m_max`
- `daily.temperature_2m_min`
- `daily.weather_code`

Notes:

- Forecast range is 7 days.
- Timezone is set to `Europe/Istanbul`.
- Changing the selected forecast date does not trigger a new API request; it recalculates values from the cached response on the client.
- React Query uses a 2-hour `staleTime` and `gcTime`.
- Open-Meteo attribution is kept visible in the app.

MGM endpoints were researched, but direct external usage returned `Not allowed by MGM` and no CORS support was available. For details, see `docs/DATA_SOURCES.md`.

## Project Structure

```text
src/app       App shell, providers, global UI store, i18n
src/entities  Domain models and data providers
src/features  Component-based feature modules
src/pages     Page-level composition
src/shared    Shared helpers, formatters, and UI utilities
docs          Architecture, data source, and task notes
```

## Architecture Notes

- Server/API state: TanStack React Query
- UI/client state: Zustand
- Form state: React Hook Form
- User-facing text is managed through i18n dictionaries.
- Colors should use theme tokens from `src/styles/index.css` where possible.
- Weather data is isolated behind a provider/adaptor layer. The active provider is `OpenMeteoWeatherProvider`.

## Documentation

More project notes:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA_SOURCES.md`
- `docs/TASK_WORKFLOW.md`
- `docs/BACKLOG.md`

## Attribution

- Weather data by [Open-Meteo](https://open-meteo.com/), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Weather icons use `@meteocons/svg`, licensed under MIT.
- Earth texture attribution is shown in the app.

## License

This project is currently being developed as an open-source project. If a formal license is needed, add a `LICENSE` file to the repository root.
