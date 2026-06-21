/**
 * LandingView (Section 9.5.1) — entry screen with two giant 360px route cards
 * over a dark gradient overlay and hover lift animation.
 */

import { motion } from 'motion/react';
import { ArrowLeft, Wallet, ShoppingCart, FileText, Clock, TrendingDown } from 'lucide-react';
import type { ViewKey } from '../types';
import { formatCurrency } from '../utils';
import { COMPANY, TOTAL_OPEN_BALANCE, OPEN_INVOICES, DELIVERY_NOTES } from '../data';
import { BrandMark } from './ui';

const ROUTES: {
  target: ViewKey;
  title: string;
  desc: string;
  image: string;
  icon: typeof Wallet;
}[] = [
  {
    target: 'menu',
    title: 'הנהלת חשבונות ומסמכים',
    desc: 'גיול חובות, כרטסת, חשבוניות, זיכויים ותעודות משלוח חתומות',
    image:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=70',
    icon: Wallet,
  },
  {
    target: 'catalog',
    title: 'קטלוג ורכש סיטונאי',
    desc: 'הזמנת חלפים, צמיגים ושמנים עם סל קניות וייצוא לאקסל',
    image:
      'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=70',
    icon: ShoppingCart,
  },
];

export default function LandingView({ onNavigate }: { onNavigate: (v: ViewKey) => void }) {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10 flex flex-col items-center text-center"
      >
        <BrandMark size={56} />
        <div className="mt-4 mb-3 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3.5 py-1 text-xs font-bold text-brand-700 shadow-[var(--shadow-premium)] backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {COMPANY.slogan}
        </div>
        <h1 className="text-4xl font-black tracking-tight text-brand-950 sm:text-6xl">
          פורטל הלקוחות הפיננסי
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-relaxed text-brand-500 sm:text-base">
          מערכת מאובטחת לניהול יתרות, גיול חובות, מסמכי מקור ורכש סיטונאי — {COMPANY.name}
        </p>
      </motion.div>

      {/* Quick stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatPill
          label="יתרה פתוחה כוללת"
          value={formatCurrency(TOTAL_OPEN_BALANCE)}
          tone="danger"
          icon={<TrendingDown className="h-5 w-5" />}
        />
        <StatPill
          label="מסמכים פתוחים"
          value={String(OPEN_INVOICES.length)}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatPill
          label="תעודות ממתינות"
          value={String(DELIVERY_NOTES.filter((d) => d.status === 'pending').length)}
          tone="warning"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {/* Route cards */}
      <div className="mb-3 flex items-center gap-3">
        <span className="text-sm font-bold text-brand-700">בחר/י גזרת עבודה</span>
        <span className="h-px flex-1 bg-brand-200/70" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {ROUTES.map((r) => {
          const Icon = r.icon;
          return (
            <motion.button
              key={r.target}
              onClick={() => onNavigate(r.target)}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="group relative h-[360px] overflow-hidden rounded-3xl text-right shadow-[var(--shadow-luxurious)]"
            >
              <img
                src={r.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/55 to-brand-900/10" />
              <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
              <div className="absolute inset-0 flex flex-col justify-end p-7 text-white">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/15 shadow-lg backdrop-blur-md">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-black">{r.title}</h2>
                <p className="mt-1 max-w-sm text-sm text-brand-100">{r.desc}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-200 transition-all group-hover:gap-3 group-hover:text-white">
                  כניסה למערכת
                  <ArrowLeft className="h-4 w-4" />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  tone = 'neutral',
  icon,
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'danger' | 'warning';
  icon?: React.ReactNode;
}) {
  const toneCls = {
    neutral: 'text-brand-950',
    danger: 'text-rose-600',
    warning: 'text-orange-600',
  }[tone];
  const accent = {
    neutral: 'bg-brand-100 text-brand-700',
    danger: 'bg-rose-50 text-rose-600',
    warning: 'bg-orange-50 text-orange-600',
  }[tone];
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-brand-100/80 bg-white p-4 shadow-[var(--shadow-premium)]">
      {icon && (
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent}`}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div className="truncate text-xs font-semibold text-brand-500">{label}</div>
        <div className={`num mt-0.5 text-lg font-extrabold sm:text-2xl ${toneCls}`}>{value}</div>
      </div>
    </div>
  );
}
