'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Assistant } from '@/types';
import { motion } from 'framer-motion';

export default function AddEntryPage() {
  const router = useRouter();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [assistantId, setAssistantId] = useState('');
  const [newBooks, setNewBooks] = useState('');
  const [fiction, setFiction] = useState('');
  const [easy, setEasy] = useState('');
  const [reference, setReference] = useState('');
  const [filipiniana, setFilipiniana] = useState('');
  const [circulation, setCirculation] = useState('');

  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('assistant');
    if (!stored) { router.push('/login'); return; }
    
    // Auto-select logged-in assistant if available
    try {
      const p = JSON.parse(stored);
      if (p && p.id) setAssistantId(String(p.id));
    } catch {}

    fetch('/api/assistants')
      .then(res => res.json())
      .then(data => {
        setAssistants(data.data || []);
        setLoading(false);
      });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId,
          date,
          newBooks, fiction, easy, reference, filipiniana, circulation
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: 'error', message: data.error || 'Failed to save entry.' });
      } else {
        setStatus({ type: 'success', message: 'Entry saved successfully!' });
        // Reset counts but keep date and assistant
        setNewBooks(''); setFiction(''); setEasy('');
        setReference(''); setFilipiniana(''); setCirculation('');
        // Dismiss success message after a bit
        setTimeout(() => setStatus(null), 3000);
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error.' });
    } finally {
      setSaving(false);
    }
  }

  // Common input styling class for reuse
  const inputBaseClass = "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cpuGold focus:ring-2 focus:ring-cpuGold/50 transition-all font-medium hover:bg-white/15 focus:-translate-y-[1px]";

  return (
    <div className="min-h-screen bg-cpuNavy text-white">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-10 lg:py-16">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Log New Entry</h1>
            <p className="text-gray-400 text-lg">Record daily book statistics, additions, and circulation numbers.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {status && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className={`p-5 rounded-2xl text-sm font-bold border shadow-lg backdrop-blur-md
                  ${status.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}
              >
                {status.message}
              </motion.div>
            )}

            {/* Section 1: Metadata */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:border-white/20">
              <h2 className="text-xl font-bold text-cpuGold mb-6 flex items-center gap-3 uppercase tracking-widest text-sm">
                <span className="w-8 h-[2px] bg-cpuGold rounded-full"></span>
                Record Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 tracking-wide uppercase">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={inputBaseClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 tracking-wide uppercase">Assistant</label>
                  <div className="relative group w-full">
                    {/* The visible "button" mimicking a select */}
                    <div className={`${inputBaseClass} cursor-pointer flex justify-between items-center group-hover:border-cpuGold group-hover:ring-2 group-hover:ring-cpuGold/50`}>
                      <span className={assistantId ? 'text-white' : 'text-gray-500'}>
                        {assistantId ? assistants.find(a => String(a.id) === assistantId)?.name : 'Select Assistant...'}
                      </span>
                      <div className="text-cpuGold transition-transform duration-300 group-hover:rotate-180">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>

                    {/* The animated hidden menu */}
                    <ul className="absolute left-0 top-[100%] w-full bg-[#0a1128] border border-transparent max-h-0 opacity-0 overflow-hidden transition-all duration-500 ease-in-out group-hover:max-h-[250px] group-hover:opacity-100 group-hover:border-white/20 z-50 rounded-b-xl shadow-2xl overflow-y-auto mt-1">
                      {assistants.map((a) => (
                        <li 
                          key={a.id} 
                          onClick={() => setAssistantId(String(a.id))}
                          className="text-white font-medium px-4 py-3 hover:bg-cpuGold hover:text-cpuNavy cursor-pointer transition-colors border-b border-white/5 last:border-0"
                        >
                          {a.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Category Counts */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:border-white/20">
              <h2 className="text-xl font-bold text-cpuGold mb-6 flex items-center gap-3 uppercase tracking-widest text-sm">
                <span className="w-8 h-[2px] bg-cpuGold rounded-full"></span>
                Book Categories
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-bold text-green-300 mb-2 tracking-wide">EASY</label>
                  <input type="number" min="0" value={easy} onChange={(e) => setEasy(e.target.value)} className={inputBaseClass} placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-purple-300 mb-2 tracking-wide">FICTION</label>
                  <input type="number" min="0" value={fiction} onChange={(e) => setFiction(e.target.value)} className={inputBaseClass} placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-orange-300 mb-2 tracking-wide">REFERENCE</label>
                  <input type="number" min="0" value={reference} onChange={(e) => setReference(e.target.value)} className={inputBaseClass} placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-red-300 mb-2 tracking-wide">FILIPINIANA</label>
                  <input type="number" min="0" value={filipiniana} onChange={(e) => setFilipiniana(e.target.value)} className={inputBaseClass} placeholder="0" />
                </div>
              </div>
            </div>

            {/* Section 3: Incoming & Usage */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:border-white/20">
              <h2 className="text-xl font-bold text-cpuGold mb-6 flex items-center gap-3 uppercase tracking-widest text-sm">
                <span className="w-8 h-[2px] bg-cpuGold rounded-full"></span>
                Circulation & Incoming
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-blue-300 mb-2 tracking-wide">NEW BOOKS</label>
                  <input type="number" min="0" value={newBooks} onChange={(e) => setNewBooks(e.target.value)} className={inputBaseClass} placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-yellow-300 mb-2 tracking-wide">GENERAL CIRCULATION</label>
                  <input type="number" min="0" value={circulation} onChange={(e) => setCirculation(e.target.value)} className={inputBaseClass} placeholder="0" />
                </div>
              </div>
            </div>

            <div className="pt-4 pb-20 text-right">
              <button
                type="submit"
                disabled={saving || loading || !assistantId || !date}
                className="w-full md:w-auto md:px-16 bg-cpuGold hover:bg-yellow-400 text-cpuNavy disabled:opacity-40 text-lg py-4 rounded-xl uppercase tracking-widest font-black transition-all shadow-lg hover:shadow-cpuGold/20 hover:-translate-y-1 active:scale-95 active:translate-y-0"
              >
                {saving ? 'Submitting Data...' : 'Submit Entry'}
              </button>
            </div>
            
          </form>
        </motion.div>
      </main>
    </div>
  );
}