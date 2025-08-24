import dayjs from 'dayjs';

export const usd = (n: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
};

export const formatNumber = (n: number): string => {
  return new Intl.NumberFormat('en-US').format(n);
};

export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('MMM DD, YYYY');
};

export const formatTime = (date: string | Date): string => {
  return dayjs(date).format('HH:mm:ss');
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

