import React, { createContext, useContext, useState, useEffect } from "react"

export type DataRow = Record<string, any>
export type ColumnInfo = {
  name: string
  type: "string" | "number" | "date" | "boolean"
  numeric: boolean
}

export type SheetData = {
  name: string
  data: DataRow[]
  columns: ColumnInfo[]
}

interface DataContextType {
  dataLoaded: boolean
  setDataLoaded: (loaded: boolean) => void
  fileName: string | null
  setFileName: (name: string | null) => void
  // Legacy support - returns current sheet data
  data: DataRow[]
  setData: (data: DataRow[]) => void
  columns: ColumnInfo[]
  setColumns: (columns: ColumnInfo[]) => void
  rawData: DataRow[] | null
  setRawData: (data: DataRow[] | null) => void
  // New multi-sheet support
  sheets: SheetData[]
  setSheets: (sheets: SheetData[]) => void
  selectedSheet: string | null
  setSelectedSheet: (sheet: string | null) => void
  // Helper to get current sheet data
  getCurrentSheetData: () => DataRow[]
  getCurrentSheetColumns: () => ColumnInfo[]
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Helper function to detect column types
function detectColumns(data: DataRow[]): ColumnInfo[] {
  if (data.length === 0) return []
  
  const firstRow = data[0]
  return Object.keys(firstRow).map((key) => {
    const values = data
      .map((row) => row[key])
      .filter((val) => val !== null && val !== undefined && val !== "")
    
    let type: ColumnInfo["type"] = "string"
    let numeric = false

    if (values.length > 0) {
      let numericCount = 0
      let dateCount = 0
      let booleanCount = 0

      values.slice(0, Math.min(100, values.length)).forEach((val) => {
        if (typeof val === "number" || (!isNaN(Number(val)) && val !== "" && String(val).trim() !== "")) {
          numericCount++
        }
        if (typeof val === "string" && !isNaN(Date.parse(val)) && val.length > 5) {
          dateCount++
        }
        if (typeof val === "boolean" || val === "true" || val === "false" || val === true || val === false) {
          booleanCount++
        }
      })

      const sampleSize = Math.min(100, values.length)
      
      if (numericCount / sampleSize > 0.8) {
        numeric = true
        type = "number"
      } else if (dateCount / sampleSize > 0.5) {
        type = "date"
      } else if (booleanCount / sampleSize > 0.8) {
        type = "boolean"
      }
    }

    return { name: key, type, numeric }
  })
}

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

  // Multi-sheet support
  const [sheets, setSheets] = useState<SheetData[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sheets")
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

  const [selectedSheet, setSelectedSheet] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedSheet")
    }
    return null
  })

  // Legacy support - current sheet data
  const [data, setData] = useState<DataRow[]>([])
  const [columns, setColumns] = useState<ColumnInfo[]>([])
  const [rawData, setRawData] = useState<DataRow[] | null>(null)

  // Auto-select first sheet if no sheet is selected
  useEffect(() => {
    if (sheets.length > 0 && !selectedSheet) {
      setSelectedSheet(sheets[0].name)
    } else if (sheets.length > 0 && selectedSheet) {
      // Validate selected sheet exists
      const sheetExists = sheets.some(s => s.name === selectedSheet)
      if (!sheetExists) {
        setSelectedSheet(sheets[0].name)
      }
    }
  }, [sheets, selectedSheet])

  // Update legacy data/columns when selected sheet changes
  useEffect(() => {
    if (sheets.length > 0) {
      const currentSheetName = selectedSheet || sheets[0]?.name
      const currentSheet = sheets.find(s => s.name === currentSheetName)
      if (currentSheet) {
        setData(currentSheet.data)
        setColumns(currentSheet.columns)
      } else {
        setData([])
        setColumns([])
      }
    } else {
      setData([])
      setColumns([])
    }
  }, [sheets, selectedSheet])

  // Helper functions
  const getCurrentSheetData = (): DataRow[] => {
    if (sheets.length === 0) return []
    const currentSheetName = selectedSheet || sheets[0]?.name
    const currentSheet = sheets.find(s => s.name === currentSheetName)
    return currentSheet?.data || []
  }

  const getCurrentSheetColumns = (): ColumnInfo[] => {
    if (sheets.length === 0) return []
    const currentSheetName = selectedSheet || sheets[0]?.name
    const currentSheet = sheets.find(s => s.name === currentSheetName)
    return currentSheet?.columns || []
  }

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dataLoaded", String(dataLoaded))
      if (fileName) {
        localStorage.setItem("fileName", fileName)
      } else {
        localStorage.removeItem("fileName")
      }
      if (sheets.length > 0) {
        localStorage.setItem("sheets", JSON.stringify(sheets))
      } else {
        localStorage.removeItem("sheets")
      }
      if (selectedSheet) {
        localStorage.setItem("selectedSheet", selectedSheet)
      } else {
        localStorage.removeItem("selectedSheet")
      }
      // Legacy support
      if (data.length > 0) {
        localStorage.setItem("data", JSON.stringify(data))
      } else {
        localStorage.removeItem("data")
      }
    }
  }, [dataLoaded, fileName, sheets, selectedSheet, data])

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
        sheets,
        setSheets,
        selectedSheet,
        setSelectedSheet,
        getCurrentSheetData,
        getCurrentSheetColumns,
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

