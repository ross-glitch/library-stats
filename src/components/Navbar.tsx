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
    <nav className="bg-cpuNavy text-white shadow-lg border-b-4 border-cpuGold">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-extrabold text-xl hover:text-cpuGold transition-colors">
          <span className="hidden sm:inline tracking-wide">HENRY LUCE III LIBRARY</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-2">
          <NavLink href="/dashboard"   label="Dashboard"  active={pathname === '/dashboard'} />
          <NavLink href="/add-entry"   label="Add Entry"  active={pathname === '/add-entry'} />
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
            className="bg-cpuGold hover:bg-cpuGoldDark text-cpuNavy text-sm font-bold py-1.5 px-4 rounded-lg transition-colors"
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
      className={`text-sm font-bold py-1.5 px-3 rounded-lg transition-colors relative
        ${active
          ? 'text-cpuGold'
          : 'text-gray-300 hover:text-white hover:bg-white/10'
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
