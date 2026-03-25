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
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginStatus, setLoginStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [removing, setRemoving] = useState(false);

  async function fetchAssistants() {
    const res = await fetch('/api/assistants');
    const data = await res.json();
    setAssistants(data.data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchAssistants();
  }, []);

  async function handleLogin() {
    if (!selectedId || !password) {
      setLoginStatus({ type: 'error', message: 'Profile and password are required.' });
      return;
    }
    setLoginStatus(null);
    try {
      const res = await fetch(`/api/assistants/${selectedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginStatus({ type: 'error', message: data.error || 'Authentication failed.' });
      } else {
        const prof = assistants.find(a => a.id.toString() === selectedId);
        if (prof) {
          sessionStorage.setItem('assistant', JSON.stringify(prof));
          router.push('/dashboard');
        }
      }
    } catch {
      setLoginStatus({ type: 'error', message: 'Network error.' });
    }
  }

  async function handleRemoveProfile() {
    if (!selectedId || !password) {
      setLoginStatus({ type: 'error', message: 'Password is required to remove profile.' });
      return;
    }
    if (!confirm('Are you sure you want to completely remove this profile? All logs will be deleted.')) return;
    
    setRemoving(true);
    setLoginStatus(null);
    try {
      const res = await fetch(`/api/assistants/${selectedId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginStatus({ type: 'error', message: data.error || 'Failed to remove profile.' });
      } else {
        setLoginStatus({ type: 'success', message: 'Profile removed successfully.' });
        setSelectedId('');
        setPassword('');
        await fetchAssistants();
      }
    } catch {
      setLoginStatus({ type: 'error', message: 'Network error.' });
    } finally {
      setRemoving(false);
    }
  }

  async function handleAddProfile() {
    if (!newName.trim()) return;
    setAdding(true);
    setAddStatus(null);
    try {
      const res = await fetch('/api/assistants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddStatus({ type: 'error', message: data.error || 'Failed to create profile.' });
      } else {
        setAddStatus({ type: 'success', message: 'Profile created successfully.' });
        setNewName('');
        setPassword('');
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
                        onChange={(e) => { setSelectedId(e.target.value); setPassword(''); setLoginStatus(null); }}
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

              {selectedId && (
                <div className="mb-6 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-cpuGold focus:ring-1 focus:ring-cpuGold transition-all font-medium text-lg"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              )}

              {loginStatus && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-bold border ${loginStatus.type === 'success' ? 'bg-green-500/20 text-green-200 border-green-500/50' : 'bg-red-500/20 text-red-200 border-red-500/50'}`}>
                  {loginStatus.message}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={!selectedId || !password}
                className="w-full bg-cpuGold hover:bg-yellow-400 text-cpuNavy disabled:opacity-40 disabled:cursor-not-allowed text-lg mb-4 py-4 rounded-xl uppercase tracking-widest font-black transition-colors"
              >
                {selectedId ? 'Continue Login' : 'Select Profile'}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowAdd(true); setPassword(''); setLoginStatus(null); }}
                  className="w-full bg-transparent border border-white/20 hover:bg-white/10 text-white text-sm py-4 rounded-xl font-bold transition-colors uppercase tracking-widest"
                >
                  Create New Profile
                </button>
                {selectedId && (
                  <button
                    onClick={handleRemoveProfile}
                    disabled={removing || !password}
                    className="w-full bg-transparent border border-red-500/30 hover:bg-red-500/20 text-red-400 hover:border-red-500/50 disabled:opacity-50 text-sm py-4 rounded-xl font-bold transition-colors uppercase tracking-widest disabled:cursor-not-allowed"
                  >
                    {removing ? '...' : 'Remove'}
                  </button>
                )}
              </div>
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

              <div className="mb-8 relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Set a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddProfile()}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-cpuGold focus:ring-1 focus:ring-cpuGold transition-all font-medium text-lg"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[42px] text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>

              <button
                onClick={handleAddProfile}
                disabled={adding || !newName.trim() || !password}
                className="w-full bg-cpuGold hover:bg-yellow-400 text-cpuNavy disabled:opacity-50 py-4 rounded-xl uppercase tracking-widest font-black transition-colors mb-4"
              >
                {adding ? 'Creating...' : 'Save Profile'}
              </button>

              <button onClick={() => { setShowAdd(false); setAddStatus(null); setNewName(''); setPassword(''); }} className="w-full bg-transparent border border-white/20 hover:bg-white/10 text-white text-sm py-4 rounded-xl font-bold transition-colors uppercase tracking-widest">
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