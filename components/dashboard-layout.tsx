"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import {
  Upload,
  Eye,
  BarChart3,
  LineChart,
  Bot,
  Menu,
  Building2,
  User,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logoError, setLogoError] = useState(false);
  const { t } = useLanguage();

  const navigationItems = [
    { id: "upload", path: "/upload", label: t.upload, icon: Upload },
    { id: "preview", path: "/preview", label: t.preview, icon: Eye },
    {
      id: "statistics",
      path: "/statistics",
      label: t.statistics,
      icon: BarChart3,
    },
    {
      id: "visualization",
      path: "/visualization",
      label: t.visualization,
      icon: LineChart,
    },
    { id: "ai", path: "/ai", label: t.ai, icon: Bot },
  ];

  const currentPath = pathname || "/upload";
  const isActive = (path: string) => currentPath === path;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div
          className={`${
            sidebarOpen ? "p-6" : "px-3 py-6"
          } border-b border-sidebar-border`}
        >
          <div
            className={`flex items-center ${
              sidebarOpen ? "gap-3" : "justify-center"
            }`}
          >
            <div className="w-12 h-12 rounded-lg bg-transparent flex items-center justify-center shrink-0 overflow-hidden">
              {!logoError ? (
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                  onError={() => {
                    setLogoError(true);
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
              )}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs text-sidebar-foreground/70 leading-tight">
                  O'zbekiston Respublikasi
                </p>
                <h1 className="text-base font-semibold text-sidebar-foreground leading-tight mt-0.5">
                  Markaziy Banki
                </h1>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="text-sm font-medium truncate">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-9 w-9 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground transition-colors"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {t.title}
              </h2>
              <p className="text-xs text-foreground/60 mt-0.5">{t.subtitle}</p>
            </div>
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
          <div className="p-6 w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
