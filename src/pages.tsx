import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import SlideCard from "./SlideCard";
import { sessionFamily, sessionName, sessionSlides, slideText } from "./content";
import { useProgress } from "./store";
import type { Content, Slide } from "./types";

type Ctx = { content: Content };

// ---------------- helpers ----------------
function Ring({ pct, color, size = 44 }: { pct: number; color: string; size?: number }) {
  const r = (size - 6) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#E5E7EB" strokeWidth="5" fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={`#${color}`} strokeWidth="5" fill="none" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="54%" textAnchor="middle" fontSize="11" fontWeight="700" fill={`#${color}`}>{Math.round(pct * 100)}</text>
    </svg>
  );
}

function useSessionStats(content: Content) {
  const { p } = useProgress();
  return useMemo(() => {
    const m: Record<string, { total: number; viewed: number; got: number; revisit: number; bookmarks: number }> = {};
    for (const s of content.order) {
      const sl = sessionSlides(content, s);
      m[s] = { total: sl.length, viewed: sl.filter(x => p.viewed[x.slideNo]).length, got: sl.filter(x => p.status[x.slideNo] === "got").length, revisit: sl.filter(x => p.status[x.slideNo] === "revisit").length, bookmarks: sl.filter(x => p.bookmarks[x.slideNo]).length };
    }
    return m;
  }, [content, p]);
}

