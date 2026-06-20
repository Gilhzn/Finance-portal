# פורטל פיננסי וגיול חובות — קבוצת חלפים לישראל בע"מ

Israel Parts Group — Financial & Debt-Aging B2B Portal.

A right-to-left (RTL) Hebrew financial portal for an automotive parts wholesaler,
built to the supplied **Design System & UI Characterization** guide and the
**Stitch design tokens**. It combines an accounting/documents hub with a
wholesale B2B catalog.

## Tech stack

- **Vite 6** + **React 18** + **TypeScript** (strict)
- **Tailwind CSS v4** (`@tailwindcss/vite`) with the brand `@theme` tokens
- **motion** (`motion/react`) for frictionless micro-interactions
- **lucide-react** icons
- Fonts: **Heebo** (Hebrew), **Inter** (Latin UI), **JetBrains Mono** (numbers/SKUs)

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## Screens (`src/components`)

| File | Screen |
| --- | --- |
| `LandingView.tsx` | Entry screen with two 360px route cards over a navy gradient |
| `MenuView.tsx` | Accounting & documents hub (12-col grid) |
| `AgingView.tsx` | Debt aging map — collapsible months, severity colour coding |
| `LedgerView.tsx` | Accounting ledger card; rows link to document replicas |
| `DeliveryView.tsx` | Delivery notes with drivers & digital signatures |
| `InvoiceView.tsx` | Invoice/credit search across 4 channels + Excel export |
| `InvoiceModal.tsx` | Pixel-perfect source-document replica with print/PDF |
| `CatalogView.tsx` | Digital catalog & wholesale cart with VAT 17% + CSV export |

The floating **AI financial advisor** (in `App.tsx`) answers questions over the
mock dataset.

## Design system

- **Palette:** Slate-Navy (`--color-brand-50…950`), with emerald/rose/orange status colours.
- **Shadows:** `--shadow-premium`, `--shadow-luxurious` (brand-tinted, no flat black).
- **Numbers** (amounts, plates, SKUs, tax IDs) render in JetBrains Mono via the `.num` helper for ERP-grade alignment.
- **Print:** `@media print` in `src/index.css` strips the portal chrome and renders documents in A4 black & white.

## Data (`src/data.ts`)

All figures are local mock data. The total open balance across all customers
reconciles to **exactly ₪2,247,320.00** — enforced in code via a computed
opening-balance document so the aging map always sums correctly.
