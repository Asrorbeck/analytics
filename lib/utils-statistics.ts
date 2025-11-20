import { DataRow } from "./data-context"

export type ColumnStats = {
  mean: number
  median: number
  std: number
  min: number
  max: number
  count: number
  missing: number
  missingPct: number
  unique: number
}

export function calculateStatistics(
  data: DataRow[],
  columnName: string
): ColumnStats | null {
  if (!data || data.length === 0) return null

  // Extract numeric values
  const values = data
    .map((row) => {
      const value = row[columnName]
      if (value === null || value === undefined || value === "") return null
      const num = Number(value)
      return isNaN(num) ? null : num
    })
    .filter((val) => val !== null) as number[]

  if (values.length === 0) return null

  // Sort values for median calculation
  const sortedValues = [...values].sort((a, b) => a - b)

  // Calculate statistics
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const median =
    sortedValues.length % 2 === 0
      ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
      : sortedValues[Math.floor(sortedValues.length / 2)]
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  const std = Math.sqrt(variance)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const count = values.length
  const missing = data.length - count
  const missingPct = (missing / data.length) * 100
  const unique = new Set(values).size

  return {
    mean,
    median,
    std,
    min,
    max,
    count,
    missing,
    missingPct,
    unique,
  }
}

export function calculateCorrelation(
  data: DataRow[],
  column1: string,
  column2: string
): number | null {
  if (!data || data.length === 0) return null

  // Extract numeric values
  const values1 = data
    .map((row) => {
      const value = row[column1]
      if (value === null || value === undefined || value === "") return null
      const num = Number(value)
      return isNaN(num) ? null : num
    })
    .filter((val) => val !== null) as number[]

  const values2 = data
    .map((row) => {
      const value = row[column2]
      if (value === null || value === undefined || value === "") return null
      const num = Number(value)
      return isNaN(num) ? null : num
    })
    .filter((val) => val !== null) as number[]

  if (values1.length === 0 || values2.length === 0) return null

  // Calculate correlation (Pearson correlation coefficient)
  const n = Math.min(values1.length, values2.length)
  const mean1 = values1.slice(0, n).reduce((sum, val) => sum + val, 0) / n
  const mean2 = values2.slice(0, n).reduce((sum, val) => sum + val, 0) / n

  let numerator = 0
  let denominator1 = 0
  let denominator2 = 0

  for (let i = 0; i < n; i++) {
    const diff1 = values1[i] - mean1
    const diff2 = values2[i] - mean2
    numerator += diff1 * diff2
    denominator1 += diff1 * diff1
    denominator2 += diff2 * diff2
  }

  const denominator = Math.sqrt(denominator1 * denominator2)
  if (denominator === 0) return null

  return numerator / denominator
}

export function calculateCorrelationMatrix(
  data: DataRow[],
  columns: string[]
): Record<string, Record<string, number>> | null {
  if (!data || data.length === 0 || columns.length < 2) return null

  const matrix: Record<string, Record<string, number>> = {}

  columns.forEach((col1) => {
    matrix[col1] = {}
    columns.forEach((col2) => {
      if (col1 === col2) {
        matrix[col1][col2] = 1
      } else {
        const correlation = calculateCorrelation(data, col1, col2)
        matrix[col1][col2] = correlation || 0
      }
    })
  })

  return matrix
}

