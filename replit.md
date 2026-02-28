# One Piece 3D Arc Explorer

## Overview

This is an immersive, cinematic portfolio website themed around the One Piece anime. The main experience is a click-to-zoom 3D WebGL animation that takes users through different One Piece arcs (East Blue, Alabasta, Skypiea, Water 7, etc.), each rendered as a unique 3D scene. The goal is to impress recruiters and showcase advanced frontend skills — specifically Three.js, GSAP animations, and WebGL post-processing effects.

The project exists in two forms:

1. **Standalone `index.html`** (project root) — A single self-contained HTML file with zero local dependencies. All Three.js, GSAP, post-processing, and fonts load from CDN. Can be opened directly in any browser or hosted on any static file server. This is the primary deliverable.

2. **React + Express shell** — The original development version wrapping the same experience inside `client/src/pages/OnePiece.tsx`. The backend is minimal with no active API routes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

- **Framework**: React 18 with TypeScript, bundled via Vite
- **Routing**: Wouter (lightweight React router) — single route `/` maps to the `OnePiece` page, with a fallback 404 page
- **UI Components**: shadcn/ui component library (built on Radix UI primitives) with Tailwind CSS for styling
- **Theme**: Dark navy/ocean theme (`--background: 220 25% 7%`) with gold accents (`--primary: 45 95% 50%`). Custom fonts: Pirata One and Cinzel loaded from Google Fonts
- **State/Data Fetching**: TanStack React Query configured with `staleTime: Infinity` and no auto-refetch (since the app is mostly static/3D)

### 3D Engine (Core Feature)

- **Three.js**: Loaded dynamically from CDN (`r128`) inside `OnePiece.tsx` using a sequential script loader pattern
- **Post-processing**: EffectComposer, RenderPass, ShaderPass, UnrealBloomPass, FilmPass all loaded from CDN
- **Animation**: GSAP loaded from CDN for camera animations and cinematic transitions
- **Pattern**: All 3D libraries are loaded as global `window.*` variables (not npm imports), because the PRD specifies zero-build-tool compatibility and CDN delivery
- **Canvas**: Three.js renders to a full-screen WebGL canvas. React acts as a thin mount point via `useRef` and `useEffect`
- **Arc System**: 8 unique 3D scenes (Grand Line, East Blue, Alabasta, Skypiea, Water 7, Marineford, Dressrosa, Wano). Each builder sets scene.background, scene.fog, custom geometry, particles, and lighting. Click navigation uses GSAP camera zoom (z - 30, 1.4s power3.inOut). All arc objects tracked in `arcObjects[]` for proper disposal on scene change.
- **Credits Screen**: After Wano (arc 7), next click shows credits scene (black bg, 500 drifting stars) with GSAP stagger fade-in of 4 lines. Clicking from credits does reverse zoom (z + 30) back to Arc 0.
- **Navigation Flow**: Arc 0→1→2→3→4→5→6→7→Credits→Arc 0→... (infinite). ArrowLeft goes backward.
- **`arcAnimateFn`**: Per-arc callback for per-frame animation (ocean waves, particle drift, cage rotation, etc.)
- **Animation Upgrades**:
  - **Text sync**: `loadArcScene()` + text update + GSAP title entrance all fire in the same `onComplete` callback (no separate setTimeout or fade-out-then-fade-in)
  - **Zoom transition**: Canvas blur(4px) at start, camera rotation.x tilt (0→0.12→0 via `camTilt` object), white flash div (`#flash-overlay`) opacity 0→0.5→0 at midpoint, blur removed in `endZoomEffects()`
  - **Title entrance**: Elastic scale 1.4→1 + y 30→0 with `back.out(1.7)`, tagline letter-spacing 0.4em→0.1em, gold scan line div sweeps x:-100%→100%
  - **Idle camera**: Orbit via `Math.sin(t*0.08)*3` on X, breathing via `baseCamY + Math.sin(t*0.15)*0.8` on Y, mouse parallax adds on top
  - **Object animations**: All Mesh/Group objects get scale pulse `1 + Math.sin(t*1.2)*0.025`, all Points get per-particle X wobble `+= Math.sin(t+i*0.1)*0.003`
  - **Progress dots**: GSAP elastic bounce `scale 1→1.6→1` with `elastic.out(1, 0.4)`, CSS `.ripple::after` pseudo-element with `dot-ripple` keyframe animation
  - **Vignette**: On mousemove, radial-gradient center follows cursor by 10% (`50 + targetX*10`)
  - **Helper functions**: `fadeOutUI()`, `startZoomEffects()`, `endZoomEffects()` centralize transition effects
