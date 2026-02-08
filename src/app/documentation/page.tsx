'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Documentation() {
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
        <div className="max-w-3xl">
          <span className="text-teal-600 font-semibold tracking-wide uppercase text-sm">Resources</span>
          <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-6 tracking-tight">Documentation</h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-12">
            Welcome to the HemoLedger documentation. Here you'll find comprehensive guides and references
            to help you understand and integrate with our blockchain-powered blood management system.
          </p>

          <div className="grid gap-12">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
              <div className="space-y-4">
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                  <h3 className="font-bold text-teal-700 mb-2">Platform Overview</h3>
                  <p className="text-gray-600">Learn about the core concepts of HemoLedger and how we use Hyperledger Fabric to ensure traceability.</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                  <h3 className="font-bold text-teal-700 mb-2">Role Guides</h3>
                  <p className="text-gray-600">Specific walkthroughs for Donors, Blood Banks, Hospitals, and Regulators.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Core Concepts</h2>
              <ul className="list-disc pl-6 space-y-3 text-gray-600 text-lg">
                <li>Immutable Ledger & Audit Trails</li>
                <li>Encryption & Data Privacy (AES-256)</li>
                <li>Smart Inventory Management</li>
                <li>Chain of Custody Tracking</li>
              </ul>
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
