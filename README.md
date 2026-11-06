# MKTG644 Exam Prep

Mobile-first revision app for MKTG644 AI-Powered Marketing (Prof. Ernst Osinga, SMU). 143 revision slides (S1–S9 + Group Project) as swipeable cards with TRAP / MEMORISE / LIKELY boxes, progress tracking, bookmarks, exam-day flashcards and search. No backend, no accounts, no trackers – everything is saved in your browser (localStorage) and works offline once loaded (PWA).

Stack: Vite + React 18 + TypeScript + Tailwind + vite-plugin-pwa. Hash routing (`/#/…`) so it runs on any static host without rewrite rules.

## Deploy to Vercel from GitHub (≈ 5 minutes)

1. Create a new, empty repository on GitHub (e.g. `mktg644-exam-prep`).
2. On your computer, unzip this project, then:
   ```bash
   cd exam-prep
   git init && git add . && git commit -m "MKTG644 Exam Prep"
   git branch -M main
   git remote add origin https://github.com/<you>/mktg644-exam-prep.git
   git push -u origin main
   ```
3. Go to https://vercel.com → **Add New… → Project** → import the repository.
4. Vercel auto-detects **Vite**. Keep the defaults (build `npm run build`, output `dist`). Click **Deploy**.
5. Open the URL Vercel gives you on your phone → browser menu → **Add to Home Screen**. It now opens like an app and works offline.

Every later `git push` to `main` redeploys automatically.

## Run locally
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the build
```

## Update the content
All slides live in one file: `public/content/slides.json` (generated from the revision deck – same content as the pptx). Replace the file and push; the app reloads it (stale-while-revalidate cache, so the new version appears on the second load).

Each slide object has: `slideNo`, `session` (S1…S9, S10, GP), `type` (title | picture | concept | distinctions | readings | exercise | likely | links | recap), `title`, `family` (strategy | promotion | price | service | analytics | risk | project) and type-specific fields (`definition`, `bullets`, `example`, `trap`, `memorise`, `notes`, `picture`, `table`, `readings`, `mcq`, `short`, `links`, `caption`).

### What's new (v2, 6 Nov 2026)
- **Session 10 – Agentic Marketing Workflows** is in (14 slides, slides 129–142, "Learn & control" layer, analytics colour). Total 157 slides; exam-day flashcards now 110 cards.
- Progress schema bumped to **v2** with an automatic migration: Session 10 was inserted before the Group Project, so saved "Got it / Revisit", bookmarks, notes and "resume" positions for GP slides are shifted to their new numbers. Nothing is lost.
- Runtime content cache renamed to `content-v2` so returning phones fetch the new `slides.json` on first load after the deploy.

### Push this update (Vercel redeploys automatically)
```
cd <your exam-prep folder>
git add .
git commit -m "Add Session 10 (agentic workflows), progress migration v2"
git push
```
Wait ~1 minute, open the Vercel URL, pull-to-refresh once on the phone (the service worker swaps to the new build on the second load).

### Adding another session later
1. Generate the slide objects (same schema) and append them to `slides.json → slides[]`.
2. Add the session id to `slides.json → order` in course position.
3. If you insert (rather than append at the end), bump `VERSION` in `src/store.ts` and extend the shift in `migrate()` so saved progress keyed by `slideNo` moves with the slides.
4. Add the session to a layer in `src/pages.tsx → Home → layers`.
5. Commit and push.

## Move progress between phone and laptop
Settings → **Export code** (copies a JSON string) → on the other device Settings → paste → **Import code**. Progress is stored per device only.

## Keyboard shortcuts (laptop)
← / → previous / next slide · Space next · **B** bookmark · **G** got it · **R** revisit.

## Manual test checklist
1. Home loads with the 4-layer course map; every session shows a progress ring at 0%.
2. Tap S1 → first card is the session title; swipe left (phone) / → (laptop) advances; progress bar grows.
3. On a concept card the yellow TRAP and green MEMORISE boxes render; "Explain it to me" expands the notes.
4. Tap "Got it" then reload the page – the state persists; the Home ring updates.
5. Tap ★ on two slides → Bookmarks tab lists them; the session filter chips narrow the list; ✕ removes one.
6. Mark a slide "Revisit" → Revisit tab lists it; ✓ moves it to "got".
7. Add a personal note → it shows under the slide and in the Bookmarks list.
8. Exam-day mode: cards flip on tap, "Randomise" changes order, filters Memorise/Traps work.
9. Search "regression" returns S2 slides; tapping a result opens that exact slide.
10. Settings: A++ enlarges all text; Dark forces dark mode; Export code → Reset → Import code restores progress. Then turn on airplane mode and reload – the app still opens (PWA).

## Licence / attribution
Course content © Prof. Ernst Osinga and the cited authors; this app is a personal study aid built by Wee Khee.
