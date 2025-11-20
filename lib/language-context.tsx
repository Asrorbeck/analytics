import React, { createContext, useContext, useState, useEffect } from "react"
import { Language, translations } from "./translations"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof translations[Language]
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language") as Language
      if (saved && (saved === "uz-lat" || saved === "uz-cyr" || saved === "ru")) {
        return saved
      }
    }
    return "uz-lat"
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("language", language)
    }
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}