// ---------------- Home ----------------
export function Home({ content }: Ctx) {
  const { p } = useProgress();
  const stats = useSessionStats(content);
  const layers = [
    { label: "Strategy", sub: "Why we market", sessions: ["S1"] },
    { label: "Tactics – the 4Ps with AI", sub: "Promotion S2–S5 · Price S6 · Service S7", sessions: ["S2", "S3", "S4", "S5", "S6", "S7"] },
    { label: "Learn & control", sub: "Analytics · Risk & governance · Agentic workflows", sessions: ["S8", "S9", "S10"] },
    { label: "Group project", sub: "Runs through all three layers", sessions: ["GP"] },
  ].filter(l => l.sessions.some(s => content.order.includes(s)));
  const totalSlides = content.slides.length, viewed = Object.keys(p.viewed).length;
  const bookmarks = Object.keys(p.bookmarks).length, revisit = Object.values(p.status).filter(s => s === "revisit").length;
  return (
    <div className="space-y-5">
      <section className="rounded-2xl p-4 text-white" style={{ background: "#1E2761" }}>
        <h1 className="text-2xl font-bold">MKTG644 Exam Prep</h1>
        <p className="text-sm opacity-80">AI-Powered Marketing · exam Fri 13 Nov 2026</p>
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <Stat n={`${Math.round((viewed / totalSlides) * 100)}%`} l="slides viewed" />
          <Stat n={String(p.minutes)} l="minutes studied" />
          <Stat n={`${p.streak}🔥`} l="day streak" />
        </div>
        {p.last && <Link to={`/s/${p.last.session}?n=${p.last.slideNo}`} className="mt-3 block text-center rounded-xl bg-white/15 py-3 font-semibold min-h-[44px]">Resume {p.last.session} · slide {p.last.slideNo} →</Link>}
      </section>

      <section>
        <h2 className="font-bold text-lg mb-2">The course map – tap a session</h2>
        <div className="space-y-3">
          {layers.map(L => (
            <div key={L.label} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-baseline justify-between mb-2"><div className="font-bold">{L.label}</div><div className="text-xs text-gray-500">{L.sub}</div></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {L.sessions.filter(s => content.order.includes(s)).map(s => {
                  const f = sessionFamily(content, s), st = stats[s];
                  return (
                    <Link key={s} to={`/s/${s}`} className="flex items-center gap-3 rounded-xl p-3 min-h-[60px]" style={{ background: `#${f.light}` }}>
                      <Ring pct={st.total ? st.viewed / st.total : 0} color={f.c} />
                      <div className="min-w-0">
                        <div className="font-bold" style={{ color: `#${f.c}` }}>{s} · {sessionName(content, s)}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">{st.got} got it · {st.revisit} revisit · {st.bookmarks} ★</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2">
        <Link to="/bookmarks" className="rounded-xl p-4 bg-amber-50 dark:bg-amber-900/30 min-h-[60px]"><div className="font-bold">★ Bookmarks</div><div className="text-sm">{bookmarks} earmarked</div></Link>
        <Link to="/revisit" className="rounded-xl p-4 bg-rose-50 dark:bg-rose-900/30 min-h-[60px]"><div className="font-bold">↺ Revisit list</div><div className="text-sm">{revisit} to redo</div></Link>
        <Link to="/examday" className="rounded-xl p-4 bg-emerald-50 dark:bg-emerald-900/30 min-h-[60px]"><div className="font-bold">🧠 Exam-day mode</div><div className="text-sm">Memorise + trap flashcards</div></Link>
        <Link to="/search" className="rounded-xl p-4 bg-blue-50 dark:bg-blue-900/30 min-h-[60px]"><div className="font-bold">🔍 Search</div><div className="text-sm">Across all slides</div></Link>
      </section>
    </div>
  );
}
const Stat = ({ n, l }: { n: string; l: string }) => <div className="rounded-xl bg-white/10 py-2"><div className="text-xl font-bold">{n}</div><div className="text-[11px] opacity-80">{l}</div></div>;

// ---------------- Session ----------------
export function Session({ content }: Ctx) {
  const { id = "S1" } = useParams();
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const slides = useMemo(() => sessionSlides(content, id), [content, id]);
  const fam = sessionFamily(content, id);
  const { p, setStatus, markViewed, toggleBookmark, setNote } = useProgress();
  const wanted = Number(sp.get("n"));
  const startIdx = Math.max(0, slides.findIndex(s => s.slideNo === wanted));
  const [idx, setIdx] = useState(startIdx);
  const s: Slide | undefined = slides[idx];
  const touch = useRef<{ x: number; y: number } | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);

  useEffect(() => { if (s) { markViewed(s.slideNo, id); setSp({ n: String(s.slideNo) }, { replace: true }); } }, [s?.slideNo]); // eslint-disable-line
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "TEXTAREA" || (e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); go(1); }
      if (e.key === "ArrowLeft") go(-1);
      if (e.key.toLowerCase() === "b" && s) toggleBookmark(s.slideNo);
      if (e.key.toLowerCase() === "g" && s) setStatus(s.slideNo, "got");
      if (e.key.toLowerCase() === "r" && s) setStatus(s.slideNo, "revisit");
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  });
  const go = (d: number) => {
    const n = idx + d;
    if (n < 0) return;
    if (n >= slides.length) { const i = content.order.indexOf(id); if (i >= 0 && i < content.order.length - 1) nav(`/s/${content.order[i + 1]}`); else nav("/"); return; }
    setIdx(n); window.scrollTo({ top: 0 });
  };
  if (!s) return <p>No slides for {id}.</p>;
  const status = p.status[s.slideNo];
  return (
    <div className="space-y-3"
      onTouchStart={e => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
      onTouchEnd={e => { if (!touch.current) return; const dx = e.changedTouches[0].clientX - touch.current.x, dy = e.changedTouches[0].clientY - touch.current.y; if (Math.abs(dx) > 70 && Math.abs(dy) < 60) go(dx < 0 ? 1 : -1); touch.current = null; }}>
      <div className="flex items-center justify-between text-sm">
        <Link to="/" className="min-h-[44px] flex items-center font-semibold" style={{ color: `#${fam.c}` }}>← Map</Link>
        <div className="text-gray-500">{id} · {idx + 1} / {slides.length}</div>
        <button onClick={() => toggleBookmark(s.slideNo)} aria-label="Bookmark" className={`min-h-[44px] min-w-[44px] text-2xl ${p.bookmarks[s.slideNo] ? "text-amber-500" : "text-gray-300"}`}>★</button>
      </div>
      <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden"><div className="h-full" style={{ width: `${((idx + 1) / slides.length) * 100}%`, background: `#${fam.c}` }} /></div>
      <SlideCard s={s} fam={fam} familyOf={ss => sessionFamily(content, ss)} />
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setStatus(s.slideNo, status === "got" ? null : "got")} className={`min-h-[48px] rounded-xl font-semibold ${status === "got" ? "bg-emerald-600 text-white" : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200"}`}>✓ Got it</button>
        <button onClick={() => setStatus(s.slideNo, status === "revisit" ? null : "revisit")} className={`min-h-[48px] rounded-xl font-semibold ${status === "revisit" ? "bg-rose-600 text-white" : "bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200"}`}>↺ Revisit</button>
      </div>
      <div>
        <button onClick={() => setNoteOpen(o => !o)} className="text-sm min-h-[44px] text-gray-500">{p.notes[s.slideNo] ? `📝 ${p.notes[s.slideNo]}` : "📝 Add a personal note"}</button>
        {noteOpen && <input defaultValue={p.notes[s.slideNo] ?? ""} onBlur={e => { setNote(s.slideNo, e.target.value); setNoteOpen(false); }} onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} autoFocus maxLength={160} placeholder="One line, e.g. 'confuse this with S6 4Ps'" className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-3 text-sm" />}
      </div>
      <div className="flex gap-2">
        <button onClick={() => go(-1)} disabled={idx === 0} className="flex-1 min-h-[48px] rounded-xl bg-gray-100 dark:bg-gray-800 font-semibold disabled:opacity-40">← Prev</button>
        <button onClick={() => go(1)} className="flex-1 min-h-[48px] rounded-xl text-white font-semibold" style={{ background: `#${fam.c}` }}>{idx === slides.length - 1 ? "Next session →" : "Next →"}</button>
      </div>
      <p className="text-xs text-gray-400 text-center">Swipe or use ← → · B bookmark · G got it · R revisit</p>
    </div>
  );
}

