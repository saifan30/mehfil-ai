const currencyFormatters: Record<string, Intl.NumberFormat> = {
  INR: new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }),
  USD: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }),
  GBP: new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }),
  EUR: new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }),
  CAD: new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }),
};

const aedNumberFormatter = new Intl.NumberFormat('en-US');

const humanDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  
  try {
    if (currency === 'AED') {
      return `AED ${aedNumberFormatter.format(safeAmount)}`;
    }
    const formatter = currencyFormatters[currency];
    if (formatter) {
      return formatter.format(safeAmount);
    }
    return `${currency} ${safeAmount.toLocaleString()}`;
  } catch {
    return `${currency} ${safeAmount.toLocaleString()}`;
  }
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return humanDateFormatter.format(date);
  } catch {
    return dateStr;
  }
}
