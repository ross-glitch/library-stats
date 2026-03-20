// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Library Stats — Elementary School',
  description: 'Daily book usage statistics for the school library',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-amber-50 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
