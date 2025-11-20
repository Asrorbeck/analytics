import { Moon, Sun } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useTheme } from "@/lib/theme-context"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()

  const isDark = theme === "dark"

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
      aria-label={isDark ? t.lightMode : t.darkMode}
      title={isDark ? t.lightMode : t.darkMode}
      type="button"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-foreground" />
      ) : (
        <Moon className="w-4 h-4 text-foreground" />
      )}
    </button>
  )
}

