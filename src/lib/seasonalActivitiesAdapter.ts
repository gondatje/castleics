const DAY_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
] as const;

const DAY_ALIASES = new Map<string, typeof DAY_ORDER[number]>([
  ['mon', 'Monday'],
  ['monday', 'Monday'],
  ['tue', 'Tuesday'],
  ['tues', 'Tuesday'],
  ['tuesday', 'Tuesday'],
  ['wed', 'Wednesday'],
  ['weds', 'Wednesday'],
  ['wednesday', 'Wednesday'],
  ['thu', 'Thursday'],
  ['thur', 'Thursday'],
  ['thurs', 'Thursday'],
  ['thursday', 'Thursday'],
  ['fri', 'Friday'],
  ['friday', 'Friday'],
  ['sat', 'Saturday'],
  ['saturday', 'Saturday'],
  ['sun', 'Sunday'],
  ['sunday', 'Sunday']
]);

type DayName = typeof DAY_ORDER[number];

type RawActivity = {
  title: string;
  start: string;
  end: string;
};

type RawSeason = {
  label: string;
  name: string;
  range: string;
  days: Record<string, RawActivity[]>;
};

type RawSeasonalActivities = {
  seasons: RawSeason[];
};

type NormalizedActivity = {
  title: string;
  start: string;
  end: string;
  startLabel: string;
  endLabel: string;
  timeRangeText: string;
  copyText: string;
};

type NormalizedSeason = {
  id: string;
  label: string;
  name: string;
  range: string;
  startDateISO: string;
  endDateISO: string;
  startKey: number;
  endKey: number;
  startMonth: number;
  startDay: number;
  startYear: number;
  days: Record<DayName, NormalizedActivity[]>;
};

type SeasonalLookupInput =
  | Date
  | string
  | [string, string]
  | {
      season?: string;
      seasonId?: string;
      seasonName?: string;
      day?: string;
      weekday?: string;
      dayOfWeek?: string;
    };

const MONTHS = new Map<string, number>([
  ['january', 1],
  ['jan', 1],
  ['february', 2],
  ['feb', 2],
  ['march', 3],
  ['mar', 3],
  ['april', 4],
  ['apr', 4],
  ['may', 5],
  ['june', 6],
  ['jun', 6],
  ['july', 7],
  ['jul', 7],
  ['august', 8],
  ['aug', 8],
  ['september', 9],
  ['sept', 9],
  ['sep', 9],
  ['october', 10],
  ['oct', 10],
  ['november', 11],
  ['nov', 11],
  ['december', 12],
  ['dec', 12]
]);

const JS_DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
] as const;

const rawSeasonalData: RawSeasonalActivities = await loadRawSeasonalData();
const normalizedSeasons = normalizeSeasons(rawSeasonalData);
const seasonIndex = buildSeasonIndex(normalizedSeasons);

type SeasonLookupResult = {
  season?: NormalizedSeason;
  day: DayName;
};

export type { NormalizedActivity, NormalizedSeason, SeasonalLookupInput };

export function getActivitiesFor(input: SeasonalLookupInput): NormalizedActivity[] {
  const { season, day } = resolveSeasonAndDay(input);
  if (!season) return [];
  const activities = season.days[day] ?? [];
  return activities.map((activity) => ({ ...activity }));
}

if (typeof globalThis !== 'undefined' && typeof (globalThis as Record<string, unknown>).document !== 'undefined') {
  (globalThis as Record<string, unknown>).__seasonalActivitiesGetActivitiesFor = getActivitiesFor;
}

async function loadRawSeasonalData(): Promise<RawSeasonalActivities> {
  if (typeof fetch === 'function' && typeof document !== 'undefined') {
    const response = await fetch(new URL('../data/seasonalActivities.json', import.meta.url));
    if (!response.ok) {
      throw new Error(`Failed to load seasonal activities: ${response.status}`);
    }
    return (await response.json()) as RawSeasonalActivities;
  }

  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const { dirname, resolve } = await import('node:path');

  const filePath = resolve(dirname(fileURLToPath(import.meta.url)), '../data/seasonalActivities.json');
  const json = await readFile(filePath, 'utf8');
  return JSON.parse(json) as RawSeasonalActivities;
}

