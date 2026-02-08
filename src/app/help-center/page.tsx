'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function HelpCenter() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const faqs = [
    { q: "How do I become a donor?", a: "Simply click 'Get Started' and create a Donor account. You'll be able to find your nearest blood bank." },
    { q: "Is my data secure?", a: "Yes, we use industry-standard AES-256 encryption and private blockchain channels to protect medical data." },
    { q: "How can my hospital join?", a: "Contact our enterprise team at hospitals@hemoledger.health for onboarding." },
  ];

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
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600">Find answers and support for HemoLedger.</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-8">
            {faqs.map((faq, i) => (
              <div key={i} className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.q}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center p-12 bg-teal-50 rounded-3xl border border-teal-100">
            <h2 className="text-2xl font-bold text-teal-900 mb-2">Still need help?</h2>
            <p className="text-teal-700 mb-6">Our support team is available 24/7.</p>
            <a href="mailto:support@hemoledger.health" className="inline-block bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all">
              Contact Support
            </a>
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
