import type {
  GeoPoint,
  MapLabelPosition,
  Province,
  ProvinceRegion,
} from './types'

const TURKEY_BOUNDS = {
  minLatitude: 35.8,
  maxLatitude: 42.3,
  minLongitude: 25.6,
  maxLongitude: 44.8,
}

const labelOverrides: Record<string, MapLabelPosition> = {
  '34': { x: 17, y: 20 },
  '41': { x: 21, y: 26 },
  '54': { x: 24, y: 28 },
  '77': { x: 18, y: 30 },
  '22': { x: 8, y: 14 },
  '39': { x: 11, y: 13 },
  '59': { x: 12, y: 20 },
  '81': { x: 27, y: 32 },
  '79': { x: 60, y: 87 },
}

function toLabelPosition(coordinates: GeoPoint): MapLabelPosition {
  const x =
    ((coordinates.longitude - TURKEY_BOUNDS.minLongitude) /
      (TURKEY_BOUNDS.maxLongitude - TURKEY_BOUNDS.minLongitude)) *
      90 +
    5
  const y =
    ((TURKEY_BOUNDS.maxLatitude - coordinates.latitude) /
      (TURKEY_BOUNDS.maxLatitude - TURKEY_BOUNDS.minLatitude)) *
      78 +
    10

  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
  }
}

function createProvince(
  plateCode: number,
  name: string,
  slug: string,
  region: ProvinceRegion,
  coordinates: GeoPoint,
): Province {
  const id = plateCode.toString().padStart(2, '0')

  return {
    id,
    plateCode,
    name,
    slug,
    region,
    coordinates,
    labelPosition: labelOverrides[id] ?? toLabelPosition(coordinates),
  }
}

