import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Debug logging that stays quiet in production builds, except for errors.
 */
export function log(type: 'log' | 'warn' | 'error', msg: string, ...args: unknown[]) {
  if (type === 'error' || import.meta.env.DEV) {
    console[type](`[Changicon] ${msg}`, ...args)
  }
}
