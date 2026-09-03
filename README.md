# Tally My Project

Phase 1 MVP: a free, ad-supported calculator site for home improvement projects, built with Next.js (App Router) + TypeScript + Tailwind CSS. Live at [tallymyproject.com](https://tallymyproject.com).

## What's in this MVP

Five calculators, prioritized by realistic SEO winnability (see the SERP research notes below), each with the same layout: interactive calculator, formula explanation, worked example, buying/material guidance, FAQ (with FAQ schema for rich results), related calculators, and three ad placeholder slots.

- `/calculators/concrete` — slabs, footings, columns: yards, bags, cost
- `/calculators/tile` — tiles/boxes needed for floors and walls
- `/calculators/roofing` — squares, shingle bundles, cost from pitch
- `/calculators/mulch-gravel` — mulch/gravel/topsoil by cubic yard and bag
- `/calculators/flooring` — hardwood/laminate/vinyl by square footage

Paint Calculator was intentionally left out of the MVP — SERP research showed it's dominated by paint manufacturers (Sherwin-Williams, Behr, Benjamin Moore, PPG) with huge domain authority, making it the least winnable of the original five. Add it later as a long-tail/supporting page once the site has authority, not as a launch priority.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To build for production:

```bash
npm run build
npm run start
```

## Before you launch

1. ~~Set your real domain~~ — done: `siteConfig.url` in `src/lib/calculators-data.ts` is set to `https://tallymyproject.com`. If this ever changes, update it there (feeds metadata, Open Graph tags, and the sitemap).
2. ~~Buy the domain~~ — done: `tallymyproject.com` purchased. Still to do: point its DNS at your deployment once you deploy (step 3).
3. **Deploy to Vercel** (recommended — zero config for Next.js): push this to a GitHub repo and import it at vercel.com, or run `npx vercel`. Add `tallymyproject.com` as the project's custom domain in Vercel's dashboard.
4. ~~Fill in the Privacy Policy contact email~~ — done: `hello@tallymyproject.com`. Make sure this inbox is actually set up (as a forwarding alias or real mailbox) before launch, so it's not a dead address.
5. **Add a real favicon** — currently the default Next.js icon at `src/app/favicon.ico`.
6. **Google Search Console**: verify the site and submit `/sitemap.xml` (auto-generated at `src/app/sitemap.ts`, includes all 20 calculator + variant URLs).
7. **Google Analytics**: set `NEXT_PUBLIC_GA_ID` (copy `.env.local.example` to `.env.local`) once you create a GA4 property — no code changes needed, it activates automatically.
8. **Apply for Google AdSense** once the site is live with real traffic/content history — don't expect same-day approval.
9. **Swap in real AdSense units**: every ad slot placeholder is the `AdSlot` component (`src/components/AdSlot.tsx`) — replace the placeholder `<div>` with your `<ins class="adsbygoogle">` unit once approved. Three placements are already wired into every calculator page (`CalculatorShell.tsx`): in-content (right after the result), mid-article (between the example and buying guidance), and footer (before related calculators).

## Adding a new calculator

1. Add its metadata to the `calculators` array in `src/lib/calculators-data.ts`.
2. Create `src/app/calculators/<slug>/page.tsx` (metadata + content) and `<Name>CalculatorWidget.tsx` (the interactive `"use client"` piece) — copy the concrete calculator as a template.
3. Wrap the page content in `<CalculatorShell>` so it automatically gets ad slots, FAQ schema, and related-calculator links.

## SEO / competition notes (from research before building)

- **Winnable niches** (small single-purpose domains rank alongside calculator.net/omnicalculator): concrete, tile, roofing, mulch/gravel. These are prioritized in this MVP.
- **Hard to win**: paint (owned by paint manufacturer brand sites), and to a lesser extent flooring (mixed brand + generic competition).
- **RPM reality**: Home improvement AdSense RPM is roughly $20-40 on US traffic, but that's typically for content/comparison pages with longer dwell time — bare calculator-tool pages likely sit at the lower end, especially before the site has domain authority. Each calculator page includes buying/material-guidance content specifically to increase dwell time and avoid being "thin" content under Google's helpful-content standards.
- Expect 6-12+ months to see meaningful organic traffic on a new domain in this space — budget patience accordingly before judging the project on revenue.

## Tech stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4
- No database — fully static, deploys anywhere Next.js runs (Vercel recommended)
