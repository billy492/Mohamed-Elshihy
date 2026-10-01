# Mohamed EL Shihy — performance coaching site

The website for Mohamed El Shihy (physical coach, Al Ahly SC): the public site, a
multi-step application, and a private review desk where Shihy filters applications.

Built on the FARGO studio-site stack (Next.js 16 · React 19 · TypeScript · Lenis ·
GSAP · Tailwind v4 reset + hand-written CSS), plus three.js for the 3D hero.

## Run it

```bash
npm install
cp .env.example .env.local   # then set ADMIN_PASSWORD and ADMIN_SESSION_SECRET
npm run dev                  # http://localhost:3000
```

- `npx tsc --noEmit` before every build. Never `npm run build` while `npm run dev` is
  running (same build folder). To measure a production build next to a dev server:
  `NEXT_DIST_DIR=.next.prod.nosync npx next build && NEXT_DIST_DIR=.next.prod.nosync npx next start -p 3200`.
- The folder lives on the iCloud-synced Desktop, so local builds go to `*.nosync`
  folders (iCloud ignores them). The Cloudflare scripts build to `.next` as normal.
- `npm run preview` builds for Cloudflare and runs the site in the real Workers
  runtime at http://localhost:8787. Put secrets for it in `.dev.vars` (same format as
  `.env.local`, never committed).
- `node scripts/seed-dev.mjs` adds 10 clearly-marked "(test)" applications and 6
  waitlist sign-ups to the local store. It refuses to run in production.

## How the pieces fit

| Where | What |
|---|---|
| `src/content/*.ts` | **All the words.** Site facts, pathways, method, problems, record, programs, media. Edit copy here, not in components. `CONFIRM` comments mark what Shihy must sign off. |
| `src/lib/motion/figure.ts` | The body model behind every chronophotograph (anthropometric segments, keyframed sprint gait with an `overstride` fault, squat, whole-body lean). |
| `src/components/hero/` | The opening: `scene3d.ts` (three.js), `plate2d.ts` (2D fallback without WebGL), `timeline.ts` (the find/fix sequence both share). |
| `src/components/site/Loader.tsx` | The 100 m loading screen. Plays on full loads of the homepage only. |
| `src/components/home/` | The scroll-driven sections (statement film, pinned method, stacking pathways, marquee, problems, programs, film room, final CTA). |
| `src/app/(focus)/apply` | The application: `components/apply/steps.ts` defines the questions; `lib/apply/schema.ts` validates them (same schema in the browser and on the server). |
| `src/app/admin` | The review desk (below). |
| `src/lib/store` | Where applications live: Upstash Redis in production, `.data/store.json` in development. |
| `src/lib/session.ts`, `src/lib/auth.ts` | Desk sign-in: signed, http-only session cookie; every desk page, action and route checks it (`requireAdmin`). |
| `wrangler.jsonc`, `open-next.config.ts`, `public/_headers` | Cloudflare hosting (below). |

## The review desk

`/admin/login` → password from `ADMIN_PASSWORD`. Sessions last 14 days; changing the
password or `ADMIN_SESSION_SECRET` signs everyone out.

- **List:** filter by status (open / new / reviewing / shortlisted / contacted /
  accepted / declined / archived), coaching or mentorship, pathway, level; search;
  sort by newest, oldest or commitment; starred only; export CSV.
- **Detail:** the applicant's problem in their words, every answer, one-tap WhatsApp
  (pre-filled message), email and call, status buttons, star, private notes that save
  as you type, previous/next within the filter. On phones, a bottom bar with
  Shortlist / Decline / Next.
- **Keyboard (desktop):** J or → next · K or ← previous · R reviewing · S shortlisted ·
  C contacted · A accepted · D declined · X archived · F star.
- **Waitlist:** program sign-ups with counts and CSV export.

## Hosting: Cloudflare Workers

The site runs as a Cloudflare Worker through the OpenNext adapter
(`@opennextjs/cloudflare`). It can't go on Cloudflare Pages as static files: the
application form, the review desk and sign-in run on the server.

