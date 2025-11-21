
import { useState, useMemo } from "react"
import { useLanguage } from "@/lib/language-context"
import { useData } from "@/lib/data-context"
import { BarChart3, TrendingUp, Upload, LineChart, Target, TrendingDown, AlertTriangle } from "lucide-react"
import {
  calculateStatistics,
  calculateCorrelationMatrix,
  calculatePercentiles,
  calculateMovingAverage,
  calculateRanking,
  calculateGrowthRate,
  calculateCumulativeSum,
  detectOutliersIQR,
  detectOutliersZScore,
  type ColumnStats,
} from "@/lib/utils-statistics"
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts"

export function StatisticsPanel() {
  const { t } = useLanguage()
  const { data, columns, dataLoaded } = useData()

  // Get numeric columns
  const numericColumns = useMemo(() => {
    return columns.filter((col) => col.numeric).map((col) => col.name)
  }, [columns])

  const [selectedColumn, setSelectedColumn] = useState<string>("")
  const [selectedMethod, setSelectedMethod] = useState<string>("basic")
  const [maWindow, setMaWindow] = useState<number>(7)
  const [rankingMethod, setRankingMethod] = useState<"dense" | "min" | "max" | "average">("dense")
  const [outlierMethod, setOutlierMethod] = useState<"iqr" | "zscore">("iqr")

  // Initialize selected column
  useMemo(() => {
    if (numericColumns.length > 0 && !selectedColumn) {
      setSelectedColumn(numericColumns[0])
    }
  }, [numericColumns, selectedColumn])

  // Calculate statistics for selected column
  const stats = useMemo(() => {
    if (!data || data.length === 0 || !selectedColumn) return null
    return calculateStatistics(data, selectedColumn)
  }, [data, selectedColumn])

  // Calculate percentiles
  const percentiles = useMemo(() => {
    if (!data || data.length === 0 || !selectedColumn || selectedMethod !== "percentiles") return null
    return calculatePercentiles(data, selectedColumn)
  }, [data, selectedColumn, selectedMethod])

  // Calculate moving average
  const movingAverage = useMemo(() => {
    if (!data || data.length === 0 || !selectedColumn || selectedMethod !== "movingAverage") return []
    return calculateMovingAverage(data, selectedColumn, maWindow)
  }, [data, selectedColumn, selectedMethod, maWindow])

  // Calculate ranking
  const ranking = useMemo(() => {
    if (!data || data.length === 0 || !selectedColumn || selectedMethod !== "ranking") return []
    return calculateRanking(data, selectedColumn, rankingMethod)
  }, [data, selectedColumn, selectedMethod, rankingMethod])

  // Calculate growth rate
  const growthRate = useMemo(() => {
    if (!data || data.length === 0 || !selectedColumn || selectedMethod !== "growthRate") return []
    return calculateGrowthRate(data, selectedColumn)
  }, [data, selectedColumn, selectedMethod])

  // Calculate cumulative sum
  const cumulativeSum = useMemo(() => {
    if (!data || data.length === 0 || !selectedColumn || selectedMethod !== "cumulativeSum") return []
    return calculateCumulativeSum(data, selectedColumn)
  }, [data, selectedColumn, selectedMethod])

  // Detect outliers
  const outliers = useMemo(() => {
    if (!data || data.length === 0 || !selectedColumn || selectedMethod !== "outliers") return null
    if (outlierMethod === "iqr") {
      return detectOutliersIQR(data, selectedColumn)
    } else {
      return detectOutliersZScore(data, selectedColumn)
    }
  }, [data, selectedColumn, selectedMethod, outlierMethod])

  // Calculate correlation matrix
  const correlationMatrix = useMemo(() => {
    if (!data || data.length === 0 || numericColumns.length < 2 || selectedMethod !== "correlation") return null
    return calculateCorrelationMatrix(data, numericColumns)
  }, [data, numericColumns, selectedMethod])

  if (!dataLoaded || !data || data.length === 0) {
    return (
      <div className="card-subtle h-96 flex items-center justify-center flex-col gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Upload className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground">{t.pleaseUploadFile}</p>
      </div>
    )
  }

  if (numericColumns.length === 0) {
    return (
      <div className="card-subtle h-96 flex items-center justify-center flex-col gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground">No numeric columns found</p>
        <p className="text-foreground/60 text-sm">Please upload data with numeric columns</p>
      </div>
    )
  }

  const methods = [
    { id: "basic", label: t.basicStatistics, icon: BarChart3 },
    { id: "percentiles", label: t.percentiles, icon: TrendingUp },
    { id: "movingAverage", label: t.movingAverage, icon: LineChart },
    { id: "ranking", label: t.ranking, icon: Target },
    { id: "growthRate", label: t.growthRate, icon: TrendingDown },
    { id: "cumulativeSum", label: t.cumulativeSum, icon: TrendingUp },
    { id: "correlation", label: t.correlationMatrix, icon: BarChart3 },
    { id: "outliers", label: t.outliers, icon: AlertTriangle },
    { id: "distribution", label: t.distribution, icon: BarChart3 },
  ]

  const renderMethodContent = () => {
    if (!selectedColumn || !stats) return null

    switch (selectedMethod) {
      case "basic":
        return (
          <div className="card-subtle p-6 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-foreground/60" />
              <h3 className="text-lg font-semibold text-foreground capitalize">
                {selectedColumn} - {t.basicStatistics}
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { label: t.count, value: stats.count },
                { label: t.mean, value: stats.mean },
                { label: t.median, value: stats.median },
                { label: t.mode, value: stats.mode ?? "N/A" },
                { label: t.stdDev, value: stats.std },
                { label: t.variance, value: stats.variance ?? 0 },
                { label: t.min, value: stats.min },
                { label: t.max, value: stats.max },
                { label: t.range, value: stats.range ?? 0 },
                { label: t.q1, value: stats.q1 ?? 0 },
                { label: t.q3, value: stats.q3 ?? 0 },
                { label: t.p90, value: stats.p90 ?? 0 },
                { label: t.p95, value: stats.p95 ?? 0 },
                { label: t.p99, value: stats.p99 ?? 0 },
                { label: t.skewness, value: stats.skewness ?? 0 },
                { label: t.kurtosis, value: stats.kurtosis ?? 0 },
                { label: t.sum, value: stats.sum ?? 0 },
              ].map((stat, idx) => (
                <div key={idx} className="bg-muted p-4 rounded-lg">
                  <p className="text-foreground/60 text-xs mb-2">{stat.label}</p>
                  <p className="text-xl font-bold text-foreground">
                    {typeof stat.value === "number"
                      ? stat.value.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
                      : stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )

      case "percentiles":
        if (!percentiles) return null
        const percentileData = [
          { name: "P1", value: percentiles.p1 },
          { name: "P5", value: percentiles.p5 },
          { name: "P10", value: percentiles.p10 },
          { name: "P25", value: percentiles.p25 },
          { name: "P50", value: percentiles.p50 },
          { name: "P75", value: percentiles.p75 },
          { name: "P90", value: percentiles.p90 },
          { name: "P95", value: percentiles.p95 },
          { name: "P99", value: percentiles.p99 },
        ]
        return (
          <div className="card-subtle p-6 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-foreground/60" />
              <h3 className="text-lg font-semibold text-foreground">{t.percentiles}: {selectedColumn}</h3>
            </div>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={percentileData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      case "movingAverage":
        if (movingAverage.length === 0) return null
        const maData = data
          .map((row, idx) => {
            const value = Number(row[selectedColumn]) || 0
            return {
              index: idx + 1,
              value: isNaN(value) ? 0 : value,
              ma: isNaN(movingAverage[idx]) ? null : movingAverage[idx],
            }
          })
          .filter((d) => d.ma !== null)
        return (
          <div className="card-subtle p-6 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-6">
              <LineChart className="w-5 h-5 text-foreground/60" />
              <h3 className="text-lg font-semibold text-foreground">
                {t.movingAverage} ({maWindow}): {selectedColumn}
              </h3>
            </div>
            <div className="mb-4">
              <label className="text-sm text-foreground/70 block mb-2">{t.window}</label>
              <input
                type="range"
                min="2"
                max="50"
                value={maWindow}
                onChange={(e) => setMaWindow(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-foreground/60 mt-1">
                <span>2</span>
                <span>{maWindow}</span>
                <span>50</span>
              </div>
            </div>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={maData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" name="Data" />
                  <Line type="monotone" dataKey="ma" stroke="#82ca9d" strokeWidth={3} name={`MA(${maWindow})`} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      case "ranking":
        if (ranking.length === 0) return null
        const topRanked = ranking.slice(0, 20)
        return (
          <div className="card-subtle p-6 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-foreground/60" />
              <h3 className="text-lg font-semibold text-foreground">{t.ranking}: {selectedColumn}</h3>
            </div>
            <div className="mb-4">
              <label className="text-sm text-foreground/70 block mb-2">{t.rankingMethod}</label>
              <select
                value={rankingMethod}
                onChange={(e) => setRankingMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:border-primary text-sm"
              >
                <option value="dense">Dense</option>
                <option value="min">Min</option>
                <option value="max">Max</option>
                <option value="average">Average</option>
              </select>
            </div>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2 text-left text-foreground/80 font-semibold">Rank</th>
                    <th className="px-4 py-2 text-left text-foreground/80 font-semibold">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {topRanked.map((item, idx) => (
                    <tr key={idx} className="border-b border-border/30 hover:bg-muted/50">
                      <td className="px-4 py-2 text-foreground">{item.rank.toFixed(2)}</td>
                      <td className="px-4 py-2 text-foreground">{item.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topRanked}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rank" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      case "growthRate":
        if (growthRate.length === 0) return null
        const growthData = data
          .map((row, idx) => ({
            index: idx + 1,
            growth: isNaN(growthRate[idx]) ? 0 : growthRate[idx],
          }))
          .filter((d) => !isNaN(d.growth))
        const avgGrowth = growthData.reduce((sum, d) => sum + d.growth, 0) / growthData.length
        const maxGrowth = Math.max(...growthData.map((d) => d.growth))
        const minGrowth = Math.min(...growthData.map((d) => d.growth))
        return (
          <div className="card-subtle p-6 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-6">
              <TrendingDown className="w-5 h-5 text-foreground/60" />
              <h3 className="text-lg font-semibold text-foreground">{t.growthRate}: {selectedColumn}</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-foreground/60 text-xs mb-2">{t.mean}</p>
                <p className="text-xl font-bold text-foreground">{avgGrowth.toFixed(2)}%</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-foreground/60 text-xs mb-2">{t.max}</p>
                <p className="text-xl font-bold text-foreground">{maxGrowth.toFixed(2)}%</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-foreground/60 text-xs mb-2">{t.min}</p>
                <p className="text-xl font-bold text-foreground">{minGrowth.toFixed(2)}%</p>
              </div>
            </div>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="growth" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      case "cumulativeSum":
        if (cumulativeSum.length === 0) return null
        const cumsumData = data.map((row, idx) => ({
          index: idx + 1,
          cumsum: cumulativeSum[idx],
        }))
        return (
          <div className="card-subtle p-6 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-foreground/60" />
              <h3 className="text-lg font-semibold text-foreground">{t.cumulativeSum}: {selectedColumn}</h3>
            </div>
            <div className="mb-4">
              <div className="bg-muted p-4 rounded-lg inline-block">
                <p className="text-foreground/60 text-xs mb-2">{t.sum}</p>
                <p className="text-xl font-bold text-foreground">
                  {cumulativeSum[cumulativeSum.length - 1]?.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={cumsumData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cumsum" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      case "correlation":
        if (!correlationMatrix) return null
        const corrData = numericColumns.map((col1) =>
          numericColumns.map((col2) => ({
            x: col1,
            y: col2,
            value: correlationMatrix[col1]?.[col2] || 0,
          }))
        )
        return (
          <div className="card-subtle p-6 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-foreground/60" />
              <h3 className="text-lg font-semibold text-foreground">{t.correlationMatrix}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2 text-left text-foreground/80 font-semibold">{t.variables}</th>
                    <th className="px-4 py-2 text-left text-foreground/80 font-semibold">{t.coefficient}</th>
                    <th className="px-4 py-2 text-left text-foreground/80 font-semibold">{t.interpretation}</th>
                  </tr>
                </thead>
                <tbody>
                  {numericColumns.map((col1, idx1) =>
                    numericColumns
                      .slice(idx1 + 1)
                      .map((col2) => {
                        const correlation = correlationMatrix[col1]?.[col2] || 0
                        const absCorr = Math.abs(correlation)
                        let interpretation = ""
                        if (absCorr < 0.3) {
                          interpretation = "Weak correlation"
                        } else if (absCorr < 0.7) {
                          interpretation = "Moderate correlation"
                        } else {
                          interpretation = "Strong correlation"
                        }
                        if (correlation > 0) {
                          interpretation += " (positive)"
                        } else {
                          interpretation += " (negative)"
                        }

                        return (
                          <tr key={`${col1}-${col2}`} className="border-b border-border/30 hover:bg-muted/50">
                            <td className="px-4 py-2 text-foreground">
                              {col1} ↔ {col2}
                            </td>
                            <td className="px-4 py-2 text-primary font-semibold">{correlation.toFixed(3)}</td>
                            <td className="px-4 py-2 text-foreground/70">{interpretation}</td>
                          </tr>
                        )
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )

      case "outliers":
        if (!outliers) return null
        const outlierData = data
          .map((row, idx) => {
            const value = Number(row[selectedColumn]) || 0
            return {
              index: idx + 1,
              value: isNaN(value) ? 0 : value,
              isOutlier: outliers.outliers[idx] || false,
            }
          })
          .filter((d) => !isNaN(d.value))
        return (
          <div className="card-subtle p-6 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="w-5 h-5 text-foreground/60" />
              <h3 className="text-lg font-semibold text-foreground">
                {t.outliers} ({outlierMethod.toUpperCase()}): {selectedColumn}
              </h3>
            </div>
            <div className="mb-4 flex items-center gap-4">
              <div>
                <label className="text-sm text-foreground/70 block mb-2">{t.outlierMethod}</label>
                <select
                  value={outlierMethod}
                  onChange={(e) => setOutlierMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:border-primary text-sm"
                >
                  <option value="iqr">{t.iqr}</option>
                  <option value="zscore">{t.zScore}</option>
                </select>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-foreground/60 text-xs mb-2">{t.outliersFound}</p>
                <p className="text-xl font-bold text-foreground">{outliers.count}</p>
              </div>
            </div>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={outlierData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" />
                  <YAxis />
                  <Tooltip />
                  <Scatter
                    dataKey="value"
                    fill={outlierData.some((d) => d.isOutlier) ? "#ef4444" : "#8884d8"}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      case "distribution":
        if (!stats) return null
        const distributionData = data
          .map((row) => {
            const value = Number(row[selectedColumn])
            return isNaN(value) ? null : value
          })
          .filter((v) => v !== null) as number[]
        const bins = 30
        const min = Math.min(...distributionData)
        const max = Math.max(...distributionData)
        const binWidth = (max - min) / bins
        const histogram: Record<number, number> = {}
        distributionData.forEach((val) => {
          const bin = Math.floor((val - min) / binWidth)
          histogram[bin] = (histogram[bin] || 0) + 1
        })
        const histData = Object.entries(histogram).map(([bin, count]) => ({
          bin: Number(bin) * binWidth + min,
          count,
        }))
        return (
          <div className="card-subtle p-6 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-foreground/60" />
              <h3 className="text-lg font-semibold text-foreground">{t.distribution}: {selectedColumn}</h3>
            </div>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bin" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Method Selection */}
      <div className="card-subtle p-4 rounded-lg border border-border">
        <label className="text-sm text-foreground/70 block mb-2">{t.selectMethod}</label>
        <div className="flex flex-wrap gap-2">
          {methods.map((method) => {
            const Icon = method.icon
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 ${
                  selectedMethod === method.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                {method.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Column Selection */}
      {selectedMethod !== "correlation" && (
        <div className="card-subtle p-4 rounded-lg border border-border">
          <label className="text-sm text-foreground/70 block mb-2">{t.selectColumns}</label>
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:border-primary text-sm"
          >
            {numericColumns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Method Content */}
      {renderMethodContent()}
    </div>
  )
}
