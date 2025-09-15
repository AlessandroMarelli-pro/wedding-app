import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  });
};
export const getOptimizedUrl = (imageId: string): string => {
  return `/api/images/${imageId}/optimized`;
};
