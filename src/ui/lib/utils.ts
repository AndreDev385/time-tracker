import { twMerge } from "tailwind-merge"
import { clsx, type ClassValue } from "clsx"
import { differenceInMilliseconds } from "date-fns"
import { toast } from "sonner";

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


export function displayMessage(
  message: string,
  type: "success" | "error" = "success",
) {
  return toast(type === "success" ? "Éxito!" : "Ha ocurrido un error!", {
    description: message,
    richColors: true,
    classNames: {
      title: `text-lg font-bold ${type === "success" ? "text-green-500" : "text-red-500"}`,
      description: "italic text-sm",
    },
    descriptionClassName: "italic text-sm",
  });
}
