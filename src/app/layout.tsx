// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Library Stats — Elementary School',
  description: 'Daily book usage statistics for the school library',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`min-h-screen ${inter.className} bg-gray-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
