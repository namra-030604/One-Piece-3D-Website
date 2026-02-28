# Objective
Convert the entire One Piece 3D Arc Explorer from a React+Express+Vite stack into a single standalone `index.html` file with zero local dependencies. All fonts, Three.js, GSAP loaded via CDN. Also create a README.md.

# Tasks

### T001: Create standalone index.html
- **Blocked By**: []
- **Details**:
  - Create a single `index.html` in the project root containing the entire experience
  - **HTML structure**: Convert the JSX from `OnePiece.tsx` into plain HTML with matching `id` attributes and `data-testid` attributes
    - Canvas mount div, vignette overlay, title container (h1 + p), credits container (4 lines + link), progress dots (8 dots), click prompt
  - **CSS**: Inline all styles in a `<style>` block
    - Full viewport reset (margin:0, overflow:hidden, background #050a1a)
    - Google Fonts via `@import` or `<link>` for Pirata One and Cinzel
    - pulse-prompt keyframe animation
    - prefers-reduced-motion media query
    - All element styles from the JSX inline styles converted to CSS classes/IDs
  - **JavaScript**: Single `<script>` block at bottom
    - CDN `<script>` tags in correct dependency order for Three.js r128, post-processing passes, GSAP 3.12
    - Convert all TypeScript to plain JavaScript (remove types, interfaces)
    - Replace React refs (`useRef`) with `document.getElementById()` calls
    - Replace `useEffect` with a self-invoking function or `DOMContentLoaded` listener
    - Port ALL logic from OnePiece.tsx: ARCS array, hexToRgba, setupScene, all 8 arc builders, buildCreditsScene, loadArcScene, updateUI, showCreditsUI, hideCreditsUI, navigateForward, navigateBack, input handlers (click/touchstart/keydown), mouse parallax, resize handler, animate loop
    - Mobile detection (isMobile), particle count reduction (pc()), ocean segment reduction
    - prefers-reduced-motion detection
  - Files: create `index.html` in project root
  - Acceptance: Opening index.html directly in a browser shows the full 3D arc explorer with all 8 arcs, credits screen, keyboard nav, mobile support

### T002: Create README.md
- **Blocked By**: []
- **Details**:
  - Create `README.md` in project root with project description
  - Content: "One Piece 3D Arc Explorer — A cinematic portfolio website built with Three.js, GSAP, WebGL. Click to journey through each One Piece arc in 3D."
  - Keep it concise — the user explicitly asked for this specific description
  - Files: create `README.md` in project root
  - Acceptance: README.md exists with the specified description

### T003: Update replit.md
- **Blocked By**: [T001, T002]
- **Details**:
  - Update replit.md to document the new standalone index.html and its relationship to the React version
  - Note that both versions coexist: the React app (npm run dev) and the standalone index.html
  - Files: `replit.md`
  - Acceptance: replit.md accurately reflects the new file structure
