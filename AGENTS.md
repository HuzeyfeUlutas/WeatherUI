# WeatherUI Agent Guide

Bu dosya sonraki Codex/agent session'lari icin projenin calisma kurallarini ozetler. Yeni bir taska baslamadan once bu dosyayi ve `docs/` altindaki notlari oku.

## Proje Amaci

WeatherUI, Turkiye'deki 81 ilin harita uzerinden sicaklik ve 7 gunluk hava tahmini bilgisini kullanici dostu bir UI ile gosteren React uygulamasidir.

MVP su an:
- 81 il icin dinamik Turkiye haritasi gosterir.
- Her ilin ustunde sicaklik etiketi surekli gorunur.
- Il tiklaninca secili il guncellenir.
- Sag panelde secili ilin 7 gunluk tahmini gosterilir.
- Harita ustunde 7 gunluk tarih secici vardir; tarih degisimi sadece client state'i gunceller, yeni API istegi tetiklemez.
- Veriler Open-Meteo'dan React Query ile alinir; bugun icin ana sicaklik `current.temperature_2m`, ileri tarihler icin harita sicakligi `daily` ortalamasindan gelir. Min/max ve 7 gunluk liste `daily` alanlarindan gelir.
- UI metinleri `i18next + react-i18next` ile coklu dil destekler.
- Header'da `TR / EN` dil secici vardir; varsayilan/fallback dil Turkcedir.
- UI profesyonel harita/analitik urun diliyle ilerler; asiri neon/cyberpunk efektlerden kacin.
- Dark/light tema destegi vardir; ilk tema sistem tercihinden algilanir, sonra kullanici secimi saklanir.

## Mutlaka Uyulacak Kurallar

- Paket yoneticisi: `npm`.
- Her tasktan sonra `npm run build` calistir.
- Kullanici task bazli ilerlemek istiyor. Her task sonunda dur, ozet ver ve onay bekle.
- Kullanici onaylamadan sonraki taska gecme.
- Component bazli ilerle. Buyuk tek dosya yerine sorumlulugu net componentler kullan.
- Server/API state icin `@tanstack/react-query` kullan.
- UI/client state icin `zustand` kullan.
- Form state icin sadece gercek form ihtiyaci varsa `react-hook-form` kullan.
- Backend yok. Backend/proxy ancak MGM veya cache gibi net ihtiyac dogarsa planlanacak.
- UI'da harita ilk ekranin ana deneyimi olmali; landing page ekleme.
- Kullaniciya gorunen yeni metinler hardcoded yazilmamali; `src/app/i18n/locales` altindaki `tr.ts` ve `en.ts` dosyalarina eklenmeli.
- Marka, provider ve lisans ozel isimleri cevrilmemeli: `Hava Atlası`, `Open-Meteo`, `CC BY 4.0`.
- Yeni UI rengi eklerken mumkunse hardcoded hex kullanma; `src/styles/index.css` icindeki tema tokenlarini kullan.
- Hava durumu ikonlari `@meteocons/svg` paketinden gelir. Paket MIT lisanslidir; ikonlar `WeatherIcon` componenti uzerinden kullanilmalidir.

## Klasor Kurallari

- `src/app`: app shell, provider setup, global UI store.
- `src/entities`: domain model, tipler, provider/adaptor gibi temel domain kodu.
- `src/features`: kullanici aksiyonuna veya UI davranisina karsilik gelen feature componentleri.
- `src/pages`: sayfa-level composition.
- `src/shared`: genel helper, format, utility kodlari.

Barrel export kullanimi mevcut pattern ile sinirli tutulmali: feature/entity disariya `index.ts` ile acilir.

## Coklu Dil Kurallari

- Aktif i18n altyapisi: `i18next + react-i18next`.
- Dil tipi: `AppLanguage = 'tr' | 'en'`.
- Dil state'i `src/app/store/useAppStore.ts` icinde tutulur.
- Ilk dil `detectInitialLanguage()` ile belirlenir:
  - `localStorage` tercihi varsa o kullanilir.
  - Tarayici dili `tr*` ise Turkce kullanilir.
  - Desteklenmeyen dillerde fallback Turkcedir.
