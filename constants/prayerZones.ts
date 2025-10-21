export interface PrayerZone {
  code: string;
  name: string;
  state: string;
  district?: string;
}

// Malaysia Prayer Zones (JAKIM)
export const PRAYER_ZONES: PrayerZone[] = [
  // Johor
  { code: 'JHR01', name: 'Pulau Aur dan Pulau Pemanggil', state: 'Johor' },
  { code: 'JHR02', name: 'Johor Bahru, Kota Tinggi, Mersing, Kulai', state: 'Johor' },
  { code: 'JHR03', name: 'Kluang, Pontian', state: 'Johor' },
  { code: 'JHR04', name: 'Batu Pahat, Muar, Segamat, Gemas', state: 'Johor' },

  // Kedah
  { code: 'KDH01', name: 'Kota Setar, Kubang Pasu, Pokok Sena', state: 'Kedah' },
  { code: 'KDH02', name: 'Kuala Muda, Yan, Pendang', state: 'Kedah' },
  { code: 'KDH03', name: 'Padang Terap, Sik', state: 'Kedah' },
  { code: 'KDH04', name: 'Baling', state: 'Kedah' },
  { code: 'KDH05', name: 'Bandar Baharu, Kulim', state: 'Kedah' },
  { code: 'KDH06', name: 'Langkawi', state: 'Kedah' },
  { code: 'KDH07', name: 'Gunung Jerai', state: 'Kedah' },

  // Kelantan
  { code: 'KTN01', name: 'Kota Bharu, Pasir Mas, Tumpat, Pasir Puteh, Bachok', state: 'Kelantan' },
  { code: 'KTN03', name: 'Jeli, Gua Musang (Mukim Galas, Bertam)', state: 'Kelantan' },

  // Melaka
  { code: 'MLK01', name: 'Melaka', state: 'Melaka' },

  // Negeri Sembilan
  { code: 'NGS01', name: 'Tampin, Jempol', state: 'Negeri Sembilan' },
  { code: 'NGS02', name: 'Port Dickson, Seremban, Kuala Pilah, Jelebu, Rembau', state: 'Negeri Sembilan' },

  // Pahang
  { code: 'PHG01', name: 'Pulau Tioman', state: 'Pahang' },
  { code: 'PHG02', name: 'Kuantan, Pekan, Rompin, Muadzam Shah', state: 'Pahang' },
  { code: 'PHG03', name: 'Jerantut, Temerloh, Maran, Bera, Chenor, Jengka', state: 'Pahang' },
  { code: 'PHG04', name: 'Bentong, Lipis, Raub', state: 'Pahang' },
  { code: 'PHG05', name: 'Genting Highlands, Bukit Tinggi, Cameron Highlands', state: 'Pahang' },
  { code: 'PHG06', name: 'Bukit Fraser', state: 'Pahang' },

  // Perlis
  { code: 'PLS01', name: 'Perlis', state: 'Perlis' },

  // Penang
  { code: 'PNG01', name: 'Pulau Pinang', state: 'Penang' },

  // Perak
  { code: 'PRK01', name: 'Tapah, Slim River, Tanjung Malim', state: 'Perak' },
  { code: 'PRK02', name: 'Ipoh, Batu Gajah, Kampar, Sg. Siput, Kuala Kangsar', state: 'Perak' },
  { code: 'PRK03', name: 'Pengkalan Hulu, Grik, Lenggong', state: 'Perak' },
  { code: 'PRK04', name: 'Temengor, Belum', state: 'Perak' },
  { code: 'PRK05', name: 'Kg. Gajah, Teluk Intan, Bagan Datuk, Seri Iskandar', state: 'Perak' },
  { code: 'PRK06', name: 'Lumut, Sitiawan, Pulau Pangkor', state: 'Perak' },
  { code: 'PRK07', name: 'Selama, Taiping, Bagan Serai, Parit Buntar', state: 'Perak' },

  // Sabah
  { code: 'SBH01', name: 'Sandakan, Bdr. Bkt. Garam, Semawang, Temanggong, Tambisan', state: 'Sabah' },
  { code: 'SBH02', name: 'Pinangah, Terusan, Beluran, Kuamut, Telupit', state: 'Sabah' },
  { code: 'SBH03', name: 'Lahad Datu, Kunak, Silabukan, Tungku, Sahabat, Semporna', state: 'Sabah' },
  { code: 'SBH04', name: 'Tawau, Balong, Merotai, Kalabakan', state: 'Sabah' },
  { code: 'SBH05', name: 'Kudat, Kota Marudu, Pitas, Pulau Banggi', state: 'Sabah' },
  { code: 'SBH06', name: 'Gunung Kinabalu', state: 'Sabah' },
  { code: 'SBH07', name: 'Papar, Ranau, Kota Belud, Tuaran, Penampang, Kota Kinabalu', state: 'Sabah' },
  { code: 'SBH08', name: 'Putatan, Penampang, Papar, Tuaran, Kota Kinabalu', state: 'Sabah' },
  { code: 'SBH09', name: 'Beaufort, Kuala Penyu, Sipitang, Tenom, Long Pa Sia', state: 'Sabah' },

  // Sarawak
  { code: 'SWK01', name: 'Kuching, Bau, Lundu, Sematan', state: 'Sarawak' },
  { code: 'SWK02', name: 'Betong, Saratok, Debak, Kabong, Pusa, Spaoh', state: 'Sarawak' },
  { code: 'SWK03', name: 'Sibu, Sarikei, Dalat, Oya, Mukah, Kapit, Song, Kanowit', state: 'Sarawak' },
  { code: 'SWK04', name: 'Miri, Niah, Bekenu, Sibuti, Marudi', state: 'Sarawak' },
  { code: 'SWK05', name: 'Limbang, Sundar, Terusan, Lawas', state: 'Sarawak' },
  { code: 'SWK06', name: 'Bintulu, Tatau, Sebauh', state: 'Sarawak' },
  { code: 'SWK07', name: 'Simunjan, Serian, Samarahan', state: 'Sarawak' },
  { code: 'SWK08', name: 'Belaga, Baram, Long Lama, Long Akah', state: 'Sarawak' },
  { code: 'SWK09', name: 'Lawas, Sundar, Trusan', state: 'Sarawak' },

  // Selangor
  { code: 'SGR01', name: 'Gombak, Petaling, Sepang, Hulu Langat, Hulu Selangor, Rawang, S.Alam', state: 'Selangor' },
  { code: 'SGR02', name: 'Kuala Selangor, Sabak Bernam', state: 'Selangor' },
  { code: 'SGR03', name: 'Klang, Kuala Langat', state: 'Selangor' },

  // Terengganu
  { code: 'TRG01', name: 'Kuala Terengganu, Marang', state: 'Terengganu' },
  { code: 'TRG02', name: 'Besut, Setiu', state: 'Terengganu' },
  { code: 'TRG03', name: 'Hulu Terengganu', state: 'Terengganu' },
  { code: 'TRG04', name: 'Dungun, Kemaman', state: 'Terengganu' },

  // Wilayah Persekutuan
  { code: 'WLY01', name: 'Kuala Lumpur', state: 'Wilayah Persekutuan' },
  { code: 'WLY02', name: 'Labuan', state: 'Wilayah Persekutuan' },
  { code: 'WLY03', name: 'Putrajaya', state: 'Wilayah Persekutuan' },
];

export function getPrayerZoneByCode(code: string): PrayerZone | undefined {
  return PRAYER_ZONES.find(zone => zone.code === code);
}

export function getPrayerZonesByState(state: string): PrayerZone[] {
  return PRAYER_ZONES.filter(zone => zone.state === state);
}

export function getAllStates(): string[] {
  return Array.from(new Set(PRAYER_ZONES.map(zone => zone.state))).sort();
}

export const DEFAULT_PRAYER_ZONE = 'WLY01'; // Kuala Lumpur
