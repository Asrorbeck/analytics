import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vite-ui-theme") as Theme
      if (saved === "light" || saved === "dark") {
        // Apply theme immediately
        const root = document.documentElement
        if (saved === "dark") {
          root.classList.add("dark")
        } else {
          root.classList.remove("dark")
        }
        return saved
      }
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      const root = document.documentElement
      if (prefersDark) {
        root.classList.add("dark")
        return "dark"
      } else {
        root.classList.remove("dark")
        return "light"
      }
    }
    return "light"
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("vite-ui-theme", theme)
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"))
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}