// ---------------- Lists (bookmarks / revisit) ----------------
export function SlideList({ content, mode }: Ctx & { mode: "bookmarks" | "revisit" }) {
  const { p, toggleBookmark, setStatus } = useProgress();
  const [filter, setFilter] = useState("all");
  const items = content.slides.filter(s => mode === "bookmarks" ? p.bookmarks[s.slideNo] : p.status[s.slideNo] === "revisit").filter(s => filter === "all" || s.session === filter);
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">{mode === "bookmarks" ? "★ Bookmarks" : "↺ Revisit list"}</h1>
      <SessionFilter content={content} value={filter} onChange={setFilter} />
      {items.length === 0 && <p className="text-gray-500">Nothing here yet. {mode === "bookmarks" ? "Tap ★ on any slide to earmark it." : "Mark a slide 'Revisit' to collect it here."}</p>}
      {items.map(s => {
        const f = content.families[s.family];
        return (
          <div key={s.slideNo} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 flex gap-3 items-start">
            <Link to={`/s/${s.session}?n=${s.slideNo}`} className="flex-1 min-w-0">
              <div className="text-xs font-bold" style={{ color: `#${f.c}` }}>{s.session} · slide {s.slideNo}</div>
              <div className="font-semibold">{s.title}</div>
              {s.memorise && <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">🧠 {s.memorise}</div>}
              {p.notes[s.slideNo] && <div className="text-xs text-gray-500 mt-1">📝 {p.notes[s.slideNo]}</div>}
            </Link>
            <button onClick={() => mode === "bookmarks" ? toggleBookmark(s.slideNo) : setStatus(s.slideNo, "got")} className="min-h-[44px] min-w-[44px] text-sm text-gray-500" aria-label="remove">{mode === "bookmarks" ? "✕" : "✓"}</button>
          </div>
        );
      })}
    </div>
  );
}
function SessionFilter({ content, value, onChange }: Ctx & { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {["all", ...content.order].map(s => <button key={s} onClick={() => onChange(s)} className={`shrink-0 min-h-[40px] px-3 rounded-full text-sm font-semibold ${value === s ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "bg-gray-100 dark:bg-gray-800"}`}>{s === "all" ? "All" : s}</button>)}
    </div>
  );
}

