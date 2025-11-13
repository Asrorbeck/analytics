"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { BarChart3, LineChart, PieChart, ScatterChart, Settings } from "lucide-react"

export function VisualizationPanel() {
  const { t } = useLanguage()
  const [chartType, setChartType] = useState("bar")

  const chartTypes = [
    { id: "bar", label: t.barChart, icon: BarChart3 },
    { id: "line", label: t.lineChart, icon: LineChart },
    { id: "pie", label: t.pieChart, icon: PieChart },
    { id: "scatter", label: t.scatterChart, icon: ScatterChart },
  ]

  return (
    <div className="space-y-6">
      {/* Chart Type Selection */}
      <div className="card-subtle p-4 rounded-lg border border-border">
        <label className="text-sm text-foreground/70 block mb-2">{t.chartType}</label>
        <div className="flex flex-wrap gap-2">
          {chartTypes.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.id}
                onClick={() => setChartType(type.id)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 ${
                  chartType === type.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="card-subtle p-12 rounded-lg border border-border h-96 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8 text-foreground/40" />
        </div>
        <p className="text-lg text-foreground/80 mb-2 font-medium">{t.dataVisualization}</p>
        <p className="text-foreground/50 text-sm text-center max-w-md">
          {t.chartWillDisplay.replace(/\{type\}/g, chartTypes.find(ct => ct.id === chartType)?.label || chartType)}
        </p>
      </div>

      {/* Chart Options */}
      <div className="card-subtle p-6 rounded-lg border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-foreground/60" />
          <h3 className="text-lg font-semibold text-foreground">{t.chartTitle}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: t.chartTitle, value: "Анализ продаж по регионам" },
            { label: t.xAxis, value: "Регион" },
            { label: t.yAxis, value: "Продажи" },
            { label: t.colors, value: t.automatic },
            { label: t.legend, value: t.enabled },
            { label: t.grid, value: t.enabled },
          ].map((option, idx) => (
            <div key={idx} className="bg-muted p-3 rounded-lg">
              <p className="text-foreground/60 text-xs mb-2">{option.label}</p>
              <p className="text-foreground text-sm font-medium">{option.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
