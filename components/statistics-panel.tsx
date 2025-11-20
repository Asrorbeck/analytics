
import { useState, useMemo } from "react"
import { useLanguage } from "@/lib/language-context"
import { useData } from "@/lib/data-context"
import { BarChart3, TrendingUp, Upload } from "lucide-react"
import { calculateStatistics, calculateCorrelationMatrix, type ColumnStats } from "@/lib/utils-statistics"

export function StatisticsPanel() {
  const { t } = useLanguage()
  const { data, columns, dataLoaded } = useData()
  
  // Get numeric columns
  const numericColumns = useMemo(() => {
    return columns.filter((col) => col.numeric).map((col) => col.name)
  }, [columns])

  const [selectedColumns, setSelectedColumns] = useState<string[]>([])

  // Initialize selected columns
  useMemo(() => {
    if (numericColumns.length > 0 && selectedColumns.length === 0) {
      setSelectedColumns(numericColumns.slice(0, 2))
    }
  }, [numericColumns, selectedColumns.length])

  // Calculate statistics for selected columns
  const stats = useMemo(() => {
    if (!data || data.length === 0 || selectedColumns.length === 0) return null
    const statsMap: Record<string, ColumnStats> = {}
    selectedColumns.forEach((col) => {
      const stat = calculateStatistics(data, col)
      if (stat) {
        statsMap[col] = stat
      }
    })
    return statsMap
  }, [data, selectedColumns])

  // Calculate correlation matrix
  const correlationMatrix = useMemo(() => {
    if (!data || data.length === 0 || selectedColumns.length < 2) return null
    return calculateCorrelationMatrix(data, selectedColumns)
  }, [data, selectedColumns])

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

  return (
    <div className="space-y-6">
      {/* Column Selection */}
      <div className="card-subtle p-4 rounded-lg border border-border">
        <label className="text-sm text-foreground/70 block mb-2">{t.selectColumns}</label>
        <div className="flex flex-wrap gap-2">
          {numericColumns.map((col) => (
            <label key={col} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedColumns.includes(col)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedColumns([...selectedColumns, col])
                  } else {
                    setSelectedColumns(selectedColumns.filter((c) => c !== col))
                  }
                }}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-foreground text-sm">{col}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Statistics Grid */}
      {stats &&
        selectedColumns.map((col) => {
          const columnStats = stats[col]
          if (!columnStats) return null

          return (
            <div key={col} className="card-subtle p-6 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-foreground/60" />
                <h3 className="text-lg font-semibold text-foreground capitalize">{col} - {t.statistics}</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: t.mean, key: "mean" as const, value: columnStats.mean },
                  { label: t.median, key: "median" as const, value: columnStats.median },
                  { label: t.stdDev, key: "std" as const, value: columnStats.std },
                  { label: t.min, key: "min" as const, value: columnStats.min },
                  { label: t.max, key: "max" as const, value: columnStats.max },
                  { label: t.count, key: "count" as const, value: columnStats.count },
                ].map((stat) => {
                  const Icon = TrendingUp
                  return (
                    <div key={stat.key} className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Icon className="w-3.5 h-3.5 text-foreground/40" />
                        <p className="text-foreground/60 text-xs">{stat.label}</p>
                      </div>
                      <p className="text-xl font-bold text-foreground">
                        {typeof stat.value === "number"
                          ? stat.value.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })
                          : stat.value}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

      {/* Correlation Section */}
      {correlationMatrix && selectedColumns.length >= 2 && (
        <div className="card-subtle p-6 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-foreground/60" />
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
                {selectedColumns.map((col1, idx1) =>
                  selectedColumns
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
                          <td className="px-4 py-2 text-primary font-semibold">
                            {correlation.toFixed(3)}
                          </td>
                          <td className="px-4 py-2 text-foreground/70">{interpretation}</td>
                        </tr>
                      )
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
