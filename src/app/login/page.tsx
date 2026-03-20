'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Assistant } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Assistant | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [addStatus, setAddStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [adding, setAdding] = useState(false);

  async function fetchAssistants() {
    const res = await fetch('/api/assistants');
    const data = await res.json();
    setAssistants(data.data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchAssistants();
  }, []);

  function handleLogin() {
    if (!selected) return;
    sessionStorage.setItem('assistant', JSON.stringify(selected));
    router.push('/dashboard');
  }

  async function handleAddProfile() {
    if (!newName.trim()) return;
    setAdding(true);
    setAddStatus(null);
    try {
      const res = await fetch('/api/assistants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddStatus({ type: 'error', message: data.error || 'Failed to create profile.' });
      } else {
        setAddStatus({ type: 'success', message: '✅ Profile created!' });
        setNewName('');
        await fetchAssistants();
        setTimeout(() => { setShowAdd(false); setAddStatus(null); }, 1000);
      }
    } catch {
      setAddStatus({ type: 'error', message: 'Network error.' });
    } finally {
      setAdding(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <div className="text-7xl mb-4">📚</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-amber-800 leading-tight">
          Library Statistics
        </h1>
        <p className="text-amber-600 mt-2 text-lg font-semibold">Elementary School Library</p>
      </div>

      <div className="card w-full max-w-md">
        {!showAdd ? (
          <>
            <h2 className="text-2xl font-extrabold text-amber-900 mb-2">Who are you?</h2>
            <p className="text-amber-600 mb-6 text-sm font-semibold">Select your name to continue.</p>

            {loading ? (
              <div className="text-center py-10 text-amber-400 font-bold animate-pulse">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 gap-3 mb-6 max-h-72 overflow-y-auto pr-1">
                {assistants.length === 0 && (
                  <p className="text-center text-amber-400 font-semibold py-4">No profiles yet. Create one below!</p>
                )}
                {assistants.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelected(a)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 font-bold text-left transition-all duration-150
                      ${selected?.id === a.id
                        ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-md scale-[1.01]'
                        : 'border-amber-100 bg-white text-gray-700 hover:border-amber-300 hover:bg-amber-50'
                      }`}
                  >
                    <span className="text-2xl">{selected?.id === a.id ? '✅' : '👤'}</span>
                    <span className="text-base">{a.name}</span>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={!selected}
              className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed text-lg mb-3"
            >
              {selected ? `Continue as ${selected.name} →` : 'Select your name first'}
            </button>

            <button
              onClick={() => setShowAdd(true)}
              className="btn-secondary w-full text-sm"
            >
              ➕ Create New Profile
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-extrabold text-amber-900 mb-2">Create Profile</h2>
            <p className="text-amber-600 mb-6 text-sm font-semibold">Enter your full name.</p>

            {addStatus && (
              <div className={`mb-4 p-3 rounded-xl text-sm font-bold
                ${addStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {addStatus.message}
              </div>
            )}

            <input
              type="text"
              placeholder="e.g. Maria Santos"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddProfile()}
              className="input-field mb-4"
              autoFocus
            />

            <button
              onClick={handleAddProfile}
              disabled={adding || !newName.trim()}
              className="btn-primary w-full mb-3 disabled:opacity-50"
            >
              {adding ? '⏳ Creating...' : '✅ Create Profile'}
            </button>

            <button onClick={() => { setShowAdd(false); setAddStatus(null); setNewName(''); }} className="btn-secondary w-full">
              ← Back
            </button>
          </>
        )}
      </div>

      <p className="mt-6 text-amber-500 text-xs font-semibold">School Library • Book Usage Tracker</p>
    </main>
  );
}