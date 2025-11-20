import { useLanguage } from "@/lib/language-context"
import { Languages } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()

  const languages = [
    { code: "uz-lat" as const, label: "O'zbek (Lotin)" },
    { code: "uz-cyr" as const, label: "Ўзбек (Кирилл)" },
    { code: "ru" as const, label: "Русский" },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          aria-label={t.language}
          title={t.language}
        >
          <Languages className="w-4 h-4 text-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={language === lang.code ? "bg-accent text-accent-foreground" : ""}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

