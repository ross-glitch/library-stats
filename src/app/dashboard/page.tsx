'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { DailyStat, MonthlyTotal, CATEGORIES } from '@/types';
import { formatDate } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type EditForm = {
  id: number;
  date: string;
  assistantId: string;
  newBooks: string;
  fiction: string;
  easy: string;
  reference: string;
  filipiniana: string;
  circulation: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'monthly' | 'daily'>('monthly');
  const [editEntry, setEditEntry] = useState<EditForm | null>(null);
  const [editStatus, setEditStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [assistants, setAssistants] = useState<{ id: number; name: string }[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [daily, monthly, asst] = await Promise.all([
        fetch('/api/stats').then((r) => r.json()),
        fetch('/api/stats/monthly').then((r) => r.json()),
        fetch('/api/assistants').then((r) => r.json()),
      ]);
      setDailyStats(daily.data || []);
      setMonthlyTotals(monthly.data || []);
      setAssistants(asst.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem('assistant');
    if (!stored) { router.push('/login'); return; }
    fetchData();
  }, [fetchData, router]);

  function openEdit(row: DailyStat) {
    setEditStatus(null);
    setEditEntry({
      id: row.id,
      date: row.date,
      assistantId: String(row.assistantId),
      newBooks: String(row.newBooks),
      fiction: String(row.fiction),
      easy: String(row.easy),
      reference: String(row.reference),
      filipiniana: String(row.filipiniana),
      circulation: String(row.circulation),
    });
  }

  async function handleEditSave() {
    if (!editEntry) return;
    setSaving(true);
    setEditStatus(null);
    try {
      const res = await fetch('/api/stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editEntry),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditStatus({ type: 'error', message: data.error || 'Failed to update.' });
      } else {
        setEditStatus({ type: 'success', message: 'Entry updated!' });
        await fetchData();
        setTimeout(() => { setEditEntry(null); setEditStatus(null); }, 1000);
      }
    } catch {
      setEditStatus({ type: 'error', message: 'Network error.' });
    } finally {
      setSaving(false);
    }
  }

  function exportCSV() {
    const rows: string[] = [];

    // Header
    rows.push('Month,Easy,Fiction,New Books,Reference,Filipiniana,Circulation,Total');

    // Monthly rows
    monthlyTotals.forEach((row) => {
      rows.push([
        row.monthLabel,
        row.easy,
        row.fiction,
        row.newBooks,
        row.reference,
        row.filipiniana,
        row.circulation,
        row.totalBooks,
      ].join(','));
    });

    rows.push(''); // blank line
    rows.push('Daily Entries');
    rows.push('Date,Assistant,Easy,Fiction,New Books,Reference,Filipiniana,Circulation,Total');

    dailyStats.forEach((row) => {
      const total = row.easy + row.fiction + row.newBooks + row.reference + row.filipiniana + row.circulation;
      rows.push([
        row.date,
        `"${row.assistant.name}"`,
        row.easy,
        row.fiction,
        row.newBooks,
        row.reference,
        row.filipiniana,
        row.circulation,
        total,
      ].join(','));
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `library-stats-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-semibold text-gray-500 text-xs tracking-wider uppercase">Dashboard</h1>
            <p className="text-cpuGoldDark font-semibold mt-1">Book usage statistics overview</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="btn-secondary text-sm hover:border-cpuGold">
              Export CSV
            </button>
            <button onClick={() => router.push('/add-entry')} className="btn-primary text-base border-transparent hover:border-cpuGold">
              Add Entry
            </button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        {!loading && monthlyTotals.length > 0 && (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
            }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8"
          >
            {CATEGORIES.map((cat) => {
              const total = monthlyTotals[0]?.[cat.key as keyof MonthlyTotal] as number || 0;
              return (
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1 }
                  }}
                  key={cat.key} 
                  className={`rounded-2xl p-4 text-center ${cat.color}`}
                >
                  <div className="text-2xl font-extrabold">{total}</div>
                  <div className="text-xs font-bold mt-1 opacity-80">{cat.label}</div>
                  <div className="text-xs opacity-60 mt-0.5">{monthlyTotals[0]?.monthLabel}</div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(['monthly', 'daily'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`py-2 px-5 rounded-lg text-sm transition-all
                ${activeTab === tab ? 'bg-cpuNavy text-white shadow' : 'bg-white text-gray-600 border border-transparent hover:text-cpuNavy font-medium opacity-80 hover:opacity-100'}`}>
              {tab === 'monthly' ? 'Monthly Totals' : 'Daily Entries'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="card text-center py-16 text-cpuGold font-bold text-lg animate-pulse">Loading statistics...</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'monthly' && <MonthlyTable totals={monthlyTotals} />}
              {activeTab === 'daily' && <DailyTable stats={dailyStats} onEdit={openEdit} />}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Edit Modal */}
      {editEntry && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-gray-500 text-xs tracking-wider uppercase mb-1">Edit Entry</h2>
            <p className="text-cpuGoldDark text-sm font-semibold mb-4">{formatDate(editEntry.date)}</p>

            {editStatus && (
              <div className={`mb-4 p-3 rounded-xl text-sm font-bold
                ${editStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {editStatus.message}
              </div>
            )}

            <div className="mb-4">
              <label className="label">Assistant</label>
              <select value={editEntry.assistantId}
                onChange={(e) => setEditEntry({ ...editEntry, assistantId: e.target.value })}
                className="input-field bg-white">
                {assistants.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { key: 'easy',        label: 'Easy'        },
                { key: 'fiction',     label: 'Fiction'     },
                { key: 'newBooks',    label: 'New Books'   },
                { key: 'reference',   label: 'Reference'   },
                { key: 'filipiniana', label: 'Filipiniana' },
                { key: 'circulation', label: 'Circulation' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  <input type="number" min="0"
                    value={editEntry[f.key as keyof EditForm]}
                    onChange={(e) => setEditEntry({ ...editEntry, [f.key]: e.target.value })}
                    className="input-field" />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={handleEditSave} disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => { setEditEntry(null); setEditStatus(null); }} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MonthlyTable({ totals }: { totals: MonthlyTotal[] }) {
  if (totals.length === 0) return <EmptyState message="No monthly data yet." />;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto p-1">
      <h2 className="text-lg font-bold text-gray-900 mb-2 px-4 pt-4">Monthly Book Totals</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-100 bg-gray-50/50">
            <Th>Month</Th>
            <Th>Easy</Th>
            <Th>Fiction</Th>
            <Th>New Books</Th>
            <Th>Reference</Th>
            <Th>Filipiniana</Th>
            <Th>Circulation</Th>
            <Th>Total</Th>
          </tr>
        </thead>
        <tbody>
          {totals.map((row, i) => (
            <tr key={row.month} className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors">
              <td className="py-4 px-4 font-medium text-gray-900">{row.monthLabel}</td>
              <Num>{row.easy}</Num>
              <Num>{row.fiction}</Num>
              <Num>{row.newBooks}</Num>
              <Num>{row.reference}</Num>
              <Num>{row.filipiniana}</Num>
              <Num>{row.circulation}</Num>
              <td className="py-4 px-4 text-center font-semibold text-cpuNavy">{row.totalBooks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DailyTable({ stats, onEdit }: { stats: DailyStat[]; onEdit: (row: DailyStat) => void }) {
  if (stats.length === 0) return <EmptyState message="No daily entries yet." />;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto p-1">
      <h2 className="text-lg font-bold text-gray-900 mb-2 px-4 pt-4">Daily Entries</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-100 bg-gray-50/50">
            <Th>Date</Th>
            <Th>Assistant</Th>
            <Th>Easy</Th>
            <Th>Fiction</Th>
            <Th>New Books</Th>
            <Th>Reference</Th>
            <Th>Filipiniana</Th>
            <Th>Circulation</Th>
            <Th>Total</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody>
          {stats.map((row, i) => {
            const total = row.easy + row.fiction + row.newBooks + row.reference + row.filipiniana + row.circulation;
            return (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors">
                <td className="py-4 px-4 font-medium text-gray-900 whitespace-nowrap">{formatDate(row.date)}</td>
                <td className="py-4 px-4 text-gray-600 font-medium whitespace-nowrap">{row.assistant.name}</td>
                <Num>{row.easy}</Num>
                <Num>{row.fiction}</Num>
                <Num>{row.newBooks}</Num>
                <Num>{row.reference}</Num>
                <Num>{row.filipiniana}</Num>
                <Num>{row.circulation}</Num>
                <td className="py-4 px-4 text-center font-semibold text-cpuNavy">{total}</td>
                <td className="py-4 px-4 text-center">
                  <button onClick={() => onEdit(row)}
                    className="bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 font-medium text-xs py-2 px-4 rounded-md transition-colors">
                    Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="py-3 px-4 text-left font-semibold text-gray-500 text-xs tracking-wider uppercase whitespace-nowrap">{children}</th>;
}
function Num({ children }: { children: React.ReactNode }) {
  return <td className="py-4 px-4 text-center text-gray-600 font-medium">{children}</td>;
}
function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center py-16">
      <div className="text-5xl mb-4"></div>
      <p className="text-gray-500 font-medium text-lg">{message}</p>
    </div>
  );
}