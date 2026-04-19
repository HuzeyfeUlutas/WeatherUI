# Architecture

## Stack

- Vite
- React 19
- TypeScript
- Tailwind CSS v4
- Zustand
- TanStack React Query
- React Hook Form
- turkey-map-react

## Katmanlar

### `src/app`

App giris noktasi ve global app setup burada durur.

- `App.tsx`: page composition'a yonlendirir.
- `providers/AppProviders.tsx`: `QueryClientProvider` setup.
- `store/useAppStore.ts`: secili il ve hover edilen il gibi UI state.

### `src/entities`

Domain bilgisi burada tutulur.

- `province`: 81 il datasini, koordinatlari, label pozisyonlarini ve province tiplerini tutar.
- `weather`: forecast tipleri, Open-Meteo provider, query keyleri, selectorlar ve weather code helperlarini tutar.

Entity katmaninda UI component olmamali.

### `src/features`

Kullanicinin gordugu ve etkilesime girdigi feature componentleri burada durur.

- `weather-map`: Turkiye haritasi, il pathleri, sicaklik etiketleri, tooltip, legend ve forecast query hook'u.
- `forecast-panel`: secili il icin 5 gunluk tahmin paneli.
- `province-search`: React Hook Form ile il secme formu.

Feature componentleri mumkun oldugunca kendi `ui`, `api`, `model`, `lib` alt klasorlerine bolunmeli.

### `src/pages`

Sayfa-level layout ve feature composition burada durur.

- `weather-dashboard`: harita, arama ve tahmin panelini bir araya getirir.

### `src/shared`

Domain'e bagli olmayan genel yardimci kodlar.

- `classNames`
- tarih formatlama
- sicaklik skalasi

## State Ownership

- React Query: Open-Meteo forecast verisi, loading/error/cache/retry.
- Zustand: secili il, hover edilen il, ileride modal/panel gibi UI state.
- React Hook Form: form state. Basit local UI state icin gereksiz yere kullanma.

## Data Flow

1. `WeatherDashboardPage` 81 ilin id listesini uretir.
2. `useProvinceForecasts` Open-Meteo provider uzerinden forecastleri alir.
3. `getTemperatureSummariesByProvinceId` bugunun sicaklik ozetini harita icin uretir.
4. `TurkeyWeatherMap` il pathlerini ve sicaklik etiketlerini render eder.
5. Il secimi Zustand store'a yazilir.
6. `ForecastPanel` secili ilin normalize 5 gunluk forecast datasini gosterir.

## Provider Pattern

Weather provider contract'i `src/entities/weather/model/types.ts` icindeki `WeatherProvider` tipidir.

Yeni provider eklerken:
- Entity katmaninda provider dosyasi ac.
- Cevabi `ProvinceForecast` formatina normalize et.
- Feature/page katmanini provider response shape'ine baglama.
- Query keylerini provider id ile ayir.

Aktif provider: `OpenMeteoWeatherProvider`.

MGM provider su an aktif degildir.
