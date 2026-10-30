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

### Add Session 10
1. Generate the Session 10 slide objects (same schema) – e.g. by re-running the deck builder with `S10.json` added, or by hand.
2. Append them to `slides.json → slides[]` with `session: "S10"` and a `family` (suggest `"analytics"` or add a new family entry under `families`).
3. Add `"S10"` to `slides.json → order` **between `"S9"` and `"GP"`**.
4. The home map places S10 automatically under "Learn & control" (edit `layers` in `src/pages.tsx` → `Home` if you want it elsewhere).
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