**First-time setup (Cloudflare dashboard):**

1. **Workers & Pages → Create → Import a repository** → pick this GitHub repo.
   - Production branch: `main`
   - Build command: *leave empty* (the deploy script builds)
   - Deploy command: `npm run deploy` (replace the suggested `npx wrangler deploy`)
   - Build variable: `NODE_VERSION` = `22`.
   The Worker name must be `shihy-coaching` (it has to match `name` in `wrangler.jsonc`).
2. **Storage:** create a free Redis database at console.upstash.com (pick a region
   near Egypt, e.g. Frankfurt) and copy its REST URL and token.
3. **Worker → Settings → Variables and Secrets** (type *Secret*):
   `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `UPSTASH_REDIS_REST_URL`,
   `UPSTASH_REDIS_REST_TOKEN`, and optionally `RESEND_API_KEY`, `NOTIFY_EMAIL`,
   `NOTIFY_FROM`. Without Redis the apply form reports that it couldn't save (rather
   than losing applications) and the desk can't sign in.
4. **`NEXT_PUBLIC_SITE_URL`** is baked in at build time, so set it as a **build
   variable** (Settings → Build → Variables): `https://shihysc.com` (also the fallback
   in `src/content/site.ts`).
5. **Images:** Images → turn on Cloudflare Images transformations (free tier:
   5,000 unique transformations a month). `/_next/image` uses it to resize photos.
6. **Domain:** Worker → Settings → Domains & Routes → **Add → Custom domain** →
   `shihysc.com`, then again for `www.shihysc.com` (which redirects to `shihysc.com`,
   see `next.config.ts`). Cloudflare creates the DNS
   records and certificate. Delete any old A/CNAME records for those names first
   (e.g. ones pointing at GitHub Pages or Vercel).

After that, every push to `main` deploys. From a computer instead:
`npx wrangler login`, then `npm run deploy`.

Size: the Worker is ~2.4 MB gzipped, under the free plan's 3 MB limit. That's why
there is no `proxy.ts` (a Node proxy bundles a second copy of the Next server).

## Before launch

1. **Hosting:** the Cloudflare steps above (storage, secrets, domain).
2. **Replace the placeholder media** in `src/content/media.ts` (free-licence Mixkit
   films and Unsplash photos, hotlinked for the prototype) with Shihy's own footage.
   Run films through the FARGO pipeline (`studio-site/scripts/transcode.sh`: H.264
   1080p, faststart, poster) into `public/assets/`, and give every replaced file a new
   name (the `/assets` cache is immutable for a year).
3. **Confirm the content** marked `CONFIRM` in `src/content/`: his exact title, the
   pathway details, the program line-up, the principles on the About page, the
   YouTube channel URL, and the Red Bull / Sportsmith entries.
4. **Add real proof:** `caseStudies` and `testimonials` in `src/content/coaching.ts`
   are empty on purpose, and their section stays hidden until they have real entries.
5. **Privacy:** have the privacy page reviewed (Egypt's PDPL 151/2020; GDPR for EU
   applicants). Applications include health information.
6. **Deploy by push:** private GitHub repo → Cloudflare Workers Builds.

## Verified (production build, headless Chrome, phone = 375×812 @2x)

- Every route 200 (unknown routes 404); no horizontal scroll on any page, desktop or phone.
- Application: step validation, consent check, submission stored with a reference.
- First paint: black at 0.4 s on Fast 4G, 0.9 s on Slow 4G. Loader counter finishes at
  3.5 s on Fast 4G. Fonts 227 KB, JS 338 KB, first load ~590 KB.
- Scrolling the whole homepage at 4× CPU throttle: median frame 16.7 ms, 0 frames over 33 ms.

**Only a real phone can confirm:** the 3D hero's frame rate and WebGL start-up on a
low-end Android and an iPhone (the headless browser renders WebGL in software, so its
3D timings are not representative); that background films autoplay (iOS Low Power
Mode blocks autoplay; the posters show instead); and that the difference-blend
headlines look right in Safari.
