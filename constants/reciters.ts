import type { Reciter } from '../types';

export const RECITERS: Reciter[] = [
  {
    id: 7,
    name: "Mishary Rashid Al-Afasy",
    slug: "mishaari_raashid_al_3afaasee",
    arabicName: "مشاري بن راشد العفاسي"
  },
  {
    id: 1,
    name: "Abdul Basit Abdul Samad",
    slug: "abdul_basit_abdus_samad_murattal",
    arabicName: "عبد الباسط عبد الصمد"
  },
  {
    id: 4,
    name: "Mahmoud Khalil Al-Hussary",
    slug: "mahmood_khaleel_al-husaree",
    arabicName: "محمود خليل الحصري"
  },
  {
    id: 9,
    name: "Abdur-Rahman as-Sudais",
    slug: "abdurrahmaan_as-sudays",
    arabicName: "عبد الرحمن السديس"
  },
  {
    id: 10,
    name: "Sa'ud ash-Shuraym",
    slug: "sa3ood_al-shuraym",
    arabicName: "سعود الشريم"
  },
  {
    id: 2,
    name: "Sa'd Al-Ghamadi",
    slug: "sa3d_al-ghaamidi",
    arabicName: "سعد الغامدي"
  },
  {
    id: 3,
    name: "Abu Bakr Al-Shatri",
    slug: "abu_bakr_al-shatri",
    arabicName: "أبو بكر الشاطري"
  },
  {
    id: 5,
    name: "Ahmad ibn Ali Al-Ajamy",
    slug: "ahmad_ibn_ali_al-ajamy",
    arabicName: "أحمد بن علي العجمي"
  },
];

export const getReciterById = (id: number): Reciter | undefined => {
  return RECITERS.find(reciter => reciter.id === id);
};

export const getReciterBySlug = (slug: string): Reciter | undefined => {
  return RECITERS.find(reciter => reciter.slug === slug);
};

export const DEFAULT_RECITER_ID = 7; // Mishary Rashid Al-Afasy
