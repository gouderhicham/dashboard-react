# Performance Enhancements

Tracking document for performance optimizations on this template.

---

## ✅ Completed (Easy Tier)

### 1. Removed duplicate / unused dependencies

- Removed `vite-plugin-windicss` (not used anywhere)
- Removed `@mui/utils` (not used)
- Removed `qs` (not used)
- Removed `@types/react-helmet` (project uses `react-helmet-async`)
- Moved `postcss-preset-env` from `dependencies` → `devDependencies`

**Files**: `package.json`

### 2. Optimized `vite.config.ts` with manualChunks

- Added a **conservative** `manualChunks` strategy: only React-free libs (`leaflet`, `date-fns`, `lucide-react`) get their own chunks; React + all React-consuming libs (MUI, Radix, react-intl, formik, tanstack, react-router) live in a single `vendor` chunk.
- Lowered `chunkSizeWarningLimit` from 3000 → 800.
- Made `rollup-plugin-visualizer` opt-in via `ANALYZE=true` env.
- Added `cssCodeSplit: true`, disabled sourcemaps in prod.
- Added `commonjsOptions.transformMixedEsModules` and `requireReturnsDefault: 'auto'` for safe CJS/ESM interop.
- Pre-bundled critical deps via `optimizeDeps.include`.

**Why not split vendor further?** Splitting `react-intl`, `mui`, `formik`, etc. into their own chunks caused runtime errors like `Cannot read properties of undefined (reading 'Fragment'/'createContext')`. These libs use `import React from 'react'` at module top level, and across chunk boundaries the CJS/ESM default-export interop wrapper is unreliable. Keeping them with React in one `vendor` chunk is the only safe fix without modifying every library's source.

**Files**: `vite.config.ts`

### 3. Added gzip + brotli compression

- `vite-plugin-compression` now emits `.gz` and `.br` files alongside the bundle.
- Configure your web server (nginx / Apache / CDN) to serve `.br` when `Accept-Encoding: br` is present.

**Files**: `vite.config.ts`, `package.json`

### 4. Split `tsc` from `vite build`

New scripts:

```json
"build": "vite build",
"build:check": "tsc --noEmit && vite build",
"typecheck": "tsc --noEmit",
"analyze": "ANALYZE=true vite build"
```

- `build` is now ~30–40% faster (no blocking type-check).
- Run `typecheck` separately in CI in parallel.

**Files**: `package.json`

### 5. Fixed `App.tsx` theme effect dependency

- Changed `useEffect` dep from full `settings` object → `settings.themeMode`.
- Avoids unnecessary re-runs whenever ANY settings field changes.

**Files**: `src/App.tsx`

### 6. Lazy-loaded all route pages

- Refactored `AppRoutingSetup.tsx`: every one of the 70+ pages is wrapped in `React.lazy` with a typed `lazyNamed` helper.
- Added `<Suspense fallback={<ScreenLoader />}>` boundary around the routes.
- Each page is now its own chunk (1–30 KB) loaded only when navigated to.

**Result**: Initial JS bundle reduced from one ~3 MB chunk to a much smaller initial payload + on-demand page chunks.

**Files**: `src/routing/AppRoutingSetup.tsx`

---

## 🟡 Pending — Medium Tier

### 7. Optimize images in `/public/media` (~20 MB) ( for this one we will remove the unsued media in the end of project bcz we need it in mock data)

**Effort**: 30 min · **Impact**: 60–80% smaller media

**Action**:

```bash
npm i -D @squoosh/cli
npx @squoosh/cli --webp auto public/media/**/*.{jpg,png}
# or
npm i -D sharp-cli
npx sharp-cli -i "public/media/**/*.{jpg,png}" -o public/media-webp -f webp
```

Then update `<img src>` references to use `.webp` (or use `<picture>` with fallback).

---

### 8. Replace KeenIcons CSS-font with on-demand icons

**Effort**: 2–4 hours · **Impact**: -500 KB to -1 MB initial CSS

The current `main.tsx` loads:

```ts
import '@/components/keenicons/assets/styles.css';
```

