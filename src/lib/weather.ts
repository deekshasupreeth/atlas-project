/** Live weather via Open-Meteo (no key required) + place search / reverse lookup. */

export type Weather = {
  temperature: number;
  feelsLike: number;
  windSpeed: number;
  humidity: number;
  code: number;
  isDay: boolean;
  summary: string;
  daily: Array<{ date: string; min: number; max: number; code: number }>;
};

export type GeoPlace = {
  name: string;
  country: string;
  admin?: string;
  lat: number;
  lon: number;
};

const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Freezing fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Rain showers",
  82: "Violent showers",
  85: "Snow showers",
  86: "Snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with hail",
};

export function describeWeather(code: number) {
  return WEATHER_CODES[code] ?? "Unsettled";
}

export async function fetchWeather(lat: number, lon: number, signal?: AbortSignal): Promise<Weather> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;
  const res = await fetch(url, { signal: signal ?? null });
  if (!res.ok) throw new Error(`Weather service returned ${res.status}`);
  const data = (await res.json()) as {
    current: Record<string, number>;
    daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[] };
  };
  const code = data.current["weather_code"] ?? 0;
  return {
    temperature: Math.round(data.current["temperature_2m"] ?? 0),
    feelsLike: Math.round(data.current["apparent_temperature"] ?? 0),
    windSpeed: Math.round(data.current["wind_speed_10m"] ?? 0),
    humidity: Math.round(data.current["relative_humidity_2m"] ?? 0),
    code,
    isDay: (data.current["is_day"] ?? 1) === 1,
    summary: describeWeather(code),
    daily: data.daily.time.slice(0, 5).map((date, i) => ({
      date,
      min: Math.round(data.daily.temperature_2m_min[i] ?? 0),
      max: Math.round(data.daily.temperature_2m_max[i] ?? 0),
      code: data.daily.weather_code[i] ?? 0,
    })),
  };
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeoPlace[]> {
  if (query.trim().length < 2) return [];
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`,
    { signal: signal ?? null },
  );
  if (!res.ok) throw new Error(`Place search returned ${res.status}`);
  const data = (await res.json()) as {
    results?: Array<{ name: string; country?: string; admin1?: string; latitude: number; longitude: number }>;
  };
  return (data.results ?? []).map((r) => ({
    name: r.name,
    country: r.country ?? "",
    admin: r.admin1,
    lat: r.latitude,
    lon: r.longitude,
  }));
}

export async function reverseLookup(lat: number, lon: number, signal?: AbortSignal): Promise<GeoPlace> {
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
    { signal: signal ?? null },
  );
  if (!res.ok) return { name: "Your location", country: "", lat, lon };
  const data = (await res.json()) as { city?: string; locality?: string; countryName?: string; principalSubdivision?: string };
  return {
    name: data.city || data.locality || "Your location",
    country: data.countryName ?? "",
    admin: data.principalSubdivision,
    lat,
    lon,
  };
}
