import { twMerge } from "tailwind-merge"
import { clsx, type ClassValue } from "clsx"
import { differenceInMilliseconds } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDistanceHHMMSS(startDate: Date, endDate: Date): string {
  const diff = Math.abs(differenceInMilliseconds(endDate, startDate));
  const totalSeconds = Math.floor(diff / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
