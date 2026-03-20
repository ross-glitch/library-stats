'use client';
// src/components/Navbar.tsx
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Assistant } from '@/types';
import { motion } from 'framer-motion';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [assistant, setAssistant] = useState<Assistant | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('assistant');
    if (stored) setAssistant(JSON.parse(stored));
  }, []);

  function handleLogout() {
    sessionStorage.removeItem('assistant');
    router.push('/login');
  }

  return (
    <nav className="bg-cpuNavy text-white sticky top-0 z-50 border-b border-gray-800 shadow-xl drop-shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-extrabold text-xl hover:text-cpuGold transition-colors">
          <span className="hidden sm:inline tracking-wide">ELEMENTARY LIBRARY</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-2">
          <NavLink href="/dashboard" label="Dashboard" active={pathname === '/dashboard'} />
          <NavLink href="/add-entry" label="Add Entry" active={pathname === '/add-entry'} />
        </div>

        {/* User + Logout */}
        <div className="flex items-center gap-3">
          {assistant && (
            <span className="hidden md:block text-cpuGold text-sm font-semibold">
              {assistant.name}
            </span>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-sm font-bold py-2 px-5 rounded-lg transition-colors border border-red-500/20 ml-4"
          >
            Logout
          </motion.button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`text-sm font-bold py-2 px-4 rounded-lg transition-all relative
        ${active
          ? 'text-cpuGold bg-white/10'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
    >
      {label}
      {active && (
        <motion.div
          layoutId="navbar-active"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-cpuGold"
          initial={false}
        />
      )}
    </Link>
  );
}