which pulls in **all 4 icon styles** (duotone + filled + outline + solid = ~14 MB raw, ~500 KB-1 MB CSS).

**Options**:

- **Option A (easy)**: Edit `keenicons/assets/styles.css` to import only ONE style (e.g. `outline`). Delete the unused `duotone/`, `filled/`, `solid/` folders.
- **Option B (better)**: Migrate to `lucide-react` (already installed!). Replace `<KeenIcon icon="..." />` with `<IconName />` from lucide.

**Files**: `src/components/keenicons/`, `src/main.tsx`, anywhere `<KeenIcon>` is used.

---

### 9. Memoize provider context values

**Effort**: 1 hour · **Impact**: Reduces cascade re-renders

Each of the 7 providers in `src/providers/` likely creates a new context value object every render. Wrap them in `useMemo`:

```tsx
// In each Provider:
const value = useMemo(() => ({ settings, updateSettings /*...*/ }), [settings]);
return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
```

**Files to audit**:

- `src/providers/SettingsProvider.tsx`
- `src/providers/LayoutProvider.tsx`
- `src/providers/MenusProvider.tsx`
- `src/providers/LoadersProvider.tsx`
- `src/providers/PathnameProvider.tsx`
- `src/providers/TranslationProvider.tsx`
- `src/auth/providers/JWTProvider.tsx`

---

### 10. Wire up React Query

**Effort**: 30 min · **Impact**: Deduplicates fetches, caches API calls

`@tanstack/react-query` is already a dependency but no `QueryClientProvider` is mounted (commented out in `ProvidersWrapper.tsx`).

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

