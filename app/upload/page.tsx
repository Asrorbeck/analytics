"use client"

import { FileUpload } from "@/components/file-upload"
import { useData } from "@/lib/data-context"

export default function UploadPage() {
  const { setDataLoaded, setFileName } = useData()

  const handleDataLoaded = (fileName?: string) => {
    setDataLoaded(true)
    if (fileName) {
      setFileName(fileName)
    }
  }

  return <FileUpload onDataLoaded={handleDataLoaded} />
}

