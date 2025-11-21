import { useState, useMemo } from "react";
import { useLanguage } from "@/lib/language-context";
import { useData, type DataRow } from "@/lib/data-context";
import {
  BarChart3,
  LineChart,
  PieChart,
  ScatterChart,
  Settings,
  Upload,
  Box,
  Activity,
  Waves,
  TrendingUp,
  Layers,
} from "lucide-react";
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
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#8dd1e1",
  "#d084d0",
];

export function VisualizationPanel() {
  const { t } = useLanguage();
  const { data, columns, dataLoaded } = useData();
  const [chartType, setChartType] = useState("bar");
  const [selectedXColumn, setSelectedXColumn] = useState<string>("");
  const [selectedYColumn, setSelectedYColumn] = useState<string>("");
  const [selectedGroupColumn, setSelectedGroupColumn] = useState<string>("");
  const [selectedColorColumn, setSelectedColorColumn] = useState<string>("");
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">(
    "vertical"
  );
  const [bins, setBins] = useState<number>(30);

  // Get numeric and string columns
  const numericColumns = useMemo(() => {
    return columns.filter((col) => col.numeric).map((col) => col.name);
  }, [columns]);

  const stringColumns = useMemo(() => {
    return columns.filter((col) => !col.numeric).map((col) => col.name);
  }, [columns]);

  // Initialize selected columns
  useMemo(() => {
    if (numericColumns.length > 0 && !selectedYColumn) {
      setSelectedYColumn(numericColumns[0]);
    }
    if (stringColumns.length > 0 && !selectedXColumn) {
      setSelectedXColumn(stringColumns[0]);
    }
  }, [numericColumns, stringColumns, selectedXColumn, selectedYColumn]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!data || data.length === 0 || !selectedYColumn) return [];

    if (chartType === "bar" || chartType === "line" || chartType === "area") {
      if (selectedXColumn && selectedGroupColumn) {
        // Group by X and Group columns
        const grouped = data.reduce((acc, row) => {
          const xKey = String(row[selectedXColumn] || "Unknown");
          const groupKey = String(row[selectedGroupColumn] || "Unknown");
          const key = `${xKey}-${groupKey}`;
          if (!acc[key]) {
            acc[key] = {
              [selectedXColumn]: xKey,
              [selectedGroupColumn]: groupKey,
              [selectedYColumn]: 0,
              count: 0,
            };
          }
          const yValue = Number(row[selectedYColumn]) || 0;
          acc[key][selectedYColumn] += yValue;
          acc[key].count += 1;
          return acc;
        }, {} as Record<string, any>);

        return Object.values(grouped).map((item: any) => ({
          ...item,
          [selectedYColumn]: item[selectedYColumn] / item.count, // Average
        }));
      } else if (selectedXColumn) {
        // Group by X column
        const grouped = data.reduce((acc, row) => {
          const xKey = String(row[selectedXColumn] || "Unknown");
          if (!acc[xKey]) {
            acc[xKey] = {
              [selectedXColumn]: xKey,
              [selectedYColumn]: 0,
              count: 0,
            };
          }
          const yValue = Number(row[selectedYColumn]) || 0;
          acc[xKey][selectedYColumn] += yValue;
          acc[xKey].count += 1;
          return acc;
        }, {} as Record<string, any>);

        return Object.values(grouped)
          .map((item: any) => ({
            ...item,
            [selectedYColumn]: item[selectedYColumn] / item.count, // Average
          }))
          .slice(0, 20);
      } else {
        // Just show Y values
        return data.slice(0, 20).map((row, idx) => ({
          index: idx + 1,
          [selectedYColumn]: Number(row[selectedYColumn]) || 0,
        }));
      }
    } else if (chartType === "pie") {
      if (selectedXColumn) {
        const grouped = data.reduce((acc, row) => {
          const xKey = String(row[selectedXColumn] || "Unknown");
          if (!acc[xKey]) {
            acc[xKey] = 0;
          }
          const yValue = Number(row[selectedYColumn]) || 0;
          acc[xKey] += yValue;
          return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped)
          .slice(0, 10)
          .map(([name, value]) => ({
            name,
            value,
          }));
      }
      return [];
    } else if (chartType === "scatter") {
      if (selectedXColumn && numericColumns.includes(selectedXColumn)) {
        return data
          .map((row) => ({
            x: Number(row[selectedXColumn]) || 0,
            y: Number(row[selectedYColumn]) || 0,
            color: selectedColorColumn
              ? String(row[selectedColorColumn] || "Unknown")
              : undefined,
          }))
          .filter((point) => !isNaN(point.x) && !isNaN(point.y))
          .slice(0, 500); // Limit for performance
      }
      return [];
    } else if (chartType === "box") {
      if (selectedXColumn) {
        // Group by X column and calculate quartiles
        const grouped = data.reduce((acc, row) => {
          const xKey = String(row[selectedXColumn] || "Unknown");
          const yValue = Number(row[selectedYColumn]);
          if (!isNaN(yValue)) {
            if (!acc[xKey]) {
              acc[xKey] = [];
            }
            acc[xKey].push(yValue);
          }
          return acc;
        }, {} as Record<string, number[]>);

        return Object.entries(grouped).map(([name, values]) => {
          const sorted = [...values].sort((a, b) => a - b);
          const q1 = sorted[Math.floor(sorted.length * 0.25)];
          const q2 = sorted[Math.floor(sorted.length * 0.5)];
          const q3 = sorted[Math.floor(sorted.length * 0.75)];
          const min = sorted[0];
          const max = sorted[sorted.length - 1];
          const iqr = q3 - q1;
          const lowerWhisker = Math.max(min, q1 - 1.5 * iqr);
          const upperWhisker = Math.min(max, q3 + 1.5 * iqr);

          return {
            name,
            min: lowerWhisker,
            q1,
            median: q2,
            q3,
            max: upperWhisker,
            outliers: sorted.filter(
              (v) => v < lowerWhisker || v > upperWhisker
            ),
          };
        });
      }
      return [];
    } else if (chartType === "heatmap") {
      // Correlation heatmap
      if (numericColumns.length >= 2) {
        const matrix: Array<{ x: string; y: string; value: number }> = [];
        numericColumns.forEach((col1) => {
          numericColumns.forEach((col2) => {
            const values1 = data
              .map((row) => Number(row[col1]))
              .filter((v) => !isNaN(v));
            const values2 = data
              .map((row) => Number(row[col2]))
              .filter((v) => !isNaN(v));
            if (values1.length > 0 && values2.length > 0) {
              const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length;
              const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length;
              let numerator = 0;
              let denom1 = 0;
              let denom2 = 0;
              const n = Math.min(values1.length, values2.length);
              for (let i = 0; i < n; i++) {
                const diff1 = values1[i] - mean1;
                const diff2 = values2[i] - mean2;
                numerator += diff1 * diff2;
                denom1 += diff1 * diff1;
                denom2 += diff2 * diff2;
              }
              const denominator = Math.sqrt(denom1 * denom2);
              const correlation =
                denominator === 0 ? 0 : numerator / denominator;
              matrix.push({ x: col1, y: col2, value: correlation });
            }
          });
        });
        return matrix;
      }
      return [];
    } else if (chartType === "waterfall") {
      return data.slice(0, 20).map((row, idx) => ({
        index: idx + 1,
        value: Number(row[selectedYColumn]) || 0,
      }));
    } else if (chartType === "pareto") {
      const grouped = data.reduce((acc, row) => {
        const xKey = String(row[selectedXColumn] || "Unknown");
        if (!acc[xKey]) {
          acc[xKey] = 0;
        }
        const yValue = Number(row[selectedYColumn]) || 0;
        acc[xKey] += yValue;
        return acc;
      }, {} as Record<string, number>);

      const sorted = Object.entries(grouped)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);
      const total = sorted.reduce((sum, [, val]) => sum + val, 0);
      let cumsum = 0;

      return sorted.map(([name, value]) => {
        cumsum += value;
        return {
          name,
          value,
          cumulative: (cumsum / total) * 100,
        };
      });
    } else if (chartType === "histogram") {
      const values = data
        .map((row) => Number(row[selectedYColumn]))
        .filter((v) => !isNaN(v));
      if (values.length === 0) return [];
      const min = Math.min(...values);
      const max = Math.max(...values);
      const binWidth = (max - min) / bins;
      const histogram: Record<number, number> = {};
      values.forEach((val) => {
        const bin = Math.floor((val - min) / binWidth);
        histogram[bin] = (histogram[bin] || 0) + 1;
      });
      return Object.entries(histogram).map(([bin, count]) => ({
        bin: Number(bin) * binWidth + min,
        count,
      }));
    }

    return [];
  }, [
    data,
    chartType,
    selectedXColumn,
    selectedYColumn,
    selectedGroupColumn,
    selectedColorColumn,
    numericColumns,
    bins,
  ]);

  const chartTypes = [
    { id: "bar", label: t.barChart, icon: BarChart3 },
    { id: "line", label: t.lineChart, icon: LineChart },
    { id: "pie", label: t.pieChart, icon: PieChart },
    { id: "scatter", label: t.scatterChart, icon: ScatterChart },
    { id: "box", label: t.boxPlot, icon: Box },
    { id: "heatmap", label: t.heatmap, icon: Activity },
    { id: "waterfall", label: t.waterfall, icon: Waves },
    { id: "pareto", label: t.pareto, icon: TrendingUp },
    { id: "area", label: t.areaChart, icon: Layers },
    { id: "histogram", label: t.histogram, icon: BarChart3 },
  ];

  // Render chart function
  const renderChart = () => {
    if (chartData.length === 0) return null;

    if (chartType === "bar") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout={orientation === "horizontal" ? "horizontal" : "vertical"}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={selectedXColumn || "index"} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={selectedYColumn} fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      );
    } else if (chartType === "line") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={selectedXColumn || "index"} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={selectedYColumn}
              stroke="#8884d8"
              strokeWidth={2}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      );
    } else if (chartType === "pie") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      );
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
      );
    } else if (chartType === "box") {
      // Box plot using bar chart (simplified)
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="median" fill="#8884d8" name="Median" />
            <Bar dataKey="q1" fill="#82ca9d" name="Q1" />
            <Bar dataKey="q3" fill="#ffc658" name="Q3" />
          </BarChart>
        </ResponsiveContainer>
      );
    } else if (chartType === "heatmap") {
      // Heatmap visualization
      const uniqueX = Array.from(new Set(chartData.map((d: any) => d.x)));
      const uniqueY = Array.from(new Set(chartData.map((d: any) => d.y)));
      return (
        <div className="w-full h-full overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left"></th>
                {uniqueX.map((x) => (
                  <th key={String(x)} className="px-2 py-1 text-center text-xs">
                    {String(x).slice(0, 10)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {uniqueY.map((y) => (
                <tr key={String(y)}>
                  <td className="px-2 py-1 text-xs font-semibold">
                    {String(y).slice(0, 10)}
                  </td>
                  {uniqueX.map((x) => {
                    const cell = chartData.find(
                      (d: any) => d.x === x && d.y === y
                    );
                    const value = cell?.value || 0;
                    const intensity = Math.abs(value);
                    const color =
                      value >= 0
                        ? `rgba(34, 197, 94, ${intensity})`
                        : `rgba(239, 68, 68, ${intensity})`;
                    return (
                      <td
                        key={`${x}-${y}`}
                        className="px-2 py-1 text-center text-xs"
                        style={{ backgroundColor: color }}
                      >
                        {value.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (chartType === "waterfall") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      );
    } else if (chartType === "pareto") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="value" fill="#8884d8" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumulative"
              stroke="#82ca9d"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      );
    } else if (chartType === "area") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={selectedXColumn || "index"} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey={selectedYColumn}
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    } else if (chartType === "histogram") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bin" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    return null;
  };

  if (!dataLoaded || !data || data.length === 0) {
    return (
      <div className="card-subtle h-96 flex items-center justify-center flex-col gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Upload className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground">
          {t.pleaseUploadFile}
        </p>
      </div>
    );
  }

  if (numericColumns.length === 0) {
    return (
      <div className="card-subtle h-96 flex items-center justify-center flex-col gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground">
          No numeric columns found
        </p>
        <p className="text-foreground/60 text-sm">
          Please upload data with numeric columns
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Type Selection */}
      <div className="card-subtle p-4 rounded-lg border border-border">
        <label className="text-sm text-foreground/70 block mb-2">
          {t.chartType}
        </label>
        <div className="flex flex-wrap gap-2">
          {chartTypes.map((type) => {
            const Icon = type.icon;
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
            );
          })}
        </div>
      </div>

      {/* Chart Options */}
      <div className="card-subtle p-6 rounded-lg border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-foreground/60" />
          <h3 className="text-lg font-semibold text-foreground">
            {t.chartTitle}
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(chartType === "bar" ||
            chartType === "line" ||
            chartType === "pie" ||
            chartType === "area" ||
            chartType === "pareto" ||
            chartType === "box") && (
            <div>
              <label className="text-sm text-foreground/70 block mb-2">
                {chartType === "pie" ? "Category" : "X Axis (Group By)"}
              </label>
              <select
                value={selectedXColumn}
                onChange={(e) => setSelectedXColumn(e.target.value)}
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
          {chartType === "scatter" && (
            <div>
              <label className="text-sm text-foreground/70 block mb-2">
                X Axis
              </label>
              <select
                value={selectedXColumn}
                onChange={(e) => setSelectedXColumn(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:border-primary text-sm"
              >
                <option value="">None</option>
                {numericColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-sm text-foreground/70 block mb-2">
              Y Axis (Value)
            </label>
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
          {(chartType === "bar" ||
            chartType === "line" ||
            chartType === "area") && (
            <div>
              <label className="text-sm text-foreground/70 block mb-2">
                Group By (Optional)
              </label>
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
          {chartType === "scatter" && (
            <div>
              <label className="text-sm text-foreground/70 block mb-2">
                Color By (Optional)
              </label>
              <select
                value={selectedColorColumn}
                onChange={(e) => setSelectedColorColumn(e.target.value)}
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
          {chartType === "bar" && (
            <div>
              <label className="text-sm text-foreground/70 block mb-2">
                {t.orientation}
              </label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as any)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:border-primary text-sm"
              >
                <option value="vertical">{t.vertical}</option>
                <option value="horizontal">{t.horizontal}</option>
              </select>
            </div>
          )}
          {chartType === "histogram" && (
            <div>
              <label className="text-sm text-foreground/70 block mb-2">
                {t.bins}
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={bins}
                onChange={(e) => setBins(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-foreground/60 mt-1">
                <span>10</span>
                <span>{bins}</span>
                <span>100</span>
              </div>
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
          <p className="text-lg text-foreground/80 mb-2 font-medium">
            {t.dataVisualization}
          </p>
          <p className="text-foreground/50 text-sm text-center max-w-md">
            Please select columns to display the chart
          </p>
        </div>
      )}
    </div>
  );
}
