export type Place = {
  name: string;
  wiki: string;
  kind: string;
  note: string;
};

export type Destination = {
  slug: string;
  name: string;
  country: string;
  region: "Europe" | "Asia" | "Americas" | "Africa" | "Oceania";
  tags: Array<"Coast" | "Old town" | "Mountains" | "Desert" | "Islands" | "Food">;
  lat: number;
  lon: number;
  wiki: string;
  tagline: string;
  blurb: string;
  bestMonths: string;
  idealDays: number;
  places: Place[];
};

export const destinations: Destination[] = [
  {
    slug: "lisbon",
    name: "Lisbon",
    country: "Portugal",
    region: "Europe",
    tags: ["Coast", "Old town", "Food"],
    lat: 38.7223,
    lon: -9.1393,
    wiki: "Lisbon",
    tagline: "Tiled hills above a wide, bright river",
    blurb:
      "Seven hills of azulejo facades, trams that groan uphill, and a river the colour of pewter at dawn. Lisbon rewards walking without a plan, then rewards a plan the next day.",
    bestMonths: "March – June, September – October",
    idealDays: 4,
    places: [
      { name: "Belém Tower", wiki: "Belém_Tower", kind: "Monument", note: "Manueline watchtower on the Tagus; go early, the light is softer." },
      { name: "Jerónimos Monastery", wiki: "Jerónimos_Monastery", kind: "Monastery", note: "Stone rigging carved into cloisters. Book a slot ahead." },
      { name: "Alfama", wiki: "Alfama", kind: "District", note: "The oldest quarter — laundry lines, fado, stairs that never end." },
      { name: "São Jorge Castle", wiki: "São_Jorge_Castle", kind: "Castle", note: "Best rooftop view of the city and the bridge." },
      { name: "Tram 28", wiki: "Trams_in_Lisbon", kind: "Ride", note: "A working tram, not an attraction. Ride it at 8am." },
    ],
  },
  {
    slug: "kyoto",
    name: "Kyoto",
    country: "Japan",
    region: "Asia",
    tags: ["Old town", "Food", "Mountains"],
    lat: 35.0116,
    lon: 135.7681,
    wiki: "Kyoto",
    tagline: "A thousand years of restraint, kept in wood",
    blurb:
      "Temple gardens raked before sunrise, machiya townhouses with lanterns at the door, and mountains closing the city in on three sides. Kyoto asks for slowness.",
    bestMonths: "Late March – April, November",
    idealDays: 5,
    places: [
      { name: "Fushimi Inari-taisha", wiki: "Fushimi_Inari-taisha", kind: "Shrine", note: "Ten thousand vermilion gates up a whole mountain. Walk past the crowds." },
      { name: "Kinkaku-ji", wiki: "Kinkaku-ji", kind: "Temple", note: "The golden pavilion, best on a grey day when it stops competing with the sky." },
      { name: "Arashiyama Bamboo Grove", wiki: "Sagano_Bamboo_Forest", kind: "Grove", note: "Arrive before 7am or don't bother." },
      { name: "Gion", wiki: "Gion", kind: "District", note: "Wooden teahouse streets. Walk them at dusk, quietly." },
      { name: "Kiyomizu-dera", wiki: "Kiyomizu-dera", kind: "Temple", note: "A veranda built without nails, hanging over the hillside." },
    ],
  },
  {
    slug: "reykjavik",
    name: "Reykjavík",
    country: "Iceland",
    region: "Europe",
    tags: ["Coast", "Mountains", "Islands"],
    lat: 64.1466,
    lon: -21.9426,
    wiki: "Reykjavík",
    tagline: "A small capital with enormous weather",
    blurb:
      "Corrugated iron houses in primary colours, a harbour that smells of diesel and salt, and everything wild beginning fifteen minutes out of town.",
    bestMonths: "June – August, or February for aurora",
    idealDays: 4,
    places: [
      { name: "Hallgrímskirkja", wiki: "Hallgrímskirkja", kind: "Church", note: "Basalt-column concrete tower; the lift up is worth the queue." },
      { name: "Harpa", wiki: "Harpa_(concert_hall)", kind: "Concert hall", note: "A glass honeycomb on the water that changes colour with the sky." },
      { name: "Blue Lagoon", wiki: "Blue_Lagoon_(geothermal_spa)", kind: "Spa", note: "Milk-blue geothermal water in a lava field. Pre-book." },
      { name: "Þingvellir", wiki: "Þingvellir", kind: "National park", note: "A parliament founded in 930, in a rift between continents." },
      { name: "Gullfoss", wiki: "Gullfoss", kind: "Waterfall", note: "Two drops into a canyon; you will get wet." },
    ],
  },
  {
    slug: "marrakesh",
    name: "Marrakesh",
    country: "Morocco",
    region: "Africa",
    tags: ["Old town", "Desert", "Food"],
    lat: 31.6295,
    lon: -7.9811,
    wiki: "Marrakesh",
    tagline: "Red walls, cold courtyards, hot squares",
    blurb:
      "The medina is a single continuous negotiation. Step through any keyhole door and the noise stops dead in a tiled courtyard with a lemon tree.",
    bestMonths: "October – April",
    idealDays: 3,
    places: [
      { name: "Jemaa el-Fnaa", wiki: "Jemaa_el-Fnaa", kind: "Square", note: "Empty at noon, a whole city after dark." },
      { name: "Koutoubia Mosque", wiki: "Kutubiyya_Mosque", kind: "Mosque", note: "The minaret that every other one in the region copies." },
      { name: "Bahia Palace", wiki: "Bahia_Palace", kind: "Palace", note: "Painted cedar ceilings, rooms built for shade." },
      { name: "Jardin Majorelle", wiki: "Majorelle_Garden", kind: "Garden", note: "Cobalt walls and cacti. First entry slot only." },
      { name: "Medina souks", wiki: "Medina_of_Marrakesh", kind: "Market", note: "Get lost deliberately; the dyers' alley is the prize." },
    ],
  },
  {
    slug: "queenstown",
    name: "Queenstown",
    country: "New Zealand",
    region: "Oceania",
    tags: ["Mountains", "Coast"],
    lat: -45.0312,
    lon: 168.6626,
    wiki: "Queenstown,_New_Zealand",
    tagline: "A lake town under serrated peaks",
    blurb:
      "The Remarkables do exactly what their name promises. Everything here is engineered around getting you up a mountain and back before dinner.",
    bestMonths: "December – March, June – August for snow",
    idealDays: 5,
    places: [
      { name: "Lake Wakatipu", wiki: "Lake_Wakatipu", kind: "Lake", note: "Z-shaped, glacier-cold, still as glass at 6am." },
      { name: "The Remarkables", wiki: "The_Remarkables", kind: "Range", note: "Ski field in winter, ridgeline walks in summer." },
      { name: "Milford Sound", wiki: "Milford_Sound", kind: "Fiord", note: "A long day trip. Go on a wet day — the waterfalls appear." },
      { name: "Skyline Gondola", wiki: "Skyline_Queenstown", kind: "Viewpoint", note: "Steepest cable car lift in the southern hemisphere." },
      { name: "Arrowtown", wiki: "Arrowtown", kind: "Village", note: "Gold-rush cottages; go in April for the poplars." },
    ],
  },
  {
    slug: "oaxaca",
    name: "Oaxaca",
    country: "Mexico",
    region: "Americas",
    tags: ["Old town", "Food", "Mountains"],
    lat: 17.0732,
    lon: -96.7266,
    wiki: "Oaxaca_City",
    tagline: "The best food in the country, in low pastel streets",
    blurb:
      "Green stone churches, markets that run on mole and mezcal, and Zapotec ruins on the ridge above town. Eat first, sightsee after.",
    bestMonths: "October – April",
    idealDays: 4,
    places: [
      { name: "Monte Albán", wiki: "Monte_Albán", kind: "Ruins", note: "A levelled mountaintop capital, 500 BC. Go at opening." },
      { name: "Santo Domingo de Guzmán", wiki: "Templo_de_Santo_Domingo_de_Guzmán", kind: "Church", note: "Gilt ceiling that stops conversation." },
      { name: "Mercado 20 de Noviembre", wiki: "Oaxaca_City", kind: "Market", note: "The smoke hall — pick your meat, they grill it in front of you." },
      { name: "Hierve el Agua", wiki: "Hierve_el_Agua", kind: "Springs", note: "Petrified waterfall and mineral pools over a valley." },
      { name: "Teotitlán del Valle", wiki: "Teotitlán_del_Valle", kind: "Village", note: "Weavers using cochineal and indigo, as they always have." },
    ],
  },
  {
    slug: "santorini",
    name: "Santorini",
    country: "Greece",
    region: "Europe",
    tags: ["Islands", "Coast", "Food"],
    lat: 36.3932,
    lon: 25.4615,
    wiki: "Santorini",
    tagline: "A drowned volcano with villages on the rim",
    blurb:
      "The caldera edge is the whole point: white cubes stacked over a 300-metre drop into blue water. Stay a night longer than you planned and go inland.",
    bestMonths: "May – June, September – October",
    idealDays: 4,
    places: [
      { name: "Oia", wiki: "Oia,_Greece", kind: "Village", note: "Famous for sunset, better at 7am with a coffee." },
      { name: "Akrotiri", wiki: "Akrotiri_(prehistoric_city)", kind: "Ruins", note: "A Bronze Age town under volcanic ash. Extraordinary and cool." },
      { name: "Fira", wiki: "Fira", kind: "Town", note: "The capital on the rim; the cliff path to Oia starts here." },
      { name: "Red Beach", wiki: "Santorini", kind: "Beach", note: "Iron-red cliffs over dark sand. Arrive by boat." },
      { name: "Pyrgos", wiki: "Pyrgos_Kallistis", kind: "Village", note: "The old inland capital — no crowds, best tavernas." },
    ],
  },
  {
    slug: "hanoi",
    name: "Hanoi",
    country: "Vietnam",
    region: "Asia",
    tags: ["Old town", "Food"],
    lat: 21.0278,
    lon: 105.8342,
    wiki: "Hanoi",
    tagline: "Lake mist, low stools, and a million motorbikes",
    blurb:
      "A French-colonial grid pressed onto a thousand-year-old quarter. Breakfast is phở on a plastic stool at 6am and it will be the best thing you eat.",
    bestMonths: "October – December, March – April",
    idealDays: 3,
    places: [
      { name: "Hoàn Kiếm Lake", wiki: "Hoàn_Kiếm_Lake", kind: "Lake", note: "The city's living room. Weekend evenings the roads close." },
      { name: "Old Quarter", wiki: "Hanoi_Old_Quarter", kind: "District", note: "36 streets, each historically one trade." },
      { name: "Temple of Literature", wiki: "Temple_of_Literature,_Hanoi", kind: "Temple", note: "Vietnam's first university, 1070. Courtyards of stelae." },
      { name: "Hỏa Lò Prison", wiki: "Hỏa_Lò_Prison", kind: "Museum", note: "Heavy, well presented, worth an hour." },
      { name: "Hạ Long Bay", wiki: "Hạ_Long_Bay", kind: "Bay", note: "Limestone karsts in jade water; an overnight, not a day trip." },
    ],
  },
];

export const allTags = ["Coast", "Old town", "Mountains", "Desert", "Islands", "Food"] as const;

export function getDestination(slug: string) {
  return destinations.find((d) => d.slug === slug);
}
