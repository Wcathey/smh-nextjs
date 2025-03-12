// layout.js

'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import Navigation from '@/components/Navigation';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {/* Navigation will be visible on every page */}
          <Navigation />
          {/* Main content */}
          {children}
      </body>
    </html>
  );
}
