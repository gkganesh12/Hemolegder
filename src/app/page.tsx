'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

// Counter Hook for animated numbers
function useCountUp(end: number, duration: number = 2000, startCounting: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startCounting) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, startCounting]);

  return count;
}

// Intersection Observer Hook
function useInView(threshold: number = 0.1) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

// Stat Counter Component
function StatCounter({ value, suffix = '', label, icon, delay = 0 }: {
  value: number;
  suffix?: string;
  label: string;
  icon: string;
  delay?: number;
}) {
  const { ref, isInView } = useInView(0.3);
  const [shouldCount, setShouldCount] = useState(false);
  const count = useCountUp(value, 2000, shouldCount);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setShouldCount(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isInView, delay]);

  return (
    <div
      ref={ref}
      className={`text-center transform transition-all duration-700 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-14 h-14 mx-auto rounded-xl bg-teal-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
        </svg>
      </div>
      <p className="text-4xl font-bold text-gray-900">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="mt-1 text-gray-600">{label}</p>
    </div>
  );
}

// Animated Feature Card
function FeatureCard({ title, description, icon, index }: {
  title: string;
  description: string;
  icon: string;
  index: number;
}) {
  const { ref, isInView } = useInView(0.2);

  return (
    <div
      ref={ref}
      className={`group p-8 bg-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-100/50 transition-all duration-500 cursor-pointer transform ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-6 group-hover:bg-teal-100 group-hover:scale-110 transition-all duration-300">
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-teal-700 transition-colors">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { value: 50000, suffix: '+', label: 'Blood Units Managed', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    { value: 15000, suffix: '+', label: 'Active Donors', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { value: 200, suffix: '+', label: 'Partner Hospitals', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { value: 99, suffix: '.9%', label: 'Traceability Rate', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  ];

  const features = [
    {
      title: 'End-to-End Encryption',
      description: 'All personal and medical data protected with AES-256 encryption. Your privacy is our priority.',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    },
    {
      title: 'Blockchain Verified',
      description: 'Every blood unit tracked on Hyperledger Fabric for immutable, transparent records.',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    },
    {
      title: 'Complete Traceability',
      description: 'Track blood units from donation to transfusion, preventing counterfeits and illegal trafficking with a full audit trail.',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      title: 'Smart Inventory',
      description: 'Real-time alerts for expiry dates, low stock, and optimal distribution.',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
    {
      title: 'Consent Management',
      description: 'Donors control their data sharing preferences with granular consent options.',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    },
    {
      title: 'Multi-Role Access',
      description: 'Secure dashboards for donors, blood banks, hospitals, and regulators.',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Animated Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg py-2'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-14' : 'h-16'}`}>
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="HemoLedger Logo"
                width={scrolled ? 36 : 44}
                height={scrolled ? 36 : 44}
                className="transition-all duration-300"
              />
              <span className={`font-bold text-gray-900 transition-all duration-300 ${scrolled ? 'text-lg' : 'text-xl'}`}>HemoLedger</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Platform', 'Resources', 'How It Works', 'Impact'].map((item, i) => (
                <a
                  key={item}
                  href={['Documentation', 'API Reference', 'Help Center', 'Privacy Policy'].includes(item) ? `/${item.toLowerCase().replace(' ', '-')}` : `#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-gray-600 hover:text-teal-600 font-medium transition-all duration-300 relative group cursor-pointer"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login" className={`text-gray-700 hover:text-teal-600 font-medium transition-all cursor-pointer ${scrolled ? 'px-3 py-1.5' : 'px-4 py-2'}`}>
                Sign In
              </Link>
              <Link
                href="/register"
                className={`bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-all cursor-pointer shadow-lg shadow-teal-600/25 hover:shadow-xl hover:shadow-teal-600/30 hover:scale-105 ${scrolled ? 'px-4 py-2 text-sm' : 'px-5 py-2.5'}`}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Parallax */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-grid">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 via-white to-cyan-50/30" />

        {/* Parallax decorative blobs */}
        <div
          className="absolute top-20 right-10 w-72 h-72 bg-teal-100 rounded-full blur-3xl opacity-40 transition-transform duration-100"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        <div
          className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-100 rounded-full blur-3xl opacity-30 transition-transform duration-100"
          style={{ transform: `translateY(${scrollY * -0.05}px)` }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-teal-400 rounded-full opacity-20 animate-float"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 pt-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 mb-8 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span className="text-sm font-medium text-teal-700">Blockchain-Powered Blood Management</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-tight animate-fade-in-up animation-delay-100">
              Every Drop of Blood
              <span className="block text-teal-600 animate-text-gradient">Saves a Life</span>
            </h1>

            <p className="mt-8 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              A secure, privacy-first platform for managing blood donation with complete traceability. From collection to transfusion, every unit is tracked and verified.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
              <Link
                href="/register"
                className="group flex items-center gap-2 px-8 py-4 bg-teal-600 text-white text-lg font-semibold rounded-xl hover:bg-teal-700 transition-all cursor-pointer shadow-lg shadow-teal-600/25 hover:shadow-xl hover:shadow-teal-600/30 hover:scale-105 active:scale-95"
              >
                Become a Donor
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 px-8 py-4 text-gray-700 text-lg font-semibold rounded-xl border-2 border-gray-200 hover:border-teal-300 hover:text-teal-600 transition-all cursor-pointer bg-white hover:scale-105 active:scale-95"
              >
                Staff Portal
              </Link>
            </div>

            {/* Animated trust indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-gray-500 animate-fade-in-up animation-delay-400">
              {[
                { text: 'AES-256 Encrypted', delay: 0 },
                { text: 'Blockchain Verified', delay: 100 },
                { text: 'HIPAA Compliant', delay: 200 },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 hover:text-teal-600 transition-colors cursor-default">
                  <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Scroll indicator */}
            <div className="mt-16 animate-bounce">
              <svg className="w-6 h-6 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Counting Animation */}
      <section id="impact" className="py-20 bg-white border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <StatCounter
                key={i}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                icon={stat.icon}
                delay={i * 150}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section id="platform" className="py-24 bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-cyan-50 text-cyan-700 border border-cyan-200 mb-4">Our Ecosystem</span>
            <h2 className="text-4xl font-bold text-gray-900">One Platform, Many Portals</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              HemoLedger provides specialized interfaces for every participant in the blood supply chain.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Donor Portal', desc: 'Securely manage your profile, donations, and data consent.', link: '/donor', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              { title: 'Blood Banks', desc: 'Track collections, manage inventory, and verify safety tests.', link: '/blood-bank', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
              { title: 'Hospitals', desc: 'Request blood units and track deliveries in real-time.', link: '/hospital', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
              { title: 'Regulators', desc: 'Monitor the entire ecosystem with full audit transparency.', link: '/regulator', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
            ].map((portal, i) => (
              <Link
                key={i}
                href={portal.link}
                className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-cyan-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-4 group-hover:bg-cyan-100 transition-colors">
                  <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={portal.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{portal.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{portal.desc}</p>
                <span className="text-cyan-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  Open Portal
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with Staggered Animation */}
      <section id="features" className="py-24 bg-texture">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-teal-50 text-teal-700 border border-teal-200 mb-4 animate-fade-in-up">Features</span>
            <h2 className="text-4xl font-bold text-gray-900 animate-fade-in-up animation-delay-100">
              Built for Safety & Trust
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Advanced technology meets healthcare to create a secure, transparent blood management ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <FeatureCard
                key={i}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Video Container */}
            <div className="relative group">
              {/* Decorative elements */}
              <div className="absolute -inset-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-teal-100 rounded-2xl -z-10" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-cyan-100 rounded-full -z-10" />

              {/* Video */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-gray-300/50 border-4 border-white">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto aspect-[9/16] object-cover lg:aspect-square"
                >
                  <source src="/videos/blood-donation-promo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Play button overlay (decorative) */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-teal-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:pl-8">
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-teal-50 text-teal-700 border border-teal-200 mb-6">
                Our Mission
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Every Drop Counts in<br />
                <span className="text-teal-600">Saving Lives</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Blood donation is a simple act with extraordinary impact. In just 10-15 minutes,
                you can give the gift of life to someone in need. Our platform ensures every
                donation is tracked, tested, and delivered safely to those who need it most.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-3xl font-bold text-teal-600">10 min</p>
                  <p className="text-sm text-gray-600">Average donation time</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-3xl font-bold text-teal-600">3 lives</p>
                  <p className="text-sm text-gray-600">Saved per donation</p>
                </div>
              </div>

              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all cursor-pointer shadow-lg shadow-teal-600/25 hover:shadow-xl hover:shadow-teal-600/30 hover:scale-105 active:scale-95"
              >
                Start Donating Today
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works with Timeline Animation */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-white to-teal-50/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-teal-50 text-teal-700 border border-teal-200 mb-4">Process</span>
            <h2 className="text-4xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              A simple, secure journey from registration to saving lives.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Animated connection line */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-teal-200 via-teal-400 to-teal-200 animate-pulse" />

            {[
              { step: '01', title: 'Register', desc: 'Create your secure donor account' },
              { step: '02', title: 'Donate', desc: 'Visit a partner blood bank' },
              { step: '03', title: 'Testing', desc: 'Units undergo safety testing' },
              { step: '04', title: 'Save Lives', desc: 'Your donation reaches those in need' },
            ].map((item, i) => {
              const { ref, isInView } = useInView(0.3);
              return (
                <div
                  key={i}
                  ref={ref}
                  className={`relative text-center transform transition-all duration-700 ${
                    isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <div className="w-24 h-24 mx-auto rounded-2xl bg-white border-2 border-teal-200 flex items-center justify-center mb-6 shadow-lg shadow-teal-100/50 relative z-10 group hover:scale-110 hover:border-teal-400 transition-all duration-300 cursor-pointer">
                    <span className="text-2xl font-bold text-teal-600 group-hover:scale-110 transition-transform">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 to-teal-700 p-12 text-center shadow-2xl group hover:shadow-teal-500/30 transition-shadow duration-500">
            {/* Animated pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="ctaGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#ctaGrid)" />
              </svg>
            </div>

            {/* Animated circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Save Lives?
              </h2>
              <p className="text-xl text-teal-100 max-w-xl mx-auto mb-8">
                Join thousands of donors making a difference. One donation can save up to three lives.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-white text-teal-700 font-semibold rounded-xl hover:bg-teal-50 transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                >
                  Register Now
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/10 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  Staff Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="/logo.png" alt="HemoLedger Logo" width={40} height={40} />
                <span className="text-xl font-bold text-gray-900">HemoLedger</span>
              </div>
              <p className="text-gray-600">
                Secure blood bank management powered by blockchain technology.
              </p>
            </div>

            {[
              { title: 'Platform', items: [{name: 'Donor Portal', link: '/donor'}, {name: 'Blood Banks', link: '/blood-bank'}, {name: 'Hospitals', link: '/hospital'}, {name: 'Regulators', link: '/regulator'}] },
              { title: 'Resources', items: [{name: 'Documentation', link: '/documentation'}, {name: 'API Reference', link: '/api-reference'}, {name: 'Help Center', link: '/help-center'}, {name: 'Privacy Policy', link: '/privacy-policy'}] },
            ].map((section, i) => (
              <div key={i}>
                <h4 className="font-semibold text-gray-900 mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item.name}>
                      <Link href={item.link} className="text-gray-600 hover:text-teal-600 transition-colors cursor-pointer hover:translate-x-1 inline-block">{item.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Contact</h4>
              <ul className="space-y-3 text-gray-600">
                <li className="hover:text-teal-600 transition-colors cursor-pointer">support@hemoledger.health</li>
                <li className="hover:text-teal-600 transition-colors cursor-pointer">+1 (800) HEMO-123</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500">
              &copy; 2024 HemoLedger Blood Bank Management. All rights reserved.
            </p>
            <p className="text-gray-500 flex items-center gap-2">
              Powered by <span className="font-medium text-teal-600">Hyperledger Fabric</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes text-gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-text-gradient {
          background: linear-gradient(90deg, #0D9488, #14B8A6, #5EEAD4, #14B8A6, #0D9488);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          animation: text-gradient 3s ease infinite;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
          opacity: 0;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }

        .bg-grid {
          background-color: #FFFFFF;
          background-image:
            linear-gradient(to right, #f1f5f9 1px, transparent 1px),
            linear-gradient(to bottom, #f1f5f9 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .bg-texture {
          background-color: #FFFFFF;
          background-image: radial-gradient(circle at 1px 1px, #f1f5f9 1px, transparent 0);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
}
