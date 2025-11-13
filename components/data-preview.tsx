"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Table, FileText } from "lucide-react"

export function DataPreview() {
  const { t } = useLanguage()
  // Mock data for demonstration
  const mockData = [
    { date: "2024-01-01", product: "Продукт A", sales: 15000, quantity: 120, region: "Север" },
    { date: "2024-01-02", product: "Продукт B", sales: 22000, quantity: 180, region: "Юг" },
    { date: "2024-01-03", product: "Продукт A", sales: 18000, quantity: 150, region: "Восток" },
    { date: "2024-01-04", product: "Продукт C", sales: 12000, quantity: 90, region: "Запад" },
    { date: "2024-01-05", product: "Продукт B", sales: 25000, quantity: 200, region: "Север" },
  ]

  const [displayRows, setDisplayRows] = useState("10")
  const [selectedColumns, setSelectedColumns] = useState(["date", "product", "sales", "quantity", "region"])

  const columns = ["date", "product", "sales", "quantity", "region"]

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="card-subtle p-4 rounded-lg border border-border flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm text-foreground/70 block mb-2">{t.rowsPerPage}</label>
          <input
            type="number"
            value={displayRows}
            onChange={(e) => setDisplayRows(e.target.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:border-primary text-sm"
            min="1"
            max="100"
          />
        </div>
        <div className="flex-1">
          <label className="text-sm text-foreground/70 block mb-2">{t.columns}</label>
          <select
            multiple
            value={selectedColumns}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map((o) => o.value)
              setSelectedColumns(selected)
            }}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:border-primary text-sm"
          >
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="card-subtle p-6 rounded-lg border border-border overflow-x-auto">
        <div className="flex items-center gap-2 mb-4">
          <Table className="w-5 h-5 text-foreground/60" />
          <h3 className="text-lg font-semibold text-foreground">{t.preview}</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {selectedColumns.map((col) => (
                <th key={col} className="px-4 py-3 text-left text-foreground/80 font-semibold">
                  {col.charAt(0).toUpperCase() + col.slice(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockData.map((row, idx) => (
              <tr key={idx} className="border-b border-border/30 hover:bg-muted/50 transition-colors">
                {selectedColumns.map((col) => (
                  <td key={col} className="px-4 py-3 text-foreground">
                    {row[col as keyof typeof row]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t.totalRows, value: "1,250", icon: FileText },
          { label: t.totalColumns, value: "5", icon: FileText },
          { label: t.fileSize, value: "2.4 MB", icon: FileText },
          { label: t.missingValues, value: "0", icon: FileText },
        ].map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="card-subtle p-4 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-foreground/40" />
                <p className="text-foreground/60 text-xs">{stat.label}</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