// ---------------- Exam-day flashcards ----------------
export function ExamDay({ content }: Ctx) {
  const cards = useMemo(() => {
    const out: { kind: "memorise" | "trap"; session: string; title: string; text: string; color: string }[] = [];
    for (const s of content.slides) {
      if (s.memorise) out.push({ kind: "memorise", session: s.session, title: s.title, text: s.memorise, color: content.families[s.family].c });
      if (s.trap) out.push({ kind: "trap", session: s.session, title: s.title, text: s.trap, color: content.families[s.family].c });
    }
    return out;
  }, [content]);
  const [kind, setKind] = useState<"all" | "memorise" | "trap">("all");
  const [order, setOrder] = useState<number[]>(() => cards.map((_, i) => i));
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const pool = order.filter(k => kind === "all" || cards[k].kind === kind);
  const c = cards[pool[i % Math.max(1, pool.length)]];
  const shuffle = () => { const a = cards.map((_, k) => k); for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } setOrder(a); setI(0); setFlip(false); };
  if (!c) return <p>No cards.</p>;
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">🧠 Exam-day mode</h1>
      <p className="text-sm text-gray-500">Every MEMORISE and TRAP box in the course as flashcards. Front = the concept; tap to reveal. {pool.length} cards.</p>
      <div className="flex gap-2 flex-wrap">
        {(["all", "memorise", "trap"] as const).map(k => <button key={k} onClick={() => { setKind(k); setI(0); setFlip(false); }} className={`min-h-[40px] px-3 rounded-full text-sm font-semibold ${kind === k ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "bg-gray-100 dark:bg-gray-800"}`}>{k === "all" ? "All" : k === "memorise" ? "🧠 Memorise" : "⚠️ Traps"}</button>)}
        <button onClick={shuffle} className="min-h-[40px] px-3 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900/40">🔀 Randomise</button>
      </div>
      <button onClick={() => setFlip(f => !f)} className={`w-full min-h-[260px] rounded-2xl p-5 text-left ${c.kind === "trap" ? "bg-amber-100 dark:bg-amber-900/40" : "bg-emerald-100 dark:bg-emerald-900/40"}`}>
        <div className="text-xs font-bold tracking-wider mb-2" style={{ color: `#${c.color}` }}>{c.session} · {c.kind === "trap" ? "⚠️ TRAP" : "🧠 MEMORISE"}</div>
        <div className="text-lg font-bold mb-3">{c.title}</div>
        {flip ? <div className="text-base leading-relaxed">{c.text}</div> : <div className="text-gray-500 italic">Say it aloud, then tap to check.</div>}
      </button>
      <div className="flex gap-2">
        <button onClick={() => { setI(k => Math.max(0, k - 1)); setFlip(false); }} className="flex-1 min-h-[48px] rounded-xl bg-gray-100 dark:bg-gray-800 font-semibold">← Prev</button>
        <div className="min-h-[48px] px-3 flex items-center text-sm text-gray-500">{(i % pool.length) + 1} / {pool.length}</div>
        <button onClick={() => { setI(k => (k + 1) % pool.length); setFlip(false); }} className="flex-1 min-h-[48px] rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-semibold">Next →</button>
      </div>
    </div>
  );
}

// ---------------- Search ----------------
export function Search({ content }: Ctx) {
  const [q, setQ] = useState("");
  const idx = useMemo(() => content.slides.map(s => ({ s, t: slideText(s) })), [content]);
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = terms.length ? idx.filter(x => terms.every(t => x.t.includes(t))).slice(0, 40) : [];
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">🔍 Search</h1>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. regression to the mean, RAG, 4 Ps" autoFocus className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-3" />
      {terms.length > 0 && <p className="text-sm text-gray-500">{hits.length} slide{hits.length === 1 ? "" : "s"}</p>}
      {hits.map(({ s }) => { const f = content.families[s.family]; return <Link key={s.slideNo} to={`/s/${s.session}?n=${s.slideNo}`} className="block rounded-xl border border-gray-200 dark:border-gray-700 p-3"><div className="text-xs font-bold" style={{ color: `#${f.c}` }}>{s.session} · slide {s.slideNo} · {s.type}</div><div className="font-semibold">{s.title}</div>{s.memorise && <div className="text-xs text-gray-500 mt-1">{s.memorise}</div>}</Link>; })}
    </div>
  );
}

