"use client"

import { useEffect, useMemo, useState } from "react"
import { Icon } from "@/components/Icon"

// 履歴書 generator — a form → printable A4 document. No backend, no libraries:
// the preview is an <iframe srcDoc>, and "print" opens the same HTML in a window
// and calls print() (save as PDF from there). Japanese renders via the browser.

const KEY = "rirekisho_data"

type HistoryRow = { year: string; month: string; text: string; note: string }
type Data = {
  candidateNo: string
  nameFurigana: string; name: string
  birthdate: string
  addrFurigana: string; address: string; email: string
  contactFurigana: string; contact: string; phone: string; contactEmail: string
  history: HistoryRow[]        // 学歴・職歴
  licenses: HistoryRow[]       // 免許・資格
  motivation: string          // 志望動機・自己PR・趣味・特技
  commuteH: string; commuteM: string
  dependents: string
  spouse: string; spouseSupport: string
  preferences: string         // 本人希望記入欄
  nationality: string
  cookShoes: string; uniformSize: string
  allergy: string; skin: string; languages: string; pastIllness: string
}

const EMPTY: Data = {
  candidateNo: "",
  nameFurigana: "", name: "",
  birthdate: "",
  addrFurigana: "", address: "", email: "",
  contactFurigana: "", contact: "", phone: "", contactEmail: "",
  history: [{ year: "", month: "", text: "", note: "" }],
  licenses: [{ year: "", month: "", text: "外食特定技能1号", note: "合格" }],
  motivation: "",
  commuteH: "", commuteM: "",
  dependents: "0",
  spouse: "無", spouseSupport: "無",
  preferences: "",
  nationality: "インドネシア",
  cookShoes: "", uniformSize: "",
  allergy: "", skin: "", languages: "", pastIllness: "",
}

function ageFrom(birthdate: string): string {
  if (!birthdate) return ""
  const b = new Date(birthdate)
  if (isNaN(b.getTime())) return ""
  const now = new Date()
  let a = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--
  return a >= 0 && a < 130 ? String(a) : ""
}

