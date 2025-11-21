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
  mode?: number | null
  variance?: number
  range?: number
  q1?: number
  q2?: number
  q3?: number
  p90?: number
  p95?: number
  p99?: number
  skewness?: number
  kurtosis?: number
  sum?: number
}

export type PercentileStats = {
  p1: number
  p5: number
  p10: number
  p25: number
  p50: number
  p75: number
  p90: number
  p95: number
  p99: number
}

export type OutlierResult = {
  outliers: boolean[]
  count: number
  indices: number[]
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

  // Calculate additional statistics
  const range = max - min
  
  // Calculate quartiles and percentiles
  const q1 = getPercentile(sortedValues, 0.25)
  const q2 = median
  const q3 = getPercentile(sortedValues, 0.75)
  const p90 = getPercentile(sortedValues, 0.90)
  const p95 = getPercentile(sortedValues, 0.95)
  const p99 = getPercentile(sortedValues, 0.99)
  
  // Calculate mode
  const frequency: Record<number, number> = {}
  values.forEach((val) => {
    frequency[val] = (frequency[val] || 0) + 1
  })
  let maxFreq = 0
  let mode: number | null = null
  Object.entries(frequency).forEach(([val, freq]) => {
    if (freq > maxFreq) {
      maxFreq = freq
      mode = Number(val)
    }
  })
  
  // Calculate skewness
  const skewness = calculateSkewness(values, mean, std)
  
  // Calculate kurtosis
  const kurtosis = calculateKurtosis(values, mean, std)
  
  // Calculate sum
  const sum = values.reduce((acc, val) => acc + val, 0)

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
    mode,
    variance,
    range,
    q1,
    q2,
    q3,
    p90,
    p95,
    p99,
    skewness,
    kurtosis,
    sum,
  }
}

// Helper function to calculate percentile
function getPercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0
  const index = percentile * (sortedValues.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const weight = index - lower
  if (lower === upper) return sortedValues[lower]
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight
}

// Calculate skewness
function calculateSkewness(values: number[], mean: number, std: number): number {
  if (values.length === 0 || std === 0) return 0
  const n = values.length
  const sum = values.reduce((acc, val) => {
    const diff = (val - mean) / std
    return acc + diff * diff * diff
  }, 0)
  return (n / ((n - 1) * (n - 2))) * sum
}

