import { VisualizationPanel } from "@/components/visualization-panel"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/lib/language-context"
import { useData } from "@/lib/data-context"
import { Upload } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function VisualizationPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { dataLoaded, sheets, selectedSheet, setSelectedSheet } = useData()

  if (!dataLoaded) {
    return (
      <div className="card-subtle h-96 flex items-center justify-center flex-col gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Upload className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground">{t.pleaseUploadFile}</p>
        <button
          onClick={() => navigate("/upload")}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
        >
          {t.goToUpload}
        </button>
      </div>
    )
  }

  // Agar faqat bitta sheet bo'lsa, tabs ko'rsatmaslik
  if (sheets.length <= 1) {
    return <VisualizationPanel />
  }

  const currentSheet = selectedSheet || sheets[0]?.name

  return (
    <div className="space-y-4">
      <Tabs value={currentSheet} onValueChange={setSelectedSheet}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {sheets.map((sheet) => (
            <TabsTrigger key={sheet.name} value={sheet.name}>
              {sheet.name}
              <span className="ml-2 text-xs opacity-60">({sheet.data.length})</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {sheets.map((sheet) => (
          <TabsContent key={sheet.name} value={sheet.name}>
            <VisualizationPanel />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

