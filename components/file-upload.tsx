import type React from "react"
import { useState } from "react"
import { Upload, CheckCircle, Loader2, FileText, AlertCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useData, type DataRow } from "@/lib/data-context"
import Papa from "papaparse"
import type { ParseResult, ParseError } from "papaparse"
import * as XLSX from "xlsx"

interface FileUploadProps {
  onDataLoaded?: (fileName?: string) => void
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const { t } = useLanguage()
  const { setData, setDataLoaded, setFileName, setRawData } = useData()
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [fileName, setFileNameState] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const parseCSV = (file: File): Promise<DataRow[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: "UTF-8", // python.py dagi kabi UTF-8 encoding
        complete: (results: ParseResult<DataRow>) => {
          if (results.errors && results.errors.length > 0) {
            // Faqat muhim xatolarni ko'rsatish
            const criticalErrors = results.errors.filter(
              (e: ParseError) => e.type === "Quotes" || e.type === "Delimiter"
            )
            if (criticalErrors.length > 0) {
              reject(
                new Error(
                  criticalErrors.map((e: ParseError) => e.message || String(e)).join(", ")
                )
              )
              return
            }
          }
          
          // Date columnlarni avtomatik aniqlash va parse qilish (python.py dagi kabi)
          const processedData = (results.data || []).map((row: DataRow) => {
            const processedRow: DataRow = {}
            Object.keys(row).forEach((key) => {
              const value = row[key]
              
              // Bo'sh qiymatlar
              if (value === "" || value === null || value === undefined) {
                processedRow[key] = null
                return
              }
              
              // Date columnlarni aniqlash va parse qilish (python.py dagi kabi)
              const keyLower = key.toLowerCase()
              if (keyLower.includes("date") || keyLower.includes("time")) {
                try {
                  const dateValue = new Date(value as string)
                  if (!isNaN(dateValue.getTime())) {
                    processedRow[key] = dateValue.toISOString().split("T")[0]
                  } else {
                    processedRow[key] = value
                  }
                } catch {
                  processedRow[key] = value
                }
              } else {
                // Number conversion
                const numValue = Number(value)
                if (!isNaN(numValue) && value !== "" && typeof value !== "object") {
                  processedRow[key] = numValue
                } else {
                  processedRow[key] = value
                }
              }
            })
            return processedRow
          }) as DataRow[]
          
          resolve(processedData)
        },
        error: (error: Error) => {
          reject(new Error(`CSV faylni o'qishda xatolik: ${error.message}`))
        },
      })
    })
  }

  // Merged cells ni to'ldirish funksiyasi
  const fillMergedCells = (worksheet: XLSX.WorkSheet): XLSX.WorkSheet => {
    if (!worksheet["!merges"]) return worksheet
    
    const mergedRanges = worksheet["!merges"] || []
    const filledWorksheet = { ...worksheet }
    
    mergedRanges.forEach((range: XLSX.Range) => {
      const startCell = XLSX.utils.encode_cell({ r: range.s.r, c: range.s.c })
      const startCellData = worksheet[startCell]
      const startValue = startCellData?.v ?? startCellData?.w
      
      if (startValue !== undefined && startValue !== null && startValue !== "") {
        // Merged range ichidagi barcha celllarni to'ldirish
        for (let row = range.s.r; row <= range.e.r; row++) {
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
            const existingCell = filledWorksheet[cellAddress]
            
            // Agar cell bo'sh bo'lsa yoki faqat format bo'lsa, qiymatni to'ldirish
            if (!existingCell || existingCell.v === undefined || existingCell.v === null || existingCell.v === "") {
              filledWorksheet[cellAddress] = {
                v: startValue,
                t: typeof startValue === "string" ? "s" : typeof startValue === "number" ? "n" : "s",
              }
            }
          }
        }
      }
    })
    
    return filledWorksheet
  }

  // Header qatorini topish
  const findHeaderRow = (worksheet: XLSX.WorkSheet, maxRows: number = 20): number => {
    // Range ni topish
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1")
    
    // Birinchi 20 qatorni tekshirish
    for (let row = 0; row < Math.min(maxRows, range.e.r); row++) {
      let nonEmptyCells = 0
      let hasText = false
      
      for (let col = 0; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
        const cell = worksheet[cellAddress]
        if (cell && cell.v !== undefined && cell.v !== null && cell.v !== "") {
          nonEmptyCells++
          if (typeof cell.v === "string") {
            hasText = true
          }
        }
      }
      
      // Agar kamida 2 ta non-empty cell bo'lsa va text bo'lsa, bu header bo'lishi mumkin
      if (nonEmptyCells >= 2 && hasText) {
        // Keyingi qatorni tekshirish - agar u ham text bo'lsa, bu multi-row header
        const nextRow = row + 1
        let nextRowHasText = false
        for (let col = 0; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: nextRow, c: col })
          const cell = worksheet[cellAddress]
          if (cell && typeof cell.v === "string" && cell.v.trim() !== "") {
            nextRowHasText = true
            break
          }
        }
        
        // Agar keyingi qator ham text bo'lsa va data bo'lmasa, header davom etmoqda
        if (nextRowHasText) {
          // Keyingi qatorni ham tekshirish
          const nextNextRow = row + 2
          let nextNextRowHasNumber = false
          for (let col = 0; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: nextNextRow, c: col })
            const cell = worksheet[cellAddress]
            if (cell && (typeof cell.v === "number" || !isNaN(Number(cell.v)))) {
              nextNextRowHasNumber = true
              break
            }
          }
          
          // Agar 2-qatorda number bo'lsa, birinchi qator header
          if (nextNextRowHasNumber) {
            return row
          }
        } else {
          // Keyingi qator data bo'lsa, bu header
          return row
        }
      }
    }
    
    return 0 // Default - birinchi qator
  }

  // Multi-row headers ni birlashtirish
  const combineMultiRowHeaders = (
    worksheet: XLSX.WorkSheet,
    headerStartRow: number,
    headerEndRow: number
  ): string[] => {
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1")
    const headers: string[] = []
    
    // Merged cells ni tekshirish
    const mergedRanges = worksheet["!merges"] || []
    
    // Har bir column uchun
    for (let col = 0; col <= range.e.c; col++) {
      const headerParts: string[] = []
      const seenValues = new Set<string>()
      
      // Har bir header qatori uchun (yuqoridan pastga)
      for (let row = headerStartRow; row <= headerEndRow; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
        let cell = worksheet[cellAddress]
        let cellValue: any = null
        
        // Agar cell bo'sh bo'lsa, merged cell ni tekshirish
        if (!cell || cell.v === undefined || cell.v === null || cell.v === "") {
          // Bu column uchun merged cell ni topish
          for (const mergeRange of mergedRanges) {
            // Agar bu column merged range ichida bo'lsa
            if (
              col >= mergeRange.s.c &&
              col <= mergeRange.e.c &&
              row >= mergeRange.s.r &&
              row <= mergeRange.e.r
            ) {
              // Merged cell ning boshlang'ich qiymatini olish
              const startCellAddress = XLSX.utils.encode_cell({ r: mergeRange.s.r, c: mergeRange.s.c })
              const startCell = worksheet[startCellAddress]
              if (startCell && (startCell.v !== undefined || startCell.w)) {
                cellValue = startCell.v ?? startCell.w
                break
              }
            }
          }
        } else {
          cellValue = cell.v ?? cell.w
        }
        
        // Agar qiymat topilgan bo'lsa va bo'sh bo'lmasa
        if (cellValue !== null && cellValue !== undefined && cellValue !== "") {
          const value = String(cellValue).trim()
          // Faqat muhim qiymatlarni qo'shish
          // Bo'sh, "-", yoki faqat raqam bo'lmasa, va uzunligi 1 dan katta bo'lsa
          if (
            value &&
            value !== "-" &&
            value.length > 1 &&
            !/^[\d\s,\.]+$/.test(value) && // Faqat raqam, probel, vergul, nuqta bo'lmasa
            !seenValues.has(value) // Allaqachon ko'rilgan bo'lmasa
          ) {
            headerParts.push(value)
            seenValues.add(value)
          }
        }
      }
      
      // Header qismlarini birlashtirish
      if (headerParts.length > 0) {
        // Agar bir nechta qism bo'lsa, ularni " - " bilan birlashtirish
        const combined = headerParts.filter((part) => part && part.trim() !== "").join(" - ")
        headers.push(combined || `Column_${col + 1}`)
      } else {
        headers.push(`Column_${col + 1}`)
      }
    }
    
    return headers
  }

  const parseExcel = async (file: File): Promise<DataRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          // Excel faylni o'qish - python.py dagi kabi
          const workbook = XLSX.read(data, { 
            type: "array",
            cellDates: true,
            cellNF: false,
            cellText: false,
            raw: false,
            sheetStubs: true // Bo'sh celllarni ham o'qish
          })
          
          // Birinchi sheet ni olish
          const firstSheetName = workbook.SheetNames[0]
          let worksheet = workbook.Sheets[firstSheetName]
          
          // Merged cells ni to'ldirish
          worksheet = fillMergedCells(worksheet)
          
          // Header qatorini topish
          const headerRow = findHeaderRow(worksheet)
          
          // Multi-row header ni aniqlash (1-3 qator header bo'lishi mumkin)
          let headerEndRow = headerRow
          const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1")
          
          // Keyingi qatorlarni tekshirish - agar text bo'lsa va data bo'lmasa, header davom etmoqda
          for (let row = headerRow + 1; row <= Math.min(headerRow + 5, range.e.r); row++) {
            let hasText = false
            let hasNumber = false
            let textCount = 0
            let numberCount = 0
            let totalCells = 0
            
            for (let col = 0; col <= range.e.c; col++) {
              const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
              const cell = worksheet[cellAddress]
              if (cell && cell.v !== undefined && cell.v !== null && cell.v !== "") {
                totalCells++
                if (typeof cell.v === "string" && cell.v.trim() !== "" && cell.v !== "-") {
                  hasText = true
                  textCount++
                } else if (typeof cell.v === "number" || (!isNaN(Number(cell.v)) && cell.v !== "")) {
                  hasNumber = true
                  numberCount++
                }
              }
            }
            
            // Agar text ko'p bo'lsa va number kam bo'lsa, bu header davomi
            // Yoki agar text va number nisbati 2:1 dan katta bo'lsa
            if (totalCells > 0 && (textCount > numberCount * 2 || (hasText && !hasNumber))) {
              headerEndRow = row
            } else if (hasNumber && numberCount > textCount) {
              // Agar number ko'p bo'lsa, bu data qatori
              break
            }
          }
          
          // Multi-row headers ni birlashtirish
          const combinedHeaders = combineMultiRowHeaders(worksheet, headerRow, headerEndRow)
          
          // Data qatorlarini o'qish (header dan keyin)
          const dataStartRow = headerEndRow + 1
          const jsonData: DataRow[] = []
          
          for (let row = dataStartRow; row <= range.e.r; row++) {
            const rowData: DataRow = {}
            let hasData = false
            
            for (let col = 0; col < combinedHeaders.length; col++) {
              const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
              const cell = worksheet[cellAddress]
              
              let value: any = null
              if (cell) {
                if (cell.v !== undefined && cell.v !== null && cell.v !== "") {
                  value = cell.v
                  hasData = true
                } else if (cell.w) {
                  value = cell.w
                  hasData = true
                }
              }
              
              rowData[combinedHeaders[col]] = value
            }
            
            // Agar qatorda kamida bitta data bo'lsa, qo'shish
            if (hasData) {
              jsonData.push(rowData)
            }
          }
          
          // Date columnlarni avtomatik aniqlash va parse qilish (python.py dagi kabi)
          const processedData = jsonData.map((row) => {
            const processedRow: DataRow = {}
            Object.keys(row).forEach((key) => {
              const value = row[key]
              
              // Bo'sh qiymatlar
              if (value === "" || value === null || value === undefined) {
                processedRow[key] = null
                return
              }
              
              // Date columnlarni aniqlash va parse qilish (python.py dagi kabi)
              const keyLower = key.toLowerCase()
              if (keyLower.includes("date") || keyLower.includes("time")) {
                try {
                  if (value instanceof Date) {
                    processedRow[key] = value.toISOString().split("T")[0]
                  } else if (typeof value === "string") {
                    const dateValue = new Date(value)
                    if (!isNaN(dateValue.getTime())) {
                      processedRow[key] = dateValue.toISOString().split("T")[0]
                    } else {
                      processedRow[key] = value
                    }
                  } else {
                    processedRow[key] = value
                  }
                } catch {
                  processedRow[key] = value
                }
              } else {
                // Number conversion (python.py dagi kabi)
                // String numberlarni ham parse qilish (masalan, "1,237,304" -> 1237304)
                let numValue: number | null = null
                if (typeof value === "string") {
                  // Comma va space larni olib tashlash
                  const cleanedValue = value.replace(/,/g, "").replace(/\s/g, "").trim()
                  numValue = Number(cleanedValue)
                } else if (typeof value === "number") {
                  numValue = value
                }
                
                if (numValue !== null && !isNaN(numValue) && value !== "") {
                  processedRow[key] = numValue
                } else {
                  processedRow[key] = value
                }
              }
            })
            return processedRow
          })
          
          resolve(processedData)
        } catch (error) {
          reject(new Error(`Excel faylni o'qishda xatolik: ${error instanceof Error ? error.message : String(error)}`))
        }
      }
      reader.onerror = () => {
        reject(new Error("Faylni o'qib bo'lmadi"))
      }
      reader.readAsArrayBuffer(file)
    })
  }

  const handleFile = async (file: File) => {
    setFileNameState(file.name)
    setUploadStatus("uploading")
    setErrorMessage(null)

    try {
      let parsedData: DataRow[] = []

      // Check file type
      if (file.name.endsWith(".csv")) {
        parsedData = await parseCSV(file)
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        parsedData = await parseExcel(file)
      } else {
        throw new Error("Unsupported file format. Please upload CSV or Excel file.")
      }

      // Clean and process data
      const cleanedData = parsedData
        .map((row) => {
          const cleanedRow: DataRow = {}
          Object.keys(row).forEach((key) => {
            const value = row[key]
            // Convert empty strings to null
            if (value === "" || value === null || value === undefined) {
              cleanedRow[key] = null
            } else {
              // Try to convert to number if possible
              const numValue = Number(value)
              if (!isNaN(numValue) && value !== "" && typeof value !== "object") {
                cleanedRow[key] = numValue
              } else {
                cleanedRow[key] = value
              }
            }
          })
          return cleanedRow
        })
        .filter((row) => Object.keys(row).length > 0)

      if (cleanedData.length === 0) {
        throw new Error("No data found in file")
      }

      // Store data
      setRawData(cleanedData)
      setData(cleanedData)
      setFileName(file.name)
      setDataLoaded(true)
      setUploadStatus("success")
      onDataLoaded?.(file.name)

      setTimeout(() => {
        setUploadStatus("idle")
      }, 2000)
    } catch (error) {
      console.error("Error parsing file:", error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to parse file")
      setUploadStatus("error")
      setDataLoaded(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
          isDragging ? "border-primary bg-primary/5" : "border-border bg-card"
        } cursor-pointer hover:border-primary/50`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
            <Upload className="w-8 h-8 text-foreground/60" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{t.uploadFile}</h3>
            <p className="text-foreground/60 text-sm">{t.dragDropFile}</p>
          </div>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm cursor-pointer"
          >
            {t.selectFile}
          </label>
        </div>
      </div>

      {/* Status Messages */}
      {uploadStatus === "uploading" && (
        <div className="card-subtle p-4 border border-primary/30 bg-primary/5 rounded-lg flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
          <span className="text-foreground text-sm">{t.uploading}: {fileName}...</span>
        </div>
      )}

      {uploadStatus === "success" && (
        <div className="card-subtle p-4 border border-green-600/30 bg-green-50 dark:bg-green-950/20 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-foreground font-medium text-sm">{t.fileUploaded}</p>
            <p className="text-foreground/60 text-xs">{fileName}</p>
          </div>
        </div>
      )}

      {uploadStatus === "error" && errorMessage && (
        <div className="card-subtle p-4 border border-red-600/30 bg-red-50 dark:bg-red-950/20 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-foreground font-medium text-sm">Error</p>
            <p className="text-foreground/60 text-xs">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Sample Data Section */}
      <div className="card-subtle p-6 rounded-lg border border-border">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-foreground/60" />
          <h3 className="text-lg font-semibold text-foreground">{t.sampleData}</h3>
        </div>
        <p className="text-foreground/70 mb-4 text-sm">{t.useSample}</p>
        <div className="bg-muted p-4 rounded-lg font-mono text-xs text-foreground/80 overflow-x-auto mb-4">
          {`Дата,Продукт,Продажи,Количество,Регион
2024-01-01,Продукт A,15000,120,Север
2024-01-02,Продукт B,22000,180,Юг
2024-01-03,Продукт A,18000,150,Восток
2024-01-04,Продукт C,12000,90,Запад`}
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
          {t.loadSample}
        </button>
      </div>
    </div>
  )
}
