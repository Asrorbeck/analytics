"use client"

import { useState } from "react"
import { Send, Loader2, Bot, MessageSquare } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function AIAssistant() {
  const { t } = useLanguage()
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: t.aiDescription,
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    setMessages([...messages, { role: "user", content: input }])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: t.aiDescription,
        },
      ])
      setIsLoading(false)
    }, 1500)
  }

  const exampleQuestions = [t.question1, t.question2, t.question3, t.question4]

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-card border border-border p-6 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="w-5 h-5 text-foreground/60" />
          <h3 className="text-lg font-semibold text-foreground">{t.aiAssistant}</h3>
        </div>
        <p className="text-foreground/70 text-sm">{t.aiDescription}</p>
      </div>

      {/* Chat */}
      <div className="card-subtle p-6 rounded-lg border border-border h-96 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs px-4 py-3 rounded-lg flex items-start gap-2 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground border border-border"
                }`}
              >
                {msg.role === "assistant" && <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground border border-border px-4 py-3 rounded-lg flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">{t.analyzing}</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2 border-t border-border pt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder={t.askQuestion}
            className="flex-1 px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary text-sm"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="card-subtle p-6 rounded-lg border border-border">
        <h3 className="text-sm font-semibold text-foreground/70 mb-3">{t.exampleQuestions}</h3>
        <div className="space-y-2">
          {exampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(q)
              }}
              className="w-full text-left px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors text-sm"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
