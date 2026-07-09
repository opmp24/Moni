import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem("wally-theme")
    if (stored === "light" || stored === "dark" || stored === "system") return stored
  } catch {}
  return null
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme() ?? "system")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    const stored = getStoredTheme()
    return stored && stored !== "system" ? stored : getSystemTheme()
  })

  const applyTheme = (t: "light" | "dark") => {
    const root = document.documentElement
    if (t === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute("content", t === "dark" ? "#0a0a0a" : "#ffffff")
    }
  }

  useEffect(() => {
    const resolved = theme === "system" ? getSystemTheme() : theme
    setResolvedTheme(resolved)
    applyTheme(resolved)

    try {
      localStorage.setItem("wally-theme", theme)
    } catch {}

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      const handler = () => {
        const sys = getSystemTheme()
        setResolvedTheme(sys)
        applyTheme(sys)
      }
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    }
  }, [theme])

  const setTheme = (t: Theme) => setThemeState(t)

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
