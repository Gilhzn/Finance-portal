/**
 * CatalogView (Section 9.5.8 / 7.ב) — digital inventory catalog & wholesale
 * purchasing. Product cards with floating category labels and a managed cart on
 * the left with VAT 17%, totals and Excel (CSV) export.
 */

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Download,
  Package,
  X,
} from 'lucide-react';
import type { CatalogItem, CartLine } from '../types';
import { cx, formatCurrency, formatNumber, VAT_RATE, toCsv, downloadCsv } from '../utils';
import { CATALOG, CATALOG_CATEGORIES, COMPANY } from '../data';
import { ViewHeader, PrimaryButton } from './ui';

export default function CatalogView() {
  const [category, setCategory] = useState('הכל');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);

  const items = useMemo(() => {
    return CATALOG.filter((item) => {
      if (category !== 'הכל' && item.category !== category) return false;
      if (query) {
        const q = query.trim();
        return item.name.includes(q) || item.sku.toLowerCase().includes(q.toLowerCase()) || item.brand.includes(q);
      }
      return true;
    });
  }, [category, query]);

  const add = (sku: string) => setCart((c) => ({ ...c, [sku]: (c[sku] ?? 0) + 1 }));
  const dec = (sku: string) =>
    setCart((c) => {
      const next = (c[sku] ?? 0) - 1;
      const copy = { ...c };
      if (next <= 0) delete copy[sku];
      else copy[sku] = next;
      return copy;
    });
  const remove = (sku: string) =>
    setCart((c) => {
      const copy = { ...c };
      delete copy[sku];
      return copy;
    });

  const cartLines: CartLine[] = useMemo(
    () =>
      Object.entries(cart)
        .map(([sku, qty]) => {
          const item = CATALOG.find((c) => c.sku === sku);
          return item ? { item, quantity: qty } : null;
        })
        .filter((x): x is CartLine => x !== null),
    [cart],
  );

  const subtotal = cartLines.reduce((a, l) => a + l.item.price * l.quantity, 0);
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;
  const cartCount = cartLines.reduce((a, l) => a + l.quantity, 0);

  const exportPurchase = () => {
    const headers = ['מק"ט', 'שם פריט', 'מותג', 'כמות', 'מחיר יח\'', 'סה"כ שורה'];
    const rows = cartLines.map((l) => [
      l.item.sku,
      l.item.name,
      l.item.brand,
      l.quantity,
      l.item.price.toFixed(2),
      (l.item.price * l.quantity).toFixed(2),
    ]);
    rows.push(['', '', '', '', 'סכום ביניים', subtotal.toFixed(2)]);
    rows.push(['', '', '', '', 'מע"מ 17%', vat.toFixed(2)]);
    rows.push(['', '', '', '', 'סה"כ כולל מע"מ', total.toFixed(2)]);
    downloadCsv('purchase_order', toCsv(headers, rows));
  };

  return (
    <div>
      <ViewHeader
        title="קטלוג מוצרים ורכש סיטונאי"
        subtitle={`${COMPANY.name} · הזמנה עם ייצוא לאקסל וחישוב מע"מ אוטומטי`}
        icon={<ShoppingCart className="h-5 w-5" />}
        action={
          <button
            onClick={() => setCartOpen(true)}
            className="relative inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-800 lg:hidden"
          >
            <ShoppingCart className="h-4 w-4" />
            סל ({cartCount})
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Catalog grid — 8 cols */}
        <div className="lg:col-span-8">
          {/* Filters */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {CATALOG_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cx(
                    'rounded-full px-3 py-1.5 text-xs font-bold transition-colors',
                    category === c
                      ? 'bg-brand-900 text-white'
                      : 'border border-brand-200 bg-white text-brand-600 hover:border-brand-300',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חיפוש מוצר או מק&quot;ט..."
              className="w-full rounded-xl border border-brand-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 sm:w-64"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <ProductCard key={item.sku} item={item} qty={cart[item.sku] ?? 0} onAdd={add} onDec={dec} />
            ))}
          </div>

          {items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-brand-200 bg-white py-12 text-center text-sm text-brand-400">
              לא נמצאו מוצרים בקטגוריה זו.
            </div>
          )}
        </div>

        {/* Cart — 4 cols (desktop, sticky) */}
        <div className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-20">
            <CartPanel
              lines={cartLines}
              subtotal={subtotal}
              vat={vat}
              total={total}
              onAdd={add}
              onDec={dec}
              onRemove={remove}
              onExport={exportPurchase}
            />
          </div>
        </div>
      </div>

      {/* Mobile cart drawer */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-start bg-brand-950/40 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          >
            <motion.div
              className="h-full w-full max-w-sm overflow-y-auto bg-brand-50 p-4"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-brand-950">סל הרכש</h3>
                <button
                  onClick={() => setCartOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <CartPanel
                lines={cartLines}
                subtotal={subtotal}
                vat={vat}
                total={total}
                onAdd={add}
                onDec={dec}
                onRemove={remove}
                onExport={exportPurchase}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductCard({
  item,
  qty,
  onAdd,
  onDec,
}: {
  item: CatalogItem;
  qty: number;
  onAdd: (sku: string) => void;
  onDec: (sku: string) => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-[var(--shadow-premium)]"
    >
      <div className="relative h-40 overflow-hidden bg-brand-100">
        <img
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <span className="absolute right-3 top-3 rounded-full bg-brand-950/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
          {item.category}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate font-bold text-brand-950">{item.name}</div>
            <div className="num text-[11px] text-brand-400">{item.sku} · {item.brand}</div>
          </div>
        </div>
        <p className="mt-1.5 line-clamp-2 text-xs text-brand-500">{item.description}</p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="num truncate text-lg font-bold text-brand-950">{formatCurrency(item.price)}</div>
            <div className="num text-[11px] text-brand-400">מלאי: {item.inStock}</div>
          </div>
          {qty === 0 ? (
            <PrimaryButton onClick={() => onAdd(item.sku)} className="shrink-0 !px-3 !py-2 text-xs">
              <Plus className="h-4 w-4" />
              הוסף
            </PrimaryButton>
          ) : (
            <div className="flex shrink-0 items-center gap-2 rounded-xl bg-brand-900 px-2 py-1 text-white">
              <button onClick={() => onAdd(item.sku)} className="p-1 hover:text-brand-300" aria-label="הוסף">
                <Plus className="h-4 w-4" />
              </button>
              <span className="num w-6 text-center text-sm font-bold">{qty}</span>
              <button onClick={() => onDec(item.sku)} className="p-1 hover:text-brand-300" aria-label="הפחת">
                <Minus className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CartPanel({
  lines,
  subtotal,
  vat,
  total,
  onAdd,
  onDec,
  onRemove,
  onExport,
}: {
  lines: CartLine[];
  subtotal: number;
  vat: number;
  total: number;
  onAdd: (sku: string) => void;
  onDec: (sku: string) => void;
  onRemove: (sku: string) => void;
  onExport: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-[var(--shadow-luxurious)]">
      <div className="flex items-center gap-2 bg-brand-950 px-5 py-4 text-white">
        <ShoppingCart className="h-5 w-5" />
        <span className="font-bold">מסמך רכש / סל קניות</span>
      </div>

      {lines.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 py-10 text-center text-sm text-brand-400">
          <Package className="h-8 w-8 text-brand-200" />
          הסל ריק. הוסיפו מוצרים מהקטלוג.
        </div>
      ) : (
        <>
          <div className="max-h-[44vh] divide-y divide-brand-100 overflow-y-auto scrollbar-slim">
            {lines.map((l) => (
              <div key={l.item.sku} className="flex items-center gap-3 px-4 py-3">
                <img src={l.item.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-brand-900">{l.item.name}</div>
                  <div className="num text-[11px] text-brand-400">{formatCurrency(l.item.price)} ליח'</div>
                  <div className="mt-1 flex items-center gap-2">
                    <button onClick={() => onDec(l.item.sku)} className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-100 text-brand-700 hover:bg-brand-200" aria-label="הפחת">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="num w-6 text-center text-sm font-bold">{l.quantity}</span>
                    <button onClick={() => onAdd(l.item.sku)} className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-100 text-brand-700 hover:bg-brand-200" aria-label="הוסף">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="num text-sm font-extrabold text-brand-950">
                    {formatNumber(l.item.price * l.quantity)}
                  </span>
                  <button onClick={() => onRemove(l.item.sku)} className="text-brand-300 hover:text-rose-500" aria-label="הסר">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 border-t border-brand-100 bg-brand-50 p-4 text-sm">
            <div className="flex justify-between text-brand-600">
              <span>סכום ביניים</span>
              <span className="num font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-brand-600">
              <span>מע"מ 17%</span>
              <span className="num font-semibold">{formatCurrency(vat)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-brand-900 pt-2 text-base font-extrabold text-brand-950">
              <span>סה"כ לתשלום</span>
              <span className="num">{formatCurrency(total)}</span>
            </div>
            <PrimaryButton onClick={onExport} className="mt-2 w-full">
              <Download className="h-4 w-4" />
              ייצוא הזמנה לאקסל
            </PrimaryButton>
          </div>
        </>
      )}
    </div>
  );
}
