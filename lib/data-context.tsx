import React, { createContext, useContext, useState, useEffect } from "react"

export type DataRow = Record<string, any>
export type ColumnInfo = {
  name: string
  type: "string" | "number" | "date" | "boolean"
  numeric: boolean
}

interface DataContextType {
  dataLoaded: boolean
  setDataLoaded: (loaded: boolean) => void
  fileName: string | null
  setFileName: (name: string | null) => void
  data: DataRow[]
  setData: (data: DataRow[]) => void
  columns: ColumnInfo[]
  setColumns: (columns: ColumnInfo[]) => void
  rawData: DataRow[] | null
  setRawData: (data: DataRow[] | null) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [dataLoaded, setDataLoaded] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dataLoaded")
      return saved === "true"
    }
    return false
  })

  const [fileName, setFileName] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("fileName")
    }
    return null
  })

  const [data, setData] = useState<DataRow[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("data")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return []
        }
      }
    }
    return []
  })

  const [rawData, setRawData] = useState<DataRow[] | null>(null)

  const [columns, setColumns] = useState<ColumnInfo[]>([])

  // Detect column types from data
  useEffect(() => {
    if (data.length > 0) {
      const firstRow = data[0]
      const detectedColumns: ColumnInfo[] = Object.keys(firstRow).map((key) => {
        const values = data
          .map((row) => row[key])
          .filter((val) => val !== null && val !== undefined && val !== "")
        
        let type: ColumnInfo["type"] = "string"
        let numeric = false

        // Try to detect type
        if (values.length > 0) {
          // Check if most values are numbers
          let numericCount = 0
          let dateCount = 0
          let booleanCount = 0

          values.slice(0, Math.min(100, values.length)).forEach((val) => {
            // Check if it's a number
            if (typeof val === "number" || (!isNaN(Number(val)) && val !== "" && String(val).trim() !== "")) {
              numericCount++
            }
            // Check if it's a date
            if (typeof val === "string" && !isNaN(Date.parse(val)) && val.length > 5) {
              dateCount++
            }
            // Check if it's boolean
            if (typeof val === "boolean" || val === "true" || val === "false" || val === true || val === false) {
              booleanCount++
            }
          })

          const sampleSize = Math.min(100, values.length)
          
          // If more than 80% are numbers, it's numeric
          if (numericCount / sampleSize > 0.8) {
            numeric = true
            type = "number"
          }
          // If more than 50% are dates, it's a date
          else if (dateCount / sampleSize > 0.5) {
            type = "date"
          }
          // If more than 80% are booleans, it's boolean
          else if (booleanCount / sampleSize > 0.8) {
            type = "boolean"
          }
        }

        return { name: key, type, numeric }
      })
      setColumns(detectedColumns)
    } else {
      setColumns([])
    }
  }, [data])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dataLoaded", String(dataLoaded))
      if (fileName) {
        localStorage.setItem("fileName", fileName)
      } else {
        localStorage.removeItem("fileName")
      }
      if (data.length > 0) {
        localStorage.setItem("data", JSON.stringify(data))
      } else {
        localStorage.removeItem("data")
      }
    }
  }, [dataLoaded, fileName, data])

  return (
    <DataContext.Provider
      value={{
        dataLoaded,
        setDataLoaded,
        fileName,
        setFileName,
        data,
        setData,
        columns,
        setColumns,
        rawData,
        setRawData,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within DataProvider")
  }
  return context
}

