'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function ApiReference() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' : 'bg-white py-4 border-b border-gray-100'}`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={36} height={36} />
            <span className="font-bold text-gray-900 text-lg">HemoLedger</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-teal-600 font-medium transition-colors">Home</Link>
            <Link href="/login" className="text-gray-700 hover:text-teal-600 font-medium">Sign In</Link>
            <Link href="/register" className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-all font-medium">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-4xl">
          <span className="text-teal-600 font-semibold tracking-wide uppercase text-sm">Developers</span>
          <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-6 tracking-tight">API Reference</h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-12">
            Automate and integrate your healthcare systems with HemoLedger's robust REST API.
          </p>

          <div className="space-y-12">
            <section className="p-8 bg-gray-900 rounded-2xl text-white">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="bg-teal-500 text-xs px-2 py-1 rounded">POST</span>
                /api/v1/donations
              </h2>
              <p className="text-gray-400 mb-6">Register a new blood donation unit on the ledger.</p>
              <pre className="bg-black/50 p-4 rounded-xl text-teal-400 font-mono text-sm">
{`{
  "donorId": "don_123...",
  "bloodGroup": "A_POSITIVE",
  "volume": 450,
  "collectionDate": "2024-03-15T10:00:00Z"
}`}
              </pre>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Authentication</h2>
              <p className="text-gray-600 mb-4 whitespace-pre-line">
                All API requests require a JWT token in the Authorization header:
                {'\n'}
                <code className="bg-gray-100 px-2 py-1 rounded">Authorization: Bearer {'<YOUR_TOKEN>'}</code>
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center text-gray-500">
          <p>&copy; 2024 HemoLedger. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