export const PROVINCES: Province[] = [
  createProvince(1, 'Adana', 'adana', 'Akdeniz', {
    latitude: 37,
    longitude: 35.3213,
  }),
  createProvince(2, 'Adiyaman', 'adiyaman', 'Guneydogu Anadolu', {
    latitude: 37.7648,
    longitude: 38.2786,
  }),
  createProvince(3, 'Afyonkarahisar', 'afyonkarahisar', 'Ege', {
    latitude: 38.7569,
    longitude: 30.5387,
  }),
  createProvince(4, 'Agri', 'agri', 'Dogu Anadolu', {
    latitude: 39.7191,
    longitude: 43.0503,
  }),
  createProvince(5, 'Amasya', 'amasya', 'Karadeniz', {
    latitude: 40.6533,
    longitude: 35.8336,
  }),
  createProvince(6, 'Ankara', 'ankara', 'Ic Anadolu', {
    latitude: 39.9334,
    longitude: 32.8597,
  }),
  createProvince(7, 'Antalya', 'antalya', 'Akdeniz', {
    latitude: 36.8841,
    longitude: 30.7056,
  }),
  createProvince(8, 'Artvin', 'artvin', 'Karadeniz', {
    latitude: 41.1828,
    longitude: 41.8183,
  }),
  createProvince(9, 'Aydin', 'aydin', 'Ege', {
    latitude: 37.856,
    longitude: 27.8416,
  }),
  createProvince(10, 'Balikesir', 'balikesir', 'Marmara', {
    latitude: 39.6484,
    longitude: 27.8826,
  }),
  createProvince(11, 'Bilecik', 'bilecik', 'Marmara', {
    latitude: 40.1426,
    longitude: 29.9793,
  }),
  createProvince(12, 'Bingol', 'bingol', 'Dogu Anadolu', {
    latitude: 38.8847,
    longitude: 40.4939,
  }),
  createProvince(13, 'Bitlis', 'bitlis', 'Dogu Anadolu', {
    latitude: 38.4012,
    longitude: 42.1078,
  }),
  createProvince(14, 'Bolu', 'bolu', 'Karadeniz', {
    latitude: 40.735,
    longitude: 31.6061,
  }),
  createProvince(15, 'Burdur', 'burdur', 'Akdeniz', {
    latitude: 37.7203,
    longitude: 30.2908,
  }),
  createProvince(16, 'Bursa', 'bursa', 'Marmara', {
    latitude: 40.1826,
    longitude: 29.0665,
  }),
  createProvince(17, 'Canakkale', 'canakkale', 'Marmara', {
    latitude: 40.1553,
    longitude: 26.4142,
  }),
  createProvince(18, 'Cankiri', 'cankiri', 'Ic Anadolu', {
    latitude: 40.6013,
    longitude: 33.6134,
  }),
  createProvince(19, 'Corum', 'corum', 'Karadeniz', {
    latitude: 40.5506,
    longitude: 34.9556,
  }),
  createProvince(20, 'Denizli', 'denizli', 'Ege', {
    latitude: 37.7765,
    longitude: 29.0864,
  }),
  createProvince(21, 'Diyarbakir', 'diyarbakir', 'Guneydogu Anadolu', {
    latitude: 37.9144,
    longitude: 40.2306,
  }),
  createProvince(22, 'Edirne', 'edirne', 'Marmara', {
    latitude: 41.6771,
    longitude: 26.5557,
  }),
  createProvince(23, 'Elazig', 'elazig', 'Dogu Anadolu', {
    latitude: 38.6748,
    longitude: 39.2225,
  }),
  createProvince(24, 'Erzincan', 'erzincan', 'Dogu Anadolu', {
    latitude: 39.75,
    longitude: 39.491,
  }),
  createProvince(25, 'Erzurum', 'erzurum', 'Dogu Anadolu', {
    latitude: 39.9043,
    longitude: 41.2679,
  }),
  createProvince(26, 'Eskisehir', 'eskisehir', 'Ic Anadolu', {
    latitude: 39.7767,
    longitude: 30.5206,
  }),
  createProvince(27, 'Gaziantep', 'gaziantep', 'Guneydogu Anadolu', {
    latitude: 37.0662,
    longitude: 37.3833,
  }),
  createProvince(28, 'Giresun', 'giresun', 'Karadeniz', {
    latitude: 40.9128,
    longitude: 38.3895,
  }),
  createProvince(29, 'Gumushane', 'gumushane', 'Karadeniz', {
    latitude: 40.4603,
    longitude: 39.4814,
  }),
  createProvince(30, 'Hakkari', 'hakkari', 'Dogu Anadolu', {
    latitude: 37.5744,
    longitude: 43.7408,
  }),
  createProvince(31, 'Hatay', 'hatay', 'Akdeniz', {
    latitude: 36.2023,
    longitude: 36.1613,
  }),
  createProvince(32, 'Isparta', 'isparta', 'Akdeniz', {
    latitude: 37.7648,
    longitude: 30.5566,
  }),
  createProvince(33, 'Mersin', 'mersin', 'Akdeniz', {
    latitude: 36.8121,
    longitude: 34.6415,
  }),
  createProvince(34, 'Istanbul', 'istanbul', 'Marmara', {
    latitude: 41.0082,
    longitude: 28.9784,
  }),
  createProvince(35, 'Izmir', 'izmir', 'Ege', {
    latitude: 38.4237,
    longitude: 27.1428,
  }),
  createProvince(36, 'Kars', 'kars', 'Dogu Anadolu', {
    latitude: 40.607,
    longitude: 43.095,
  }),
  createProvince(37, 'Kastamonu', 'kastamonu', 'Karadeniz', {
    latitude: 41.3887,
    longitude: 33.7827,
  }),
  createProvince(38, 'Kayseri', 'kayseri', 'Ic Anadolu', {
    latitude: 38.7205,
    longitude: 35.4826,
  }),
  createProvince(39, 'Kirklareli', 'kirklareli', 'Marmara', {
    latitude: 41.7351,
    longitude: 27.2252,
  }),
  createProvince(40, 'Kirsehir', 'kirsehir', 'Ic Anadolu', {
    latitude: 39.1461,
    longitude: 34.1595,
  }),
  createProvince(41, 'Kocaeli', 'kocaeli', 'Marmara', {
    latitude: 40.7667,
    longitude: 29.9167,
  }),
  createProvince(42, 'Konya', 'konya', 'Ic Anadolu', {
    latitude: 37.8714,
    longitude: 32.4846,
  }),
  createProvince(43, 'Kutahya', 'kutahya', 'Ege', {
    latitude: 39.4192,
    longitude: 29.9857,
  }),
  createProvince(44, 'Malatya', 'malatya', 'Dogu Anadolu', {
    latitude: 38.3552,
    longitude: 38.3095,
  }),
  createProvince(45, 'Manisa', 'manisa', 'Ege', {
    latitude: 38.6191,
    longitude: 27.4289,
  }),
  createProvince(46, 'Kahramanmaras', 'kahramanmaras', 'Akdeniz', {
    latitude: 37.5753,
    longitude: 36.9228,
  }),
  createProvince(47, 'Mardin', 'mardin', 'Guneydogu Anadolu', {
    latitude: 37.3129,
    longitude: 40.735,
  }),
  createProvince(48, 'Mugla', 'mugla', 'Ege', {
    latitude: 37.2153,
    longitude: 28.3636,
  }),
  createProvince(49, 'Mus', 'mus', 'Dogu Anadolu', {
    latitude: 38.9462,
    longitude: 41.7539,
  }),
  createProvince(50, 'Nevsehir', 'nevsehir', 'Ic Anadolu', {
    latitude: 38.6244,
    longitude: 34.7239,
  }),
  createProvince(51, 'Nigde', 'nigde', 'Ic Anadolu', {
    latitude: 37.9667,
    longitude: 34.6833,
  }),
  createProvince(52, 'Ordu', 'ordu', 'Karadeniz', {
    latitude: 40.9862,
    longitude: 37.8797,
  }),
  createProvince(53, 'Rize', 'rize', 'Karadeniz', {
    latitude: 41.0255,
    longitude: 40.5177,
  }),
  createProvince(54, 'Sakarya', 'sakarya', 'Marmara', {
    latitude: 40.7569,
    longitude: 30.3781,
  }),
  createProvince(55, 'Samsun', 'samsun', 'Karadeniz', {
    latitude: 41.2867,
    longitude: 36.33,
  }),
  createProvince(56, 'Siirt', 'siirt', 'Guneydogu Anadolu', {
    latitude: 37.9333,
    longitude: 41.95,
  }),
  createProvince(57, 'Sinop', 'sinop', 'Karadeniz', {
    latitude: 42.0278,
    longitude: 35.1517,
  }),
  createProvince(58, 'Sivas', 'sivas', 'Ic Anadolu', {
    latitude: 39.7477,
    longitude: 37.0179,
  }),
  createProvince(59, 'Tekirdag', 'tekirdag', 'Marmara', {
    latitude: 40.9781,
    longitude: 27.511,
  }),
  createProvince(60, 'Tokat', 'tokat', 'Karadeniz', {
    latitude: 40.3167,
    longitude: 36.55,
  }),
  createProvince(61, 'Trabzon', 'trabzon', 'Karadeniz', {
    latitude: 41.0027,
    longitude: 39.7168,
  }),
  createProvince(62, 'Tunceli', 'tunceli', 'Dogu Anadolu', {
    latitude: 39.1062,
    longitude: 39.5483,
  }),
  createProvince(63, 'Sanliurfa', 'sanliurfa', 'Guneydogu Anadolu', {
    latitude: 37.1674,
    longitude: 38.7955,
  }),
  createProvince(64, 'Usak', 'usak', 'Ege', {
    latitude: 38.6742,
    longitude: 29.4059,
  }),
  createProvince(65, 'Van', 'van', 'Dogu Anadolu', {
    latitude: 38.5012,
    longitude: 43.373,
  }),
  createProvince(66, 'Yozgat', 'yozgat', 'Ic Anadolu', {
    latitude: 39.8181,
    longitude: 34.8147,
  }),
  createProvince(67, 'Zonguldak', 'zonguldak', 'Karadeniz', {
    latitude: 41.4564,
    longitude: 31.7987,
  }),
  createProvince(68, 'Aksaray', 'aksaray', 'Ic Anadolu', {
    latitude: 38.3687,
    longitude: 34.037,
  }),
  createProvince(69, 'Bayburt', 'bayburt', 'Karadeniz', {
    latitude: 40.2552,
    longitude: 40.2249,
  }),
  createProvince(70, 'Karaman', 'karaman', 'Ic Anadolu', {
    latitude: 37.1811,
    longitude: 33.215,
  }),
  createProvince(71, 'Kirikkale', 'kirikkale', 'Ic Anadolu', {
    latitude: 39.8468,
    longitude: 33.5153,
  }),
  createProvince(72, 'Batman', 'batman', 'Guneydogu Anadolu', {
    latitude: 37.8812,
    longitude: 41.1351,
  }),
  createProvince(73, 'Sirnak', 'sirnak', 'Guneydogu Anadolu', {
    latitude: 37.519,
    longitude: 42.4543,
  }),
  createProvince(74, 'Bartin', 'bartin', 'Karadeniz', {
    latitude: 41.6344,
    longitude: 32.3375,
  }),
  createProvince(75, 'Ardahan', 'ardahan', 'Dogu Anadolu', {
    latitude: 41.1105,
    longitude: 42.7022,
  }),
  createProvince(76, 'Igdir', 'igdir', 'Dogu Anadolu', {
    latitude: 39.9237,
    longitude: 44.045,
  }),
  createProvince(77, 'Yalova', 'yalova', 'Marmara', {
    latitude: 40.655,
    longitude: 29.2769,
  }),
  createProvince(78, 'Karabuk', 'karabuk', 'Karadeniz', {
    latitude: 41.2049,
    longitude: 32.6277,
  }),
  createProvince(79, 'Kilis', 'kilis', 'Guneydogu Anadolu', {
    latitude: 36.7184,
    longitude: 37.1212,
  }),
  createProvince(80, 'Osmaniye', 'osmaniye', 'Akdeniz', {
    latitude: 37.0746,
    longitude: 36.2464,
  }),
  createProvince(81, 'Duzce', 'duzce', 'Karadeniz', {
    latitude: 40.8438,
    longitude: 31.1565,
  }),
]

export const DEFAULT_PROVINCE_ID = '06'

export const PROVINCES_BY_ID = Object.fromEntries(
  PROVINCES.map((province) => [province.id, province]),
) as Record<string, Province>

export const PROVINCES_BY_SLUG = Object.fromEntries(
  PROVINCES.map((province) => [province.slug, province]),
) as Record<string, Province>
