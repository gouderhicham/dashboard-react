# Performance Review

This review focuses on improving the app toward a 90+ Lighthouse Performance score. Media assets are intentionally out of scope because they are being kept as mock data until the end of the project.

## Ready To Push

Status: Ready from a build/typecheck perspective.

Completed in this performance pass:

- Lazy-loaded the main route shells: `AuthPage`, `Demo1Layout`, and `ErrorsRouting`.
- Split i18n message JSON into on-demand language chunks.
- Made FormatJS relative-time polyfill loading conditional instead of eager.
- Removed MUI and Emotion entirely. All shared primitives (`loaders`, `tooltip`, `accordion`, `modal`, `menu`, `tabs`) are now backed by Radix UI plus Floating UI for the menu's dropdown positioning.
- Updated this report with the current bundle snapshot and remaining optimization order.

Verification completed:

```bash
npm run typecheck
npm run build
```

Both commands passed.

Files changed for this pass:

```text
src/routing/AppRoutingSetup.tsx
src/i18n/config.tsx
src/i18n/types.d.ts
src/providers/TranslationProvider.tsx
src/components/loaders/ContentLoader.tsx
src/components/loaders/ProgressBarLoader.tsx
src/components/tooltip/Tooltip.tsx
src/components/accordion/AccordionItem.tsx
src/components/modal/Modal.tsx
src/components/menu/MenuItem.tsx
src/components/menu/MenuSub.tsx
src/components/menu/types.d.ts
src/components/tabs/Tabs.tsx
src/components/tabs/Tab.tsx
src/components/tabs/TabsList.tsx
src/components/tabs/TabPanel.tsx
src/pages/examples/modal/ModalExamplePage.tsx
src/pages/examples/modal/index.ts
src/plugins/components/tabs.js
tailwind.config.js
package.json
PERFORMANCE_REVIEW.md
```

Before pushing, recommended manual check:

- Open the app and verify the language dropdown still switches between English, Arabic, French, and Chinese.
- Check one protected route, one auth route, and one error route to confirm lazy-loaded shells render correctly.

## Current Build Snapshot

Command used:

```bash
npm run build
```

Production build succeeded.

Original key output sizes before the first optimization:

| Asset | Minified | Gzip |
| --- | ---: | ---: |
| `vendor` JS | 1.03 MB | 320 KB |
| `index` JS | 210 KB | 45 KB |
| Main CSS | 305 KB | 46 KB |

Current key output sizes after lazy-loading route shells, slimming i18n startup, and removing MUI/Emotion:

| Asset | Minified | Gzip | Brotli |
| --- | ---: | ---: | ---: |
| `vendor` JS | 877 KB | 266 KB | 211 KB |
| Initial app entry JS | 84 KB | 23 KB | — |
| Main CSS | 305 KB | 46 KB | — |

Removing MUI and Emotion shaved roughly 127 KB raw (≈ 37 KB brotli) off the vendor chunk vs. the prior pass.

Translation JSON is split into separate language chunks:

| Language Chunk | Minified | Gzip |
| --- | ---: | ---: |
| `zh` | 0.47 KB | 0.38 KB |
| `ar` | 0.57 KB | 0.41 KB |
| `en` | 0.57 KB | 0.34 KB |
| `fr` | 0.61 KB | 0.37 KB |

The main remaining performance problem is startup cost: too much shared JavaScript and CSS is loaded before the user reaches a specific page. The next big win is scoping app-only providers out of the global root so auth and error routes do not pay for dashboard state.

## Completed Optimizations

### 1. Lazy-loaded layout and route shells

Status: Done  
Build verification: Passed with `npm run build`

Changed:

```text
src/routing/AppRoutingSetup.tsx
```

What changed:

- Removed eager imports for `AuthPage`, `Demo1Layout`, and `ErrorsRouting`.
- Converted them to `React.lazy` imports using the existing `lazyNamed` helper.
- Kept the existing `Suspense` boundary and `ScreenLoader` fallback.

Result:

- Initial app entry JS reduced from about 210 KB minified / 45 KB gzip to about 85 KB minified / 24 KB gzip.
- Dashboard, auth, and error route shells are now split into separate chunks and loaded only when needed.

### 3. Removed MUI and Emotion

