"use client"

import { useState } from "react"
import { FileUpload } from "./file-upload"
import { DataPreview } from "./data-preview"
import { StatisticsPanel } from "./statistics-panel"
import { VisualizationPanel } from "./visualization-panel"
import { AIAssistant } from "./ai-assistant"
import { useLanguage } from "@/lib/language-context"
import { ThemeToggle } from "./theme-toggle"
import { LanguageSwitcher } from "./language-switcher"
import {
  Upload,
  Eye,
  BarChart3,
  LineChart,
  Bot,
  Menu,
  X,
  Building2,
  User,
} from "lucide-react"

export default function DataAnalystDashboard() {
  const [currentTab, setCurrentTab] = useState<"upload" | "preview" | "statistics" | "visualization" | "ai">("upload")
  const [dataLoaded, setDataLoaded] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { t } = useLanguage()

  const navigationItems = [
    { id: "upload" as const, label: t.upload, icon: Upload },
    { id: "preview" as const, label: t.preview, icon: Eye },
    { id: "statistics" as const, label: t.statistics, icon: BarChart3 },
    { id: "visualization" as const, label: t.visualization, icon: LineChart },
    { id: "ai" as const, label: t.ai, icon: Bot },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-semibold text-sidebar-foreground truncate leading-tight">{t.title}</h1>
                <p className="text-xs text-sidebar-foreground/60 truncate mt-0.5">{t.subtitle}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  currentTab === item.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium truncate">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Footer Controls */}
        <div className="border-t border-sidebar-border p-3">
          {sidebarOpen ? (
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-full h-10 px-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors flex items-center justify-center gap-2"
              aria-label="Collapse sidebar"
            >
              <X className="w-4 h-4" />
              <span className="text-sm">{t.settings}</span>
            </button>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-full h-10 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors flex items-center justify-center"
              aria-label="Expand sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{t.title}</h2>
            <p className="text-xs text-foreground/60 mt-0.5">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-foreground cursor-pointer hover:bg-muted/80 transition-colors">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto w-full">
            {currentTab === "upload" && <FileUpload onDataLoaded={() => setDataLoaded(true)} />}
            {currentTab === "preview" && dataLoaded && <DataPreview />}
            {currentTab === "statistics" && dataLoaded && <StatisticsPanel />}
            {currentTab === "visualization" && dataLoaded && <VisualizationPanel />}
            {currentTab === "ai" && <AIAssistant />}

            {!dataLoaded && currentTab !== "upload" && currentTab !== "ai" && (
              <div className="card-subtle h-96 flex items-center justify-center flex-col gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground">{t.pleaseUploadFile}</p>
                <button
                  onClick={() => setCurrentTab("upload")}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                >
                  {t.goToUpload}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
