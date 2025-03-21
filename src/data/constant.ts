import { subDays } from "date-fns";
import { SQL, sql } from "drizzle-orm";

export const CHART_INTERVALS = {
  last7days: {
    dateFormatter: (date: Date) => dateFormatter.format(date),
    startDate: subDays(new Date(), 7),
    label: "Last 7 days",
    sql: sql`GENERATE_SERIES(current_date - 7, current_date, '1 day'::interval) as series`,
    dateGrouper: (col: SQL | SQL.Aliased) => sql<string>`DATE(${col})`.inlineParams(),
  },
  last30days: {
    dateFormatter: (date: Date) => dateFormatter.format(date),
    startDate: subDays(new Date(), 30),
    label: "Last 30 days",
    sql: sql`GENERATE_SERIES(current_date - 30, current_date, '1 day'::interval) as series`,
    dateGrouper: (col: SQL | SQL.Aliased) => sql<string>`DATE(${col})`.inlineParams(),
  },
  last90days: {
    dateFormatter: (date: Date) => dateFormatter.format(date),
    startDate: subDays(new Date(), 90),
    label: "Last 90 days",
    sql: sql`GENERATE_SERIES(DATE_TRUNC('week',current_date - 90), DATE_TRUNC('week', current_date), '1 week'::interval) as series`,
    dateGrouper: (col: SQL | SQL.Aliased) => sql<string>`DATE_TRUNC('week', ${col})`.inlineParams(),
  },
  last365days: {
    dateFormatter: (date: Date) => monthFormatter.format(date),
    startDate: subDays(new Date(), 365),
    label: "Last 365 days",
    sql: sql`GENERATE_SERIES(DATE_TRUNC('month', current_date - 365), DATE_TRUNC('month', current_date), '1 month'::interval) as series`,
    dateGrouper: (col: SQL | SQL.Aliased) => sql<string>`DATE_TRUNC('month',${col})`.inlineParams(),
  },
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
  timeZone: "UTC",
});

const monthFormatter = new Intl.DateTimeFormat(undefined, {
  year: "2-digit",
  month: "short",
  timeZone: "UTC",
});
