'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Assistant, CATEGORIES } from '@/types';
import { getTodayLocal, isWeekday } from '@/lib/utils';
import { motion } from 'framer-motion';

type FormState = {
  date: string;
  assistantId: string;
  newBooks: string;
  fiction: string;
  easy: string;
  reference: string;
  filipiniana: string;
  circulation: string;
};

type Status = { type: 'success' | 'error'; message: string } | null;

export default function AddEntryPage() {
  const router = useRouter();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const [form, setForm] = useState<FormState>({
    date: getTodayLocal(),
    assistantId: '',
    newBooks: '',
    fiction: '',
    easy: '',
    reference: '',
    filipiniana: '',
    circulation: '',
  });

  useEffect(() => {
    const stored = sessionStorage.getItem('assistant');
    if (!stored) { router.push('/login'); return; }
    const parsed: Assistant = JSON.parse(stored);
    setForm((f) => ({ ...f, assistantId: String(parsed.id) }));
    fetch('/api/assistants').then((r) => r.json()).then((data) => setAssistants(data.data || []));
  }, [router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setStatus(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    if (!isWeekday(form.date)) {
      const ok = confirm(`${form.date} is a weekend day.\n\nDo you still want to submit?`);
      if (!ok) return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: form.date,
          assistantId: form.assistantId,
          newBooks:    form.newBooks    || '0',
          fiction:     form.fiction     || '0',
          easy:        form.easy        || '0',
          reference:   form.reference   || '0',
          filipiniana: form.filipiniana || '0',
          circulation: form.circulation || '0',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: 'error', message: data.error || 'Something went wrong.' });
      } else {
        setStatus({ type: 'success', message: `${data.message}` });
        setForm((f) => ({ ...f, newBooks: '', fiction: '', easy: '', reference: '', filipiniana: '', circulation: '' }));
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  const categoryFields = [
    { key: 'easy',        label: 'Easy',        emoji: '' },
    { key: 'fiction',     label: 'Fiction',     emoji: '' },
    { key: 'newBooks',    label: 'New Books',   emoji: '' },
    { key: 'reference',   label: 'Reference',   emoji: '' },
    { key: 'filipiniana', label: 'Filipiniana', emoji: '' },
    { key: 'circulation', label: 'Circulation', emoji: '' },
  ];

  return (
    <div className="min-h-screen bg-white/5">
      <Navbar />
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto px-4 py-8"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Add Daily Entry</h1>
          <p className="text-gray-400 font-medium mt-1">Record today's book usage</p>
        </div>

        {status && (
          <div className={`mb-6 p-4 rounded-xl font-bold text-sm
            ${status.type === 'success' ? 'bg-green-100 text-green-800 border-2 border-green-300' : 'bg-red-100 text-red-800 border-2 border-red-300'}`}>
            {status.message}
            {status.type === 'success' && (
              <button onClick={() => router.push('/dashboard')} className="ml-4 underline font-extrabold">
                View Dashboard →
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="label" htmlFor="date">Date</label>
            <input id="date" name="date" type="date" value={form.date} onChange={handleChange} required className="input-field" />
          </div>

          <div>
            <label className="label" htmlFor="assistantId">Your Name</label>
            <select id="assistantId" name="assistantId" value={form.assistantId} onChange={handleChange} required className="input-field bg-white/5">
              <option value="">— Select your name —</option>
              {assistants.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="border-t border-white/10 pt-6 mt-2">
            <p className="text-xs font-bold text-white uppercase tracking-wider mb-5">Number of books per category</p>
            <div className="grid grid-cols-1 gap-4">
              {categoryFields.map((field) => (
                <div key={field.key} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cpuGold flex-shrink-0 mr-3"></div>
                  <div className="flex-1">
                    <label className="label" htmlFor={field.key}>{field.label}</label>
                    <input
                      id={field.key}
                      name={field.key}
                      type="number"
                      min="0"
                      max="9999"
                      value={form[field.key as keyof FormState]}
                      onChange={handleChange}
                      placeholder="0"
                      className="input-field"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5/5 rounded-xl p-5 border border-blue-100">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white">Total Books:</span>
              <span className="text-2xl font-extrabold text-white">
                {[form.newBooks, form.fiction, form.easy, form.reference, form.filipiniana, form.circulation]
                  .reduce((sum, v) => sum + (parseInt(v) || 0), 0).toLocaleString()}
              </span>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full text-lg disabled:opacity-50">
            {submitting ? 'Saving...' : 'Save Entry'}
          </button>
        </form>

        <button onClick={() => router.push('/dashboard')} className="btn-secondary w-full mt-4 text-center block">
          ← Back to Dashboard
        </button>
      </motion.main>
    </div>
  );
}