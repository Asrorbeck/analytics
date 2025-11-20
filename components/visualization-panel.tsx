
import { useState, useMemo } from "react"
import { useLanguage } from "@/lib/language-context"
import { useData, type DataRow } from "@/lib/data-context"
import { BarChart3, LineChart, PieChart, ScatterChart, Settings, Upload } from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1", "#d084d0"]

export function VisualizationPanel() {
  const { t } = useLanguage()
  const { data, columns, dataLoaded } = useData()
  const [chartType, setChartType] = useState("bar")
  const [selectedXColumn, setSelectedXColumn] = useState<string>("")
  const [selectedYColumn, setSelectedYColumn] = useState<string>("")
  const [selectedGroupColumn, setSelectedGroupColumn] = useState<string>("")

  // Get numeric and string columns
  const numericColumns = useMemo(() => {
    return columns.filter((col) => col.numeric).map((col) => col.name)
  }, [columns])

  const stringColumns = useMemo(() => {
    return columns.filter((col) => !col.numeric).map((col) => col.name)
  }, [columns])

  // Initialize selected columns
  useMemo(() => {
    if (numericColumns.length > 0 && !selectedYColumn) {
      setSelectedYColumn(numericColumns[0])
    }
    if (stringColumns.length > 0 && !selectedXColumn) {
      setSelectedXColumn(stringColumns[0])
    }
  }, [numericColumns, stringColumns, selectedXColumn, selectedYColumn])

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!data || data.length === 0 || !selectedYColumn) return []

    if (chartType === "bar" || chartType === "line") {
      if (selectedXColumn && selectedGroupColumn) {
        // Group by X and Group columns
        const grouped = data.reduce((acc, row) => {
          const xKey = String(row[selectedXColumn] || "Unknown")
          const groupKey = String(row[selectedGroupColumn] || "Unknown")
          const key = `${xKey}-${groupKey}`
          if (!acc[key]) {
            acc[key] = {
              [selectedXColumn]: xKey,
              [selectedGroupColumn]: groupKey,
              [selectedYColumn]: 0,
              count: 0,
            }
          }
          const yValue = Number(row[selectedYColumn]) || 0
          acc[key][selectedYColumn] += yValue
          acc[key].count += 1
          return acc
        }, {} as Record<string, any>)

        return Object.values(grouped).map((item: any) => ({
          ...item,
          [selectedYColumn]: item[selectedYColumn] / item.count, // Average
        }))
      } else if (selectedXColumn) {
        // Group by X column
        const grouped = data.reduce((acc, row) => {
          const xKey = String(row[selectedXColumn] || "Unknown")
          if (!acc[xKey]) {
            acc[xKey] = { [selectedXColumn]: xKey, [selectedYColumn]: 0, count: 0 }
          }
          const yValue = Number(row[selectedYColumn]) || 0
          acc[xKey][selectedYColumn] += yValue
          acc[xKey].count += 1
          return acc
        }, {} as Record<string, any>)

        return Object.values(grouped).map((item: any) => ({
          ...item,
          [selectedYColumn]: item[selectedYColumn] / item.count, // Average
        }))
      } else {
        // Just show Y values
        return data.slice(0, 20).map((row, idx) => ({
          index: idx + 1,
          [selectedYColumn]: Number(row[selectedYColumn]) || 0,
        }))
      }
    } else if (chartType === "pie") {
      if (selectedXColumn) {
        const grouped = data.reduce((acc, row) => {
          const xKey = String(row[selectedXColumn] || "Unknown")
          if (!acc[xKey]) {
            acc[xKey] = 0
          }
          const yValue = Number(row[selectedYColumn]) || 0
          acc[xKey] += yValue
          return acc
        }, {} as Record<string, number>)

        return Object.entries(grouped).map(([name, value]) => ({
          name,
          value,
        }))
      }
      return []
    } else if (chartType === "scatter") {
      if (selectedXColumn && numericColumns.includes(selectedXColumn)) {
        return data
          .map((row) => ({
            x: Number(row[selectedXColumn]) || 0,
            y: Number(row[selectedYColumn]) || 0,
          }))
          .filter((point) => !isNaN(point.x) && !isNaN(point.y))
      }
      return []
    }

    return []
  }, [data, chartType, selectedXColumn, selectedYColumn, selectedGroupColumn, numericColumns])

  const chartTypes = [
    { id: "bar", label: t.barChart, icon: BarChart3 },
    { id: "line", label: t.lineChart, icon: LineChart },
    { id: "pie", label: t.pieChart, icon: PieChart },
    { id: "scatter", label: t.scatterChart, icon: ScatterChart },
  ]

  // Render chart function
  const renderChart = () => {
    if (chartType === "bar") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={selectedXColumn || "index"} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={selectedYColumn} fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      )
    } else if (chartType === "line") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={selectedXColumn || "index"} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={selectedYColumn} stroke="#8884d8" strokeWidth={2} />
          </RechartsLineChart>
        </ResponsiveContainer>
      )
    } else if (chartType === "pie") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      )
    } else if (chartType === "scatter") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsScatterChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" name={selectedXColumn} type="number" />
            <YAxis dataKey="y" name={selectedYColumn} type="number" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter dataKey="y" fill="#8884d8" />
          </RechartsScatterChart>
        </ResponsiveContainer>
      )
    }
    return null
  }

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

      {/* Chart Options */}
      <div className="card-subtle p-6 rounded-lg border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-foreground/60" />
          <h3 className="text-lg font-semibold text-foreground">{t.chartTitle}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-foreground/70 block mb-2">
              {chartType === "scatter" ? "X Axis" : chartType === "pie" ? "Category" : "X Axis (Group By)"}
            </label>
            <select
              value={selectedXColumn}
              onChange={(e) => setSelectedXColumn(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:border-primary text-sm"
            >
              <option value="">None</option>
              {(chartType === "scatter" ? numericColumns : stringColumns).map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-foreground/70 block mb-2">Y Axis (Value)</label>
            <select
              value={selectedYColumn}
              onChange={(e) => setSelectedYColumn(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:border-primary text-sm"
            >
              {numericColumns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
          {(chartType === "bar" || chartType === "line") && (
            <div>
              <label className="text-sm text-foreground/70 block mb-2">Group By (Optional)</label>
              <select
                value={selectedGroupColumn}
                onChange={(e) => setSelectedGroupColumn(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:border-primary text-sm"
              >
                <option value="">None</option>
                {stringColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card-subtle p-6 rounded-lg border border-border">
          <div className="h-96 w-full">{renderChart()}</div>
        </div>
      )}

      {chartData.length === 0 && (
        <div className="card-subtle p-12 rounded-lg border border-border h-96 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-foreground/40" />
          </div>
          <p className="text-lg text-foreground/80 mb-2 font-medium">{t.dataVisualization}</p>
          <p className="text-foreground/50 text-sm text-center max-w-md">
            Please select columns to display the chart
          </p>
        </div>
      )}
    </div>
  )
}