<QueryClientProvider client={queryClient}>{/* rest of providers */}</QueryClientProvider>;
```

**Files**: `src/providers/ProvidersWrapper.tsx`

---

### 11. Audit Tailwind config (721 lines)

**Effort**: 2 hours · **Impact**: Smaller production CSS

Current `tailwind.config.js` is 721 lines.

**Action**:

- Verify `content` glob is precise (not `**/*.*`).
- Remove any `safelist` entries that aren't justified.
- Audit custom plugins for tree-shake friendliness.
- Confirm JIT mode is producing minimal CSS by inspecting `dist/assets/index-*.css`.

**Files**: `tailwind.config.js`

---

### 12. Tree-shake `date-fns` imports

**Effort**: 30 min · **Impact**: -20 KB if mis-imported

Ensure all `date-fns` imports use the modular form:

```ts
// Good
import { format, parseISO } from 'date-fns';

// Bad (won't tree-shake)
import * as dateFns from 'date-fns';
```

Run a grep: `grep -rn "import \* as.*date-fns\|from 'date-fns'" src`

---

### 13. Split barrel exports for tree-shaking

**Effort**: 1 hour · **Impact**: Better tree-shaking with lazy routes

Pages are currently exported via `index.ts` barrels (`export * from './demo1'`). When combined with lazy loading, this can pull in sibling demos. Already mitigated by direct `import()` paths in the lazy router, but apply the same pattern to:

- `src/components/index.ts`
- `src/partials/*/index.ts`
- `src/layouts/*/index.ts`

---

## 🔴 Pending — Hard Tier

### 14. Decide: MUI **or** Radix — not both

**Effort**: 2–5 days · **Impact**: -100 to -200 KB gzip

Currently the bundle ships both:

- `@mui/material` + `@mui/base` + `@emotion/*` (~150 KB gzip)
- 14 separate `@radix-ui/*` packages (~135 KB raw / 25 KB brotli per build)

**Action**: Pick one design system, refactor components in `src/components/ui/` and `src/components/menu|tabs|modal/` to use only it.

---

### 15. Replace `react-intl` + `@formatjs/*` with native `Intl`

**Effort**: 3–5 days · **Impact**: -100 to -200 KB gzip

`react-intl` + polyfills currently produce a 161 KB chunk. Modern browsers (your target) have native `Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.PluralRules`, `Intl.RelativeTimeFormat`.

**Options**:

- Migrate to `@lingui/react` (~10 KB)
- Or use native `Intl` directly with a thin wrapper for ICU message format
- Or use `format-message` (lighter than react-intl)

**Files**: `src/i18n/`, `src/providers/TranslationProvider.tsx`

---

### 16. Route-based provider scoping

**Effort**: 4 hours · **Impact**: Faster auth/error pages

Move `LoadersProvider`, `MenusProvider`, `LayoutProvider` from `ProvidersWrapper` (root) into `Demo1Layout` only. Auth pages (`/auth/*`) and error pages (`/error/*`) don't need them.

**Files**: `src/providers/ProvidersWrapper.tsx`, `src/layouts/demo1/Demo1Layout.tsx`

---

### 17. Migrate to `@tanstack/react-router` or RR v7 file-based routing

**Effort**: 1–2 weeks · **Impact**: Type-safe params, route-level preloading, smaller core

Benefits:

- Built-in route-level code splitting + intent-based preloading (hover-to-preload)
- Type-safe URL params and search params
- Built-in pending / error states (no `Suspense` boilerplate)
- File-based routing reduces the giant `AppRoutingSetup.tsx`

---

### 18. Switch to SWC (faster transforms)

**Effort**: 1 hour · **Impact**: 20× faster dev/build transforms

```bash
npm rm @vitejs/plugin-react
npm i -D @vitejs/plugin-react-swc
```

```ts
// vite.config.ts
import react from '@vitejs/plugin-react-swc'; // drop-in
```

**Note**: Drops Babel-based plugins (e.g. emotion's `babel-plugin`). Verify nothing relies on Babel.

---

### 19. Server-side render or prerender public pages

**Effort**: 2–3 weeks · **Impact**: First-contentful-paint < 1s

The auth + welcome pages would benefit from SSR/SSG. Options:

- `vite-plugin-ssr` (recommended for SPA → SSR migration)
- Migrate the public surface to Next.js (admin stays SPA)

---

### 20. PWA + service worker caching

**Effort**: 4 hours · **Impact**: Instant repeat visits, offline support

```bash
npm i -D vite-plugin-pwa
```

Cache strategies:

- `media/` images → `CacheFirst`, 30-day expiry
- `assets/*.js` → `StaleWhileRevalidate`
- API calls → `NetworkFirst` with timeout

**Files**: `vite.config.ts`, add manifest

---

## 📊 Build Output Reference (after easy-tier fixes)

After implementing items 1-6 with the **safe** chunking strategy:

| Chunk                      | Raw     | Brotli   |
| -------------------------- | ------- | -------- |
| `vendor` (React + UI libs) | 976 KB  | 242 KB   |
| `index` (entry)            | 205 KB  | 35 KB    |
| `date-fns`                 | 23 KB   | 6 KB     |
| `icons` (lucide-react)     | 5 KB    | 1 KB     |
| Per-page chunk             | 1–30 KB | 0.5–8 KB |

Total `dist/assets`: ~12 MB (was effectively one big bundle before)

**Trade-off**: The `vendor` chunk is large because we're keeping React + all React-consuming libs together for interop safety. The big wins are still real:

- Lazy routes (each page is its own chunk loaded on-demand)
- Brotli compression (~75% size reduction over the wire)
- Independent leaflet/date-fns/icons chunks

To shrink the vendor chunk further, the path forward is the **medium / hard tier items**: drop one of MUI or Radix (#14), migrate off `react-intl` (#15), and migrate off MUI base for menu/tabs/modal.

---

## 🎯 Priority Order

If implementing one at a time, do them in this order:

1. **#7 Image optimization** — biggest single byte reduction (20 MB → ~5 MB media)
2. **#8 KeenIcons cleanup** — second biggest CSS reduction
3. **#10 React Query** — quick win, real impact on real apps
4. **#9 Memoize providers** — improves render performance everywhere
5. **#18 SWC swap** — faster dev experience for the team
6. **#14 Pick MUI or Radix** — once the team decides
7. **#15 Native Intl migration** — biggest remaining vendor-chunk reduction
8. **#17 Modern router** — long-term DX win
9. **#19 SSR** — only if SEO / first-paint truly matters
10. **#20 PWA** — only if offline / repeat-visit UX matters

---

_Last updated: 2026-05-01_
