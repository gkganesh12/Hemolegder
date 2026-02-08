'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function PrivacyPolicy() {
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
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 lg:px-8 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-teal max-w-none text-gray-600 leading-relaxed space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p>HemoLedger is committed to protecting your personal and medical information. This policy explains how we collect, use, and protect your data using advanced encryption and blockchain technology.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Encryption & Security</h2>
            <p>We use **AES-256 bit encryption** for all Personally Identifiable Information (PII). This data is encrypted at rest and in transit. Medical records are hashed and stored on a private blockchain channel, ensuring that only authorized participants can access them.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
            <p>As a donor, you have full control over your data. You can grant or revoke consent for data sharing with specific organizations at any time through the Donor Portal.</p>
          </section>

          <footer className="pt-8 border-t border-gray-100 text-sm text-gray-400">
            Last Updated: March 2024
          </footer>
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
