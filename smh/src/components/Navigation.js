'use client';

import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-gray-800 p-4 w-full z-[1000] shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Home Link */}
        <Link href="/" className="text-white text-2xl font-semibold hover:text-blue-300 transition">
          Home
        </Link>

        {/* Login Link */}
        <div className="flex space-x-4">
          <Link
            href="/login"
            className="text-white text-lg hover:text-blue-300 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
