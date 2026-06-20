/**
 * Local mock database (Section 9.2).
 * The total open balance across all customer invoices reconciles to exactly
 * ₪2,247,320.00 — enforced in code via a computed opening-balance document so
 * the aging map always sums correctly.
 */

import type {
  Invoice,
  InvoiceLine,
  LedgerEntry,
  DeliveryNote,
  CatalogItem,
  AgingBucket,
} from './types';
import { VAT_RATE } from './utils';

export const TARGET_OPEN_BALANCE = 2_247_320.0;

export const COMPANY = {
  name: 'קבוצת חלפים לישראל בע"מ',
  taxId: '514783920',
  address: 'האשל 14, אזור התעשייה, פתח תקווה',
  phone: '03-9217500',
  email: 'finance@israel-parts.co.il',
  slogan: 'יבוא ושיווק חלקי חילוף, צמיגים ושמנים — סיטונאות לענף הרכב',
};

/** The customer whose ledger card is shown in the Ledger view. */
export const ACCOUNT = {
  name: 'מוסך השחר בע"מ',
  taxId: '512936487',
  address: 'דרך השלום 102, תל אביב',
  contact: 'רונן שחר',
  phone: '03-6841290',
};

const HEBREW_MONTHS = [
  'ינואר',
  'פברואר',
  'מרץ',
  'אפריל',
  'מאי',
  'יוני',
  'יולי',
  'אוגוסט',
  'ספטמבר',
  'אוקטובר',
  'נובמבר',
  'דצמבר',
];

export function hebrewMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-');
  return `${HEBREW_MONTHS[Number(m) - 1]} ${y}`;
}

