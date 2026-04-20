# Hava Atlasi

Turkiye'deki 81 ilin sicaklik ve 7 gunluk hava tahmini bilgisini interaktif harita uzerinden gosteren React uygulamasi.

Hava Atlasi, il bazli hava durumunu hizli okunabilir bir harita deneyimiyle sunmayi hedefler. Haritadaki sicaklik etiketleri hover gerektirmeden gorunur, tarih seciciyle 7 gunluk tahminler arasinda gezilebilir ve secili il icin detay paneli acilir.

## Ozellikler

- 81 ilin tamamini gosteren interaktif Turkiye haritasi
- Her il uzerinde surekli gorunen sicaklik rozeti
- Secili tarihe gore harita sicakliklarini guncelleyen 7 gunluk tarih secici
- Bugun icin Open-Meteo `current.temperature_2m`, gelecek gunler icin daily tahmin ozeti
- Secili il icin 7 gunluk tahmin paneli
- Il arama/secme alani
- Dark/light tema destegi
- Turkce ve Ingilizce arayuz destegi
- Mobilde yatay suruklenebilir harita ve secili ili merkeze alma davranisi
- React Query ile 2 saatlik in-memory cache
- Three.js tabanli dunya giris ekrani

## Ekranlar

- Globe view: Turkiye secimiyle harita ekranina gecis.
- Turkey map view: Il bazli sicaklik haritasi, tarih secici, il arama ve detay paneli.

## Stack

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

## Baslangic

Gereksinimler:

- Node.js
- npm

Kurulum:

```bash
npm install
```

Gelistirme sunucusu:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Build onizleme:

```bash
npm run preview
```

## Veri Kaynagi

Aktif hava durumu kaynagi [Open-Meteo](https://open-meteo.com/) Forecast API'dir.

Kullanilan alanlar:

- `current.temperature_2m`
- `current.weather_code`
- `daily.temperature_2m_max`
- `daily.temperature_2m_min`
- `daily.weather_code`

Notlar:

- Forecast araligi 7 gundur.
- Timezone `Europe/Istanbul` olarak kullanilir.
- Tarih secimi yeni API istegi atmaz; mevcut cached response uzerinden client tarafinda hesaplanir.
- React Query `staleTime` ve `gcTime` degerleri 2 saattir.
- Open-Meteo attribution uygulama icinde gorunur tutulur.

MGM endpointleri arastirildi ancak direkt dis kullanimda `Not allowed by MGM` dondugu ve CORS olmadigi icin aktif kaynak yapilmadi. Detaylar icin `docs/DATA_SOURCES.md` dosyasina bakabilirsiniz.

## Proje Yapisi

```text
src/app       App shell, providers, global UI store, i18n
src/entities  Domain modelleri ve veri providerlari
src/features  Component bazli feature modulleri
src/pages     Page-level composition
src/shared    Genel helper, format ve UI utility kodlari
docs          Mimari, veri kaynagi ve task notlari
```

## Mimari Notlar

- Server/API state: TanStack React Query
- UI/client state: Zustand
- Form state: React Hook Form
- Kullaniciya gorunen metinler i18n sozluklerinden gelir.
- Renkler mumkun oldugunca `src/styles/index.css` tema tokenlari uzerinden kullanilir.
- Weather provider katmani adaptor mantigiyla ayrilmistir; aktif provider `OpenMeteoWeatherProvider`.

## Dokumantasyon

Proje hakkinda daha fazla bilgi:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA_SOURCES.md`
- `docs/TASK_WORKFLOW.md`
- `docs/BACKLOG.md`

## Attribution

- Weather data by [Open-Meteo](https://open-meteo.com/), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Weather icons use `@meteocons/svg`, licensed under MIT.
- Earth texture attribution is shown in the app.

## Lisans

Bu proje su anda open source gelistirme amaciyla hazirlanmaktadir. Lisans dosyasi eklenecekse repository kokune `LICENSE` dosyasi eklenmelidir.
