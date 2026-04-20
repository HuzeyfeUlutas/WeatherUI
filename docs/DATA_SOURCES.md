# Data Sources

## Aktif Kaynak: Open-Meteo

Open-Meteo su an MVP'nin aktif hava tahmini kaynagidir.

Kullanim:
- Endpoint: `https://api.open-meteo.com/v1/forecast`
- Alanlar:
  - `current.temperature_2m`
  - `current.weather_code`
  - `temperature_2m_max`
  - `temperature_2m_min`
  - `weather_code`
- Gun sayisi: 7
- Timezone: `Europe/Istanbul`

Harita ve sag paneldeki bugun ana sicaklik degeri `current.temperature_2m` alanindan gelir. Ileri tarih secildiginde harita sicakligi ilgili gunun daily ortalamasindan hesaplanir. Gunluk minimum/maksimum ve 7 gunluk tahmin listesi `daily` alanlarindan gelir. `current` verisi eksik gelirse UI bugunun daily ortalama sicakligina fallback yapar.

Tarih secici sadece client state'i degistirir. 7 gunluk veri tek Open-Meteo response'unda geldigi icin tarih degisimi yeni API request atmaz ve 2 saatlik React Query cache'i invalidate etmez.

Provider dosyasi:

```text
src/entities/weather/api/openMeteoWeatherProvider.ts
```

Normalize edilen model:

```text
ProvinceForecast
ForecastDay
WeatherTemperatureSummary
```

## MGM Arastirma Sonucu

MGM web sitesi Angular tabanli sayfada su base URL'i kullaniyor:

```text
https://servis.mgm.gov.tr/web
```

Kaynak JS:

```text
https://www.mgm.gov.tr/Scripts/ziko16_js/angularService/ililceler.js?v=4
```

Bulunan endpointler:

```text
/merkezler/iller
/merkezler?il=...
/merkezler/ililcesi?il=...
/sondurumlar?merkezid=...
/tahminler/gunluk?istno=...
/tahminler/saatlik?istno=...
/ucdegerler?merkezid=...&ay=...&gun=...
/merkezler/lokasyon?enlem=...&boylam=...
```

Direkt test sonucu:

```text
status: 500
body: {"error":"ServerError","message":"Not allowed by MGM"}
CORS: Access-Control-Allow-Origin yok
```

Karar:
- MGM frontend'den direkt kullanilmayacak.
- Open-Meteo MVP icin dogru kaynak olarak kalacak.
- Open-Meteo icinde current + daily forecast ayrimi kullanilacak.
- MGM entegrasyonu istenirse ayri bir backend/proxy taski acilmali.
- MGM endpointleri resmi public API gibi davranmadigi icin surdurulebilirlik riski yuksek.

## Gelecekte Eklenebilecek Alanlar

Open-Meteo tarafindan eklenebilir:

- Yagis olasiligi
- Ruzgar hizi/yonu
- Hissedilen sicaklik
- Saatlik tahmin detaylari
- Weather icon mapping

Bu alanlar eklenirken once `ForecastDay` tipi genisletilmeli, sonra provider normalize katmani guncellenmelidir.

## Icon Kaynagi

Hava durumu ikonlari Meteocons paketinden gelir:

```text
@meteocons/svg
```

Lisans: MIT. Ikonlar weather code mapping ile `WeatherIcon` componentinde kullanilir.