function sumLines(lines: InvoiceLine[]): number {
  return lines.reduce((acc, l) => acc + l.quantity * l.unitPrice, 0);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

interface InvoiceSeed {
  id: string;
  kind?: 'invoice' | 'credit';
  date: string;
  customerName: string;
  customerId: string;
  customerAddress: string;
  status: Invoice['status'];
  poNumber?: string;
  /** When true the document is fully paid (openAmount = 0). */
  paid?: boolean;
  lines: InvoiceLine[];
}

function buildInvoice(seed: InvoiceSeed): Invoice {
  const isCredit = seed.kind === 'credit';
  const subtotal = round2(sumLines(seed.lines) * (isCredit ? -1 : 1));
  const vat = round2(subtotal * VAT_RATE);
  const total = round2(subtotal + vat);
  const due = new Date(seed.date);
  due.setDate(due.getDate() + 30);
  const dueDate = due.toISOString().slice(0, 10);
  const openAmount = isCredit ? total : seed.paid ? 0 : total;
  return {
    id: seed.id,
    kind: isCredit ? 'credit' : 'invoice',
    date: seed.date,
    dueDate,
    status: seed.status,
    customerName: seed.customerName,
    customerId: seed.customerId,
    customerAddress: seed.customerAddress,
    lines: seed.lines,
    subtotal,
    vat,
    total,
    openAmount,
    poNumber: seed.poNumber,
  };
}

const CUSTOMERS = [
  { name: 'מוסך השחר בע"מ', id: '512936487', address: 'דרך השלום 102, תל אביב' },
  { name: 'מוסך הדקל שירותי רכב', id: '513847201', address: 'הברזל 8, חיפה' },
  { name: 'אוטו סנטר כרמל', id: '514029384', address: 'דרך העצמאות 55, חיפה' },
  { name: 'מוסך גלי הצפון', id: '515382910', address: 'התעשייה 21, כרמיאל' },
  { name: 'צמיגי הדרום בע"מ', id: '512774639', address: 'דרך חברון 410, באר שבע' },
  { name: 'מוסך מרכז הרכב', id: '516293847', address: 'ז\'בוטינסקי 140, ראשון לציון' },
];

const seeds: InvoiceSeed[] = [
  // ---- יוני 2026 — שוטף ----
  {
    id: 'INV-2026-0612',
    date: '2026-06-12',
    status: 'unpaid',
    customerName: CUSTOMERS[0].name,
    customerId: CUSTOMERS[0].id,
    customerAddress: CUSTOMERS[0].address,
    poNumber: 'PO-88231',
    lines: [
      { sku: 'BRK-PAD-2200', description: 'רפידות בלם קדמיות — מאזדה 3', quantity: 24, unitPrice: 142.5, plate: '85-412-03' },
      { sku: 'OIL-5W30-4L', description: 'שמן מנוע סינתטי 5W30 — מיכל 4 ליטר', quantity: 60, unitPrice: 98.0 },
      { sku: 'FLT-OIL-119', description: 'פילטר שמן אוניברסלי', quantity: 80, unitPrice: 21.9 },
    ],
  },
  {
    id: 'INV-2026-0608',
    date: '2026-06-08',
    status: 'unpaid',
    customerName: CUSTOMERS[2].name,
    customerId: CUSTOMERS[2].id,
    customerAddress: CUSTOMERS[2].address,
    poNumber: 'PO-88119',
    lines: [
      { sku: 'TYR-205-55-16', description: 'צמיג 205/55R16 — קיץ', quantity: 48, unitPrice: 312.0 },
      { sku: 'TYR-225-45-17', description: 'צמיג 225/45R17 — ביצועים', quantity: 24, unitPrice: 489.0 },
    ],
  },
  // ---- מאי 2026 — שוטף ----
  {
    id: 'INV-2026-0524',
    date: '2026-05-24',
    status: 'unpaid',
    customerName: CUSTOMERS[1].name,
    customerId: CUSTOMERS[1].id,
    customerAddress: CUSTOMERS[1].address,
    lines: [
      { sku: 'BAT-72AH-EFB', description: 'מצבר 72Ah EFB סטרט-סטופ', quantity: 36, unitPrice: 398.0 },
      { sku: 'ALT-BOSCH-140', description: 'אלטרנטור בוש 140A — משופץ', quantity: 8, unitPrice: 1240.0, plate: '12-908-74' },
    ],
  },
  {
    id: 'INV-2026-0517',
    date: '2026-05-17',
    status: 'unpaid',
    customerName: CUSTOMERS[4].name,
    customerId: CUSTOMERS[4].id,
    customerAddress: CUSTOMERS[4].address,
    poNumber: 'PO-87640',
    lines: [
      { sku: 'TYR-265-70-16', description: 'צמיג שטח 265/70R16 — AT', quantity: 40, unitPrice: 642.0 },
      { sku: 'TYR-235-65-17', description: 'צמיג 235/65R17 — SUV', quantity: 32, unitPrice: 558.0 },
    ],
  },
  // ---- אפריל 2026 — אזהרה ----
  {
    id: 'INV-2026-0419',
    date: '2026-04-19',
    status: 'overdue',
    customerName: CUSTOMERS[0].name,
    customerId: CUSTOMERS[0].id,
    customerAddress: CUSTOMERS[0].address,
    lines: [
      { sku: 'CLT-KIT-VW', description: 'ערכת מצמד פולקסווגן גולף', quantity: 12, unitPrice: 1180.0, plate: '63-271-90' },
      { sku: 'SHK-ABS-FR', description: 'בולם זעזועים קדמי — אבסורבר', quantity: 28, unitPrice: 286.0 },
      { sku: 'BLT-TIMING-08', description: 'רצועת תזמון + מתחים', quantity: 20, unitPrice: 345.0 },
    ],
  },
  {
    id: 'INV-2026-0405',
    date: '2026-04-05',
    status: 'overdue',
    customerName: CUSTOMERS[3].name,
    customerId: CUSTOMERS[3].id,
    customerAddress: CUSTOMERS[3].address,
    poNumber: 'PO-86120',
    lines: [
      { sku: 'OIL-10W40-208', description: 'שמן מנוע 10W40 — חבית 208 ליטר', quantity: 6, unitPrice: 3980.0 },
      { sku: 'FLT-AIR-330', description: 'מסנן אוויר תעשייתי', quantity: 90, unitPrice: 64.0 },
    ],
  },
  // ---- מרץ 2026 — אזהרה ----
  {
    id: 'INV-2026-0322',
    date: '2026-03-22',
    status: 'overdue',
    customerName: CUSTOMERS[5].name,
    customerId: CUSTOMERS[5].id,
    customerAddress: CUSTOMERS[5].address,
    lines: [
      { sku: 'RAD-COOL-KIA', description: 'רדיאטור מים קיה ספורטאג\'', quantity: 14, unitPrice: 892.0 },
      { sku: 'WPM-PUMP-22', description: 'משאבת מים', quantity: 26, unitPrice: 268.0 },
    ],
  },
  {
    id: 'CRN-2026-0310',
    kind: 'credit',
    date: '2026-03-10',
    status: 'credit',
    customerName: CUSTOMERS[0].name,
    customerId: CUSTOMERS[0].id,
    customerAddress: CUSTOMERS[0].address,
    lines: [
      { sku: 'BRK-PAD-2200', description: 'זיכוי החזרת רפידות בלם — פגומות', quantity: 8, unitPrice: 142.5 },
    ],
  },
  // ---- פברואר 2026 — סכנה ----
  {
    id: 'INV-2026-0214',
    date: '2026-02-14',
    status: 'overdue',
    customerName: CUSTOMERS[2].name,
    customerId: CUSTOMERS[2].id,
    customerAddress: CUSTOMERS[2].address,
    poNumber: 'PO-84410',
    lines: [
      { sku: 'GBX-RECON-90', description: 'תיבת הילוכים אוטומטית — משופצת', quantity: 4, unitPrice: 7850.0, plate: '47-330-21' },
      { sku: 'SNS-O2-UNIV', description: 'חיישן חמצן אוניברסלי', quantity: 40, unitPrice: 188.0 },
    ],
  },
  // ---- ינואר 2026 — סכנה ----
  {
    id: 'INV-2026-0118',
    date: '2026-01-18',
    status: 'overdue',
    customerName: CUSTOMERS[4].name,
    customerId: CUSTOMERS[4].id,
    customerAddress: CUSTOMERS[4].address,
    lines: [
      { sku: 'TYR-315-80-22', description: 'צמיג משאית 315/80R22.5', quantity: 36, unitPrice: 1490.0 },
    ],
  },
  // ---- מסמכים ששולמו (להצגת היסטוריה) ----
  {
    id: 'INV-2026-0131',
    date: '2026-01-31',
    status: 'paid',
    paid: true,
    customerName: CUSTOMERS[0].name,
    customerId: CUSTOMERS[0].id,
    customerAddress: CUSTOMERS[0].address,
    lines: [
      { sku: 'OIL-5W30-4L', description: 'שמן מנוע סינתטי 5W30 — מיכל 4 ליטר', quantity: 48, unitPrice: 98.0 },
      { sku: 'FLT-CAB-77', description: 'מסנן מזגן פחמן', quantity: 64, unitPrice: 39.0 },
    ],
  },
  {
    id: 'INV-2025-1209',
    date: '2025-12-09',
    status: 'paid',
    paid: true,
    customerName: CUSTOMERS[1].name,
    customerId: CUSTOMERS[1].id,
    customerAddress: CUSTOMERS[1].address,
    lines: [
      { sku: 'BAT-60AH', description: 'מצבר 60Ah', quantity: 30, unitPrice: 298.0 },
    ],
  },
];

const baseInvoices = seeds.map(buildInvoice);

// --- Compute the opening-balance document so the open total is exact. ---
const openSoFar = baseInvoices.reduce((acc, inv) => acc + inv.openAmount, 0);
const remainingOpen = round2(TARGET_OPEN_BALANCE - openSoFar);
const openingSubtotal = round2(remainingOpen / (1 + VAT_RATE));

const openingInvoice: Invoice = buildInvoice({
  id: 'INV-2026-0102',
  date: '2026-01-02',
  status: 'overdue',
  customerName: CUSTOMERS[5].name,
  customerId: CUSTOMERS[5].id,
  customerAddress: CUSTOMERS[5].address,
  poNumber: 'PO-83001',
  lines: [
    {
      sku: 'ACC-OPENING',
      description: 'ריכוז יתרת פתיחה — אספקת חלפים מצטברת לרבעון',
      quantity: 1,
      unitPrice: openingSubtotal,
    },
  ],
});
// Force the opening doc to absorb rounding so the grand total is exact.
openingInvoice.openAmount = remainingOpen;
openingInvoice.total = remainingOpen;
openingInvoice.subtotal = openingSubtotal;
openingInvoice.vat = round2(remainingOpen - openingSubtotal);

export const INVOICES: Invoice[] = [openingInvoice, ...baseInvoices].sort(
  (a, b) => (a.date < b.date ? 1 : -1),
);

/** Open invoices only (positive open balance contributions and credits). */
export const OPEN_INVOICES = INVOICES.filter(
  (inv) => inv.status !== 'paid' && inv.openAmount !== 0,
);

export const TOTAL_OPEN_BALANCE = round2(
  INVOICES.reduce((acc, inv) => acc + inv.openAmount, 0),
);

// --- Aging buckets, derived from open invoices grouped by month. ---
function severityForMonth(monthKey: string): AgingBucket['severity'] {
  // Anything older than March 2026 is danger; Mar–Apr warning; newer current.
  if (monthKey <= '2026-02') return 'danger';
  if (monthKey <= '2026-04') return 'warning';
  return 'current';
}

const bucketMap = new Map<string, AgingBucket>();
for (const inv of OPEN_INVOICES) {
  const monthKey = inv.date.slice(0, 7);
  let bucket = bucketMap.get(monthKey);
  if (!bucket) {
    bucket = {
      month: monthKey,
      label: hebrewMonthLabel(monthKey),
      total: 0,
      severity: severityForMonth(monthKey),
      invoiceIds: [],
    };
    bucketMap.set(monthKey, bucket);
  }
  bucket.total = round2(bucket.total + inv.openAmount);
  bucket.invoiceIds.push(inv.id);
}

export const AGING_BUCKETS: AgingBucket[] = [...bucketMap.values()].sort((a, b) =>
  a.month < b.month ? 1 : -1,
);

// ---------------------------------------------------------------------------
// Ledger card for the primary account (מוסך השחר בע"מ).
// ---------------------------------------------------------------------------
interface LedgerSeed {
  date: string;
  reference: string;
  description: string;
  linkedInvoiceId?: string;
  debit: number;
  credit: number;
}

const ledgerSeeds: LedgerSeed[] = [
  { date: '2025-12-01', reference: 'יתרת פתיחה', description: 'יתרה מועברת מתקופה קודמת', debit: 318420.0, credit: 0 },
  { date: '2026-01-18', reference: 'INV-2026-0102', description: 'ריכוז יתרת פתיחה רבעוני', linkedInvoiceId: 'INV-2026-0102', debit: 0, credit: 0 },
  { date: '2026-01-25', reference: 'REC-4471', description: 'קבלה — העברה בנקאית', debit: 0, credit: 120000.0 },
  { date: '2026-01-31', reference: 'INV-2026-0131', description: 'חשבונית — שמנים ומסננים', linkedInvoiceId: 'INV-2026-0131', debit: 21157.6, credit: 0 },
  { date: '2026-02-10', reference: 'REC-4509', description: 'קבלה — שיק מס\' 30214', debit: 0, credit: 21157.6 },
  { date: '2026-03-10', reference: 'CRN-2026-0310', description: 'זיכוי — החזרת רפידות פגומות', linkedInvoiceId: 'CRN-2026-0310', debit: 0, credit: 1333.8 },
  { date: '2026-04-19', reference: 'INV-2026-0419', description: 'חשבונית — מצמד, בולמים, רצועות', linkedInvoiceId: 'INV-2026-0419', debit: 33933.0, credit: 0 },
  { date: '2026-05-02', reference: 'REC-4612', description: 'קבלה — העברה בנקאית', debit: 0, credit: 80000.0 },
  { date: '2026-06-12', reference: 'INV-2026-0612', description: 'חשבונית — רפידות, שמן, מסננים', linkedInvoiceId: 'INV-2026-0612', debit: 12048.39, credit: 0 },
];

let running = 0;
export const LEDGER_ENTRIES: LedgerEntry[] = ledgerSeeds.map((s, i) => {
  running = round2(running + s.debit - s.credit);
  return {
    id: `L-${i + 1}`,
    date: s.date,
    reference: s.reference,
    description: s.description,
    linkedInvoiceId: s.linkedInvoiceId,
    debit: s.debit,
    credit: s.credit,
    balance: running,
  };
});

export const LEDGER_BALANCE = LEDGER_ENTRIES[LEDGER_ENTRIES.length - 1].balance;

// ---------------------------------------------------------------------------
// Delivery notes.
// ---------------------------------------------------------------------------
export const DELIVERY_NOTES: DeliveryNote[] = [
  {
    id: 'DN-2026-3391',
    date: '2026-06-12',
    status: 'signed',
    customerName: CUSTOMERS[0].name,
    customerId: CUSTOMERS[0].id,
    driverName: 'מוטי לוי',
    vehiclePlate: '23-441-08',
    destination: 'דרך השלום 102, תל אביב',
    signedBy: 'רונן שחר',
    signedAt: '2026-06-12',
    linkedInvoiceId: 'INV-2026-0612',
    itemCount: 3,
    lines: [
      { sku: 'BRK-PAD-2200', description: 'רפידות בלם קדמיות — מאזדה 3', quantity: 24, unitPrice: 142.5 },
      { sku: 'OIL-5W30-4L', description: 'שמן מנוע סינתטי 5W30 — מיכל 4 ליטר', quantity: 60, unitPrice: 98.0 },
      { sku: 'FLT-OIL-119', description: 'פילטר שמן אוניברסלי', quantity: 80, unitPrice: 21.9 },
    ],
  },
  {
    id: 'DN-2026-3388',
    date: '2026-06-11',
    status: 'pending',
    customerName: CUSTOMERS[2].name,
    customerId: CUSTOMERS[2].id,
    driverName: 'איציק ברק',
    vehiclePlate: '88-102-55',
    destination: 'דרך העצמאות 55, חיפה',
    linkedInvoiceId: 'INV-2026-0608',
    itemCount: 2,
    lines: [
      { sku: 'TYR-205-55-16', description: 'צמיג 205/55R16 — קיץ', quantity: 48, unitPrice: 312.0 },
      { sku: 'TYR-225-45-17', description: 'צמיג 225/45R17 — ביצועים', quantity: 24, unitPrice: 489.0 },
    ],
  },
  {
    id: 'DN-2026-3375',
    date: '2026-05-24',
    status: 'signed',
    customerName: CUSTOMERS[1].name,
    customerId: CUSTOMERS[1].id,
    driverName: 'מוטי לוי',
    vehiclePlate: '23-441-08',
    destination: 'הברזל 8, חיפה',
    signedBy: 'דוד הדקל',
    signedAt: '2026-05-25',
    linkedInvoiceId: 'INV-2026-0524',
    itemCount: 2,
    lines: [
      { sku: 'BAT-72AH-EFB', description: 'מצבר 72Ah EFB סטרט-סטופ', quantity: 36, unitPrice: 398.0 },
      { sku: 'ALT-BOSCH-140', description: 'אלטרנטור בוש 140A — משופץ', quantity: 8, unitPrice: 1240.0 },
    ],
  },
  {
    id: 'DN-2026-3362',
    date: '2026-05-17',
    status: 'pending',
    customerName: CUSTOMERS[4].name,
    customerId: CUSTOMERS[4].id,
    driverName: 'שרון כהן',
    vehiclePlate: '41-779-20',
    destination: 'דרך חברון 410, באר שבע',
    linkedInvoiceId: 'INV-2026-0517',
    itemCount: 2,
    lines: [
      { sku: 'TYR-265-70-16', description: 'צמיג שטח 265/70R16 — AT', quantity: 40, unitPrice: 642.0 },
      { sku: 'TYR-235-65-17', description: 'צמיג 235/65R17 — SUV', quantity: 32, unitPrice: 558.0 },
    ],
  },
  {
    id: 'DN-2026-3340',
    date: '2026-04-19',
    status: 'signed',
    customerName: CUSTOMERS[0].name,
    customerId: CUSTOMERS[0].id,
    driverName: 'איציק ברק',
    vehiclePlate: '88-102-55',
    destination: 'דרך השלום 102, תל אביב',
    signedBy: 'רונן שחר',
    signedAt: '2026-04-20',
    linkedInvoiceId: 'INV-2026-0419',
    itemCount: 3,
    lines: [
      { sku: 'CLT-KIT-VW', description: 'ערכת מצמד פולקסווגן גולף', quantity: 12, unitPrice: 1180.0 },
      { sku: 'SHK-ABS-FR', description: 'בולם זעזועים קדמי', quantity: 28, unitPrice: 286.0 },
      { sku: 'BLT-TIMING-08', description: 'רצועת תזמון + מתחים', quantity: 20, unitPrice: 345.0 },
    ],
  },
  {
    id: 'DN-2026-3318',
    date: '2026-03-22',
    status: 'signed',
    customerName: CUSTOMERS[5].name,
    customerId: CUSTOMERS[5].id,
    driverName: 'שרון כהן',
    vehiclePlate: '41-779-20',
    destination: 'ז\'בוטינסקי 140, ראשון לציון',
    signedBy: 'אבי מרכז',
    signedAt: '2026-03-23',
    linkedInvoiceId: 'INV-2026-0322',
    itemCount: 2,
    lines: [
      { sku: 'RAD-COOL-KIA', description: 'רדיאטור מים קיה ספורטאג\'', quantity: 14, unitPrice: 892.0 },
      { sku: 'WPM-PUMP-22', description: 'משאבת מים', quantity: 26, unitPrice: 268.0 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Digital catalog.
// ---------------------------------------------------------------------------
export const CATALOG: CatalogItem[] = [
  {
    sku: 'TYR-205-55-16',
    name: 'צמיג 205/55R16 קיץ',
    category: 'צמיגים',
    brand: 'Michelin',
    price: 312.0,
    inStock: 240,
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=70',
    description: 'צמיג קיץ פרימיום לרכב פרטי, אחיזה גבוהה בכביש רטוב.',
  },
  {
    sku: 'TYR-265-70-16',
    name: 'צמיג שטח 265/70R16 AT',
    category: 'צמיגים',
    brand: 'BFGoodrich',
    price: 642.0,
    inStock: 96,
    imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=600&q=70',
    description: 'צמיג שטח All-Terrain לרכבי SUV וטנדרים.',
  },
  {
    sku: 'OIL-5W30-4L',
    name: 'שמן מנוע סינתטי 5W30',
    category: 'שמנים',
    brand: 'Castrol',
    price: 98.0,
    inStock: 520,
    imageUrl: 'https://images.unsplash.com/photo-1635001948531-9a9f0c3a3b4a?auto=format&fit=crop&w=600&q=70',
    description: 'מיכל 4 ליטר, שמן סינתטי מלא לפי תקני יצרן מחמירים.',
  },
  {
    sku: 'OIL-10W40-208',
    name: 'שמן מנוע 10W40 חבית',
    category: 'שמנים',
    brand: 'Total',
    price: 3980.0,
    inStock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1632823471565-1ecdf5c6da77?auto=format&fit=crop&w=600&q=70',
    description: 'חבית תעשייתית 208 ליטר למוסכים בעלי צריכה גבוהה.',
  },
  {
    sku: 'BRK-PAD-2200',
    name: 'רפידות בלם קדמיות',
    category: 'מערכת בלמים',
    brand: 'Brembo',
    price: 142.5,
    inStock: 310,
    imageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=70',
    description: 'רפידות בלם קרמיות, רעש נמוך ובלאי מופחת.',
  },
  {
    sku: 'BAT-72AH-EFB',
    name: 'מצבר 72Ah EFB',
    category: 'חשמל',
    brand: 'Varta',
    price: 398.0,
    inStock: 140,
    imageUrl: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=600&q=70',
    description: 'מצבר טכנולוגיית EFB למערכות סטארט-סטופ.',
  },
  {
    sku: 'FLT-OIL-119',
    name: 'פילטר שמן אוניברסלי',
    category: 'מסננים',
    brand: 'Mann',
    price: 21.9,
    inStock: 880,
    imageUrl: 'https://images.unsplash.com/photo-1599256621730-535171e28e50?auto=format&fit=crop&w=600&q=70',
    description: 'מסנן שמן איכותי המתאים למגוון רחב של דגמים.',
  },
  {
    sku: 'ALT-BOSCH-140',
    name: 'אלטרנטור בוש 140A',
    category: 'חשמל',
    brand: 'Bosch',
    price: 1240.0,
    inStock: 42,
    imageUrl: 'https://images.unsplash.com/photo-1537984822441-cff330075342?auto=format&fit=crop&w=600&q=70',
    description: 'אלטרנטור משופץ באחריות יצרן, הספק 140 אמפר.',
  },
  {
    sku: 'SHK-ABS-FR',
    name: 'בולם זעזועים קדמי',
    category: 'מתלים',
    brand: 'KYB',
    price: 286.0,
    inStock: 175,
    imageUrl: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=600&q=70',
    description: 'בולם זעזועים גז קדמי לנסיעה יציבה ושקטה.',
  },
  {
    sku: 'RAD-COOL-KIA',
    name: 'רדיאטור מים',
    category: 'מערכת קירור',
    brand: 'Valeo',
    price: 892.0,
    inStock: 54,
    imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=70',
    description: 'רדיאטור אלומיניום לקירור מנוע יעיל בעומסים גבוהים.',
  },
];

export const CATALOG_CATEGORIES = ['הכל', ...new Set(CATALOG.map((c) => c.category))];
