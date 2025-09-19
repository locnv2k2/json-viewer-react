# JSON Viewer for React — Version 1 (Detailed Plan)

**Tone:** pragmatic, minimal surface API, React-first, TypeScript-ready, tiny but extensible.

---

## 1. High-level description
`json-viewer-react` is a small, dependency-light React library that renders JSON data as an interactive tree with expand/collapse, search/highlight, copy, and optional inline editing. Designed as a React component (and hooks) so integration is trivial. v1 focuses on correctness, DX, types, accessibility, and small bundle size.

### Primary goals (v1)
- Stable, tiny, ergonomic React component API.
- Core features: render tree, expand/collapse, search, copy value/path, collapse/expand all, optional inline edit (opt-in), themable with CSS classes.
- TypeScript declarations shipped (first-class TS support).
- Tests, CI, clear README + examples.
- Outputs ESM + CJS builds, usable in CRA/Vite/Next.

### Constraints / non-goals (v1)
- No virtualization for gigantic JSONs (that's v2+). We'll provide `maxRenderDepth` and `maxNodes` protection for safety.
- No React-native support in v1.
- No heavy UI frameworks (no Material UI). Pure CSS + optional CSS module or tailwind-friendly classes.

---

## 2. MVP feature list (must-haves)
1. Render JSON tree (object / array) with per-node expand/collapse.
2. Show data types visually (string/number/bool/null/object/array).
3. Copy value / copy JSON / copy path for a node.
4. Collapse all / Expand all controls.
5. Search: filter/highlight keys and values, auto-expand matches.
6. Basic inline edit (opt-in prop `editable`) with safe parsing and `onChange` callback.
7. Events: `onSelect(nodePath)`, `onChange(path, oldVal, newVal)`, `onError`.
8. Theming: `theme` prop ("light"|"dark"|custom class) + CSS variables for easy customization.
9. TypeScript types and exported types for paths and nodes.
10. Small bundle size (< ~6–10 KB gzipped goal; realistic after measuring).

---

## 3. Public API (React-first)

### Default export: `JSONViewer` component
```tsx
<JSONViewer
  data={object | string}
  rootName?: string // default 'root'
  collapsed?: boolean | number // true = fully collapsed, number = initial collapse depth
  editable?: boolean
  search?: string // controlled search value (optional)
  onSearchMatchCount?: (n:number) => void
  showTypes?: boolean
  theme?: 'light' | 'dark' | string // custom class name allowed
  maxRenderDepth?: number // safety
  maxNodes?: number // safety
  renderValue?: (value, path) => ReactNode // custom renderer hook
  renderKey?: (key, path) => ReactNode
  className?: string
  style?: React.CSSProperties
  onSelect?: (path: string, node: NodeMeta) => void
  onChange?: (path: string, oldVal: any, newVal: any) => void
  onError?: (err: Error) => void
/>
```

### Named exports
- `useJSONViewer(api?)` hook — minimal hook for programmatic control (expand/collapse/search). (Optional in v1; can be deferred to v1.1 if scope is tight.)
- Types: `NodeMeta`, `JSONPath` (string), `RenderOptions`.

### Helper methods (imperative API via `ref`)
Allow a forwarded ref to call methods for imperative control:
```ts
const ref = useRef<JSONViewerHandle>(null);
ref.current.expandAll();
ref.current.collapseAll();
ref.current.search('foo');
ref.current.get(path);
ref.current.set(path, value);
```
`JSONViewerHandle` will be a tiny interface with: `expandAll()`, `collapseAll()`, `search(q)`, `get(path)`, `set(path, value)`, `toJSON()`.

---

## 4. UX & interaction details
- Node header shows key (or index for arrays), type badge, and actions (Copy value, Copy path, Edit (if editable)).
- Click on key toggles expand/collapse for objects/arrays.
- Keyboard accessibility: focusable nodes, Enter/Space toggles, ArrowRight expands, ArrowLeft collapses, / to focus search (progressive enhancement).
- Search: typed query matches key or value (case-insensitive). Matching nodes highlighted and their parents auto-expanded.
- Inline edit: double-click value (or click Edit button) to switch to an input. On blur or Enter, attempt to parse via `safeParse` (JSON.parse fallback: try primitive parsing, else string). Validate values before committing; on invalid show inline error and call `onError`.
- Copy path format: dot/bracket notation, e.g. `root.items[0].name`.

---

## 5. Data model & internal Node metadata
Each rendered node uses a small metadata object (not exposed for mutation):
```ts
interface NodeMeta {
  path: string; // 'root.foo[0].bar'
  depth: number;
  key: string | number;
  type: 'object'|'array'|'string'|'number'|'boolean'|'null';
  childrenCount?: number;
}
```
Store minimal state in React: expandedPaths set (Set<string>), searchQuery string, editState map. The actual JSON data is kept in a proxied copy (immuted clone) so `set`/inline edits mutate a local clone and call `onChange` with previous value and new value.

---

## 6. Safety & limits
- `maxRenderDepth` default 6 — deeper nodes will show `...` placeholder and require explicit expand.
- `maxNodes` default 2000 — if exceeded show a warning and stop rendering more nodes; provide a prop to override.
- Use `textContent` not `innerHTML` for user values. Do not `eval`.
- If `data` is a string, parse with `try { JSON.parse } catch` and call `onError` on parse failure.

---

## 7. TypeScript plan
- Write core code in TypeScript (`src/` in `.tsx`/`.ts`).
- Export full `.d.ts` in `dist` and include `types` field in `package.json`.
- Public types: `JSONViewerProps`, `JSONViewerHandle`, `NodeMeta`, `JSONPath`.

---

## 8. Component architecture
```
src/
  components/
    JSONViewer.tsx       // main wrapper, forwarding ref
    TreeNode.tsx         // recursive node renderer (optimized)
    Controls.tsx         // Expand/Collapse/Search bar
    InlineEditor.tsx     // reusable small editor with validation
  hooks/
    useExpandedPaths.ts // logic for expand/collapse
    useSearch.ts         // search logic
  utils/
    parseSafe.ts
    pathUtils.ts         // build/normalize path, get/set by path
    types.ts
  styles/
    base.css
    themes.css
  index.ts
```

### Rendering strategy
- `TreeNode` receives node value, meta and renders header + optional children. Avoid deep recursion in render by limiting depth and splitting long lists into paged chunks (optional). Keep `TreeNode` `memo`ized to reduce re-renders.
- Prefer `key` prop = `path` to help React reconciliation.

---

## 9. CSS & theming
- Provide single CSS file with CSS variables (for colors, spacing, fonts), and two classes `.jv-theme-light` and `.jv-theme-dark`.
- Document recommended CSS variables so consumers can override.
- Keep classnames BEM-like and unique prefix `jv-` to avoid clashes.

---

## 10. Testing strategy
- Unit tests (Jest + React Testing Library) for: rendering nodes, expand/collapse, search result counts, copy actions (mock clipboard), inline edit success & parse edge cases, `onChange` calls.
- Snapshot tests for small sample JSON render (avoid snapshots for huge trees).
- Accessibility tests: basic axe/core-aria checks.
- Integration E2E optional (Cypress) — skip in v1 unless time.

---

## 11. CI / workflow
- GitHub Actions: run `pnpm install` (or npm), `pnpm test`, `pnpm build`, `pnpm lint` on push and PR.
- Use `semantic-release` or manual release (v1 may do manual to control initial publish).

---

## 12. Bundling & distribution
- Tool: Rollup (or esbuild for faster build). For v1 prefer Rollup for easier config.
- Outputs: `module` (ESM, `dist/index.esm.js`), `main` (CJS, `dist/index.cjs.js`). Optional UMD build `dist/index.umd.min.js` for browser script usage.
- Include source maps.
- Ship types (`dist/index.d.ts`).
- Ensure `package.json` fields: `main`, `module`, `types`, `files: ["dist"]`.

---

## 13. Docs, examples, README
README must include:
- Quick start (install + minimal usage with React).
- Full props table with defaults and types.
- Examples: simple usage, editable example, controlled search example, imperatively set/get example.
- Theming instructions (CSS var overrides).
- Troubleshooting & performance tips (maxNodes, deep structures).

Also include `examples/` folder with minimal `create-react-app` or `vite` demo using the built package via `npm link` or `yarn workspace`.

---

## 14. Acceptance criteria for v1
- ✅ Component builds and runs in CRA/Vite/Next with ESM import.
- ✅ Core interactions work: expand/collapse, search, copy, collapse/expand all.
- ✅ Editable mode updates internal state and fires `onChange` with correct old/new values.
- ✅ TypeScript types present and accurate.
- ✅ Tests covering main use cases with >80% critical path coverage.
- ✅ README + examples clear enough to integrate.

---

## 15. Tasks & rough estimates (single dev)
All estimates given in *work-days* (1 day = ~6–8 focused hours). Adjust based on your speed.

**Phase 0 — Setup**
- Repo scaffold + lint + tsconfig + rollup setup — 0.5d
- CI skeleton (GH Actions) — 0.5d

**Phase 1 — Core render & API (MVP)**
- Core `JSONViewer` + `TreeNode` render with expand/collapse — 2d
- Basic styles + themes + CSS variables — 0.5d
- Copy path/value & expandAll/collapseAll — 0.5d
- Controlled/imperative API via ref — 0.5d

**Phase 2 — Search & Highlight**
- Search implementation, auto-expand matches, match-count callback — 1d
- Unit tests for search — 0.5d

**Phase 3 — Editable mode**
- Inline editor component, safe parse rules, validation, events — 1d
- Tests for edit flows & error handling — 0.5d

**Phase 4 — Types, build, tests & polish**
- Typescript types, build, package.json metadata — 0.5d
- Jest + RTL tests (main flows) — 1d
- Docs + README + examples — 1d
- Final polish, small bugfixes — 0.5d

**Total estimated:** ~10–11 days

---

## 16. Release checklist (pre-publish)
- [ ] Version bump to `1.0.0` or `0.1.0` (decide stable vs initial)
- [ ] All tests passing on CI
- [ ] Build artifacts present in `dist`
- [ ] README, LICENSE, CHANGELOG (initial), and examples included
- [ ] Types included and validated
- [ ] `npm publish --access public` or `pnpm publish` dry run tested

---

## 17. Future roadmap (quick)
- v1.1: Virtualization for huge JSONs, performance flags
- v1.2: Diff viewer & two-pane compare
- v1.3: JSON Schema validation + inline error markers
- v2.0: Plugins system (custom cell renderers), React Native support

---

## 18. Example minimal usage (to include in README)
```tsx
import React, { useRef } from 'react';
import JSONViewer from 'json-viewer-react';

export default function App(){
  const ref = useRef(null);
  const data = { name: 'Loc', tags: ['dev','js'] };
  return (
    <div>
      <button onClick={() => ref.current.expandAll()}>Expand all</button>
      <JSONViewer
        ref={ref}
        data={data}
        collapsed={1}
        editable
        onChange={(path, oldVal, newVal) => console.log('changed', path, oldVal, newVal)}
      />
    </div>
  );
}
```

---

## 19. Implementation pitfalls & tips
- Avoid deep recursion when rendering: use depth guard and memoization.
- Keep DOM small: avoid rendering thousands of nodes at once (maxNodes, collapse-by-default for arrays/objects > N).
- For `set` by path, operate on cloned data to avoid surprising upstream props mutation.
- For inline edit parsing: prefer `try JSON.parse`, then fallback heuristics (number, boolean, null, string).
- Use `useCallback` + `React.memo` for `TreeNode` to minimize re-renders.

---

## 20. Next actions (what I can help with right now)
- I can scaffold the repo for you (TSX code + rollup + tests + README). (Pick `A`)
- I can implement the main `JSONViewer` + `TreeNode` component with tests. (Pick `B`)
- I can produce the README + examples only. (Pick `C`)

---

*End of v1 plan.*