Status: Done
Build verification: Passed with `npm run typecheck` and `npm run build`

Replaced every `@mui/material` and `@mui/base` usage with Radix UI primitives (and Floating UI for the menu's dropdown positioning), then removed `@mui/material`, `@mui/base`, `@emotion/cache`, `@emotion/react`, and `@emotion/styled` from `package.json`. Migration was executed in six small chunks so each could be type-checked, built, and visually verified before moving on:

1. **Loaders** — `ContentLoader` and `ProgressBarLoader` rewritten as Tailwind-only spinners. New keyframe `progress-indeterminate` added in `tailwind.config.js`.
2. **Tooltip** — `DefaultTooltip` rewritten on top of `@radix-ui/react-tooltip`, preserving the `title`/`placement`/`className` API consumed by header dropdowns and sidebar.
3. **Accordion** — `AccordionItem` switched to `@radix-ui/react-collapsible` using existing `collapsible-down`/`collapsible-up` Tailwind animations.
4. **Modal** — Local `Modal` rewritten on top of `@radix-ui/react-dialog`, preserving `open`/`onClose`/`zIndex`/`className`. Inline `display:block; opacity:1` overrides the Metronic `.modal` plugin's hidden default. Added `/examples/modal` page with four demos (basic, form, large/scrolling, confirm).
5. **Tabs** — `Tabs`/`TabsList`/`Tab`/`TabPanel` rewritten on top of `@radix-ui/react-tabs`. Numeric `value`/`defaultValue` are coerced to strings so existing call sites (`<Tabs defaultValue={1}>`) keep working unchanged. The `.tab` Tailwind plugin now styles `[data-state="active"]` alongside `.active`.
6. **Menu** — Highest-risk piece. `Collapse` replaced with `@radix-ui/react-collapsible`. `Popper` replaced with `useFloating` from `@floating-ui/react-dom` (`offset`, `flip`, `shift`, `autoUpdate`) rendered via `createPortal`. `ClickAwayListener` replaced with a scoped `mousedown` listener that ignores clicks inside the trigger or floating container. `dropdownProps` keeps the same `{ placement, modifiers: [{ name: 'offset', options: { offset: [skid, distance] } }] }` shape, so all 25+ call sites required no changes.

Result:

- `@mui/*` and `@emotion/*` are fully gone from `package.json`, `package-lock.json`, and `node_modules`.
- Vendor chunk dropped from ~1004 KB raw / ~248 KB brotli to ~877 KB raw / ~211 KB brotli (≈ 127 KB raw / 37 KB brotli saved).
- Build time also improved noticeably (≈ 25 s → ≈ 6 s in this chain) because there is far less code to bundle.
- Behavior verified: tooltips render correctly, accordion and menu submenus animate on open/close, dropdown positioning is preserved across RTL/LTR and offset modifiers, modal backdrop and ESC/outside-click work.

Browser checks still recommended:

- A page using the user/notifications dropdown menus.
- The search modal which exercises `Tabs` + `Modal` together.
- Any FAQ page using the `Accordion` component.

### 2. Slimmed i18n startup loading

Status: Done  
Build verification: Passed with `npm run typecheck` and `npm run build`

Changed:

```text
src/i18n/config.tsx
src/i18n/types.d.ts
src/providers/TranslationProvider.tsx
```

What changed:

- Removed eager imports of all message JSON files from `src/i18n/config.tsx`.
- Added dynamic message loaders for `en`, `ar`, `fr`, and `zh`.
- Changed stored i18n config to keep only the language code instead of storing the full language object with messages.
- Removed eager FormatJS relative-time polyfill and locale-data imports from provider startup.
- Added conditional relative-time polyfill loading only when browser support is missing.
- Memoized translation provider callbacks and context value while touching this provider.

Result:

- Translation files now build as separate chunks instead of being bundled into startup code.
- Initial app entry JS is now about 84 KB minified / 23 KB gzip.
- Language switching still uses the same dropdown API, but messages load on demand.

## What To Do First

This order is based on practical execution: low-risk improvements first, then higher-risk dependency work later. MUI replacement has very high potential impact, but it touches shared UI behavior, so it should wait until the safer optimizations are done.

| Priority | Status | Task | Effort | Expected Performance Gain | Why This Order |
| ---: | --- | --- | --- | --- | --- |
| 1 | Done | Lazy-load layout and route shells | Easy | High | Completed. This reduced the initial app entry from about 210 KB to about 85 KB minified. |
| 2 | **Next** | Move app-only providers out of the global root | Medium | High | Auth/error pages should not mount dashboard layout, loader, and menu providers. This reduces startup work and rerenders. |
| 3 | Pending | Reduce route verification work | Easy | Medium | Avoids repeated async auth checks and loader state changes on navigation. Good runtime improvement with low risk. |
| 4 | Pending | Memoize provider values and callbacks | Easy | Medium | Reduces cascade rerenders, especially when loader/settings/menu state changes. Low risk if done carefully. |
| 5 | Done | Slim i18n startup cost | Medium | Medium to high | Completed. Message JSON files now load as separate language chunks and relative-time polyfills are conditional. |
| 6 | Pending | Avoid the global components barrel in hot paths | Medium | Medium | Direct imports improve chunk isolation, but this touches many files and should be done gradually. |
| 7 | Pending | Audit Tailwind plugin output | Medium | Medium | CSS is not the largest blocker, but unused custom component CSS still adds startup cost. Best after the UI surface is stable. |
| 8 | Done | Replace MUI usage in shared components | Hard | Very high | Completed. MUI/Emotion fully removed; loaders, tooltip, accordion, modal, tabs, menu now run on Radix + Floating UI. Vendor chunk shrank ≈ 127 KB raw / 37 KB brotli. |

## Effort Classification

### Easy

| Task | Expected Gain | Files |
| --- | --- | --- |
| Lazy-load layout and route shells | High, done | `src/routing/AppRoutingSetup.tsx` |
| Reduce route verification work | Medium | `src/routing/AppRouting.tsx` |
| Memoize provider values and callbacks | Medium | `src/providers/*`, `src/auth/providers/JWTProvider.tsx` |

### Medium

| Task | Expected Gain | Files |
| --- | --- | --- |
| Move app-only providers out of the global root | High | `src/providers/ProvidersWrapper.tsx`, protected layout files |
| Slim i18n startup cost | Medium to high, done | `src/providers/TranslationProvider.tsx`, `src/i18n/config.tsx`, `src/i18n/types.d.ts` |
| Avoid the global components barrel in hot paths | Medium | `src/components/index.ts`, auth/layout/shared files |
| Audit Tailwind plugin output | Medium | `tailwind.config.js`, `src/plugins/components/*` |

### Hard

| Task | Expected Gain | Files |
| --- | --- | --- |
| Replace MUI usage in shared components | Very high, done | `src/components/menu`, `src/components/accordion`, `src/components/tooltip`, `src/components/loaders`, `src/components/modal`, `src/components/tabs` |

## Detailed Improvements

### 1. Lazy-load layout and route shells

Effort: Easy  
Expected performance gain: High  
Recommended priority: 1

Route pages are already lazy-loaded, which is good. However, the router still eagerly imports key shells:

- `AuthPage`
- `Demo1Layout`
- `ErrorsRouting`

File:

```text
src/routing/AppRoutingSetup.tsx
```

Recommended action:

- Convert `AuthPage`, `Demo1Layout`, and `ErrorsRouting` to lazy imports.
- Keep the existing `Suspense` boundary.
- This reduces startup work because the dashboard shell, auth shell, and error shell do not all need to load immediately.

### 2. Move app-only providers out of the global root

Effort: Medium  
Expected performance gain: High  
Recommended priority: 2

The root provider tree currently mounts layout, menu, and loader providers for every route, including auth and error pages.

File:

```text
src/providers/ProvidersWrapper.tsx
```

Current global providers include:

- `LayoutProvider`
- `LoadersProvider`
- `MenusProvider`
- `TranslationProvider`
- `SettingsProvider`
- `AuthProvider`
- `QueryClientProvider`

Recommended action:

- Keep truly global providers at the root.
- Move `LayoutProvider`, `LoadersProvider`, and `MenusProvider` into the protected app layout.
- Auth and error pages should not pay for dashboard layout/menu state.

### 3. Replace MUI usage in shared components

Effort: Hard
Expected performance gain: Very high
Recommended priority: 8
Status: Done

All shared primitives now use Radix UI plus Floating UI. `@mui/material`, `@mui/base`, `@emotion/cache`, `@emotion/react`, `@emotion/styled` are removed from `package.json` and `package-lock.json`. See "Completed Optimizations → 3. Removed MUI and Emotion" above for the per-chunk breakdown and verification notes.

### 4. Slim i18n startup cost

Effort: Medium  
Expected performance gain: Medium to high  
Recommended priority: 5
Status: Done

The translation provider imports FormatJS polyfills and several locale datasets at startup. The i18n config also imports all language JSON files immediately.

Files:

```text
src/providers/TranslationProvider.tsx
src/i18n/config.tsx
```

Recommended action:

- Done: Load only the active language messages.
- Done: Dynamically import language JSON files when the language changes.
- Done: Load FormatJS relative-time polyfills only when browser support is missing.
- Done: Remove eager locale-data imports from startup.

### 5. Avoid the global components barrel in hot paths

Effort: Medium  
Expected performance gain: Medium  
Recommended priority: 6

The shared barrel exports many component groups:

```text
src/components/index.ts
```

Many files import from `@/components`, which can make chunks pull unrelated component modules.

Recommended action:

- Replace broad imports like:

```ts
import { KeenIcon, Alert } from '@/components';
```

with direct imports:

```ts
import { KeenIcon } from '@/components/keenicons';
import { Alert } from '@/components/alert';
```

Start with:

- auth pages
- layout files
- header/sidebar/menu files
- components used on first load

### 6. Memoize provider values and callbacks

Effort: Easy  
Expected performance gain: Medium  
Recommended priority: 4

Several providers recreate functions and context values on every render.

Files:

```text
src/providers/SettingsProvider.tsx
src/providers/LayoutProvider.tsx
src/providers/LoadersProvider.tsx
src/providers/MenusProvider.tsx
src/providers/PathnameProvider.tsx
src/auth/providers/JWTProvider.tsx
```

Recommended action:

- Use `useCallback` for provider functions.
- Use `useMemo` for context values.
- Use functional state updates where possible.

Example:

```tsx
const updateSettings = useCallback((newSettings: Partial<ISettings>) => {
  setSettings((current) => ({ ...current, ...newSettings }));
}, []);

const value = useMemo(
  () => ({ settings, updateSettings, storeSettings, getThemeMode }),
  [settings, updateSettings, storeSettings, getThemeMode]
);
```

### 7. Reduce route verification work

Effort: Easy  
Expected performance gain: Medium  
Recommended priority: 3

Auth verification currently runs during routing and again on location changes.

File:

```text
src/routing/AppRouting.tsx
```

Recommended action:

- Verify only when the auth token changes or becomes stale.
- Cache successful user verification.
- Avoid verifying on every navigation when using mock auth or unchanged tokens.
- Add dependencies to effects instead of relying on no-dependency effects.

### 8. Audit Tailwind plugin output

Effort: Medium  
Expected performance gain: Medium  
Recommended priority: 7

Tailwind content globs are already precise:

```text
index.html
./src/**/*.{ts,tsx}
```

However, the config loads many custom component plugins globally.

File:

```text
tailwind.config.js
```

Recommended action:

- Remove unused custom Tailwind component plugins once the final UI surface is known.
- Check whether every plugin under `src/plugins/components/*` is still required.
- Inspect the final generated CSS after removing unused page/template sections.

## Recommended Execution Order

1. Done: Lazy-load `Demo1Layout`, `AuthPage`, and `ErrorsRouting`.
2. **Next:** Scope `LayoutProvider`, `LoadersProvider`, and `MenusProvider` to the protected dashboard layout (out of the global root).
3. Reduce repeated auth verification on navigation.
4. Memoize provider values.
5. Done: Dynamically load i18n messages and conditional polyfills.
6. Replace broad `@/components` imports in first-load paths.
7. Audit Tailwind custom plugin output.
8. Done: Replace MUI in shared components.

## Notes

- The project already has route-level lazy loading for most protected pages.
- React Query is already mounted with reasonable defaults.
- Gzip and Brotli files are already generated by the Vite build.
- The remaining work is mostly about reducing initial shared code and avoiding root-level work that every route pays for.
