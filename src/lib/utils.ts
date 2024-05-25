import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * I use a cn helper to make it easier to conditionally add Tailwind CSS classes
 * @param inputs 
 * @returns 
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
