// Static fallback data — used while API response is loading
export const bikeDataFallback = {
  brand: "Kawasaki",
  model: "Z900RS",
  year: 2023,
  color: "Candy Emerald Green",
  engine: "948 cc inline-4",
  power: "111 hp @ 8,500 rpm",
  torque: "98.5 Nm @ 6,600 rpm",
  weight: "214 kg (dry)",
  topSpeed: "225 km/h (est.)",
  mileage: "12,450 km",
  heroVideo: "/hero.mp4",
  story: {
    en: "This is where your personal story goes. Write about how you got into motorcycles, what drew you to this particular bike, memorable rides, and what riding means to you. Replace this placeholder with your own words.",
    fr: "C'est ici que va votre histoire personnelle. Écrivez comment vous êtes entré dans le monde de la moto, ce qui vous a attiré vers cette machine en particulier, vos sorties mémorables, et ce que rouler signifie pour vous. Remplacez ce texte par vos propres mots.",
    ro: "Aici vine povestea ta personală. Scrie despre cum ai intrat în lumea motocicletelor, ce te-a atras la această motocicletă în particular, turele memorabile și ce înseamnă mersul pe motocicletă pentru tine. Înlocuiește acest text cu propriile tale cuvinte.",
  },
  photos: [
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1920&q=85",
    "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=800&q=85",
    "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=85",
    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=85",
    "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&q=85",
  ],
};

/**
 * Normalizes the API response (snake_case) to the shape the frontend expects (camelCase).
 */
export function normalizeBike(apiData) {
  if (!apiData) return bikeDataFallback;
  return {
    brand: apiData.brand || bikeDataFallback.brand,
    model: apiData.model || bikeDataFallback.model,
    year: apiData.year || bikeDataFallback.year,
    color: apiData.color || bikeDataFallback.color,
    engine: apiData.engine || bikeDataFallback.engine,
    power: apiData.power || bikeDataFallback.power,
    torque: apiData.torque || bikeDataFallback.torque,
    weight: apiData.weight || bikeDataFallback.weight,
    topSpeed: apiData.top_speed || bikeDataFallback.topSpeed,
    mileage: apiData.mileage || bikeDataFallback.mileage,
    heroVideo: apiData.hero_video || null,
    story: {
      en: apiData.story_en || bikeDataFallback.story.en,
      fr: apiData.story_fr || bikeDataFallback.story.fr,
      ro: apiData.story_ro || bikeDataFallback.story.ro,
    },
    photos: apiData.photos?.length ? apiData.photos : bikeDataFallback.photos,
  };
}