- Dil secimi `localStorage` anahtari `weatherui-language` ile saklanir.
- Yeni UI metni eklerken hem `tr.ts` hem `en.ts` guncellenmelidir.
- Tarih formatlayan helperlar locale parametresi alir; aktif dile gore `tr-TR` veya `en-US` gecilmelidir.
- Hava durumu kod label'lari `getWeatherConditionLabel(weatherCode, t)` ile ceviriden alinmalidir.
- Sadece kod icindeki type/function/class isimlerinin Ingilizce kalmasi normaldir; ekranda gorunen metinler ceviri katmanindan gelmelidir.

## Tema Kurallari

- Tema tipi: `ThemeMode = 'light' | 'dark'`.
- Tema state'i `src/app/store/useAppStore.ts` icinde tutulur.
- Tema tercihi `localStorage` anahtari `weatherui-theme` ile saklanir.
- Ilk acilista kayitli tercih yoksa `prefers-color-scheme` ile `light` veya `dark` secilir.
- `Shell` aktif temayi `html[data-theme="light|dark"]` olarak uygular.
- Renkler `src/styles/index.css` tokenlarindan gelmelidir: background, surface, border, text, accent, danger, map-sea, shadow.
- Globe canvas koyu sahne olarak kalabilir; panel ve shell tema tokenlariyla uyumlu olmalidir.

## Veri Kaynagi Karari

- Aktif kaynak: Open-Meteo Forecast API (`current` + `daily`).
- Hava tahmini query cache suresi 2 saattir (`staleTime` ve `gcTime`). Bu cache React Query in-memory cache'tir.
- Forecast araligi 7 gundur. Tarih secimi Zustand `selectedForecastDate` ile tutulur ve cache'i invalidate etmez.
- MGM arastirildi; `https://servis.mgm.gov.tr/web` altinda endpointler var ancak dis istekte `Not allowed by MGM` donuyor ve CORS yok.
- Bu nedenle MGM frontend'den direkt kullanilmamali.
- MGM entegrasyonu istenirse ayri task olarak proxy/cache ve surdurulebilirlik riskiyle planlanmali.

## Bilinen Hassas Noktalar

- Haritadaki 81 sicaklik etiketi surekli gorunuyor. Marmara gibi yogun bolgelerde label offset iyilestirmesi gerekebilir.
- `ProvinceSearch` once `watch + useEffect` ile secimi geri tetikleyip bos ekran bug'i uretmisti. Su an secim akisi tek yonlu: dis state formu sync eder, select `onChange` secimi bildirir.
- `turkey-map-react` paketi sadece Turkiye il path datasini saglamak icin kullaniliyor; render islemini kendi componentlerimiz yapiyor.
- `src/features/weather-map/model/mockTemperatures.ts` fallback/gelistirme icin duruyor; aktif veri Open-Meteo'dur.
- Sicaklik etiketleri haritada sadece derece olarak gorunur; rozet konumu il SVG path merkezinden hesaplanir. Il adi tooltip/panel tarafinda gorunur.
- Globe ekraninda manuel Three.js renderer kullaniliyor; context lost sorunlari nedeniyle React Three Fiber canvas kullanimi su an aktif degil.

## Komutlar

```bash
npm run dev
npm run build
npm run preview
```

## Sonraki Muhtemel Isler

- Harita label offsetlerini tek tek duzeltmek.
- Select yerine autocomplete/combobox yapmak.
- Hava durumu ikonlari eklemek.
- Open-Meteo'dan yagis ihtimali ve ruzgar bilgisi almak.
- Test altyapisi ve gorsel regression kontrolu eklemek.
- Coklu dil icin eksik ceviri/hardcoded metin taramasi eklemek.
