export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

const FALLBACK_TIMEZONES = [
  'UTC', 'Africa/Douala', 'Africa/Lagos', 'Africa/Nairobi', 'Africa/Cairo', 'Africa/Johannesburg',
  'Africa/Abidjan', 'Africa/Accra', 'Africa/Casablanca',
  'Europe/Paris', 'Europe/London', 'Europe/Berlin', 'Europe/Madrid',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Sao_Paulo',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Singapore',
  'Australia/Sydney',
];

let cachedTimezones: string[] | null = null;

export function getSupportedTimezones(): string[] {
  if (cachedTimezones) return cachedTimezones;
  try {
    const list = (Intl as any).supportedValuesOf?.('timeZone');
    cachedTimezones = Array.isArray(list) && list.length > 0 ? list : FALLBACK_TIMEZONES;
  } catch {
    cachedTimezones = FALLBACK_TIMEZONES;
  }
  return cachedTimezones;
}

export function formatInTimezone(date: Date | string, timeZone: string, options: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat('en-US', { ...options, timeZone: timeZone || 'UTC' }).format(d);
  } catch {
    return new Intl.DateTimeFormat('en-US', options).format(d);
  }
}

export const formatDateTimeInTz = (date: Date | string, timeZone: string) =>
  formatInTimezone(date, timeZone, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });

export const formatTimeInTz = (date: Date | string, timeZone: string) =>
  formatInTimezone(date, timeZone, { hour: '2-digit', minute: '2-digit', hour12: false });

export const formatFullDateTimeInTz = (date: Date | string, timeZone: string) =>
  formatInTimezone(date, timeZone, { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });

function tzWallClockPartsAsUtc(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find(p => p.type === type)?.value ?? '0');
  const hour = get('hour') === 24 ? 0 : get('hour');
  return Date.UTC(get('year'), get('month') - 1, get('day'), hour, get('minute'), get('second'));
}

/** Interprets a naive "YYYY-MM-DDTHH:MM[:SS]" wall-clock string as local time
 *  in `timeZone` and returns the absolute instant (correct across DST). */
export function zonedTimeToUtc(naive: string, timeZone: string): Date {
  const m = naive.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return new Date(naive);
  const [, y, mo, d, h, mi, s] = m;
  const wantedUtc = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s || '0'));
  let guess = wantedUtc;
  for (let i = 0; i < 2; i++) {
    const seenAsUtc = tzWallClockPartsAsUtc(new Date(guess), timeZone);
    guess += wantedUtc - seenAsUtc;
  }
  return new Date(guess);
}

/** Formats an absolute Date as a naive "YYYY-MM-DDTHH:MM" wall-clock string
 *  in `timeZone` — the inverse of `zonedTimeToUtc`. */
export function utcToZonedNaiveISO(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00';
  const hour = get('hour') === '24' ? '00' : get('hour');
  return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}`;
}
