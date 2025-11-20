import { useState, useEffect } from "react";
import { Send, Loader2, Bot, MessageSquare, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useData } from "@/lib/data-context";

// OpenAI API endpoint
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// localStorage keys
const CHAT_HISTORY_KEY = "ai_chat_history";
const API_KEY_STORAGE_KEY = "openai_api_key";

// OpenAI API Key - runtime da olinadi (environment variable yoki localStorage)
const getApiKey = (): string => {
  // 1. Environment variable (build vaqtida bo'lmasa, undefined bo'ladi)
  const envKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (envKey) return envKey;

  // 2. localStorage dan olish
  if (typeof window !== "undefined") {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedKey) return storedKey;
  }

  return "";
};

export function AIAssistant() {
  const { t, language } = useLanguage();
  const { data, columns, dataLoaded } = useData();

  // localStorage dan messages ni yuklash
  const loadMessagesFromStorage = (): Array<{
    role: "user" | "assistant";
    content: string;
  }> => {
    if (typeof window === "undefined") {
      return [
        {
          role: "assistant",
          content: t.aiDescription,
        },
      ];
    }

    try {
      const saved = localStorage.getItem(CHAT_HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Agar array bo'lsa va kamida bitta message bo'lsa
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }

    // Default message
    return [
      {
        role: "assistant",
        content: t.aiDescription,
      },
    ];
  };

  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >(loadMessagesFromStorage);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>(() => getApiKey());
  const [showApiKeyInput, setShowApiKeyInput] = useState(() => !getApiKey());

  // Messages o'zgarganda localStorage ga saqlash
  useEffect(() => {
    if (typeof window !== "undefined" && messages.length > 0) {
      try {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
      } catch (error) {
        console.error("Error saving chat history:", error);
      }
    }
  }, [messages]);

  // Language o'zgarganda default message ni yangilash (faqat birinchi marta)
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === "assistant") {
      setMessages([
        {
          role: "assistant",
          content: t.aiDescription,
        },
      ]);
    }
  }, [t.aiDescription]);

  const prepareDataInfo = () => {
    if (!dataLoaded || !data || data.length === 0) {
      return null;
    }

    // Ma'lumotlarni tayyorlash
    const sample = data.slice(0, 5).reduce((acc, row, idx) => {
      Object.keys(row).forEach((key) => {
        if (!acc[key]) acc[key] = [];
        acc[key].push(row[key]);
      });
      return acc;
    }, {} as Record<string, any[]>);

    const dtypes: Record<string, string> = {};
    columns.forEach((col) => {
      dtypes[col.name] = col.type;
    });

    const missing: Record<string, number> = {};
    columns.forEach((col) => {
      missing[col.name] = data.filter(
        (row) =>
          row[col.name] === null ||
          row[col.name] === undefined ||
          row[col.name] === ""
      ).length;
    });

    // Statistical summary faqat numeric columns uchun
    const numericCols = columns.filter((col) => col.numeric);
    const describe: Record<string, any> = {};
    if (numericCols.length > 0) {
      numericCols.forEach((col) => {
        const values = data
          .map((row) => Number(row[col.name]))
          .filter((v) => !isNaN(v));
        if (values.length > 0) {
          describe[col.name] = {
            count: values.length,
            mean: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            std: Math.sqrt(
              values.reduce(
                (acc, val) =>
                  acc +
                  Math.pow(
                    val - values.reduce((a, b) => a + b, 0) / values.length,
                    2
                  ),
                0
              ) / values.length
            ),
          };
        }
      });
    }

    return {
      shape: [data.length, columns.length],
      columns: columns.map((col) => col.name),
      dtypes,
      describe: Object.keys(describe).length > 0 ? describe : undefined,
      sample,
      missing,
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // API key tekshirish
    const currentApiKey = apiKey || getApiKey();
    if (!currentApiKey) {
      setShowApiKeyInput(true);
      setError("OpenAI API key kiritilmagan. Iltimos, API key ni kiriting.");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    setError(null);

    // User message ni qo'shish va assistant message index ni olish
    let assistantMessageIndex = 0;
    setMessages((prev) => {
      const updated = [
        ...prev,
        { role: "user" as const, content: userMessage },
      ];
      assistantMessageIndex = updated.length; // Assistant message index
      return [...updated, { role: "assistant" as const, content: "" }];
    });

    try {
      const dataInfo = prepareDataInfo();

      // System prompt yaratish
      let systemPrompt = `You are a helpful data analyst assistant. You help users analyze their data and answer questions about datasets.`;
      let userPrompt = userMessage;

      if (dataInfo && dataInfo.shape) {
        systemPrompt = `You are an expert data analyst assistant. You help users analyze their data and answer questions about datasets. 

When provided with data information, you should:
- Analyze the data structure and characteristics
- Identify trends, patterns, and insights
- Answer questions about the data
- Provide recommendations based on the data

Always respond in the language requested by the user.`;

        userPrompt = `Data Information:
- Shape: ${dataInfo.shape[0]} rows × ${dataInfo.shape[1]} columns
- Columns: ${dataInfo.columns?.join(", ") || "N/A"}
- Data types: ${JSON.stringify(dataInfo.dtypes || {})}
- Sample data (first 5 rows): ${JSON.stringify(dataInfo.sample || {})}
- Missing values: ${JSON.stringify(dataInfo.missing || {})}
${
  dataInfo.describe
    ? `- Statistical summary: ${JSON.stringify(dataInfo.describe)}`
    : ""
}

User Query: ${userMessage}

Please provide a comprehensive analysis in ${
          language === "uz-lat"
            ? "Uzbek (Latin)"
            : language === "uz-cyr"
            ? "Uzbek (Cyrillic)"
            : language === "ru"
            ? "Russian"
            : "English"
        } language.`;
      } else {
        userPrompt = `User Query: ${userMessage}

Please provide a helpful response in ${
          language === "uz-lat"
            ? "Uzbek (Latin)"
            : language === "uz-cyr"
            ? "Uzbek (Cyrillic)"
            : language === "ru"
            ? "Russian"
            : "English"
        } language.`;
      }

      // OpenAI API ga streaming so'rov
      const models = ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"];
      let lastError: Error | null = null;

      // Har bir modelni sinab ko'rish
      for (const modelName of models) {
        try {
          console.log(`Trying OpenAI model: ${modelName} (streaming)`);

          const response = await fetch(OPENAI_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentApiKey}`,
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              temperature: 0.7,
              max_tokens: 2000,
              stream: true, // Streaming ni yoqish
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({
              error: { message: `HTTP ${response.status}` },
            }));
            throw new Error(
              errorData.error?.message ||
                `HTTP error! status: ${response.status}`
            );
          }

          // Streaming response ni o'qish
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let fullContent = "";

          if (!reader) {
            throw new Error("Response body reader not available");
          }

          // Stream ni o'qish
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.trim() === "") continue;
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  console.log(`✅ Streaming complete with model: ${modelName}`);
                  setIsLoading(false);
                  return; // Muvaffaqiyatli bo'lsa, chiqish
                }

                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices[0]?.delta?.content;
                  if (delta) {
                    fullContent += delta;
                    // Real-time yangilash
                    setMessages((prev) => {
                      const updated = [...prev];
                      updated[assistantMessageIndex] = {
                        role: "assistant",
                        content: fullContent,
                      };
                      return updated;
                    });
                  }
                } catch (parseError) {
                  // JSON parse xatosi - e'tiborsiz qoldirish
                  continue;
                }
              }
            }
          }

          // Agar stream muvaffaqiyatli tugasa
          if (fullContent) {
            console.log(`✅ Success with model: ${modelName}`);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.log(`❌ Model ${modelName} failed:`, err);
          lastError = err instanceof Error ? err : new Error(String(err));

          // Xatolik bo'lsa, assistant message ni o'chirish
          setMessages((prev) => prev.slice(0, assistantMessageIndex));
          setIsLoading(false);

          // Keyingi modelga o'tish
          continue;
        }
      }

      // Barcha modellar ishlamasa
      setMessages((prev) => prev.slice(0, assistantMessageIndex));
      setIsLoading(false);
      throw lastError || new Error("All models failed");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.";

      // Xatolik tahlili
      let userFriendlyError = errorMessage;
      if (
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized")
      ) {
        userFriendlyError =
          "API key noto'g'ri yoki mavjud emas. Iltimos, VITE_OPENAI_API_KEY ni tekshiring.";
      } else if (
        errorMessage.includes("429") ||
        errorMessage.includes("rate limit")
      ) {
        userFriendlyError =
          "API rate limitiga yetib keldingiz. Iltimos, bir necha daqiqa kutib, qayta urinib ko'ring.";
      } else if (errorMessage.includes("quota")) {
        userFriendlyError =
          "Quota limitiga yetib keldingiz. Iltimos, OpenAI dashboard da quota holatini tekshiring.";
      }

      setError(userFriendlyError);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Xatolik: ${userFriendlyError}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQuestions = [t.question1, t.question2, t.question3, t.question4];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[900px]">
      {/* Header - Info Box */}
      <div className="bg-card border-b border-border p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-foreground/60" />
            <h3 className="text-lg font-semibold text-foreground">
              {t.aiAssistant}
            </h3>
          </div>
          {!dataLoaded && (
            <div className="text-xs text-foreground/60 bg-muted/50 px-3 py-1 rounded-full">
              💡 Ma'lumotlar yuklangandan keyin AI yanada aniqroq javob bera
              oladi
            </div>
          )}
        </div>
      </div>

      {/* API Key Input */}
      {showApiKeyInput && (
        <div className="bg-card border-x border-border border-b border-border p-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              OpenAI API Key
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="flex-1 px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary text-sm"
              />
              <button
                onClick={() => {
                  if (apiKey.trim()) {
                    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
                    setShowApiKeyInput(false);
                    setError(null);
                  }
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                Saqlash
              </button>
            </div>
            <p className="text-xs text-foreground/60">
              API key localStorage ga saqlanadi va faqat sizning brauzeringizda
              saqlanadi.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border-x border-destructive/20 text-destructive px-4 py-2 flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-card border-x border-border overflow-hidden">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => {
            const isLastMessage = idx === messages.length - 1;
            const isEmptyAssistant = msg.role === "assistant" && !msg.content;
            const isStreaming = isEmptyAssistant && isLastMessage && isLoading;

            return (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] px-4 py-3 rounded-lg flex items-start gap-2 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground border border-border rounded-bl-sm"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <Bot className="w-4 h-4 mt-0.5 shrink-0 text-foreground/60" />
                  )}
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content ? (
                      msg.content
                    ) : isStreaming ? (
                      <span className="inline-flex items-center gap-2 text-foreground/60">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>{t.analyzing}</span>
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-background">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={t.askQuestion}
                rows={1}
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary text-sm resize-none max-h-32 overflow-y-auto"
                style={{
                  minHeight: "44px",
                  height: "44px",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "44px";
                  target.style.height = `${Math.min(
                    target.scrollHeight,
                    128
                  )}px`;
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="h-[44px] px-5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[44px] shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Questions - Compact */}
          <div className="mt-3 flex flex-wrap gap-2">
            {exampleQuestions.slice(0, 2).map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(q);
                }}
                className="text-xs px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-full transition-colors"
              >
                {q.length > 40 ? q.substring(0, 40) + "..." : q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer - Quick Questions (Collapsible) */}
      <details className="bg-card border border-border border-t-0 rounded-b-lg">
        <summary className="px-4 py-2 text-sm font-semibold text-foreground/70 cursor-pointer hover:bg-muted/50 transition-colors list-none">
          <span className="flex items-center gap-2">
            <span>{t.exampleQuestions}</span>
            <span className="text-xs text-foreground/50">
              ({exampleQuestions.length})
            </span>
          </span>
        </summary>
        <div className="p-4 pt-2 space-y-2 border-t border-border">
          {exampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(q);
              }}
              className="w-full text-left px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors text-sm"
            >
              {q}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}
