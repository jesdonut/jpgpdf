"use client"

import { useEffect, useState } from "react"
import { useT } from "@/lib/i18n"

// A plain scratchpad — paste a phone number, birthdate, whatever. No parsing,
// no "reading". Persists in the browser so it survives a reload.
const KEY = "leo_memo"

export default function MemoPanel() {
  const { t } = useT()
  const [text, setText] = useState("")

  useEffect(() => { setText(localStorage.getItem(KEY) ?? "") }, [])

  function update(v: string) {
    setText(v)
    try { localStorage.setItem(KEY, v) } catch {}
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="label-xs">{t("leo.memoTitle")}</p>
        {text && (
          <button onClick={() => update("")}
            className="text-[0.65rem] text-[var(--text-3)] hover:text-red-400 transition-colors">
            {t("common.clear")}
          </button>
        )}
      </div>
      <textarea
        value={text}
        onChange={e => update(e.target.value)}
        placeholder={t("leo.memoPlaceholder")}
        className="w-full min-h-[90px] resize-y bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--text-2)] placeholder:text-[var(--text-3)]"
      />
    </div>
  )
}
