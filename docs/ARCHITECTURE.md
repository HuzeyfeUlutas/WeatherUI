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
- i18next
- react-i18next
- Three.js
- @meteocons/svg

## Katmanlar

### `src/app`

App giris noktasi ve global app setup burada durur.

- `App.tsx`: page composition'a yonlendirir.
- `providers/AppProviders.tsx`: `QueryClientProvider` setup.
- `store/useAppStore.ts`: secili il, hover edilen il, secili forecast tarihi, aktif view ve dil tercihi gibi UI state.
- `i18n`: i18next setup, dil algilama, localStorage persist ve ceviri sozlukleri.

### `src/entities`

Domain bilgisi burada tutulur.

- `province`: 81 il datasini, koordinatlari, label pozisyonlarini ve province tiplerini tutar.
- `weather`: forecast tipleri, Open-Meteo provider, query keyleri, selectorlar ve weather code helperlarini tutar.

Entity katmaninda UI component olmamali.

### `src/features`

Kullanicinin gordugu ve etkilesime girdigi feature componentleri burada durur.

- `weather-map`: Turkiye haritasi, il pathleri, sicaklik etiketleri, tooltip, legend ve forecast query hook'u.
- `forecast-date-selector`: 7 gunluk forecast tarih secimini client state olarak yoneten yatay secici.
- `forecast-panel`: secili il icin 7 gunluk tahmin paneli.
- `province-search`: React Hook Form ile il secme formu.
- `country-globe`: Three.js ile dunya giris ekrani ve Turkiye haritasina gecis animasyonu.

Feature componentleri mumkun oldugunca kendi `ui`, `api`, `model`, `lib` alt klasorlerine bolunmeli.

### `src/pages`

Sayfa-level layout ve feature composition burada durur.

- `weather-dashboard`: harita, arama ve tahmin panelini bir araya getirir.

### `src/shared`

Domain'e bagli olmayan genel yardimci kodlar.

- `classNames`
- tarih formatlama
- sicaklik skalasi
- genel UI componentleri: `Shell`, `DataAttribution`, `LanguageSwitcher`
- `WeatherIcon`: Open-Meteo weather code'larini MIT lisansli Meteocons SVG ikonlarina map eder.

## State Ownership

- React Query: Open-Meteo forecast verisi, loading/error/cache/retry.
- Zustand: aktif view, secili ulke/il, secili forecast tarihi, hover edilen il, dil tercihi ve ileride modal/panel gibi UI state.
- React Hook Form: form state. Basit local UI state icin gereksiz yere kullanma.

Open-Meteo hava tahmini query'si 2 saatlik `staleTime` ve `gcTime` kullanir. Bu cache in-memory React Query cache'tir; sayfa yenilenirse kalici cache gibi davranmaz.

Forecast tarih secimi yeni network istegi atmaz. Open-Meteo tek batch response icinde 7 gunluk daily tahminleri getirir; kullanici tarih degistirdiginde harita ve panel selectorlar uzerinden ayni cached veriyi yeniden hesaplar.

## Internationalization

Aktif coklu dil altyapisi `i18next + react-i18next` yapisidir.

- Ceviri dosyalari `src/app/i18n/locales/tr.ts` ve `src/app/i18n/locales/en.ts` altindadir.
- Varsayilan/fallback dil Turkcedir.
- Dil tercihi Zustand store'da tutulur ve `weatherui-language` localStorage anahtari ile saklanir.
- Header'daki `LanguageSwitcher` aktif dili `i18n.changeLanguage` ile aninda degistirir.
- Yeni kullaniciya gorunen metinler component icinde hardcoded kalmamali; ceviri dosyalarina eklenmelidir.
- Tarih helperlari locale parametresi alir; aktif dile gore `tr-TR` veya `en-US` kullanilir.
- `Hava Atlası`, `Open-Meteo`, `CC BY 4.0`, il/ulke adlari gibi ozel isimler cevrilmez.

## Theme System

Aktif tema sistemi `light | dark` modlariyla Zustand uzerinden yonetilir.

- Tema tercihi `weatherui-theme` localStorage anahtari ile saklanir.
- Kayitli tercih yoksa ilk acilista `prefers-color-scheme` ile `light` veya `dark` secilir.
- `Shell`, `html[data-theme]` attribute'unu set eder.
- Global renkler `src/styles/index.css` icindeki CSS variable tokenlaridir.
- Componentlerde yeni renk ihtiyaci olursa once token kullan; hardcoded hex sadece harita sicaklik bandlari veya globe sahnesi gibi domain/gorsel zorunluluklarda tercih edilmeli.
- Gorsel yon profesyonel harita/analitik urun dilidir; neon efektler ve dekoratif arka planlar kullanilmaz.

## Icon Assets

Hava durumu ikonlari `@meteocons/svg` paketinden kullanilir. Paket MIT lisanslidir ve ikonlar local bundle'a dahil edilir. Weather code -> ikon eslemesi `src/entities/weather/model/weatherCode.ts`, render componenti `src/shared/ui/WeatherIcon.tsx` icindedir.

## Data Flow

1. `WeatherDashboardPage` 81 ilin id listesini uretir.
2. `useProvinceForecasts` Open-Meteo provider uzerinden forecastleri alir.
3. `ForecastDateSelector` secili tarihi Zustand store'a yazar.
4. `getTemperatureSummariesByProvinceId` harita icin secili tarihe gore sicaklik ve daily min/max degerlerini uretir. Bugun seciliyken `current.temperature_2m`, ileri tarihlerde daily ortalama kullanilir.
5. `TurkeyWeatherMap` il pathlerini ve sicaklik etiketlerini render eder.
6. Il secimi Zustand store'a yazilir.
7. `ForecastPanel` secili ilin secili tarih sicakligini, daily min/max degerlerini ve normalize 7 gunluk forecast datasini gosterir.
8. UI metinleri aktif i18n diline gore render edilir; dil degisince sayfa yenilenmeden guncellenir.

## Provider Pattern

Weather provider contract'i `src/entities/weather/model/types.ts` icindeki `WeatherProvider` tipidir.

Yeni provider eklerken:
- Entity katmaninda provider dosyasi ac.
- Cevabi `ProvinceForecast` formatina normalize et.
- Feature/page katmanini provider response shape'ine baglama.
- Query keylerini provider id ile ayir.

Aktif provider: `OpenMeteoWeatherProvider`.

MGM provider su an aktif degildir.
