/**
 * App.tsx (Section 9.4) — main engine: top navigation (desktop tabs + mobile
 * hamburger drawer), the floating AI financial advisor, view routing and the
 * globally-shared invoice modal.
 */

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  Home,
  LayoutGrid,
  TrendingDown,
  BookOpen,
  Truck,
  FileText,
  ShoppingCart,
  Sparkles,
  Send,
} from 'lucide-react';
import type { ViewKey, Invoice, ChatMessage } from './types';
import { cx, formatCurrency } from './utils';
import {
  COMPANY,
  TOTAL_OPEN_BALANCE,
  AGING_BUCKETS,
  OPEN_INVOICES,
  DELIVERY_NOTES,
} from './data';
import { Logo } from './components/ui';
import InvoiceModal from './components/InvoiceModal';
import LandingView from './components/LandingView';
import MenuView from './components/MenuView';
import AgingView from './components/AgingView';
import LedgerView from './components/LedgerView';
import DeliveryView from './components/DeliveryView';
import InvoiceView from './components/InvoiceView';
import CatalogView from './components/CatalogView';

const NAV_ITEMS: { key: ViewKey; label: string; icon: typeof Home }[] = [
  { key: 'menu', label: 'תפריט ראשי', icon: LayoutGrid },
  { key: 'aging', label: 'גיול חובות', icon: TrendingDown },
  { key: 'ledger', label: 'כרטסת', icon: BookOpen },
  { key: 'delivery', label: 'תעודות משלוח', icon: Truck },
  { key: 'invoices', label: 'חשבוניות', icon: FileText },
  { key: 'catalog', label: 'קטלוג ורכש', icon: ShoppingCart },
];

