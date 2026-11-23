// Persian Shamsi (Jalali) calendar & currency formatters (100% offline, zero external libs)

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

export function formatNumber(value: number, maximumFractionDigits = 1): string {
  if (!Number.isFinite(value)) return '۰';
  return new Intl.NumberFormat('fa-IR', {
    maximumFractionDigits,
  }).format(value);
}

export function formatToman(value: number, withUnit = true): string {
  const formatted = new Intl.NumberFormat('fa-IR', {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
  return withUnit ? `${formatted} تومان` : formatted;
}

export function formatShamsiDate(isoDate?: string | null): string {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('fa-IR', {
    calendar: 'persian',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatShamsiShort(isoDate?: string | null): string {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('fa-IR', {
    calendar: 'persian',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function formatShamsiHeaderDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('fa-IR', {
    calendar: 'persian',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).formatToParts(date);

  const year = parts.find((p) => p.type === 'year')?.value ?? '';
  const month = parts.find((p) => p.type === 'month')?.value ?? '';
  const day = parts.find((p) => p.type === 'day')?.value ?? '';
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? '';

  return `امروز ${year} ${month} ${day}، ${weekday} است.`;
}

export function calculateWeightLossPct(inputGreenKg: number, outputRoastedKg: number): number {
  if (inputGreenKg <= 0) return 0;
  const loss = ((inputGreenKg - outputRoastedKg) / inputGreenKg) * 100;
  return Math.max(0, Math.round(loss * 10) / 10);
}

export function exportRowsToCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number>>
): void {
  if (typeof window === 'undefined') return;
  const escapeCell = (cell: string | number) => {
    const str = String(cell ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };
  const csvLines = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ];
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvLines.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
