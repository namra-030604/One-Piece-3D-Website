# One Piece 3D Arc Explorer

## Overview

This is an immersive, cinematic portfolio website themed around the One Piece anime. The main experience is a click-to-zoom 3D WebGL animation that takes users through different One Piece arcs (East Blue, Alabasta, Skypiea, Water 7, etc.), each rendered as a unique 3D scene. The goal is to impress recruiters and showcase advanced frontend skills — specifically Three.js, GSAP animations, and WebGL post-processing effects.

The project wraps a primarily frontend 3D experience inside a React + Express fullstack shell. The actual One Piece experience lives in `client/src/pages/OnePiece.tsx`, which dynamically loads Three.js, GSAP, and post-processing libraries from CDN at runtime, then renders a full-screen WebGL canvas.

The backend is minimal — it exists mainly as a scaffold with no active API routes yet.

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