// Calculate kurtosis
function calculateKurtosis(values: number[], mean: number, std: number): number {
  if (values.length === 0 || std === 0) return 0
  const n = values.length
  const sum = values.reduce((acc, val) => {
    const diff = (val - mean) / std
    return acc + diff * diff * diff * diff
  }, 0)
  return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sum - (3 * (n - 1) * (n - 1)) / ((n - 2) * (n - 3))
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

// Calculate percentiles
export function calculatePercentiles(
  data: DataRow[],
  columnName: string
): PercentileStats | null {
  if (!data || data.length === 0) return null

  const values = data
    .map((row) => {
      const value = row[columnName]
      if (value === null || value === undefined || value === "") return null
      const num = Number(value)
      return isNaN(num) ? null : num
    })
    .filter((val) => val !== null) as number[]

  if (values.length === 0) return null

  const sortedValues = [...values].sort((a, b) => a - b)

  return {
    p1: getPercentile(sortedValues, 0.01),
    p5: getPercentile(sortedValues, 0.05),
    p10: getPercentile(sortedValues, 0.10),
    p25: getPercentile(sortedValues, 0.25),
    p50: getPercentile(sortedValues, 0.50),
    p75: getPercentile(sortedValues, 0.75),
    p90: getPercentile(sortedValues, 0.90),
    p95: getPercentile(sortedValues, 0.95),
    p99: getPercentile(sortedValues, 0.99),
  }
}

// Calculate moving average
export function calculateMovingAverage(
  data: DataRow[],
  columnName: string,
  window: number
): number[] {
  if (!data || data.length === 0 || window < 1) return []

  const values = data
    .map((row) => {
      const value = row[columnName]
      if (value === null || value === undefined || value === "") return null
      const num = Number(value)
      return isNaN(num) ? null : num
    })
    .filter((val) => val !== null) as number[]

  if (values.length === 0) return []

  const movingAverages: number[] = []
  for (let i = 0; i < values.length; i++) {
    if (i < window - 1) {
      movingAverages.push(NaN)
    } else {
      const windowValues = values.slice(i - window + 1, i + 1)
      const avg = windowValues.reduce((sum, val) => sum + val, 0) / window
      movingAverages.push(avg)
    }
  }
  return movingAverages
}

// Calculate ranking
export function calculateRanking(
  data: DataRow[],
  columnName: string,
  method: "dense" | "min" | "max" | "average" = "dense"
): Array<{ value: number; rank: number; index: number }> {
  if (!data || data.length === 0) return []

  const values = data
    .map((row, idx) => {
      const value = row[columnName]
      if (value === null || value === undefined || value === "") return null
      const num = Number(value)
      return isNaN(num) ? null : { value: num, index: idx }
    })
    .filter((val) => val !== null) as Array<{ value: number; index: number }>

  if (values.length === 0) return []

  // Sort by value descending
  const sorted = [...values].sort((a, b) => b.value - a.value)

  // First pass: assign initial ranks
  const withRanks: Array<{ value: number; index: number; rank: number }> = sorted.map(
    (item, idx) => ({
      ...item,
      rank: idx + 1,
    })
  )

  // Second pass: handle ties based on method
  const ranked = withRanks.map((item, idx) => {
    let rank = item.rank

    if (method === "dense") {
      // Dense ranking: same values get same rank, next rank is +1
      if (idx > 0 && withRanks[idx - 1].value === item.value) {
        rank = withRanks[idx - 1].rank
      }
    } else if (method === "min") {
      // Min ranking: same values get minimum rank
      let minRank = rank
      for (let i = idx - 1; i >= 0 && withRanks[i].value === item.value; i--) {
        minRank = withRanks[i].rank
      }
      rank = minRank
    } else if (method === "max") {
      // Max ranking: same values get maximum rank
      let maxRank = rank
      for (let i = idx + 1; i < withRanks.length && withRanks[i].value === item.value; i++) {
        maxRank = withRanks[i].rank
      }
      rank = maxRank
    } else if (method === "average") {
      // Average ranking: same values get average rank
      const sameValueIndices: number[] = []
      withRanks.forEach((s, i) => {
        if (s.value === item.value) {
          sameValueIndices.push(i + 1) // +1 because rank starts at 1
        }
      })
      rank = sameValueIndices.reduce((sum, r) => sum + r, 0) / sameValueIndices.length
    }

    return { ...item, rank }
  })

  return ranked
}

// Calculate growth rate (percentage change)
export function calculateGrowthRate(
  data: DataRow[],
  columnName: string
): number[] {
  if (!data || data.length === 0) return []

  const values = data
    .map((row) => {
      const value = row[columnName]
      if (value === null || value === undefined || value === "") return null
      const num = Number(value)
      return isNaN(num) ? null : num
    })
    .filter((val) => val !== null) as number[]

  if (values.length === 0) return []

  const growthRates: number[] = [NaN] // First value has no previous value
  for (let i = 1; i < values.length; i++) {
    const prev = values[i - 1]
    const curr = values[i]
    if (prev === 0) {
      growthRates.push(NaN)
    } else {
      growthRates.push(((curr - prev) / prev) * 100)
    }
  }
  return growthRates
}

// Calculate cumulative sum
export function calculateCumulativeSum(
  data: DataRow[],
  columnName: string
): number[] {
  if (!data || data.length === 0) return []

  const values = data
    .map((row) => {
      const value = row[columnName]
      if (value === null || value === undefined || value === "") return null
      const num = Number(value)
      return isNaN(num) ? null : num
    })
    .filter((val) => val !== null) as number[]

  if (values.length === 0) return []

  const cumsum: number[] = []
  let sum = 0
  values.forEach((val) => {
    sum += val
    cumsum.push(sum)
  })
  return cumsum
}

// Detect outliers using IQR method
export function detectOutliersIQR(
  data: DataRow[],
  columnName: string
): OutlierResult {
  if (!data || data.length === 0) {
    return { outliers: [], count: 0, indices: [] }
  }

  const values = data
    .map((row, idx) => {
      const value = row[columnName]
      if (value === null || value === undefined || value === "") return null
      const num = Number(value)
      return isNaN(num) ? null : { value: num, index: idx }
    })
    .filter((val) => val !== null) as Array<{ value: number; index: number }>

  if (values.length === 0) {
    return { outliers: [], count: 0, indices: [] }
  }

  const sortedValues = [...values].sort((a, b) => a.value - b.value)
  const q1 = getPercentile(
    sortedValues.map((v) => v.value),
    0.25
  )
  const q3 = getPercentile(
    sortedValues.map((v) => v.value),
    0.75
  )
  const iqr = q3 - q1
  const lower = q1 - 1.5 * iqr
  const upper = q3 + 1.5 * iqr

  const outliers: boolean[] = new Array(data.length).fill(false)
  const indices: number[] = []

  values.forEach((item) => {
    if (item.value < lower || item.value > upper) {
      outliers[item.index] = true
      indices.push(item.index)
    }
  })

  return {
    outliers,
    count: indices.length,
    indices,
  }
}

// Detect outliers using Z-Score method
export function detectOutliersZScore(
  data: DataRow[],
  columnName: string,
  threshold: number = 3
): OutlierResult {
  if (!data || data.length === 0) {
    return { outliers: [], count: 0, indices: [] }
  }

  const values = data
    .map((row, idx) => {
      const value = row[columnName]
      if (value === null || value === undefined || value === "") return null
      const num = Number(value)
      return isNaN(num) ? null : { value: num, index: idx }
    })
    .filter((val) => val !== null) as Array<{ value: number; index: number }>

  if (values.length === 0) {
    return { outliers: [], count: 0, indices: [] }
  }

  const mean = values.reduce((sum, item) => sum + item.value, 0) / values.length
  const variance =
    values.reduce((sum, item) => sum + Math.pow(item.value - mean, 2), 0) / values.length
  const std = Math.sqrt(variance)

  if (std === 0) {
    return { outliers: [], count: 0, indices: [] }
  }

  const outliers: boolean[] = new Array(data.length).fill(false)
  const indices: number[] = []

  values.forEach((item) => {
    const zScore = Math.abs((item.value - mean) / std)
    if (zScore > threshold) {
      outliers[item.index] = true
      indices.push(item.index)
    }
  })

  return {
    outliers,
    count: indices.length,
    indices,
  }
}

