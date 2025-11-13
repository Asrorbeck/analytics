"use client"

import type React from "react"
import { useState } from "react"
import { Upload, CheckCircle, Loader2, FileText } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface FileUploadProps {
  onDataLoaded?: (fileName?: string) => void
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const { t } = useLanguage()
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [fileName, setFileName] = useState<string | null>(null)

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

  const handleFile = async (file: File) => {
    setFileName(file.name)
    setUploadStatus("uploading")

    // Simulate upload delay
    setTimeout(() => {
      setUploadStatus("success")
      onDataLoaded?.(file.name)
      setTimeout(() => {
        setUploadStatus("idle")
      }, 2000)
    }, 1500)
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
