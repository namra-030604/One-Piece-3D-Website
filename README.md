# One Piece 3D Arc Explorer

A cinematic interactive website inspired by the One Piece anime, built as a TypeScript full-stack application with a Vite frontend and Express server.

## Highlights

- Interactive 3D/WebGL presentation
- Animated transitions powered by GSAP and Framer Motion
- Responsive React UI with Tailwind CSS
- Shared client/server TypeScript structure
- Optional database integration through Drizzle ORM

## Tech stack

React, TypeScript, Vite, Three.js/WebGL, Express, Tailwind CSS, GSAP, Drizzle ORM, and PostgreSQL support.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- PostgreSQL only when database-backed features are enabled

## Getting started

~~~bash
npm ci
npm run dev
~~~

For a production build:

~~~bash
npm run check
npm run build
npm start
~~~

Copy `.env.example` to `.env` when local configuration is needed. Keep secrets out of Git.

## Repository layout

- `client/` — React and visual experience
- `server/` — Express entrypoint and server routes
- `shared/` — shared types and schemas
- `script/` — build tooling
- `.github/` — repository automation

## Notes

This is an independent fan-made project and is not affiliated with the One Piece rights holders. Visual assets and trademarks remain the property of their respective owners.
