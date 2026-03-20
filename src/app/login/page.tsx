'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Assistant } from '@/types';
import { motion } from 'framer-motion';

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
        setAddStatus({ type: 'success', message: 'Profile created successfully.' });
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
    <main className="min-h-screen flex text-cpuNavy bg-white overflow-hidden">
      {/* Left panel (Form + Header) */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-12 xl:p-16 border-r border-gray-200 shadow-xl z-10 relative overflow-y-auto min-h-screen justify-center">
        
        {/* Header Block */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-6 mb-16 text-center w-full max-w-lg mx-auto"
        >
          <img src="/elem-logo.png" alt="Elementary Logo" className="w-24 h-24 object-contain shadow-sm rounded-full p-1 border border-gray-100" />
          <div className="flex-1">
            <h2 className="text-xl lg:text-2xl font-black tracking-widest uppercase text-cpuNavy leading-tight">Central Philippine<br/>University</h2>
            <h3 className="text-lg font-bold text-cpuGoldDark mt-2 uppercase tracking-wide">Elementary School</h3>
            <p className="text-sm font-semibold text-gray-400 mt-1 uppercase tracking-wider text-[10px]">Jaro City, Iloilo, Philippines</p>
          </div>
          <img src="/cpu-logo.png" alt="CPU Logo" className="w-24 h-24 object-contain shadow-sm rounded-full p-1 border border-gray-100" />
        </motion.div>

        {/* Login Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card w-full max-w-lg mx-auto border-t-4 border-cpuGold shadow-lg"
        >
          {!showAdd ? (
            <>
              <h2 className="text-3xl font-extrabold text-cpuNavy mb-2">Welcome Back</h2>
              <p className="text-gray-500 mb-8 font-semibold">Select your profile to continue tracking book usage.</p>

              {loading ? (
                <div className="text-center py-10 text-cpuGold font-bold animate-pulse">Loading profiles...</div>
              ) : (
                <div className="grid grid-cols-1 gap-3 mb-8 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                  {assistants.length === 0 && (
                    <p className="text-center text-gray-400 font-semibold py-4">No profiles found. Create one below.</p>
                  )}
                  {assistants.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setSelected(a)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 font-bold text-left transition-all duration-200
                        ${selected?.id === a.id
                          ? 'border-cpuGold bg-blue-50 text-cpuNavy shadow scale-[1.02]'
                          : 'border-gray-100 bg-white text-gray-700 hover:border-blue-200 hover:bg-gray-50'
                        }`}
                    >
                      <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white text-sm tracking-wider shadow-sm transition-colors ${selected?.id === a.id ? 'bg-cpuGold' : 'bg-cpuNavy'}`}>
                        {a.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-lg">{a.name}</span>
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={!selected}
                className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed text-lg mb-4 py-4 uppercase tracking-widest font-black"
              >
                {selected ? `Continue as ${selected.name}` : 'Select Profile'}
              </button>

              <button
                onClick={() => setShowAdd(true)}
                className="btn-secondary w-full text-sm hover:border-cpuGold"
              >
                Create New Profile
              </button>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-extrabold text-cpuNavy mb-2">Create Profile</h2>
              <p className="text-gray-500 mb-8 font-semibold">Log in a new student assistant to the system.</p>

              {addStatus && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-bold border-2
                  ${addStatus.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                  {addStatus.message}
                </div>
              )}

              <div className="mb-6">
                <label className="label mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Maria Santos"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddProfile()}
                  className="input-field py-4"
                  autoFocus
                />
              </div>

              <button
                onClick={handleAddProfile}
                disabled={adding || !newName.trim()}
                className="btn-primary w-full mb-4 disabled:opacity-50 py-4 uppercase tracking-widest font-black"
              >
                {adding ? 'Creating...' : 'Save Profile'}
              </button>

              <button onClick={() => { setShowAdd(false); setAddStatus(null); setNewName(''); }} className="btn-secondary w-full border-transparent hover:border-gray-300">
                Cancel
              </button>
            </motion.div>
          )}
        </motion.div>
        
        <p className="mt-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">School Library • Usage Tracker Engine</p>
      </div>

      {/* Right panel (Slideshow placeholder) */}
      <div className="hidden lg:flex w-1/2 bg-blue-50/50 flex-col items-center justify-center relative border-l border-white shadow-[inset_10px_0_20px_rgba(0,0,0,0.02)]">
         {/* Decorative Background Element */}
         <div className="absolute inset-0 bg-cpuNavy opacity-5 mix-blend-multiply pointer-events-none layout-bg-pattern"></div>
         
         {/* Slideshow Content Box */}
         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.4 }}
           className="text-center p-12 bg-white/70 backdrop-blur-md rounded-3xl border border-white shadow-xl max-w-md mx-auto z-10"
         >
           <div className="w-24 h-24 mx-auto bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
           </div>
           <h3 className="text-2xl font-extrabold text-cpuNavy mb-2">Student Assistant Gallery</h3>
           <p className="text-gray-500 font-medium">Replace this section with a slideshow showcasing the dedicated student assistants in action.</p>
         </motion.div>
      </div>
    </main>
  );
}