import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number with spaces as thousand separators
 * Example: 1241234151274 -> "1 241 234 151 274"
 */
export function formatNumber(value: number | string | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || value === "") {
    return "-"
  }
  
  const num = typeof value === "string" ? Number(value) : value
  
  if (isNaN(num)) {
    return String(value)
  }
  
  // Split into integer and decimal parts
  const parts = num.toFixed(decimals).split(".")
  const integerPart = parts[0]
  const decimalPart = parts[1]
  
  // Add spaces every 3 digits from right to left
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  
  // If decimal part exists and is not all zeros, include it
  if (decimalPart && decimalPart !== "00" && !/^0+$/.test(decimalPart)) {
    // Remove trailing zeros
    const trimmedDecimal = decimalPart.replace(/0+$/, "")
    return trimmedDecimal ? `${formattedInteger},${trimmedDecimal}` : formattedInteger
  }
  
  return formattedInteger
}