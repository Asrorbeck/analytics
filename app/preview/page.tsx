"use client"

import { DataPreview } from "@/components/data-preview"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { useData } from "@/lib/data-context"
import { Upload } from "lucide-react"

export default function PreviewPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { dataLoaded } = useData()

  if (!dataLoaded) {
    return (
      <div className="card-subtle h-96 flex items-center justify-center flex-col gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Upload className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground">{t.pleaseUploadFile}</p>
        <button
          onClick={() => router.push("/upload")}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
        >
          {t.goToUpload}
        </button>
      </div>
    )
  }

  return <DataPreview />
}

