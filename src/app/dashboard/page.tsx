'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { DailyStat, MonthlyTotal, CATEGORIES } from '@/types';
import { formatDate } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

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

// Recharts colors
const COLORS = ['#10b981', '#a855f7', '#3b82f6', '#f97316', '#ef4444'];

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

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currMonthLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    let booksToday = 0;
    dailyStats.filter(s => s.date === todayStr).forEach(s => {
      booksToday += s.easy + s.fiction + s.newBooks + s.reference + s.filipiniana;
    });

    const monthData = monthlyTotals.find(m => m.monthLabel === currMonthLabel);
    const booksMonth = monthData ? monthData.totalBooks : 0;

    let catTotals = { easy: 0, fiction: 0, new: 0, ref: 0, fil: 0 };
    dailyStats.forEach(s => {
      catTotals.easy += s.easy;
      catTotals.fiction += s.fiction;
      catTotals.new += s.newBooks;
      catTotals.ref += s.reference;
      catTotals.fil += s.filipiniana;
    });

    const pieData = [
      { name: 'Easy', value: catTotals.easy },
      { name: 'Fiction', value: catTotals.fiction },
      { name: 'New Books', value: catTotals.new },
      { name: 'Reference', value: catTotals.ref },
      { name: 'Filipiniana', value: catTotals.fil },
    ].filter(d => d.value > 0);

    let topCat = 'None';
    if (pieData.length > 0) {
      const sorted = [...pieData].sort((a, b) => b.value - a.value);
      topCat = sorted[0].name;
    }

    return { booksToday, booksMonth, topCategory: topCat, totalEntries: dailyStats.length, pieData };
  }, [dailyStats, monthlyTotals]);

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
    rows.push('Month,Easy,Fiction,New Books,Reference,Filipiniana,Circulation,Total');
    monthlyTotals.forEach((row) => {
      rows.push([row.monthLabel, row.easy, row.fiction, row.newBooks, row.reference, row.filipiniana, row.circulation, row.totalBooks].join(','));
    });
    rows.push('');
    rows.push('Daily Entries');
    rows.push('Date,Assistant,Easy,Fiction,New Books,Reference,Filipiniana,Circulation,Total');
    dailyStats.forEach((row) => {
      const total = row.easy + row.fiction + row.newBooks + row.reference + row.filipiniana + row.circulation;
      rows.push([row.date, `"${row.assistant.name}"`, row.easy, row.fiction, row.newBooks, row.reference, row.filipiniana, row.circulation, total].join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `library-stats-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const chartTheme = {
    textColor: '#9ca3af',
    gridColor: 'rgba(255,255,255,0.05)',
    tooltipBg: 'rgba(15, 30, 58, 0.95)',
  };

  return (
    <div className="min-h-screen bg-cpuNavy text-white pb-20">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Dashboard Overview</h1>
              <p className="text-gray-400 mt-2 text-lg">Central Philippine University Library Analytics.</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <button onClick={() => router.push('/add-entry')} className="flex-1 md:flex-none bg-cpuGold hover:bg-yellow-400 text-cpuNavy font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95">
                + Add Entry
              </button>
              <button onClick={exportCSV} className="flex-1 md:flex-none bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg active:scale-95">
                Export CSV
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Books Today', value: stats.booksToday, icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
              { label: 'Current Month', value: stats.booksMonth, icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
              { label: 'Top Category', value: stats.topCategory, icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> },
              { label: 'Total Logs', value: stats.totalEntries, icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md hover:border-white/20 transition-all hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400 font-bold tracking-wider text-xs uppercase">{stat.label}</h3>
                  <span className="text-xl opacity-50 group-hover:opacity-100 transition-opacity">{stat.icon}</span>
                </div>
                <p className="text-3xl font-black text-white tracking-tight">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Data Visualization Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md hover:border-white/20 transition-colors">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3 uppercase tracking-widest text-sm">
                <span className="w-4 h-4 rounded-full bg-cpuGold"></span> Monthly Usage Trends
              </h3>
              <div className="h-72">
                {monthlyTotals.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTotals} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
                      <XAxis dataKey="monthLabel" stroke={chartTheme.textColor} fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke={chartTheme.textColor} fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: chartTheme.tooltipBg, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Bar dataKey="totalBooks" fill="#F3B229" radius={[6, 6, 0, 0]} barSize={45} animationDuration={1500} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium border-2 border-dashed border-white/10 rounded-xl">No trend data available.</div>
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md hover:border-white/20 transition-colors">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3 uppercase tracking-widest text-sm">
                <span className="w-4 h-4 rounded-full bg-blue-500"></span> Category Distribution
              </h3>
              <div className="h-72">
                {stats.pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none" animationDuration={1500}>
                        {stats.pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#fff', paddingTop: '20px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium border-2 border-dashed border-white/10 rounded-xl">No category data available.</div>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden mb-8">
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setActiveTab('monthly')}
                className={`flex-1 py-5 text-center font-bold text-sm tracking-widest uppercase transition-all
                  ${activeTab === 'monthly' ? 'text-cpuGold border-b-2 border-cpuGold bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                Monthly Summary
              </button>
              <button
                onClick={() => setActiveTab('daily')}
                className={`flex-1 py-5 text-center font-bold text-sm tracking-widest uppercase transition-all
                  ${activeTab === 'daily' ? 'text-cpuGold border-b-2 border-cpuGold bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                Daily Logs
              </button>
            </div>

            <div className="p-6 overflow-x-auto min-h-[300px]">
              {loading ? (
                <div className="text-center py-20 text-cpuGold font-bold animate-pulse">Syncing Library Data...</div>
              ) : activeTab === 'monthly' ? (
                <MonthlyTable data={monthlyTotals} router={router} />
              ) : (
                <DailyTable data={dailyStats} onEdit={openEdit} router={router} />
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Edit Modal */}
      <AnimatePresence>
        {editEntry && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-cpuNavy/90 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-cpuNavy border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-2xl font-bold text-white tracking-tight">Edit Past Entry</h2>
                <button onClick={() => setEditEntry(null)} className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6">
                {editStatus && (
                  <div className={`mb-6 p-4 rounded-xl text-sm font-bold border ${editStatus.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                    {editStatus.message}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Date</label>
                    <input type="date" value={editEntry.date} onChange={(e) => setEditEntry({ ...editEntry, date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white focus:border-cpuGold focus:ring-1 focus:ring-cpuGold outline-none transition-all focus:-translate-y-[1px]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Assistant</label>
                    <div className="relative">
                      <select value={editEntry.assistantId} onChange={(e) => setEditEntry({ ...editEntry, assistantId: e.target.value })} className="w-full bg-cpuNavy border border-white/10 rounded-xl p-3.5 text-white focus:border-cpuGold focus:ring-1 focus:ring-cpuGold outline-none appearance-none transition-all focus:-translate-y-[1px]">
                        {assistants.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-cpuGold">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-green-400 mb-2 uppercase tracking-wider">Easy</label>
                    <input type="number" value={editEntry.easy} onChange={(e) => setEditEntry({ ...editEntry, easy: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white focus:border-cpuGold focus:ring-1 focus:ring-cpuGold outline-none transition-all focus:-translate-y-[1px]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider">Fiction</label>
                    <input type="number" value={editEntry.fiction} onChange={(e) => setEditEntry({ ...editEntry, fiction: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white focus:border-cpuGold focus:ring-1 focus:ring-cpuGold outline-none transition-all focus:-translate-y-[1px]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-400 mb-2 uppercase tracking-wider">New Books</label>
                    <input type="number" value={editEntry.newBooks} onChange={(e) => setEditEntry({ ...editEntry, newBooks: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white focus:border-cpuGold focus:ring-1 focus:ring-cpuGold outline-none transition-all focus:-translate-y-[1px]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-orange-400 mb-2 uppercase tracking-wider">Reference</label>
                    <input type="number" value={editEntry.reference} onChange={(e) => setEditEntry({ ...editEntry, reference: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white focus:border-cpuGold focus:ring-1 focus:ring-cpuGold outline-none transition-all focus:-translate-y-[1px]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-red-400 mb-2 uppercase tracking-wider">Filipiniana</label>
                    <input type="number" value={editEntry.filipiniana} onChange={(e) => setEditEntry({ ...editEntry, filipiniana: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white focus:border-cpuGold focus:ring-1 focus:ring-cpuGold outline-none transition-all focus:-translate-y-[1px]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-yellow-400 mb-2 uppercase tracking-wider">Circulation</label>
                    <input type="number" value={editEntry.circulation} onChange={(e) => setEditEntry({ ...editEntry, circulation: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white focus:border-cpuGold focus:ring-1 focus:ring-cpuGold outline-none transition-all focus:-translate-y-[1px]" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => setEditEntry(null)} className="px-6 py-3.5 rounded-xl font-bold text-gray-300 hover:bg-white/10 transition-colors uppercase tracking-widest text-sm">Cancel</button>
                  <button onClick={handleEditSave} disabled={saving} className="px-8 py-3.5 bg-cpuGold hover:bg-yellow-400 text-cpuNavy rounded-xl font-black tracking-widest uppercase transition-all shadow-lg hover:-translate-y-1 active:scale-95 disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Subcomponents

function EmptyDataState({ message, action, actionText }: { message: string, action: () => void, actionText: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-xl overflow-hidden relative">
        <svg className="w-12 h-12 text-cpuGold/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
      </div>
      <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{message}</h3>
      <p className="text-gray-400 max-w-sm mx-auto mb-10 text-lg leading-relaxed">Once you begin tracking books and materials, the layout and analytics tables will automatically render here.</p>
      <button onClick={action} className="bg-cpuGold hover:bg-yellow-400 text-cpuNavy font-bold py-4 px-10 rounded-xl transition-all shadow-lg hover:-translate-y-1 hover:shadow-xl active:scale-95 tracking-widest uppercase">
        {actionText}
      </button>
    </div>
  );
}

function MonthlyTable({ data, router }: { data: MonthlyTotal[], router: any }) {
  if (data.length === 0) return <EmptyDataState message="No Monthly Data Available" action={() => router.push('/add-entry')} actionText="Create First Entry" />;
  return (
    <table className="w-full text-left border-collapse min-w-max">
      <thead>
        <tr>
          <Th>Month</Th>
          {CATEGORIES.map((c) => (<Th key={c.key}>{c.label}</Th>))}
          <Th>Total</Th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="border-b border-white/10 hover:bg-white/5 transition-colors">
            <td className="p-4 font-bold text-white tracking-wide">{row.monthLabel}</td>
            <Num>{row.easy}</Num>
            <Num>{row.fiction}</Num>
            <Num>{row.newBooks}</Num>
            <Num>{row.reference}</Num>
            <Num>{row.filipiniana}</Num>
            <Num>{row.circulation}</Num>
            <td className="p-4 font-black text-cpuGold text-lg">{row.totalBooks}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DailyTable({ data, onEdit, router }: { data: DailyStat[], onEdit: (r: DailyStat) => void, router: any }) {
  if (data.length === 0) return <EmptyDataState message="No Daily Entries Found" action={() => router.push('/add-entry')} actionText="Start Tracking Now" />;
  return (
    <table className="w-full text-left border-collapse min-w-max">
      <thead>
        <tr>
          <Th>Date</Th>
          <Th>Assistant</Th>
          {CATEGORIES.map((c) => (<Th key={c.key}>{c.label}</Th>))}
          <Th>Action</Th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id} className="border-b border-white/10 hover:bg-white/5 transition-colors group">
            <td className="p-4 font-semibold text-gray-200">{formatDate(row.date)}</td>
            <td className="p-4 text-white font-bold">{row.assistant.name}</td>
            <Num>{row.easy}</Num>
            <Num>{row.fiction}</Num>
            <Num>{row.newBooks}</Num>
            <Num>{row.reference}</Num>
            <Num>{row.filipiniana}</Num>
            <Num>{row.circulation}</Num>
            <td className="p-4">
              <button onClick={() => onEdit(row)} className="text-xs font-bold uppercase tracking-widest text-cpuGold border border-cpuGold/30 hover:bg-cpuGold hover:text-cpuNavy py-2 px-4 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm active:scale-95">
                Edit Data
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="p-4 text-xs tracking-widest uppercase text-gray-500 font-bold border-b border-white/10">{children}</th>;
}

function Num({ children }: { children: React.ReactNode }) {
  return <td className="p-4 text-gray-300 font-medium">{children}</td>;
}