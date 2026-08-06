"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { EN, type MsgKey } from "./keys"
import { ja } from "./ja"
import { id } from "./id"
import { vi } from "./vi"
import { my } from "./my"

export type Lang = "ja" | "id" | "vi" | "my"

// No English in the picker — the team speaks these four.
export const LANGS: { code: Lang; label: string }[] = [
  { code: "ja", label: "日本語" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "my", label: "မြန်မာ" },
]

const DICT: Record<Lang, Partial<Record<MsgKey, string>>> = { ja, id, vi, my }
const DEFAULT: Lang = "id"
const STORAGE_KEY = "app_lang"

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: MsgKey) => string }
const LangCtx = createContext<Ctx | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (saved && saved in DICT) setLangState(saved)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch {}
  }

  // Fall back to the English source if a translation is missing.
  const t = (k: MsgKey) => DICT[lang][k] ?? EN[k]

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>
}

export function useT() {
  const ctx = useContext(LangCtx)
  if (!ctx) throw new Error("useT must be used within LanguageProvider")
  return ctx
}
