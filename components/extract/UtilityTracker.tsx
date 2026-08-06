"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/cn"
import { useT } from "@/lib/i18n"
import type { MsgKey } from "@/lib/i18n/keys"

// A tiny checklist for a move: did we call electricity / gas / water, and on
// what date. Scratchpad-style (one worker at a time), persisted in the browser.
// Rendered once per address (move-out / move-in) via `storageKey` + `title`.
// Gas also carries 立ち会い (technician attendance): required/not, and a time
// window (from–to, e.g. 9:00–12:00).
type Row = { called: boolean; date: string; tachiai?: "req" | "no"; tachiaiFrom?: string; tachiaiTo?: string }
type State = { electricity: Row; gas: Row; water: Row }
const EMPTY: State = {
  electricity: { called: false, date: "" },
  gas:         { called: false, date: "" },
  water:       { called: false, date: "" },
}

// Japanese labels/terms for the copied text (goes into JP forms regardless of
// the UI language). mode decides 使用開始 (start, move-in) vs 使用停止 (stop, move-out).
const ROWS: { id: keyof State; labelKey: MsgKey; jp: string }[] = [
  { id: "electricity", labelKey: "leo.electricity", jp: "電気" },
  { id: "gas",         labelKey: "leo.gas",         jp: "ガス" },
  { id: "water",       labelKey: "leo.water",       jp: "水道" },
]

export default function UtilityTracker(
  { title, storageKey, mode }: { title: string; storageKey: string; mode: "start" | "stop" }
) {
  const { t } = useT()
  const [state, setState] = useState<State>(EMPTY)
  const [copied, setCopied] = useState(false)
  const term = mode === "stop" ? "使用停止" : "使用開始"

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) setState({ ...EMPTY, ...JSON.parse(saved) })
    } catch {}
  }, [storageKey])

  function save(next: State) {
    setState(next)
    try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch {}
  }
  function set(id: keyof State, patch: Partial<Row>) {
    save({ ...state, [id]: { ...state[id], ...patch } })
  }

  const anySet = ROWS.some(r => state[r.id].called || state[r.id].date)
    || !!state.gas.tachiai || !!state.gas.tachiaiFrom || !!state.gas.tachiaiTo

  // e.g.  電気　使用停止　2026-08-17   (one line per utility that has a date)
  // Gas appends 立会:  ガス　使用開始　2026-08-25　立会い必要　9:00〜12:00
  function copy() {
    const g = state.gas
    const window = [g.tachiaiFrom, g.tachiaiTo].filter(Boolean).join("〜")
    const lines = ROWS
      .filter(r => state[r.id].date || (r.id === "gas" && (g.tachiai || window)))
      .map(r => {
        let line = `${r.jp}　${term}${state[r.id].date ? "　" + state[r.id].date : ""}`
        if (r.id === "gas") {
          if (g.tachiai === "req") line += `　立会い必要${window ? "　" + window : ""}`
          else if (g.tachiai === "no") line += "　立会いなし"
        }
        return line
      })
    const text = lines.join("\n")
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[0.72rem] font-medium text-[var(--text-2)]">{title}</p>
        {anySet && (
          <div className="flex items-center gap-2">
            <button onClick={copy}
              className={cn("text-[0.65rem] transition-colors",
                copied ? "text-green-500" : "text-[var(--text-3)] hover:text-[var(--text)]")}>
              {copied ? t("common.copied") : t("common.copy")}
            </button>
            <button onClick={() => save(EMPTY)}
              className="text-[0.65rem] text-[var(--text-3)] hover:text-red-400 transition-colors">
              {t("common.clear")}
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        {ROWS.map(({ id, labelKey }) => {
          const row = state[id]
          return (
            <div key={id} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => set(id, { called: !row.called })}
                  className={cn(
                    "w-[4.6rem] shrink-0 flex items-center justify-center gap-1 px-2 py-1.5 rounded border text-[0.72rem] transition-colors",
                    row.called
                      ? "bg-green-500/15 border-green-500/40 text-green-500"
                      : "border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text)]"
                  )}
                >
                  {row.called && "✓"} {t(labelKey)}
                </button>
                <input
                  type="date"
                  value={row.date}
                  onChange={e => set(id, { date: e.target.value })}
                  className="flex-1 min-w-0 bg-[var(--bg-2)] border border-[var(--border)] rounded px-2 py-1.5 text-[0.75rem] text-[var(--text)] outline-none focus:border-[var(--text-2)]"
                />
              </div>

              {/* Gas 立ち会い: required / not required (+ time when required) */}
              {id === "gas" && (
                <div className="pl-[5.6rem] flex flex-wrap items-center gap-1.5">
                  <span className="text-[0.65rem] text-[var(--text-3)]">{t("leo.tachiai")}</span>
                  {(["req", "no"] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => set("gas", { tachiai: row.tachiai === v ? undefined : v })}
                      className={cn(
                        "px-1.5 py-0.5 rounded border text-[0.65rem] transition-colors",
                        row.tachiai === v
                          ? "bg-[var(--text)] text-[var(--bg)] border-[var(--text)]"
                          : "border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text)]"
                      )}
                    >
                      {v === "req" ? t("leo.tachiaiReq") : t("leo.tachiaiNo")}
                    </button>
                  ))}
                  {row.tachiai === "req" && (
                    <span className="flex items-center gap-1">
                      <input
                        type="time"
                        value={row.tachiaiFrom ?? ""}
                        onChange={e => set("gas", { tachiaiFrom: e.target.value })}
                        className="min-w-0 bg-[var(--bg-2)] border border-[var(--border)] rounded px-1.5 py-1 text-[0.7rem] text-[var(--text)] outline-none focus:border-[var(--text-2)]"
                      />
                      <span className="text-[var(--text-3)] text-[0.7rem]">〜</span>
                      <input
                        type="time"
                        value={row.tachiaiTo ?? ""}
                        onChange={e => set("gas", { tachiaiTo: e.target.value })}
                        className="min-w-0 bg-[var(--bg-2)] border border-[var(--border)] rounded px-1.5 py-1 text-[0.7rem] text-[var(--text)] outline-none focus:border-[var(--text-2)]"
                      />
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