const esc = (s: string) =>
  (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

// ── the printable document ─────────────────────────────────────────────────
function buildHtml(d: Data): string {
  const age = ageFrom(d.birthdate)
  const histRows = (rows: HistoryRow[], min: number) => {
    const r = [...rows]
    while (r.length < min) r.push({ year: "", month: "", text: "", note: "" })
    return r.map(x => `<tr>
      <td class="c">${esc(x.year)}</td><td class="c">${esc(x.month)}</td>
      <td>${esc(x.text)}</td><td class="c">${esc(x.note)}</td></tr>`).join("")
  }
  const kv = (label: string, val: string) =>
    `<tr><td class="k">${label}</td><td class="v">${esc(val) || "&nbsp;"}</td></tr>`

  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>履歴書</title>
<style>
  * { box-sizing: border-box; }
  @page { size: A4; margin: 12mm; }
  body { font-family: "Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",sans-serif; color:#111; font-size:11px; margin:0; }
  h1 { font-size:20px; letter-spacing:.5em; text-align:center; margin:0 0 10px; }
  .top { display:flex; justify-content:space-between; font-size:11px; margin-bottom:6px; }
  table { width:100%; border-collapse:collapse; }
  td, th { border:1px solid #333; padding:4px 6px; vertical-align:top; }
  .k { background:#f2f2f2; width:90px; white-space:nowrap; }
  .c { text-align:center; white-space:nowrap; width:44px; }
  .sec { background:#f2f2f2; font-weight:bold; text-align:center; }
  .furi { font-size:9px; color:#555; }
  .cols { display:flex; gap:8px; align-items:flex-start; }
  .cols > * { flex:1; }
  .box { min-height:70px; }
  .foot { text-align:right; margin-top:8px; font-size:10px; color:#333; }
  h2 { font-size:12px; margin:12px 0 4px; }
</style></head><body>
<h1>履 歴 書</h1>
<div class="top"><span>候補者番号：${esc(d.candidateNo)}</span><span>${new Date().toLocaleDateString("ja-JP",{timeZone:"Asia/Tokyo"})} 現在</span></div>

<table>
  <tr><td class="k">フリガナ</td><td colspan="3">${esc(d.nameFurigana)||"&nbsp;"}</td></tr>
  <tr><td class="k">氏名</td><td colspan="3" style="font-size:15px;font-weight:bold">${esc(d.name)||"&nbsp;"}</td></tr>
  <tr><td class="k">生年月日</td><td>${esc(d.birthdate)||"&nbsp;"}</td><td class="k">年齢</td><td class="c">${age?age+" 歳":"&nbsp;"}</td></tr>
  <tr><td class="k">フリガナ</td><td colspan="3">${esc(d.addrFurigana)||"&nbsp;"}</td></tr>
  <tr><td class="k">現住所</td><td colspan="3">${esc(d.address)||"&nbsp;"}</td></tr>
  <tr><td class="k">E-mail</td><td>${esc(d.email)||"&nbsp;"}</td><td class="k">電話</td><td>${esc(d.phone)||"&nbsp;"}</td></tr>
  <tr><td class="k">連絡先</td><td colspan="3">${esc(d.contact)||"（現住所に同じ）"}${d.contactEmail?"　"+esc(d.contactEmail):""}</td></tr>
</table>

<div class="cols" style="margin-top:10px">
  <table>
    <tr><td class="c">年</td><td class="c">月</td><td class="sec">学　歴・職　歴</td><td class="c">区分</td></tr>
    ${histRows(d.history, 8)}
  </table>
  <table>
    <tr><td class="c">年</td><td class="c">月</td><td class="sec">免　許・資　格</td><td class="c">結果</td></tr>
    ${histRows(d.licenses, 8)}
  </table>
</div>

<h2>志望の動機、自己PR、趣味、特技など</h2>
<table><tr><td class="box">${esc(d.motivation).replace(/\n/g,"<br>")||"&nbsp;"}</td></tr></table>

<div class="cols" style="margin-top:8px">
  <table>
    ${kv("通勤時間", d.commuteH||d.commuteM ? `約 ${esc(d.commuteH)} 時間 ${esc(d.commuteM)} 分` : "")}
    ${kv("扶養家族", `${esc(d.dependents)} 人（配偶者を除く）`)}
    ${kv("配偶者", d.spouse)}
    ${kv("配偶者の扶養義務", d.spouseSupport)}
  </table>
  <table>
    ${kv("国籍", d.nationality)}
    ${kv("コックシューズ", d.cookShoes)}
    ${kv("ユニフォームサイズ", d.uniformSize)}
    ${kv("アレルギー有無", d.allergy)}
    ${kv("肌（荒れやすいか）", d.skin)}
    ${kv("他言語対応", d.languages)}
    ${kv("過去にかかった病気", d.pastIllness)}
  </table>
</div>

<h2>本人希望記入欄</h2>
<table><tr><td class="box">${esc(d.preferences).replace(/\n/g,"<br>")||"&nbsp;"}</td></tr></table>

<div class="foot">人材紹介サービス GRASP</div>
</body></html>`
}

// ── form ────────────────────────────────────────────────────────────────────
const inp = "w-full bg-[var(--bg-2)] border border-[var(--border)] rounded px-2.5 py-1.5 text-[0.8rem] text-[var(--text)] outline-none focus:border-[var(--text-2)]"

export default function RirekishoTab() {
  const [d, setD] = useState<Data>(EMPTY)

  useEffect(() => {
    try { const s = localStorage.getItem(KEY); if (s) setD({ ...EMPTY, ...JSON.parse(s) }) } catch {}
  }, [])

  function up<K extends keyof Data>(k: K, v: Data[K]) {
    setD(prev => { const n = { ...prev, [k]: v }; try { localStorage.setItem(KEY, JSON.stringify(n)) } catch {}; return n })
  }
  function setRow(list: "history" | "licenses", i: number, patch: Partial<HistoryRow>) {
    up(list, d[list].map((r, idx) => idx === i ? { ...r, ...patch } : r))
  }
  function addRow(list: "history" | "licenses") { up(list, [...d[list], { year: "", month: "", text: "", note: "" }]) }
  function delRow(list: "history" | "licenses", i: number) { up(list, d[list].filter((_, idx) => idx !== i)) }

  const html = useMemo(() => buildHtml(d), [d])

  function print() {
    const w = window.open("", "_blank")
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 300)
  }

  // Plain render functions (not components) so inputs keep focus across renders.
  const field = (label: string, k: keyof Data, ph?: string) => (
    <label className="flex flex-col gap-0.5">
      <span className="label-xs">{label}</span>
      <input className={inp} value={d[k] as string} placeholder={ph}
        onChange={e => up(k, e.target.value as Data[typeof k])} />
    </label>
  )

  const historyEditor = (list: "history" | "licenses", title: string) => (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="label-xs">{title}</span>
        <button onClick={() => addRow(list)} className="text-[0.68rem] text-[var(--highlight-text)] hover:opacity-80">+ 行</button>
      </div>
      {d[list].map((r, i) => (
        <div key={i} className="flex gap-1.5 items-center">
          <input className={inp + " w-14"} placeholder="年" value={r.year} onChange={e => setRow(list, i, { year: e.target.value })} />
          <input className={inp + " w-12"} placeholder="月" value={r.month} onChange={e => setRow(list, i, { month: e.target.value })} />
          <input className={inp} placeholder="内容" value={r.text} onChange={e => setRow(list, i, { text: e.target.value })} />
          <input className={inp + " w-20"} placeholder="区分" value={r.note} onChange={e => setRow(list, i, { note: e.target.value })} />
          <button onClick={() => delRow(list, i)} className="shrink-0 text-[var(--text-3)] hover:text-red-400"><Icon name="close" size={13} /></button>
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0 p-5">
      {/* Form */}
      <div className="w-full lg:w-[440px] shrink-0 overflow-y-auto pr-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--text)]">履歴書</p>
          <button onClick={print}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--text)] text-[var(--bg)] text-[0.78rem] font-semibold hover:opacity-80 transition-opacity">
            <Icon name="print" size={14} /> 印刷 / PDF
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {field("候補者番号", "candidateNo")}
          {field("生年月日", "birthdate", "1998-05-18")}
          {field("フリガナ（氏名）", "nameFurigana", "テイン ザー アウン")}
          {field("氏名", "name")}
          {field("フリガナ（住所）", "addrFurigana")}
          {field("電話", "phone")}
          <div className="col-span-2">{field("現住所", "address")}</div>
          {field("E-mail", "email")}
          {field("連絡先（現住所以外）", "contact")}
        </div>

        {historyEditor("history", "学歴・職歴")}
        {historyEditor("licenses", "免許・資格")}

        <label className="flex flex-col gap-0.5">
          <span className="label-xs">志望の動機・自己PR・趣味・特技</span>
          <textarea className={inp + " min-h-[70px] resize-y"} value={d.motivation} onChange={e => up("motivation", e.target.value)} />
        </label>

        <div className="grid grid-cols-2 gap-2.5">
          {field("通勤（時間）", "commuteH", "1")}
          {field("通勤（分）", "commuteM", "30")}
          {field("扶養家族（人）", "dependents")}
          {field("配偶者（有/無）", "spouse")}
          {field("配偶者の扶養義務", "spouseSupport")}
          {field("国籍", "nationality")}
          {field("コックシューズ", "cookShoes")}
          {field("ユニフォームサイズ", "uniformSize")}
          {field("アレルギー有無", "allergy")}
          {field("肌（荒れやすいか）", "skin")}
          {field("他言語対応", "languages")}
          {field("過去にかかった病気", "pastIllness")}
        </div>

        <label className="flex flex-col gap-0.5">
          <span className="label-xs">本人希望記入欄</span>
          <textarea className={inp + " min-h-[60px] resize-y"} value={d.preferences} onChange={e => up("preferences", e.target.value)} />
        </label>
      </div>

      {/* Live preview */}
      <div className="flex-1 min-w-0 min-h-0 border border-[var(--border)] rounded-lg overflow-hidden bg-white">
        <iframe title="履歴書プレビュー" srcDoc={html} className="w-full h-full min-h-[600px]" />
      </div>
    </div>
  )
}
