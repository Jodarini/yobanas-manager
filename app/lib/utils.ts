import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Updater } from '@tanstack/vue-table';
import type { Ref } from 'vue';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function valueUpdater<T>(updaterOrValue: Updater<T>, ref: Ref<T>) {
  ref.value =
    typeof updaterOrValue === 'function'
      ? (updaterOrValue as (old: T) => T)(ref.value)
      : (updaterOrValue as T);
}

export const normalizeString = (str) => {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, ''); // Remove accent marks
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Just now (less than 1 minute)
  if (diffInSeconds < 60) {
    return 'Justo ahora';
  }

  // Use RelativeTimeFormat for recent dates
  const rtf = new Intl.RelativeTimeFormat('es-ES', { numeric: 'auto' });

  // Minutes (less than 1 hour)
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return rtf.format(-minutes, 'minute'); // "hace X minutos"
  }

  // Hours (less than 1 day)
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return rtf.format(-hours, 'hour'); // "hace X horas"
  }

  // Today, Yesterday (less than 2 days)
  if (diffInSeconds < 172800) {
    const days = Math.floor(diffInSeconds / 86400);
    return rtf.format(-days, 'day'); // "hoy", "ayer"
  }

  // For older dates, show full format
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }); // "20 de noviembre de 2025"
}
