// Seeds mock page_views into the local DB so the admin analytics has data.
// Usage: node scripts/seed-pageviews.cjs [count]
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const COUNT = Number(process.argv[2]) || 900;
const DAYS = 30;

const PATHS = [
  ["/", 40],
  ["/candidatar", 18],
  ["/juri", 12],
  ["/o-que-deve-ser-entregue", 8],
  ["/contacto", 8],
  ["/termos", 4],
  ["/privacidade", 4],
  ["/entrar", 6],
];

// PT districts: [DI code, city, lat, lng, weight]
const PT_DISTRICTS = [
  ["11", "Lisboa", 38.72, -9.14, 32],
  ["13", "Porto", 41.15, -8.61, 20],
  ["03", "Braga", 41.55, -8.42, 8],
  ["01", "Aveiro", 40.64, -8.65, 6],
  ["06", "Coimbra", 40.21, -8.43, 6],
  ["15", "Setúbal", 38.52, -8.89, 6],
  ["08", "Faro", 37.02, -7.93, 5],
  ["10", "Leiria", 39.74, -8.81, 4],
  ["18", "Viseu", 40.66, -7.91, 3],
  ["14", "Santarém", 39.24, -8.69, 3],
  ["07", "Évora", 38.57, -7.91, 2],
  ["16", "Viana do Castelo", 41.69, -8.83, 2],
];

// Other countries: [ISO, region, city, weight]
const COUNTRIES = [
  ["BR", "SP", "São Paulo", 7],
  ["ES", "MD", "Madrid", 4],
  ["FR", "IDF", "Paris", 3],
  ["GB", "ENG", "London", 3],
  ["DE", "BE", "Berlin", 2],
  ["US", "NY", "New York", 2],
  ["CH", "ZH", "Zürich", 1],
  ["LU", "LU", "Luxembourg", 1],
];

function pickWeighted(items, weightIndex) {
  const total = items.reduce((s, it) => s + it[weightIndex], 0);
  let r = Math.random() * total;
  for (const it of items) {
    r -= it[weightIndex];
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

function randomDate() {
  // Bias toward recent days.
  const daysAgo = Math.floor(Math.pow(Math.random(), 1.6) * DAYS);
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
  return d;
}

async function main() {
  const rows = [];
  for (let i = 0; i < COUNT; i++) {
    const path = pickWeighted(PATHS, 1)[0];
    const createdAt = randomDate();
    const isPt = Math.random() < 0.78;

    if (isPt) {
      const [code, city, lat, lng] = pickWeighted(PT_DISTRICTS, 4);
      const precise = Math.random() < 0.12;
      rows.push({
        path,
        country: "PT",
        region: code,
        city,
        createdAt,
        precise,
        latitude: precise ? lat + (Math.random() - 0.5) * 0.3 : null,
        longitude: precise ? lng + (Math.random() - 0.5) * 0.3 : null,
      });
    } else {
      const [country, region, city] = pickWeighted(COUNTRIES, 3);
      rows.push({ path, country, region, city, createdAt, precise: false, latitude: null, longitude: null });
    }
  }

  await prisma.pageView.createMany({ data: rows });
  const total = await prisma.pageView.count();
  console.log(`Inserted ${rows.length} mock page views. Total now: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
