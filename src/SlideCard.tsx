import { useState } from "react";
import type { FamilyInfo, Picture, Slide } from "./types";

const Box = ({ kind, text }: { kind: "trap" | "memorise" | "likely"; text: string }) => {
  const cls = kind === "trap" ? "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100" : kind === "memorise" ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100" : "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100";
  const label = kind === "trap" ? "⚠️ TRAP" : kind === "memorise" ? "🧠 MEMORISE" : "🎯 LIKELY";
  return (
    <div className={`rounded-xl p-3 ${cls}`}>
      <div className="text-xs font-bold tracking-wider mb-1">{label}</div>
      <div className="leading-snug">{text}</div>
    </div>
  );
};

export function PictureView({ p, fam }: { p: Picture; fam: FamilyInfo }) {
  const light = { background: `#${fam.light}` };
  const dark = { background: `#${fam.c}`, color: "white" };
  if (p.type === "flow" && p.items) {
    return (
      <div className="flex flex-col gap-1">
        {p.items.map((it, i) => (
          <div key={i}>
            <div className="rounded-xl p-3" style={i === p.items!.length - 1 ? dark : light}>
              <div className="font-bold" style={i === p.items!.length - 1 ? {} : { color: `#${fam.c}` }}>{it.label}</div>
              <div className="text-sm opacity-90">{it.sub}</div>
            </div>
            {i < p.items!.length - 1 && <div className="text-center text-lg leading-none" style={{ color: `#${fam.c}` }}>↓</div>}
          </div>
        ))}
      </div>
    );
  }
  if (p.type === "compare" && p.left && p.right) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {[p.left, p.right].map((c, i) => (
          <div key={i} className={`rounded-xl p-3 ${i ? "bg-gray-100 dark:bg-gray-800" : ""}`} style={i ? {} : light}>
            <div className="font-bold mb-1" style={{ color: `#${fam.c}` }}>{c.title}</div>
            <ul className="list-disc pl-5 text-sm space-y-1">{c.items.map((t, j) => <li key={j}>{t}</li>)}</ul>
          </div>
        ))}
      </div>
    );
  }
  if (p.type === "grid2x2" && p.cells && p.axes) {
    return (
      <div>
        <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 mb-1 text-center"><div>{p.axes.x[0]}</div><div>{p.axes.x[1]}</div></div>
        <div className="grid grid-cols-2 gap-2">
          {p.cells.map((c, i) => (
            <div key={i} className={`rounded-xl p-3 ${i % 3 ? "bg-gray-100 dark:bg-gray-800" : ""}`} style={i % 3 ? {} : light}>
              <div className="text-[10px] text-gray-500">{p.axes!.y[Math.floor(i / 2)]}</div>
              <div className="font-bold" style={{ color: `#${fam.c}` }}>{c.label}</div>
              <div className="text-sm">{c.sub}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (p.type === "table" && p.headers && p.rows) return <TableView headers={p.headers} rows={p.rows} fam={fam} />;
  if (p.type === "timeline" && p.items) {
    return <ol className="relative border-l-2 ml-2 pl-4 space-y-3" style={{ borderColor: `#${fam.c}` }}>{p.items.map((it, i) => <li key={i}><div className="font-bold" style={{ color: `#${fam.c}` }}>{it.when}</div><div className="text-sm">{it.label}</div></li>)}</ol>;
  }
  if (p.type === "pyramid" && p.items) {
    return <div className="flex flex-col items-center gap-1">{[...p.items].reverse().map((it, i) => <div key={i} className="rounded-lg px-3 py-2 text-center text-sm" style={{ width: `${55 + (45 * i) / Math.max(1, p.items!.length - 1)}%`, ...(i === 0 ? dark : light) }}><b>{it.label}</b> – {it.sub}</div>)}</div>;
  }
  return null;
}

function TableView({ headers, rows, fam }: { headers: string[]; rows: string[][]; fam: FamilyInfo }) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm border-collapse">
        <thead><tr>{headers.map((h, i) => <th key={i} className="text-left p-2 text-white" style={{ background: `#${fam.c}` }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} className={i % 2 ? "bg-gray-50 dark:bg-gray-800/60" : ""}>{r.map((c, j) => <td key={j} className={`p-2 align-top border-b border-gray-200 dark:border-gray-700 ${j === 0 ? "font-semibold" : ""}`} style={j === 0 ? { color: `#${fam.c}` } : {}}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function McqCard({ q, fam }: { q: { stem: string; options: string[]; answer: number; why: string }; fam: FamilyInfo }) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="rounded-xl p-3 bg-blue-50 dark:bg-blue-900/30">
      <div className="font-semibold mb-2">{q.stem}</div>
      <div className="space-y-1">
        {q.options.map((o, j) => {
          const show = picked !== null;
          const cls = show && j === q.answer ? "bg-emerald-200 dark:bg-emerald-800" : show && j === picked ? "bg-red-200 dark:bg-red-900" : "bg-white dark:bg-gray-800";
          return <button key={j} onClick={() => setPicked(j)} className={`w-full text-left rounded-lg px-3 py-2 min-h-[44px] text-sm ${cls}`}><b>{"ABCD"[j]}.</b> {o}{show && j === q.answer ? " ✓" : ""}</button>;
        })}
      </div>
      {picked !== null && <div className="text-sm mt-2 italic" style={{ color: `#${fam.c}` }}>Why: {q.why}</div>}
    </div>
  );
}

function ShortCard({ q }: { q: { stem: string; answer: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl p-3 bg-blue-50 dark:bg-blue-900/30">
      <div className="font-semibold mb-2">{q.stem}</div>
      <button onClick={() => setOpen(o => !o)} className="min-h-[44px] px-3 rounded-lg bg-white dark:bg-gray-800 text-sm">{open ? "Hide model answer" : "Show model answer"}</button>
      {open && <p className="text-sm mt-2 leading-relaxed">{q.answer}</p>}
    </div>
  );
}

export default function SlideCard({ s, fam, familyOf }: { s: Slide; fam: FamilyInfo; familyOf: (session: string) => FamilyInfo }) {
  const [explain, setExplain] = useState(false);
  const color = { color: `#${fam.c}` };
  const typeLabel: Record<string, string> = { title: "Session", picture: "The lesson in one picture", concept: "Concept", distinctions: "Gets tested", readings: "Readings", exercise: "In-class exercise", likely: "Likely exam questions", links: "Connections", recap: "60-second recap", cover: "", map: "Course map", recall: "Last-day recall" };
  return (
    <article className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
      <div className="text-xs font-bold tracking-wider uppercase mb-1" style={color}>{s.session} · {typeLabel[s.type]}</div>
      <h2 className="text-xl font-bold mb-3" style={color}>{s.title}</h2>
      {s.subtitle && <p className="text-sm text-gray-500 mb-3">{s.subtitle}</p>}

      {s.type === "concept" && (
        <div className="space-y-3">
          <p className="font-semibold leading-snug">{s.definition}</p>
          <ul className="list-disc pl-5 space-y-1">{s.bullets?.map((b, i) => <li key={i}>{b}</li>)}</ul>
          {s.example && <div className="rounded-xl p-3 bg-gray-100 dark:bg-gray-800"><div className="text-xs font-bold tracking-wider mb-1" style={color}>EXAMPLE</div><div className="text-sm">{s.example}</div></div>}
          {s.trap && <Box kind="trap" text={s.trap} />}
          {s.memorise && <Box kind="memorise" text={s.memorise} />}
        </div>
      )}
      {s.type === "picture" && s.picture && (<div className="space-y-3"><PictureView p={s.picture} fam={fam} />{s.caption && <div className="rounded-xl p-3 font-semibold" style={{ background: `#${fam.light}`, ...color }}>{s.caption}</div>}</div>)}
      {s.type === "distinctions" && s.table && <TableView headers={s.table.headers} rows={s.table.rows} fam={fam} />}
      {s.type === "readings" && (
        <div className="space-y-2">{s.readings?.map((r, i) => <div key={i} className={`rounded-xl p-3 ${i % 2 ? "bg-gray-100 dark:bg-gray-800" : ""}`} style={i % 2 ? {} : { background: `#${fam.light}` }}><div className="font-bold text-sm" style={color}>{r.ref}</div><div className="text-sm">{r.point}</div>{r.number && r.number !== "–" && <div className="text-sm font-bold mt-1" style={color}>{r.number}</div>}</div>)}</div>
      )}
      {s.type === "exercise" && (
        <div className="space-y-3">
          <div className="rounded-xl p-3" style={{ background: `#${fam.light}` }}><div className="text-xs font-bold tracking-wider mb-1" style={color}>WHAT WE DID</div><div className="text-sm">{s.definition}</div></div>
          <div className="rounded-xl p-3 bg-gray-100 dark:bg-gray-800"><div className="text-xs font-bold tracking-wider mb-1" style={color}>DESIGNED TO TEACH</div><div className="text-sm">{s.example}</div></div>
          <div className="font-bold" style={color}>Three lessons to state in the exam</div>
          <ol className="space-y-2">{s.bullets?.map((b, i) => <li key={i} className="flex gap-3"><span className="shrink-0 w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-sm" style={{ background: `#${fam.c}` }}>{i + 1}</span><span>{b}</span></li>)}</ol>
        </div>
      )}
      {(s.type === "likely" || s.type === "links") && (
        <div className="space-y-3">
          {s.mcq?.map((q, i) => <McqCard key={i} q={q} fam={fam} />)}
          {s.short?.map((q, i) => <ShortCard key={i} q={q} />)}
          {s.links && s.links.length > 0 && (<div><div className="font-bold mb-2" style={color}>Connects to</div><div className="space-y-2">{s.links.map((l, i) => { const f = familyOf(l.to); return <div key={i} className="flex gap-3 items-start"><span className="shrink-0 w-12 h-12 rounded-xl text-white flex items-center justify-center font-bold" style={{ background: `#${f.c}` }}>{l.to}</span><span className="text-sm pt-1">{l.how}</span></div>; })}</div></div>)}
        </div>
      )}
      {(s.type === "recap" || s.type === "recall" || s.type === "map" || s.type === "cover") && (
        <ol className="space-y-2">{s.bullets?.map((b, i) => <li key={i} className="flex gap-3"><span className="shrink-0 w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-sm" style={{ background: `#${fam.c}` }}>{i + 1}</span><span>{b}</span></li>)}</ol>
      )}
      {s.type === "title" && (<div><div className="font-bold mb-2" style={color}>What you should be able to answer</div><ol className="list-decimal pl-5 space-y-2">{s.bullets?.map((b, i) => <li key={i}>{b}</li>)}</ol></div>)}

      {s.notes && (
        <div className="mt-4">
          <button onClick={() => setExplain(e => !e)} className="min-h-[44px] w-full rounded-xl border border-gray-300 dark:border-gray-600 px-3 text-sm font-semibold">{explain ? "Hide explanation" : "Explain it to me (speaker notes)"}</button>
          {explain && <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{s.notes}</p>}
        </div>
      )}
    </article>
  );
}
