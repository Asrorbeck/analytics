"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface DataContextType {
  dataLoaded: boolean
  setDataLoaded: (loaded: boolean) => void
  fileName: string | null
  setFileName: (name: string | null) => void
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dataLoaded", String(dataLoaded))
      if (fileName) {
        localStorage.setItem("fileName", fileName)
      } else {
        localStorage.removeItem("fileName")
      }
    }
  }, [dataLoaded, fileName])

  return (
    <DataContext.Provider value={{ dataLoaded, setDataLoaded, fileName, setFileName }}>
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

