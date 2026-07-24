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
