import { useCallback, useEffect, useState } from "react";
import type { Progress, Status } from "./types";

const KEY = "mktg644-exam-prep";
const VERSION = 2;
// v1 → v2: Session 10 (14 slides) was inserted before GP, so slide numbers ≥ 129 moved by +14.
const V2_SHIFT_FROM = 129, V2_SHIFT_BY = 14;
function shiftKeys<T>(obj: Record<string, T> | undefined): Record<string, T> {
  const out: Record<string, T> = {};
  for (const [k, v] of Object.entries(obj ?? {})) { const n = Number(k); out[String(Number.isFinite(n) && n >= V2_SHIFT_FROM ? n + V2_SHIFT_BY : k)] = v; }
  return out;
}

export const emptyProgress = (): Progress => ({
  version: VERSION, status: {}, viewed: {}, bookmarks: {}, notes: {}, last: null,
  minutes: 0, lastDay: "", streak: 0, fontScale: 1, dark: null,
});

function migrate(raw: unknown): Progress {
  const base = emptyProgress();
  if (!raw || typeof raw !== "object") return base;
  const p = raw as Partial<Progress>;
  let status = p.status ?? {}, viewed = p.viewed ?? {}, bookmarks = p.bookmarks ?? {}, notes = p.notes ?? {}, last = p.last ?? null;
  if ((p.version ?? 1) < 2) {
    status = shiftKeys(status); viewed = shiftKeys(viewed); bookmarks = shiftKeys(bookmarks); notes = shiftKeys(notes);
    if (last && last.slideNo >= V2_SHIFT_FROM) last = { ...last, slideNo: last.slideNo + V2_SHIFT_BY };
  }
  return { ...base, ...p, version: VERSION, status, viewed, bookmarks, notes, last };
}

export function load(): Progress {
  try { const s = localStorage.getItem(KEY); return s ? migrate(JSON.parse(s)) : emptyProgress(); } catch { return emptyProgress(); }
}
export function save(p: Progress) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* ignore */ } }

let state = load();
save(state); // persist any migration immediately
const listeners = new Set<() => void>();
function set(update: (p: Progress) => Progress) { state = update(state); save(state); listeners.forEach(l => l()); }

export function useProgress() {
  const [, tick] = useState(0);
  useEffect(() => { const l = () => tick(t => t + 1); listeners.add(l); return () => { listeners.delete(l); }; }, []);
  const api = {
    p: state,
    setStatus: useCallback((n: number, s: Status | null) => set(p => { const status = { ...p.status }; if (s) status[n] = s; else delete status[n]; return { ...p, status }; }), []),
    markViewed: useCallback((n: number, session: string) => set(p => (p.viewed[n] && p.last?.slideNo === n) ? p : { ...p, viewed: { ...p.viewed, [n]: true }, last: { session, slideNo: n } }), []),
    toggleBookmark: useCallback((n: number) => set(p => { const b = { ...p.bookmarks }; if (b[n]) delete b[n]; else b[n] = true; return { ...p, bookmarks: b }; }), []),
    setNote: useCallback((n: number, t: string) => set(p => { const notes = { ...p.notes }; if (t.trim()) notes[n] = t; else delete notes[n]; return { ...p, notes }; }), []),
    setFontScale: useCallback((f: number) => set(p => ({ ...p, fontScale: f })), []),
    setDark: useCallback((d: boolean | null) => set(p => ({ ...p, dark: d })), []),
    addMinute: useCallback(() => set(p => {
      const today = new Date().toISOString().slice(0, 10);
      let streak = p.streak;
      if (p.lastDay !== today) {
        const y = new Date(); y.setDate(y.getDate() - 1);
        streak = p.lastDay === y.toISOString().slice(0, 10) ? p.streak + 1 : 1;
      }
      return { ...p, minutes: p.minutes + 1, lastDay: today, streak };
    }), []),
    reset: useCallback(() => set(() => emptyProgress()), []),
    exportJSON: useCallback(() => JSON.stringify(state), []),
    importJSON: useCallback((s: string): string | null => { try { const parsed = JSON.parse(s); set(() => migrate(parsed)); return null; } catch (e) { return (e as Error).message; } }, []),
  };
  return api;
}
