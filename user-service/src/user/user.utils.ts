// src/utils/astro.ts

export type ZodiacSign =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

export type HoroscopeSign =
  | 'Rat'
  | 'Ox'
  | 'Tiger'
  | 'Rabbit'
  | 'Dragon'
  | 'Snake'
  | 'Horse'
  | 'Goat'
  | 'Monkey'
  | 'Rooster'
  | 'Dog'
  | 'Pig';

/**
 * Dapatkan zodiac (sun sign) berdasarkan tanggal lahir.
 * Rentang menggunakan standar Tropikal:
 * Aries (Mar 21–Apr 19), Taurus (Apr 20–May 20), ..., Pisces (Feb 19–Mar 20) :contentReference[oaicite:1]{index=1}
 */
export function getZodiac(date: Date): ZodiacSign {
  const day = date.getDate();
  const month = date.getMonth() + 1; // 1–12

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
    return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
    return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
    return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
    return 'Aquarius';
  return 'Pisces';
}

/**
 * Dapatkan Horoscope (shio) berdasarkan tahun kelahiran.
 * Siklus 12 shio: Rat -> Pig, diulang. Tahun 2020 = Rat.
 */
export function getHoroscope(year: number): HoroscopeSign {
  const signs: HoroscopeSign[] = [
    'Rat',
    'Ox',
    'Tiger',
    'Rabbit',
    'Dragon',
    'Snake',
    'Horse',
    'Goat',
    'Monkey',
    'Rooster',
    'Dog',
    'Pig',
  ];
  // 2020 adalah tahun Rat
  const baseYear = 2020;
  const offset = (year - baseYear) % 12;
  const idx = (offset + 12) % 12;
  return signs[idx];
}
