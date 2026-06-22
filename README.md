# ecommerce-mfe

A hands-on micro-frontend reference implementation built with Vite Module Federation, React, and Redux Toolkit. The project is deliberately minimal — three apps, one shared store boundary, one cross-MFE subscription — so every concept is visible without noise.

---

## What is Micro-Frontend Architecture?

A micro-frontend (MFE) treats the **frontend monolith the same way microservices treat the backend**: split it into independently owned, independently deployable units that compose into a single user experience at runtime.

Instead of one giant React app that every team commits to, each team ships their own app. The browser assembles them.

```
                        ┌─────────────────────────────┐
                        │        Shell  :3000          │
                        │  (host — owns the nav + router)│
                        └────────┬────────────┬────────┘
                                 │            │
              lazy import        │            │  lazy import
                                 ▼            ▼
                    ┌──────────────┐   ┌──────────────┐
                    │ Products MFE │   │   Cart MFE   │
                    │    :3001     │   │    :3002     │
                    │ Redux store  │   │  useSyncExt  │
                    │ (cartSlice)  │   │  + checkout  │
                    └──────────────┘   └──────────────┘
```

---

## Project Structure

```
ecommerce-mfe/
├── shell/        # Host — React Router, nav, lazy-loads remotes
├── products/     # Remote — product catalog, owns the cart Redux store
└── cart/         # Remote — cart view, subscribes to products' store
```

Each folder is a **completely independent Vite project** with its own `package.json`, `node_modules`, build pipeline, and dev server. They share nothing at build time.

---

## Concepts Demonstrated

### 1. Module Federation

`@originjs/vite-plugin-federation` implements [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) for Vite. The shell declares `remotes`; each remote declares what it `exposes`.

```js
// shell/vite.config.js
federation({
  remotes: {
    products: 'http://localhost:3001/assets/remoteEntry.js',
    cart:     'http://localhost:3002/assets/remoteEntry.js',
  },
  shared: ['react', 'react-dom', 'react-redux', '@reduxjs/toolkit'],
})

// products/vite.config.js
federation({
  exposes: { './ProductsApp': './src/ProductsApp' },
  shared: ['react', 'react-dom', 'react-redux', '@reduxjs/toolkit'],
})
```

At runtime, the shell does `import('products/ProductsApp')` — the browser fetches `remoteEntry.js` from `:3001` and executes it. No build-time coupling.

---

### 2. Shared Singleton Dependencies

React and `react-redux` must be **singletons** — there can only be one instance of React per page or hooks break (`Cannot read properties of null (reading 'useRef')`).

The `shared` array tells the federation runtime: *"before loading your own copy, check if someone already registered this module."* The shell loads first, registers React and react-redux, and all remotes reuse them.

This is the MFE equivalent of `peerDependencies` — you declare what you share, not what you bundle.

---

### 3. Independent State with a Shared Boundary

Each MFE owns its own Redux store:

| MFE | Store | Slice |
|-----|-------|-------|
| Products | `window.__productsStore` | `cartSlice` — items array |
| Cart | local `store` | `checkoutSlice` — total, status |

The Products MFE exposes its store on `window.__productsStore`. This is the **explicit contract** between the two apps — the only shared surface.

---

### 4. `useSyncExternalStore` for Cross-MFE Reactivity

The Cart MFE does not import anything from Products. It subscribes to `window.__productsStore` using React 18's `useSyncExternalStore`:

```js
// cart/src/CartApp.jsx
const cartItems = useSyncExternalStore(
  (callback) => window.__productsStore.subscribe(callback),  // subscribe
  () => window.__productsStore.getState().cart.items         // getSnapshot
)
```

When Products dispatches `addItem`, Redux notifies all subscribers, which triggers the `callback`, which causes Cart to re-render with the new snapshot. No prop drilling, no shared context, no event buses — just a standard store subscription across an app boundary.

---

### 5. Independent Deployability

Each MFE follows the same lifecycle:

```bash
npm run build    # output goes to dist/
npm run preview  # serves dist/ on its configured port
```

You can update and redeploy Products without touching Cart or Shell. The shell fetches `remoteEntry.js` at **request time**, so the next page load picks up the new version automatically.

This is the core scalability promise of MFEs: **deploy velocity is per-team, not per-repo**.

---

## How This Maps to Real Scale

| Problem at scale | MFE solution | This project shows it via |
|---|---|---|
| Multiple teams on one frontend | Each team owns one remote | `products/`, `cart/`, `shell/` are fully independent |
| One deploy breaks everything | Remotes deploy independently | Products and Cart have separate build + preview commands |
| Shared libraries cause version conflicts | `shared` singleton registry | React, react-redux declared shared — one instance in browser |
| State leaks across team boundaries | Explicit `window.__productsStore` contract | Cart only reads what Products consciously exposes |
| Growing codebase is hard to test | Each MFE is a standalone app | Each remote works in isolation on its own port |
| Onboarding new teams | New remote = new folder + `exposes` config | Add a third MFE by creating a new folder and pointing shell at it |

---

## Running Locally

Each MFE must be **built** before preview — Module Federation only works from built artifacts, not `vite dev`.

```bash
# Terminal 1 — Products remote
cd products && npm install && npm run build && npm run preview

# Terminal 2 — Cart remote
cd cart && npm install && npm run build && npm run preview

# Terminal 3 — Shell host (run last)
cd shell && npm install && npm run build && npm run preview
```

Open `http://localhost:3000`.

> Products and Cart must be running before the shell loads, because the shell fetches their `remoteEntry.js` on first navigation to each route.

---

## Key Files

| File | Role |
|---|---|
| `shell/src/App.jsx` | Router, lazy imports, ErrorBoundary |
| `products/src/store/store.js` | Creates Redux store, assigns `window.__productsStore` |
| `products/src/store/cartSlice.js` | `addItem` reducer |
| `cart/src/CartApp.jsx` | `useSyncExternalStore` subscription to Products store |
| `cart/src/store/checkoutSlice.js` | `setTotal`, `setStatus` reducers |
| `*/vite.config.js` | Federation config — exposes, remotes, shared, CORS headers |

---

## Extending the Project

To add a new micro-frontend (e.g. an **Orders** app):

1. Create `orders/` with its own Vite project
2. Add `federation({ exposes: { './OrdersApp': './src/OrdersApp' } })` to its config
3. Add `orders: 'http://localhost:3003/assets/remoteEntry.js'` to the shell's `remotes`
4. Add `<Route path="/orders" element={<OrdersApp />} />` to the shell's router

No other file changes needed. The shell does not need a rebuild if you use a runtime remote URL. That is the scalability model.
