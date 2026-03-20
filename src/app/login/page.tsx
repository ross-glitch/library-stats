'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Assistant } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('');
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
    const prof = assistants.find(a => a.id.toString() === selectedId);
    if (!prof) return;
    sessionStorage.setItem('assistant', JSON.stringify(prof));
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
    <main className="min-h-screen flex text-white bg-cpuNavy overflow-hidden">
      {/* Left panel (Form + Header) */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-12 xl:p-16 shadow-2xl z-10 relative overflow-y-auto min-h-screen justify-center">
        
        {/* Header Block */}
        <div 
          className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-6 mb-16 text-center w-full max-w-lg mx-auto"
        >
          <img src="/elem-logo.jpg" alt="Elementary Logo" className="w-24 h-24 object-contain shadow-sm rounded-full p-2 bg-white/5 border border-white/10" />
          <div className="flex-1">
            <h2 className="text-2xl lg:text-4xl font-black tracking-widest uppercase text-white leading-tight drop-shadow-sm">Central Philippine<br/>University</h2>
            
            {/* White Gap Separator */}
            <div className="w-16 h-[3px] bg-white/70 mx-auto my-5 rounded-full shadow-sm"></div>
            
            <h3 className="text-xl lg:text-2xl font-bold text-cpuGold uppercase tracking-widest drop-shadow-sm">Elementary School</h3>
            <p className="text-xs lg:text-sm font-bold text-gray-400 mt-2 uppercase tracking-[0.2em]">Jaro City, Iloilo, Philippines</p>
          </div>
          <img src="/cpu-logo.png" alt="CPU Logo" className="w-24 h-24 object-contain shadow-sm rounded-full p-2 bg-white/5 border border-white/10" />
        </div>

        {/* Login Form */}
        <div 
          className="w-full max-w-lg mx-auto bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm"
        >
          {!showAdd ? (
            <>
              <h2 className="text-3xl font-extrabold text-white mb-2">Welcome</h2>
              <p className="text-gray-400 mb-8 font-medium">Select your profile from the dropdown to continue tracking book usage.</p>

              {loading ? (
                <div className="text-center py-6 text-cpuGold font-bold animate-pulse">Loading profiles...</div>
              ) : (
                <div className="mb-6">
                  {assistants.length === 0 ? (
                    <p className="text-center text-gray-400 font-medium py-4">No profiles found. Create one below.</p>
                  ) : (
                    <div className="relative">
                      <select
                        className="w-full bg-cpuNavy border border-white/20 text-white rounded-xl px-5 py-4 focus:ring-2 focus:ring-cpuGold focus:border-cpuGold focus:outline-none appearance-none cursor-pointer text-lg font-bold transition-all shadow-inner"
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                      >
                        <option value="" disabled className="text-gray-400 font-medium">Choose an assistant profile...</option>
                        {assistants.map((a) => (
                          <option key={a.id} value={a.id} className="text-white font-bold">{a.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-cpuGold">
                        <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={!selectedId}
                className="w-full bg-cpuGold hover:bg-yellow-400 text-cpuNavy disabled:opacity-40 disabled:cursor-not-allowed text-lg mb-4 py-4 rounded-xl uppercase tracking-widest font-black transition-colors"
              >
                {selectedId ? 'Continue Login' : 'Select Profile'}
              </button>

              <button
                onClick={() => setShowAdd(true)}
                className="w-full bg-transparent border border-white/20 hover:bg-white/10 text-white text-sm py-4 rounded-xl font-bold transition-colors uppercase tracking-widest"
              >
                Create New Profile
              </button>
            </>
          ) : (
            <div>
              <h2 className="text-3xl font-extrabold text-white mb-2">Create Profile</h2>
              <p className="text-gray-400 mb-8 font-medium">Log in a new student assistant to the system.</p>

              {addStatus && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-bold border
                  ${addStatus.type === 'success' ? 'bg-green-500/20 text-green-200 border-green-500/50' : 'bg-red-500/20 text-red-200 border-red-500/50'}`}>
                  {addStatus.message}
                </div>
              )}

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Maria Santos"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddProfile()}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-cpuGold focus:ring-1 focus:ring-cpuGold transition-all font-medium text-lg"
                  autoFocus
                />
              </div>

              <button
                onClick={handleAddProfile}
                disabled={adding || !newName.trim()}
                className="w-full bg-cpuGold hover:bg-yellow-400 text-cpuNavy disabled:opacity-50 py-4 rounded-xl uppercase tracking-widest font-black transition-colors mb-4"
              >
                {adding ? 'Creating...' : 'Save Profile'}
              </button>

              <button onClick={() => { setShowAdd(false); setAddStatus(null); setNewName(''); }} className="w-full bg-transparent border border-white/20 hover:bg-white/10 text-white text-sm py-4 rounded-xl font-bold transition-colors uppercase tracking-widest">
                Cancel
              </button>
            </div>
          )}
        </div>
        
        <p className="mt-12 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">School Library • Usage Tracker Engine</p>
      </div>

      {/* Right panel (Slideshow placeholder) */}
      <div 
        className="hidden lg:flex w-1/2 flex-col items-center justify-center relative shadow-[inset_10px_0_20px_rgba(0,0,0,0.02)] bg-cover bg-center"
        style={{ backgroundImage: "url('/elem-lib.jpg')" }}
      >
         {/* Deep Overlay for Contrast */}
         <div className="absolute inset-0 bg-cpuNavy/80 backdrop-blur-[2px] pointer-events-none"></div>
         
         {/* Slideshow Content Box */}
         <div 
           className="text-center p-12 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl max-w-md mx-auto z-10"
         >
           <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">Elementary Library</h3>
           <p className="text-gray-200 font-medium text-lg leading-relaxed">Welcome to the Central Philippine University Elementary School Assistant Portal.</p>
         </div>
      </div>
    </main>
  );
}