import { useEffect, useState } from "react";
import type { Content, Slide } from "./types";

let cache: Content | null = null;

export function useContent() {
  const [content, setContent] = useState<Content | null>(cache);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (cache) return;
    fetch(`${import.meta.env.BASE_URL}content/slides.json`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((c: Content) => { cache = c; setContent(c); })
      .catch(e => setError(String(e)));
  }, []);
  return { content, error };
}

export const SESSION_NAMES: Record<string, string> = {
  S1: "Introduction", S2: "Synthetic Market Research", S3: "GEO", S4: "Advertising Reimagined", S5: "Virtual Influencers",
  S6: "Dynamic Pricing", S7: "AI Customer Interactions", S8: "AI Marketing Analytics", S9: "AI Risk & Governance", S10: "Agentic Workflows", GP: "Group Project",
};

export function sessionSlides(c: Content, s: string): Slide[] { return c.slides.filter(x => x.session === s); }
export function sessionName(c: Content, s: string): string {
  const t = c.slides.find(x => x.session === s && x.type === "title");
  return t ? t.title.replace(/^\S+\s/, "") : SESSION_NAMES[s] ?? s;
}
export function sessionFamily(c: Content, s: string) { const sl = c.slides.find(x => x.session === s); return sl ? c.families[sl.family] : c.families.strategy; }

export function slideText(s: Slide): string {
  const parts: string[] = [s.title, s.subtitle ?? "", s.definition ?? "", s.example ?? "", s.trap ?? "", s.memorise ?? "", s.notes ?? "", s.caption ?? "", ...(s.bullets ?? [])];
  s.mcq?.forEach(q => parts.push(q.stem, ...q.options, q.why));
  s.short?.forEach(q => parts.push(q.stem, q.answer));
  s.readings?.forEach(r => parts.push(r.ref, r.point, r.number));
  s.links?.forEach(l => parts.push(l.to, l.how));
  s.table?.rows.forEach(r => parts.push(...r));
  return parts.join(" \n ").toLowerCase();
}
