# WeatherUI Agent Guide

Bu dosya sonraki Codex/agent session'lari icin projenin calisma kurallarini ozetler. Yeni bir taska baslamadan once bu dosyayi ve `docs/` altindaki notlari oku.

## Proje Amaci

WeatherUI, Turkiye'deki 81 ilin harita uzerinden sicaklik ve 5 gunluk hava tahmini bilgisini kullanici dostu bir UI ile gosteren React uygulamasidir.

MVP su an:
- 81 il icin dinamik Turkiye haritasi gosterir.
- Her ilin ustunde sicaklik etiketi surekli gorunur.
- Il tiklaninca secili il guncellenir.
- Sag panelde secili ilin 5 gunluk tahmini gosterilir.
- Veriler Open-Meteo'dan React Query ile alinir.

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

## Klasor Kurallari

- `src/app`: app shell, provider setup, global UI store.
- `src/entities`: domain model, tipler, provider/adaptor gibi temel domain kodu.
- `src/features`: kullanici aksiyonuna veya UI davranisina karsilik gelen feature componentleri.
- `src/pages`: sayfa-level composition.
- `src/shared`: genel helper, format, utility kodlari.

Barrel export kullanimi mevcut pattern ile sinirli tutulmali: feature/entity disariya `index.ts` ile acilir.

## Veri Kaynagi Karari

- Aktif kaynak: Open-Meteo Forecast API.
- MGM arastirildi; `https://servis.mgm.gov.tr/web` altinda endpointler var ancak dis istekte `Not allowed by MGM` donuyor ve CORS yok.
- Bu nedenle MGM frontend'den direkt kullanilmamali.
- MGM entegrasyonu istenirse ayri task olarak proxy/cache ve surdurulebilirlik riskiyle planlanmali.

## Bilinen Hassas Noktalar

- Haritadaki 81 sicaklik etiketi surekli gorunuyor. Marmara gibi yogun bolgelerde label offset iyilestirmesi gerekebilir.
- `ProvinceSearch` once `watch + useEffect` ile secimi geri tetikleyip bos ekran bug'i uretmisti. Su an secim akisi tek yonlu: dis state formu sync eder, select `onChange` secimi bildirir.
- `turkey-map-react` paketi sadece Turkiye il path datasini saglamak icin kullaniliyor; render islemini kendi componentlerimiz yapiyor.
- `src/features/weather-map/model/mockTemperatures.ts` fallback/gelistirme icin duruyor; aktif veri Open-Meteo'dur.

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
