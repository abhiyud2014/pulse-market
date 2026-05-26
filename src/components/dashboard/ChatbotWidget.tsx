import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle, X, Send, Sparkles, Loader2, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";

const SUGGESTIONS = [
  "Which channel grew fastest YoY?",
  "Compare Brand A share: Urban vs Rural",
  "Top SKU by revenue & its distribution gap",
  "Where is HH penetration weakest?",
];

const FOLLOW_UP_RE = /__FOLLOW_UPS__:\s*(\[[\s\S]*?\])\s*$/;

function extractFollowUps(text: string): { clean: string; questions: string[] } {
  const match = text.match(FOLLOW_UP_RE);
  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed)) {
        return { clean: text.slice(0, match.index).trim(), questions: parsed };
      }
    } catch {}
  }
  return { clean: text, questions: [] };
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, setMessages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const resetChat = useCallback(() => {
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  }, [setMessages]);

  const submit = useCallback((text: string) => {
    const t = text.trim();
    if (!t || isLoading) return;
    sendMessage({ text: t });
    setInput("");
  }, [isLoading, sendMessage]);

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          aria-label="Open dashboard assistant"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer"
          style={{
            background: "linear-gradient(135deg, var(--chart-teal), var(--chart-blue))",
            boxShadow: "0 10px 30px -10px oklch(0.65 0.2 245 / 0.6)",
          }}
        >
          <MessageCircle className="size-6 text-background" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[600px] max-h-[calc(100vh-3rem)] w-[400px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: "linear-gradient(135deg, var(--chart-teal), var(--chart-blue))" }}
          >
            <div className="flex items-center gap-2 text-background">
              <Sparkles className="size-4" />
              <div>
                <p className="text-sm font-bold leading-tight">Dataset Assistant</p>
                <p className="text-[10px] opacity-80">Ask anything about this dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={resetChat}
                  className="rounded-md p-1 text-background/90 hover:bg-background/10 cursor-pointer"
                  aria-label="Start new chat"
                  title="New chat"
                >
                  <RefreshCw className="size-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-background/90 hover:bg-background/10 cursor-pointer"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Hi! I have full context of the market, channel, HH panel & SKU data. Try:
                </p>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-left text-xs hover:bg-secondary cursor-pointer transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => {
              const raw = m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              const isUser = m.role === "user";
              const { clean: text, questions: followUps } = isUser ? { clean: raw, questions: [] } : extractFollowUps(raw);
              return (
                <div
                  key={m.id}
                  className={isUser ? "flex justify-end" : "flex justify-start"}
                >
                  <div className={isUser ? "" : "max-w-[92%]"}>
                    {isUser ? (
                      <div
                        className="max-w-[85%] rounded-2xl rounded-tr-sm px-3 py-2 text-xs"
                        style={{ background: "var(--chart-blue)", color: "white" }}
                      >
                        {text}
                      </div>
                    ) : (
                      <div className="text-xs leading-relaxed text-foreground">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="my-1.5 whitespace-pre-wrap">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                            ul: ({ children }) => <ul className="my-1.5 ml-4 list-disc space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="my-1.5 ml-4 list-decimal space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="leading-snug">{children}</li>,
                            h1: ({ children }) => <h3 className="mt-2 mb-1 text-sm font-bold">{children}</h3>,
                            h2: ({ children }) => <h3 className="mt-2 mb-1 text-sm font-bold">{children}</h3>,
                            h3: ({ children }) => <h4 className="mt-2 mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{children}</h4>,
                            code: ({ children }) => <code className="rounded bg-secondary px-1 py-0.5 text-[11px] font-mono">{children}</code>,
                            pre: ({ children }) => <pre className="my-2 overflow-x-auto rounded-md border border-border bg-secondary/60 p-2 text-[11px]">{children}</pre>,
                            a: ({ children, href }) => (
                              <a href={href} target="_blank" rel="noreferrer" className="underline" style={{ color: "var(--chart-teal)" }}>
                                {children}
                              </a>
                            ),
                            table: ({ children }) => (
                              <div className="my-2 overflow-x-auto rounded-md border border-border">
                                <table className="w-full border-collapse text-[11px]">{children}</table>
                              </div>
                            ),
                            thead: ({ children }) => <thead className="bg-secondary/70">{children}</thead>,
                            tr: ({ children }) => <tr className="border-b border-border last:border-0">{children}</tr>,
                            th: ({ children }) => <th className="px-2 py-1.5 text-left font-semibold">{children}</th>,
                            td: ({ children }) => <td className="px-2 py-1.5 tabular-nums">{children}</td>,
                            blockquote: ({ children }) => (
                              <blockquote className="my-2 border-l-2 pl-2 italic text-muted-foreground" style={{ borderColor: "var(--chart-teal)" }}>
                                {children}
                              </blockquote>
                            ),
                            hr: () => <hr className="my-2 border-border" />,
                          }}
                        >
                          {text || "…"}
                        </ReactMarkdown>
                        {followUps.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {followUps.map((q, i) => (
                              <button
                                key={i}
                                onClick={() => submit(q)}
                                className="rounded-full border border-border bg-secondary/30 px-2.5 py-1 text-[10px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                Thinking…
              </div>
            )}

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error.message || "Something went wrong."}
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="flex items-end gap-2 border-t border-border bg-secondary/30 p-3"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(input);
                }
              }}
              rows={1}
              placeholder="Ask about a market, brand, SKU…"
              className="max-h-32 flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-ring"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="size-9 shrink-0"
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