// ---------------- Settings ----------------
export function Settings({ content }: Ctx) {
  const { p, setFontScale, setDark, reset, exportJSON, importJSON } = useProgress();
  const [txt, setTxt] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">⚙️ Settings</h1>
      <section className="space-y-2">
        <div className="font-semibold">Text size</div>
        <div className="flex gap-2">{[1, 1.15, 1.3].map((f, i) => <button key={f} onClick={() => setFontScale(f)} className={`min-h-[48px] flex-1 rounded-xl font-bold ${p.fontScale === f ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "bg-gray-100 dark:bg-gray-800"}`}>{["A", "A+", "A++"][i]}</button>)}</div>
      </section>
      <section className="space-y-2">
        <div className="font-semibold">Theme</div>
        <div className="flex gap-2">{([[null, "System"], [false, "Light"], [true, "Dark"]] as const).map(([v, l]) => <button key={l} onClick={() => setDark(v)} className={`min-h-[48px] flex-1 rounded-xl font-semibold ${p.dark === v ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "bg-gray-100 dark:bg-gray-800"}`}>{l}</button>)}</div>
      </section>
      <section className="space-y-2">
        <div className="font-semibold">Move progress between phone and laptop</div>
        <p className="text-sm text-gray-500">Progress is saved on this device only. Copy the code below, paste it into the other device's import box.</p>
        <div className="flex gap-2">
          <button onClick={async () => { const j = exportJSON(); setTxt(j); try { await navigator.clipboard.writeText(j); setMsg("Copied to clipboard."); } catch { setMsg("Code shown below – copy it manually."); } }} className="min-h-[48px] flex-1 rounded-xl bg-blue-600 text-white font-semibold">Export code</button>
          <button onClick={() => { const err = importJSON(txt); setMsg(err ? `Import failed: ${err}` : "Imported. Your progress is now on this device."); }} className="min-h-[48px] flex-1 rounded-xl bg-emerald-600 text-white font-semibold">Import code</button>
        </div>
        <textarea value={txt} onChange={e => setTxt(e.target.value)} rows={4} placeholder="Paste a progress code here to import" className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent p-3 text-xs font-mono" />
        {msg && <p className="text-sm">{msg}</p>}
      </section>
      <section className="space-y-2">
        <div className="font-semibold">Colour legend</div>
        <div className="grid grid-cols-2 gap-2">{Object.values(content.families).map(f => <div key={f.name} className="rounded-xl px-3 py-2 text-white text-sm font-semibold" style={{ background: `#${f.c}` }}>{f.name}</div>)}</div>
        <div className="grid grid-cols-3 gap-2 text-xs font-bold"><div className="rounded-xl p-2 bg-amber-100 text-amber-900">⚠️ TRAP</div><div className="rounded-xl p-2 bg-emerald-100 text-emerald-900">🧠 MEMORISE</div><div className="rounded-xl p-2 bg-blue-100 text-blue-900">🎯 LIKELY</div></div>
      </section>
      <section className="space-y-2">
        <div className="font-semibold">Reset</div>
        {!confirm ? <button onClick={() => setConfirm(true)} className="min-h-[48px] w-full rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-200 font-semibold">Reset all progress…</button>
          : <div className="flex gap-2"><button onClick={() => { reset(); setConfirm(false); setMsg("Progress reset."); }} className="min-h-[48px] flex-1 rounded-xl bg-rose-600 text-white font-semibold">Yes, reset</button><button onClick={() => setConfirm(false)} className="min-h-[48px] flex-1 rounded-xl bg-gray-100 dark:bg-gray-800 font-semibold">Cancel</button></div>}
      </section>
      <p className="text-xs text-gray-400">Content generated {new Date(content.generated).toLocaleDateString()} · {content.slides.length} slides · no analytics, no trackers.</p>
    </div>
  );
}
