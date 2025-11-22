
import { useState, useMemo } from "react"
import { useLanguage } from "@/lib/language-context"
import { useData, type DataRow } from "@/lib/data-context"
import { Table, FileText, Upload } from "lucide-react"
import { formatNumber } from "@/lib/utils"

export function DataPreview() {
  const { t } = useLanguage()
  const { data, columns, dataLoaded } = useData()
  const [displayRows, setDisplayRows] = useState("10")
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])

  // Initialize selected columns
  useMemo(() => {
    if (columns.length > 0 && selectedColumns.length === 0) {
      setSelectedColumns(columns.map((col) => col.name).slice(0, 5))
    }
  }, [columns, selectedColumns.length])

  // Filter data based on selected columns
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return []
    const rows = parseInt(displayRows) || 10
    return data.slice(0, rows).map((row) => {
      const filteredRow: DataRow = {}
      selectedColumns.forEach((col) => {
        filteredRow[col] = row[col]
      })
      return filteredRow
    })
  }, [data, selectedColumns, displayRows])

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null
    const totalRows = data.length
    const totalColumns = columns.length
    const missingValues = data.reduce((acc, row) => {
      return (
        acc +
        Object.values(row).filter((val) => val === null || val === undefined || val === "").length
      )
    }, 0)
    const fileSize = new Blob([JSON.stringify(data)]).size / 1024 / 1024 // MB

    return {
      totalRows,
      totalColumns,
      missingValues,
      fileSize: fileSize.toFixed(2),
    }
  }, [data, columns])

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
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-input border border-border rounded-lg">
            {columns.map((col) => (
              <label key={col.name} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(col.name)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedColumns([...selectedColumns, col.name])
                    } else {
                      setSelectedColumns(selectedColumns.filter((c) => c !== col.name))
                    }
                  }}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-foreground text-sm">{col.name}</span>
              </label>
            ))}
          </div>
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
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, idx) => (
                <tr key={idx} className="border-b border-border/30 hover:bg-muted/50 transition-colors">
                  {selectedColumns.map((col) => (
                    <td key={col} className="px-4 py-3 text-foreground">
                      {row[col] !== null && row[col] !== undefined
                        ? typeof row[col] === "number"
                          ? formatNumber(row[col])
                          : String(row[col])
                        : "-"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={selectedColumns.length} className="px-4 py-8 text-center text-foreground/60">
                  No data to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: t.totalRows, value: stats.totalRows.toLocaleString(), icon: FileText },
            { label: t.totalColumns, value: stats.totalColumns.toString(), icon: FileText },
            { label: t.fileSize, value: `${stats.fileSize} MB`, icon: FileText },
            { label: t.missingValues, value: stats.missingValues.toString(), icon: FileText },
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
      )}
    </div>
  )
}