export default function App() {
  const [view, setView] = useState<ViewKey>('landing');
  const [mobileNav, setMobileNav] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const navigate = (v: ViewKey) => {
    setView(v);
    setMobileNav(false);
    window.scrollTo({ top: 0 });
  };

  const renderView = () => {
    switch (view) {
      case 'landing':
        return <LandingView onNavigate={navigate} />;
      case 'menu':
        return <MenuView onNavigate={navigate} onOpenInvoice={setSelectedInvoice} />;
      case 'aging':
        return <AgingView onOpenInvoice={setSelectedInvoice} />;
      case 'ledger':
        return <LedgerView onOpenInvoice={setSelectedInvoice} />;
      case 'delivery':
        return <DeliveryView onOpenInvoice={setSelectedInvoice} />;
      case 'invoices':
        return <InvoiceView onOpenInvoice={setSelectedInvoice} />;
      case 'catalog':
        return <CatalogView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 text-brand-950">
      {/* ---- Top navigation ---- */}
      <header className="no-print sticky top-0 z-40 border-b border-brand-900/40 bg-brand-950 text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <button onClick={() => navigate('landing')} className="shrink-0">
            <Logo light />
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = view === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  className={cx(
                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                    active
                      ? 'bg-brand-500 text-white'
                      : 'text-brand-200 hover:bg-brand-900 hover:text-white',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileNav((s) => !s)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-brand-900 md:hidden"
            aria-label="תפריט"
          >
            {mobileNav ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileNav && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-brand-900 bg-brand-950 md:hidden"
            >
              <div className="flex flex-col gap-1 p-3">
                <button
                  onClick={() => navigate('landing')}
                  className="flex min-h-[52px] items-center gap-2.5 rounded-xl px-4 text-sm font-semibold text-brand-200 hover:bg-brand-900"
                >
                  <Home className="h-5 w-5" />
                  דף הבית
                </button>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = view === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => navigate(item.key)}
                      className={cx(
                        'flex min-h-[52px] items-center gap-2.5 rounded-xl px-4 text-sm font-semibold transition-colors',
                        active
                          ? 'bg-brand-500 text-white'
                          : 'text-brand-200 hover:bg-brand-900',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ---- Main content ---- */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{renderView()}</main>

      {/* ---- Footer (demo banner) ---- */}
      <footer className="no-print mt-8 border-t border-brand-100 bg-brand-950 text-brand-300">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-center text-xs sm:flex-row sm:text-right">
          <div>
            © {new Date().getFullYear()} {COMPANY.name} · {COMPANY.slogan}
          </div>
          <div className="rounded-full bg-brand-900 px-3 py-1 font-semibold text-brand-300">
            סביבת הדגמה — נתונים לדוגמה בלבד
          </div>
        </div>
      </footer>

      {/* ---- AI advisor (floating) ---- */}
      <AiAdvisor open={aiOpen} onOpen={() => setAiOpen(true)} onClose={() => setAiOpen(false)} />

      {/* ---- Global invoice modal ---- */}
      <InvoiceModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* AI Financial Advisor — rule-based mock over the real dataset.              */
/* -------------------------------------------------------------------------- */

const SUGGESTIONS = [
  'מהי היתרה הפתוחה הכוללת?',
  'איזה חודש הכי בסיכון?',
  'כמה תעודות ממתינות לחתימה?',
  'מהי החשבונית הגדולה ביותר?',
];

function advisorReply(question: string): string {
  const q = question.trim();

  if (/יתרה|חוב|כולל|סה.?כ/.test(q)) {
    return `היתרה הפתוחה הכוללת של כלל הלקוחות עומדת על ${formatCurrency(
      TOTAL_OPEN_BALANCE,
    )}. מומלץ למקד גבייה בחודשים הוותיקים ביותר כדי לצמצם חשיפה.`;
  }
  if (/סיכון|איחור|ותיק|ישן/.test(q)) {
    const danger = AGING_BUCKETS.filter((b) => b.severity === 'danger');
    const worst = danger.reduce(
      (a, b) => (b.total > a.total ? b : a),
      danger[0] ?? AGING_BUCKETS[AGING_BUCKETS.length - 1],
    );
    return `החודש בסיכון הגבוה ביותר הוא ${worst.label} עם חוב פתוח של ${formatCurrency(
      worst.total,
    )}. כדאי ליצור קשר עם הלקוחות הרלוונטיים בהקדם.`;
  }
  if (/חתימה|ממתינ|תעוד/.test(q)) {
    const pending = DELIVERY_NOTES.filter((d) => d.status === 'pending');
    return `קיימות ${pending.length} תעודות משלוח הממתינות לחתימה דיגיטלית. ניתן לצפות בהן במסך "תעודות משלוח".`;
  }
  if (/גדול|הכי גבוה|מקסימ/.test(q)) {
    const biggest = OPEN_INVOICES.reduce((a, b) => (b.total > a.total ? b : a));
    return `החשבונית הפתוחה הגדולה ביותר היא ${biggest.id} של ${
      biggest.customerName
    } בסך ${formatCurrency(biggest.total)}.`;
  }
  if (/שלום|היי|הי\b|מה נשמע/.test(q)) {
    return 'שלום! אני היועץ הפיננסי החכם של הפורטל. אפשר לשאול אותי על יתרות, גיול חובות, תעודות וחשבוניות.';
  }
  return `קיבלתי את שאלתך. בהתבסס על הנתונים, היתרה הפתוחה הכוללת היא ${formatCurrency(
    TOTAL_OPEN_BALANCE,
  )}. נסו לשאול על חודש בסיכון, תעודות ממתינות או החשבונית הגדולה ביותר.`;
}

function AiAdvisor({
  open,
  onOpen,
  onClose,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'שלום, אני היועץ הפיננסי של חלפים לישראל. כיצד אוכל לעזור בניתוח החובות והמסמכים שלך היום?',
    },
  ]);
  const [input, setInput] = useState('');

  const ask = (text: string) => {
    const question = text.trim();
    if (!question) return;
    setInput('');
    setMessages((m) => [
      ...m,
      { role: 'user', content: question },
      { role: 'assistant', content: advisorReply(question) },
    ]);
  };

  const total = useMemo(() => formatCurrency(TOTAL_OPEN_BALANCE), []);

  return (
    <>
      {/* Floating launcher */}
      <motion.button
        onClick={onOpen}
        whileHover={{ y: -3 }}
        className="no-print fixed bottom-5 left-5 z-40 flex items-center gap-2 rounded-full bg-brand-500 px-4 py-3 text-sm font-bold text-white shadow-[var(--shadow-luxurious)] hover:bg-brand-600"
      >
        <Sparkles className="h-5 w-5" />
        יועץ AI פיננסי
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="no-print fixed inset-0 z-50 flex justify-start bg-brand-950/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.aside
              className="flex h-full w-full max-w-md flex-col bg-white shadow-[var(--shadow-luxurious)]"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between bg-brand-950 px-5 py-4 text-white">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand-300" />
                  <div>
                    <div className="text-sm font-bold">יועץ AI פיננסי</div>
                    <div className="text-[11px] text-brand-300">
                      יתרה פתוחה: <span className="num">{total}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-brand-900"
                  aria-label="סגירה"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-brand-50 p-4">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={cx('flex', m.role === 'user' ? 'justify-start' : 'justify-end')}
                  >
                    <div
                      className={cx(
                        'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                        m.role === 'user'
                          ? 'bg-brand-900 text-white'
                          : 'border border-brand-100 bg-white text-brand-800',
                      )}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-brand-100 bg-white p-3">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => ask(s)}
                      className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 hover:border-brand-300"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    ask(input);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="שאל את היועץ..."
                    className="flex-1 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm outline-none focus:border-brand-400"
                  />
                  <button
                    type="submit"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-900 text-white hover:bg-brand-800"
                    aria-label="שליחה"
                  >
                    <Send className="h-4 w-4 -scale-x-100" />
                  </button>
                </form>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
