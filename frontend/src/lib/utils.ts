import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',

    hour12: false,
  });
};

export const formatDateWithTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('fr-FR', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  });
};

export const formatTime = (dateString: string) => {
  return dateString.split('T')?.[1]?.split(':')?.slice(0, 2)?.join(':');
};

export const getOptimizedUrl = (imageId: string): string => {
  return `/api/images/${imageId}`;
};