function normalizeSeasons(raw: RawSeasonalActivities): NormalizedSeason[] {
  const seasons: NormalizedSeason[] = [];
  let yearCursor = extractYear(raw.seasons[0]) ?? new Date().getFullYear();

  raw.seasons.forEach((season, index) => {
    const { start, end } = parseRange(season.range);
    if (!start || !end) {
      throw new Error(`Invalid date range for season: ${season.label}`);
    }

    if (index === 0 && extractYear(season) !== undefined) {
      yearCursor = extractYear(season)!;
    }

    const prev = seasons[seasons.length - 1];
    if (prev) {
      if (start.month < prev.startMonth || (start.month === prev.startMonth && start.day <= prev.startDay)) {
        yearCursor = prev.startYear + 1;
      } else {
        yearCursor = prev.startYear;
      }
    }

    const startYear = yearCursor;
    let endYear = startYear;
    if (end.month < start.month || (end.month === start.month && end.day < start.day)) {
      endYear = startYear + 1;
    }

    const id = slugify(season.label || season.name);
    const normalizedDays: Record<DayName, NormalizedActivity[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    };

    for (const dayName of DAY_ORDER) {
      const rawActivities = season.days[dayName] ?? [];
      const normalizedActivities = rawActivities
        .map((activity) => normalizeActivity(activity))
        .sort((a, b) => a.start.localeCompare(b.start));
      normalizedDays[dayName] = normalizedActivities;
    }

    seasons.push({
      id,
      label: season.label,
      name: season.name,
      range: season.range,
      startDateISO: toISODate(startYear, start.month, start.day),
      endDateISO: toISODate(endYear, end.month, end.day),
      startKey: toDateKey(startYear, start.month, start.day),
      endKey: toDateKey(endYear, end.month, end.day),
      startMonth: start.month,
      startDay: start.day,
      startYear,
      days: normalizedDays
    });
  });

  return seasons;
}

function normalizeActivity(activity: RawActivity): NormalizedActivity {
  const startLabel = formatTimeLabel(activity.start);
  const endLabel = formatTimeLabel(activity.end);
  return {
    title: activity.title,
    start: activity.start,
    end: activity.end,
    startLabel,
    endLabel,
    timeRangeText: `${startLabel} – ${endLabel}`,
    copyText: `${startLabel} - ${endLabel} | ${activity.title}`
  };
}

function buildSeasonIndex(seasons: NormalizedSeason[]): Map<string, NormalizedSeason> {
  const map = new Map<string, NormalizedSeason>();
  seasons.forEach((season) => {
    const keys = new Set<string>();
    keys.add(season.id);
    keys.add(slugify(season.name));
    keys.add(slugify(season.label));
    keys.add(season.label.toLowerCase());
    keys.add(season.name.toLowerCase());
    keys.add(season.id.toLowerCase());
    for (const key of keys) {
      map.set(key, season);
    }
  });
  return map;
}

function resolveSeasonAndDay(input: SeasonalLookupInput): SeasonLookupResult {
  if (input instanceof Date) {
    const day = JS_DAY_NAMES[input.getDay()] as DayName;
    const key = toComparableKey(input);
    const season = normalizedSeasons.find((candidate) => key >= candidate.startKey && key <= candidate.endKey);
    return { season, day };
  }

  if (Array.isArray(input)) {
    const [seasonKey, dayKey] = input;
    return {
      season: lookupSeason(seasonKey),
      day: normalizeDay(dayKey)
    };
  }

  if (typeof input === 'object' && input !== null) {
    const seasonKey = input.season ?? input.seasonId ?? input.seasonName;
    const dayKey = input.weekday ?? input.dayOfWeek ?? input.day;
    return {
      season: lookupSeason(seasonKey),
      day: normalizeDay(dayKey)
    };
  }

  if (typeof input === 'string') {
    const parsed = parseSeasonDayString(input);
    return {
      season: lookupSeason(parsed.seasonKey),
      day: normalizeDay(parsed.dayKey)
    };
  }

  throw new Error('Unsupported lookup input.');
}

