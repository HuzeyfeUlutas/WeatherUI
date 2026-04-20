# Task Workflow

Bu projede kullanici task bazli ilerlemek istiyor. Sonraki agentlar bu akisa uymali.

## Task Akisi

1. Task kapsaminda sadece gereken dosyalari degistir.
2. Mimari ve component yapisina sadik kal.
3. Degisiklikten sonra `npm run build` calistir.
4. Sonucta kullaniciya kisa review ver.
5. Kullanici onaylamadan sonraki taska gecme.

## Review Formati

Her task sonunda su bilgileri ver:

- Yapilan degisiklikler
- Degisen ana dosyalar
- Calistirilan kontroller
- Bilinen riskler veya eksikler
- Kullanici onayi beklenen nokta

## Daha Once Tamamlanan Tasklar

1. Proje kurulumu ve temel mimari
2. Statik il datası ve tipler
3. Dinamik Turkiye haritasi
4. Open-Meteo entegrasyonu
5. Detay paneli ve il secimi
6. UI polish ve kalite
7. MGM arastirma
8. Three.js globe giris ekrani
9. Globe uzerinde ulke sinirlari (Line2, #7accff, 1.5px)
10. Border sync duzeltmesi (spinGroup mimarisi)
11. Ulke tiklama + odaklama animasyonu
12. Turkiye girisi + sayfa gecis animasyonu
13. Ulke ismi etiketleri (eklendi, sonra kaldirildi)
14. Odaklama bug fix: cameraFacingVector dinamik camera pozisyonuyla hesaplandi
15. Globe sagpanel: tum dunya ulkeleri GeoJSON'dan dinamik dropdown

## Onemli Bug Notu

Task 5 sonrasi haritada il tiklaninca bos ekran oluyordu.

Sebep:
- `ProvinceSearch` icinde `watch` ve iki `useEffect` eski form degerini secili ile geri yazabiliyordu.

Fix:
- Form state dis secimle sadece `setValue` ile sync ediliyor.
- Select degisince `register(... onChange)` dogrudan `onSelectProvince` cagiriyor.

Bu akisi bozma.
