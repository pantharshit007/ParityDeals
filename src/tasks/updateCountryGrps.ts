import { sql } from "drizzle-orm";
import { db } from "@/drizzle/db";
import countriesByDiscount from "@/data/countriesByDiscount.json";
import { CountryGroupTable, CountryTable } from "@/drizzle/schema";
// doesnt work on standalone react <19.0.0
// import { CACHE_TAGS, revalidateDbCache } from "@/lib/cache";

const grpCount = await updateCountryGrps();
const countryCount = await updateCountries();

console.log(`[UPDATE]: Updated ${grpCount} country groups and ${countryCount} countries`);

async function updateCountryGrps() {
  const countryGrpInsertData = countriesByDiscount.map((grp) => ({
    name: grp.name,
    recommendedDiscountPercentage: grp.recommendedDiscountPercentage,
  }));

  const { rowCount } = await db
    .insert(CountryGroupTable)
    .values(countryGrpInsertData)
    .onConflictDoUpdate({
      target: CountryGroupTable.name,
      set: {
        // get the value of the excluded column and use it in the update
        recommendedDiscountPercentage: sql.raw(
          `excluded.${CountryGroupTable.recommendedDiscountPercentage.name}`
        ),
      },
    });

  //   revalidateDbCache({ tag: CACHE_TAGS.COUNTRY_GROUPS });

  return rowCount;
}

async function updateCountries() {
  const countryGrps = await db.query.CountryGroupTable.findMany({
    columns: { id: true, name: true },
  });

  const countryInsertData = countriesByDiscount.flatMap(({ name, countries }) => {
    const countryGrp = countryGrps.find((grp) => grp.name === name);
    if (!countryGrp) throw new Error(`Country group ${name} not found`);

    return countries.map((country) => ({
      name: country.countryName,
      code: country.country,
      countryGroupId: countryGrp.id,
    }));
  });

  const { rowCount } = await db
    .insert(CountryTable)
    .values(countryInsertData)
    .onConflictDoUpdate({
      target: CountryTable.code,
      set: {
        name: sql.raw(`excluded.${CountryTable.name.name}`),
        countryGroupId: sql.raw(`excluded.${CountryTable.countryGroupId.name}`),
      },
    });

  //   revalidateDbCache({ tag: CACHE_TAGS.COUNTRIES });

  return rowCount;
}

export {};
