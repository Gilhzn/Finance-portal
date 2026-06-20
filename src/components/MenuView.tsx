/**
 * MenuView (Section 9.5.2) — combined accounting & documents hub.
 * Desktop: 12-column grid — a central info card on the right, a responsive
 * button grid on the left.
 */

import { motion } from 'motion/react';
import {
  TrendingDown,
  BookOpen,
  Truck,
  FileText,
  ShoppingCart,
  ArrowLeft,
} from 'lucide-react';
import type { ViewKey, Invoice } from '../types';
import { formatCurrency } from '../utils';
import {
  ACCOUNT,
  TOTAL_OPEN_BALANCE,
  AGING_BUCKETS,
  OPEN_INVOICES,
  DELIVERY_NOTES,
} from '../data';
import { Card, StatusBadge } from './ui';

const TILES: { key: ViewKey; label: string; desc: string; icon: typeof BookOpen }[] = [
  { key: 'aging', label: 'גיול חובות', desc: 'מפת חובות לפי חודשים', icon: TrendingDown },
  { key: 'ledger', label: 'כרטסת', desc: 'דוח כרטיסת חשבון', icon: BookOpen },
  { key: 'delivery', label: 'תעודות משלוח', desc: 'נהגים וחתימות', icon: Truck },
  { key: 'invoices', label: 'חשבוניות וזיכויים', desc: 'איתור לפי 4 ערוצים', icon: FileText },
  { key: 'catalog', label: 'קטלוג ורכש', desc: 'הזמנות סיטונאיות', icon: ShoppingCart },
];

export default function MenuView({
  onNavigate,
  onOpenInvoice,
}: {
  onNavigate: (v: ViewKey) => void;
  onOpenInvoice: (inv: Invoice) => void;
}) {
  const dangerTotal = AGING_BUCKETS.filter((b) => b.severity === 'danger').reduce(
    (a, b) => a + b.total,
    0,
  );
  const recent = OPEN_INVOICES.slice(0, 4);
  const pending = DELIVERY_NOTES.filter((d) => d.status === 'pending').length;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Central info card (right side in RTL) */}
      <div className="lg:col-span-5">
        <Card className="overflow-hidden">
          <div className="bg-brand-950 p-6 text-white">
            <div className="text-xs font-semibold text-brand-300">חשבון ראשי</div>
            <div className="mt-1 text-xl font-black">{ACCOUNT.name}</div>
            <div className="num mt-0.5 text-xs text-brand-300">ע.מ {ACCOUNT.taxId}</div>

            <div className="mt-5 rounded-2xl bg-brand-900 p-4">
              <div className="text-xs font-medium text-brand-300">יתרה פתוחה כוללת (כל הלקוחות)</div>
              <div className="num mt-1 text-3xl font-black text-white">
                {formatCurrency(TOTAL_OPEN_BALANCE)}
              </div>
              <div className="mt-2 text-xs text-rose-300">
                מתוכם בסיכון גבוה: <span className="num">{formatCurrency(dangerTotal)}</span>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-brand-900">מסמכים פתוחים אחרונים</h3>
              <button
                onClick={() => onNavigate('invoices')}
                className="text-xs font-bold text-brand-600 hover:text-brand-800"
              >
                לכל החשבוניות
              </button>
            </div>
            <div className="space-y-2">
              {recent.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => onOpenInvoice(inv)}
                  className="flex w-full items-center justify-between rounded-xl border border-brand-100 bg-brand-50/50 px-3 py-2.5 text-right transition-colors hover:border-brand-200 hover:bg-brand-50"
                >
                  <div className="min-w-0">
                    <div className="num text-sm font-bold text-brand-900">{inv.id}</div>
                    <div className="truncate text-xs text-brand-500">{inv.customerName}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="num text-sm font-extrabold text-brand-950">
                      {formatCurrency(inv.openAmount)}
                    </span>
                    <StatusBadge status={inv.status} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Responsive button grid (left side) */}
      <div className="lg:col-span-7">
        <div className="grid gap-4 sm:grid-cols-2">
          {TILES.map((tile) => {
            const Icon = tile.icon;
            const badge =
              tile.key === 'delivery' && pending > 0 ? `${pending} ממתינות` : undefined;
            return (
              <motion.button
                key={tile.key}
                onClick={() => onNavigate(tile.key)}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="group flex h-full min-h-[150px] flex-col justify-between rounded-2xl border border-brand-100 bg-white p-5 text-right shadow-[var(--shadow-premium)] hover:border-brand-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-900 text-white transition-colors group-hover:bg-brand-500">
                    <Icon className="h-6 w-6" />
                  </div>
                  {badge && (
                    <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-600">
                      {badge}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-lg font-black text-brand-950">{tile.label}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs font-medium text-brand-500 transition-all group-hover:gap-2 group-hover:text-brand-700">
                    {tile.desc}
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
