"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { BarChart3, TrendingUp } from "lucide-react"

export function StatisticsPanel() {
  const { t } = useLanguage()
  const [selectedColumns, setSelectedColumns] = useState(["sales", "quantity"])

  const mockStats = {
    sales: {
      mean: 18400,
      median: 18000,
      std: 4821,
      min: 12000,
      max: 25000,
      count: 5,
    },
    quantity: {
      mean: 148,
      median: 150,
      std: 42.5,
      min: 90,
      max: 200,
      count: 5,
    },
  }

  return (
    <div className="space-y-6">
      {/* Column Selection */}
      <div className="card-subtle p-4 rounded-lg border border-border">
        <label className="text-sm text-foreground/70 block mb-2">{t.selectColumns}</label>
        <div className="flex flex-wrap gap-2">
          {["sales", "quantity"].map((col) => (
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
      {selectedColumns.map((col) => (
        <div key={col} className="card-subtle p-6 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-foreground/60" />
            <h3 className="text-lg font-semibold text-foreground capitalize">{col} - {t.statistics}</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: t.mean, key: "mean", icon: TrendingUp },
              { label: t.median, key: "median", icon: TrendingUp },
              { label: t.stdDev, key: "std", icon: TrendingUp },
              { label: t.min, key: "min", icon: TrendingUp },
              { label: t.max, key: "max", icon: TrendingUp },
              { label: t.count, key: "count", icon: TrendingUp },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.key} className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon className="w-3.5 h-3.5 text-foreground/40" />
                    <p className="text-foreground/60 text-xs">{stat.label}</p>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    {mockStats[col as keyof typeof mockStats][stat.key as any].toLocaleString()}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Correlation Section */}
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
              <tr className="border-b border-border/30 hover:bg-muted/50">
                <td className="px-4 py-2 text-foreground">Sales ↔ Quantity</td>
                <td className="px-4 py-2 text-primary font-semibold">0.95</td>
                <td className="px-4 py-2 text-foreground/70">Очень сильная положительная корреляция</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