function normalizeDay(value?: string): DayName {
  if (!value) throw new Error('Day is required for lookup.');
  const trimmed = value.trim().toLowerCase();
  const mapped = DAY_ALIASES.get(trimmed);
  if (mapped) return mapped;
  for (const day of DAY_ORDER) {
    if (day.toLowerCase() === trimmed) return day;
  }
  throw new Error(`Unknown day: ${value}`);
}

function lookupSeason(value?: string): NormalizedSeason | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const slug = slugify(trimmed);
  return seasonIndex.get(slug) ?? seasonIndex.get(trimmed.toLowerCase()) ?? seasonIndex.get(trimmed);
}

function parseSeasonDayString(value: string): { seasonKey?: string; dayKey?: string } {
  const trimmed = value.trim();
  if (!trimmed) return { seasonKey: undefined, dayKey: undefined };
  const delimiters = ['|', '/', '::', '@', '#'];
  for (const delimiter of delimiters) {
    if (trimmed.includes(delimiter)) {
      const [left, right] = trimmed.split(delimiter).map((part) => part.trim());
      if (DAY_ALIASES.has(right.toLowerCase())) {
        return { seasonKey: left, dayKey: right };
      }
      if (DAY_ALIASES.has(left.toLowerCase())) {
        return { seasonKey: right, dayKey: left };
      }
      return { seasonKey: left, dayKey: right };
    }
  }

  for (const day of DAY_ORDER) {
    if (trimmed.toLowerCase().endsWith(day.toLowerCase())) {
      const seasonPart = trimmed.slice(0, trimmed.length - day.length).trim();
      return { seasonKey: seasonPart, dayKey: day };
    }
  }

  return { seasonKey: trimmed, dayKey: undefined };
}

function formatTimeLabel(time: string): string {
  const [hourStr, minuteStr] = time.split(':');
  let hour = Number.parseInt(hourStr, 10);
  const minute = Number.parseInt(minuteStr, 10);
  const suffix = hour >= 12 ? 'pm' : 'am';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  const minuteText = minute.toString().padStart(2, '0');
  return `${hour}:${minuteText}${suffix}`;
}

function parseRange(range: string): {
  start: { month: number; day: number } | undefined;
  end: { month: number; day: number } | undefined;
} {
  const parts = range.split('–').map((part) => part.trim());
  if (parts.length !== 2) return { start: undefined, end: undefined };
  return {
    start: parseMonthDay(parts[0]),
    end: parseMonthDay(parts[1])
  };
}

function parseMonthDay(value: string): { month: number; day: number } | undefined {
  const match = value.trim().match(/^(?<month>[A-Za-z]+)\s+(?<day>\d{1,2})$/);
  if (!match || !match.groups) return undefined;
  const monthName = match.groups.month.toLowerCase();
  const day = Number.parseInt(match.groups.day, 10);
  const month = MONTHS.get(monthName);
  if (!month) return undefined;
  return { month, day };
}

function toISODate(year: number, month: number, day: number): string {
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

function toDateKey(year: number, month: number, day: number): number {
  return year * 10000 + month * 100 + day;
}

function toComparableKey(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractYear(season: RawSeason): number | undefined {
  const match = season.label.match(/(\d{4})/);
  if (match) return Number.parseInt(match[1], 10);
  const nameMatch = season.name.match(/(\d{4})/);
  if (nameMatch) return Number.parseInt(nameMatch[1], 10);
  return undefined;
}
