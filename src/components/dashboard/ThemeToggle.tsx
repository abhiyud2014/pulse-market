import { useEffect, useRef, useState } from "react";
import { Palette } from "lucide-react";

type Theme = {
  id: string;
  name: string;
  preview: string;
  colors: [string, string];
};

const THEMES: Theme[] = [
  { id: "", name: "Code Noir", preview: "Default dark", colors: ["oklch(0.78 0.17 175)", "oklch(0.65 0.2 245)"] },
  { id: "arctic", name: "Arctic Dawn", preview: "Light mode", colors: ["oklch(0.55 0.17 175)", "oklch(0.5 0.18 245)"] },
  { id: "indigo", name: "Midnight Indigo", preview: "Purple dark", colors: ["oklch(0.75 0.2 310)", "oklch(0.68 0.18 260)"] },
  { id: "amber", name: "Amber Glow", preview: "Warm dark", colors: ["oklch(0.82 0.2 75)", "oklch(0.78 0.2 45)"] },
];

function getCurrentTheme(): string {
  if (typeof document === "undefined") return "";
  return document.documentElement.getAttribute("data-theme") ?? "";
}

function setTheme(id: string) {
  if (id) {
    document.documentElement.setAttribute("data-theme", id);
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  try {
    localStorage.setItem("theme", id);
  } catch {}
}

export function ThemeToggle() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(getCurrentTheme);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (id: string) => {
    setTheme(id);
    setCurrent(id);
    setOpen(false);
  };

  const active = THEMES.find((t) => t.id === current) ?? THEMES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary cursor-pointer"
        style={{ borderColor: "var(--chart-purple)", color: "var(--chart-purple)" }}
        aria-label="Switch theme"
      >
        <Palette className="size-3.5" />
        {active.name}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-border bg-background shadow-xl z-50">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Choose theme
          </div>
          {THEMES.map((t) => {
            const isActive = t.id === current;
            return (
              <button
                key={t.id}
                onClick={() => select(t.id)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs transition-colors hover:bg-secondary cursor-pointer ${
                  isActive ? "bg-secondary/60" : ""
                }`}
              >
                <div
                  className="size-7 rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})`,
                  }}
                />
                <div className="flex-1">
                  <div className="font-medium text-foreground">{t.name}</div>
                  <div className="text-[10px] text-muted-foreground">{t.preview}</div>
                </div>
                {isActive && (
                  <div className="size-2 rounded-full" style={{ background: "var(--chart-teal)" }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
