'use client';

import Link from 'next/link';

export default function Home() {

  const wrapLetters = (text) => {
    return text.split('').map((letter, index) => (
      <span
        key={index}
        className="inline-block transition-colors duration-500 ease-in-out hover:text-stone-indigo-300"
        style={{ transitionDelay: `${index * 0.01}s` }}
      >
        {letter}
      </span>
    ));
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center text-center py-28 px-4"
      style={{
        backgroundImage: 'url(logo-rsr.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Radial Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle, rgba(0, 0, 0, 0.6) 20%, rgba(0, 0, 0, 0) 70%)',
        }}
      ></div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* "Records to Remember" Section */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-9xl font-medium text-white mb-2 cursor-default" style={{ textShadow: '2px 2px 6px rgba(0, 0, 0, 0.6)' }}>
            {wrapLetters('Records')}
          </h2>
          <h2 className="text-6xl font-bold text-white mb-2 cursor-default" style={{ textShadow: '2px 2px 6px rgba(0, 0, 0, 0.6)' }}>
            {wrapLetters('to')}
          </h2>
          <h2 className="text-8xl font-medium text-white mb-12 cursor-default" style={{ textShadow: '2px 2px 6px rgba(0, 0, 0, 0.6)' }}>
            {wrapLetters('Remember')}
          </h2>
        </div>

        {/* Sign-Up Boxes (Now Floating on the Background) */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-center items-center gap-8">
          {/* Left Box - Client */}
          <div className="bg-white p-8 rounded-xl shadow-lg w-full md:w-1/2 text-left">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Sign up as a Client</h3>
            <ul className="list-disc list-inside text-gray-700 mb-6">
              <li>Access and retrieve your records anytime</li>
              <li>Secure cloud storage for your documents</li>
              <li>Seamless integration with multiple platforms</li>
            </ul>
            <Link href="/new-client" className="text-indigo-600 font-semibold hover:underline">Continue →</Link>
          </div>

          {/* Right Box - Preserver */}
          <div className="bg-white p-8 rounded-xl shadow-lg w-full md:w-1/2 text-left">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Sign up as a Preserver</h3>
            <ul className="list-disc list-inside text-gray-700 mb-6">
              <li>Contribute to a growing archive</li>
              <li>Help store and protect historical records</li>
              <li>Earn recognition for your preservation efforts</li>
            </ul>
            <Link href="/new-preserver-application" className="text-indigo-600 font-semibold hover:underline">Continue →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