- **Input**: Click/touchstart (mobile), Space/ArrowRight (forward), ArrowLeft (backward). Mobile uses touchstart instead of click.
- **Accessibility**: `prefers-reduced-motion` disables zoom tweens and uses instant scene swaps. CSS also disables animations.
- **Mobile Optimization**: On `width < 768px`, particle counts reduced by 75% via `pc()` helper, ocean segments reduced to 40x40.
- **`window.__threejsState`**: Exposes scene, camera, renderer, composer, clock, THREE, gsap, bloomPass, getCurrentArc, isCredits, loadArcScene, updateUI, clearScene, navigateForward, navigateBack
- **New HTML elements**: `#flash-overlay` (white, z-index 999, pointer-events none), `#scan-line` (2px gold bar, absolute in title-container). In React version these have `-react` suffix IDs.
- **New CSS**: `#flash-overlay`, `#scan-line`, `.progress-dot.ripple::after`, `@keyframes dot-ripple`

### Backend

- **Framework**: Express 5 running on Node.js via `tsx` (TypeScript execution)
- **Structure**: `server/index.ts` → sets up Express, registers routes, serves static files
- **Routes**: Currently empty (`server/routes.ts` has placeholder comments only)
- **Static serving**: In production, serves built Vite output from `dist/public`. In development, uses Vite middleware (`server/vite.ts`) for HMR

### Data Storage

- **Current**: In-memory storage (`MemStorage` class in `server/storage.ts`) — a simple Map for users
- **Schema**: Drizzle ORM with PostgreSQL dialect defined in `shared/schema.ts`. A `users` table exists with `id`, `username`, and `password` fields
- **DB config**: `drizzle.config.ts` points to `DATABASE_URL` env variable. Run `npm run db:push` to push schema to Postgres
- **Note**: The app currently uses `MemStorage` not the database. Switching to real DB storage requires implementing a `DbStorage` class using the Drizzle client

### Shared Code

- `shared/schema.ts` is the single source of truth for DB types, shared between server and client via the `@shared/*` path alias

### Build System

- **Dev**: `tsx server/index.ts` — runs Express with Vite middleware for hot reload
- **Production build**: Custom `script/build.ts` that runs Vite (client) then esbuild (server), outputting to `dist/`
- **Path aliases**: `@/` → `client/src/`, `@shared/` → `shared/`, `@assets/` → `attached_assets/`

## External Dependencies

### CDN Libraries (Runtime-loaded, not npm)
- **Three.js r128** — `cdnjs.cloudflare.com` — Core 3D WebGL rendering
- **Three.js post-processing** — `cdn.jsdelivr.net` — EffectComposer, RenderPass, ShaderPass, UnrealBloomPass, FilmPass
- **GSAP** — loaded from CDN — Camera animation and cinematic transitions

### npm Packages (Key ones)
- `drizzle-orm` + `drizzle-zod` — ORM and schema validation
- `@tanstack/react-query` — Server state management
- `wouter` — Client-side routing
- `radix-ui/*` — Accessible UI primitives (full suite installed)
- `tailwind-merge` + `clsx` — CSS class utilities
- `connect-pg-simple` — PostgreSQL session store (available but not yet wired up)
- `express-session` — Session management (available but not yet wired up)

### Google Fonts (CDN)
- **Pirata One** — Decorative pirate-style font for headings
- **Cinzel** — Elegant serif font for arc titles and UI text

### Replit-specific Plugins (dev only)
- `@replit/vite-plugin-runtime-error-modal` — Shows runtime errors in an overlay
- `@replit/vite-plugin-cartographer` — Replit-specific dev tooling
- `@replit/vite-plugin-dev-banner` — Dev environment banner

### Database
- **PostgreSQL** — Required via `DATABASE_URL` environment variable. Schema managed by Drizzle Kit (`npm run db:push`)