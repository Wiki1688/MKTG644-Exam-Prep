import { useEffect } from "react";
import { HashRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { useContent } from "./content";
import { ExamDay, Home, Search, Session, Settings, SlideList } from "./pages";
import { useProgress } from "./store";

function Shell() {
  const { content, error } = useContent();
  const { p, addMinute } = useProgress();
  const loc = useLocation();

  useEffect(() => {
    const prefers = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => document.documentElement.classList.toggle("dark", p.dark ?? prefers.matches);
    apply(); prefers.addEventListener("change", apply); return () => prefers.removeEventListener("change", apply);
  }, [p.dark]);
  useEffect(() => { document.documentElement.style.fontSize = `${16 * p.fontScale}px`; }, [p.fontScale]);
  useEffect(() => { const t = setInterval(() => { if (document.visibilityState === "visible") addMinute(); }, 60000); return () => clearInterval(t); }, [addMinute]);

  const tabs = [["/", "Map"], ["/bookmarks", "★"], ["/revisit", "↺"], ["/examday", "🧠"], ["/search", "🔍"], ["/settings", "⚙️"]];
  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 pb-20">
      <main className="max-w-3xl mx-auto px-4 pt-4">
        {error && <p className="text-rose-600">Could not load content: {error}</p>}
        {!content && !error && <p className="text-gray-500">Loading…</p>}
        {content && (
          <Routes>
            <Route path="/" element={<Home content={content} />} />
            <Route path="/s/:id" element={<Session key={loc.pathname} content={content} />} />
            <Route path="/bookmarks" element={<SlideList content={content} mode="bookmarks" />} />
            <Route path="/revisit" element={<SlideList content={content} mode="revisit" />} />
            <Route path="/examday" element={<ExamDay content={content} />} />
            <Route path="/search" element={<Search content={content} />} />
            <Route path="/settings" element={<Settings content={content} />} />
            <Route path="*" element={<Home content={content} />} />
          </Routes>
        )}
      </main>
      <nav className="fixed bottom-0 inset-x-0 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="max-w-3xl mx-auto grid grid-cols-6">
          {tabs.map(([to, label]) => <Link key={to} to={to} className={`min-h-[52px] flex items-center justify-center text-sm font-semibold ${loc.pathname === to ? "text-blue-700 dark:text-blue-300" : "text-gray-500"}`} aria-label={label}>{label}</Link>)}
        </div>
      </nav>
    </div>
  );
}

export default function App() { return <HashRouter><Shell /></HashRouter>; }
