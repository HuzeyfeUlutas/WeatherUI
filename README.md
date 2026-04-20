# WeatherUI

Turkiye'deki 81 ilin sicaklik ve 7 gunluk hava tahmini bilgisini harita uzerinden gosteren React uygulamasi.

## Baslangic

```bash
npm install
npm run dev
```

Build kontrolu:

```bash
npm run build
```

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Zustand
- TanStack React Query
- React Hook Form

## Proje Yapisi

```text
src/app       App shell, providers, global UI store
src/entities  Domain modelleri ve veri providerlari
src/features  Component bazli feature modulleri
src/pages     Page-level composition
src/shared    Genel helper ve utility kodlari
```

## Dokumantasyon

Sonraki sessionlarda once su dosyalari oku:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA_SOURCES.md`
- `docs/TASK_WORKFLOW.md`
- `docs/BACKLOG.md`

## Veri Kaynagi

Aktif veri kaynagi Open-Meteo'dur. MGM endpointleri arastirildi ancak direkt dis kullanimda `Not allowed by MGM` dondugu ve CORS olmadigi icin aktif kaynak yapilmadi.
