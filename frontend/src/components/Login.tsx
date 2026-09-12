import React, { useState, useEffect } from 'react';
import { loginApi, User } from '../services/api';
import { motion } from 'framer-motion';
import flamLogo from '../../assets/Flam-AI-scaled.webp';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  // Live microsecond timestamp ticker
  const [timeString, setTimeString] = useState('');
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const iso = now.toISOString().split('T')[1].slice(0, 12);
      setTimeString(`${iso} UTC`);
    };
    updateClock();
    const interval = setInterval(updateClock, 37);
    return () => clearInterval(interval);
  }, []);

  // Mouse perspective grid tilt
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    setMousePos({
      x: (clientX / window.innerWidth - 0.5) * 20,
      y: (clientY / window.innerHeight - 0.5) * 20,
    });
  };

  // Keyboard shortcut listener (Cmd/Ctrl + 1 / 2)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        handleQuickFill('tenant_a@example.com');
      } else if ((e.metaKey || e.ctrlKey) && e.key === '2') {
        e.preventDefault();
        handleQuickFill('tenant_b@example.com');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('AUTHENTICATION ERROR // EMAIL AND PASSWORD REQUIRED');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await loginApi(email, password);
      onLoginSuccess(res.user);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setError(
        errorObj.message?.toUpperCase() ||
          'AUTHENTICATION FAILED // INVALID TENANT CREDENTIALS'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#050505] text-[#F5F5F7] flex flex-col md:flex-row relative overflow-hidden font-mono selection:bg-[#D4FF3F] selection:text-[#050505]"
    >
      {/* 0.5px Full-Bleed Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 bg-dot-grid"
        style={{
          transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
          transition: 'transform 0.1s ease-out',
        }}
      />

      {/* LEFT PANEL: Massive Cropped Editorial Typography + Logo + Live Telemetry */}
      <div className="flex-1 flex flex-col justify-between p-8 md:p-14 relative z-10 border-b md:border-b-0 md:border-r border-[#1A1A1A] overflow-hidden">
        {/* Top Header Telemetry with Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs tracking-widest text-[#6B6B6B]">
            <img src={flamLogo} alt="Flam AI Logo" className="h-6 w-auto object-contain opacity-90" />
            <span className="w-2 h-2 bg-[#D4FF3F] inline-block animate-pulse" />
            <span className="text-[#F4F1EA] font-bold tracking-widest">✦ NORTHSTAR</span>
            <span className="text-[#6B6B6B]">//</span>
            <span className="text-[#6B6B6B]">PORTFOLIO TELEMETRY OS</span>
          </div>

          <div className="text-[11px] text-[#6B6B6B] font-mono tracking-wider">
            {timeString || '00:00:00.000 UTC'}
          </div>
        </div>

        {/* Hero Serif Brand Crop (bleeding off the left edge) */}
        <div className="my-16 md:my-0 space-y-6 relative">
          <div className="text-[11px] uppercase tracking-widest text-[#D4FF3F] flex items-center gap-2 font-mono">
            <span>[ SYSTEM ACCESS :: RESTRICTED PORTAL ]</span>
          </div>

          {/* Oversized cropped wordmark bleeding off left edge at -40px */}
          <div className="relative -ml-10 sm:-ml-16 select-none pointer-events-none">
            <h1 className="font-serif-display text-8xl sm:text-9xl lg:text-[140px] leading-none text-[#F4F1EA] tracking-tighter opacity-95">
              NORTHSTAR<span className="text-[#D4FF3F]">.</span>
            </h1>
          </div>

          <p className="text-xs text-[#6B6B6B] max-w-md uppercase tracking-wider leading-relaxed border-l border-[#D4FF3F] pl-4 font-mono">
            Multi-tenant portfolio intelligence telemetry. High-density asset tracking, atomic CSV dataset uploads, institutional returns analysis.
          </p>
        </div>

        {/* Bottom Technical Spec Readout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-[10px] text-[#6B6B6B] border-t border-[#1A1A1A] pt-6 uppercase tracking-widest font-mono">
          <div>
            <div className="text-[#6B6B6B]">SECURITY METHOD</div>
            <div className="text-[#F4F1EA] font-bold mt-1">JWT SHA-256 ISOLATED</div>
          </div>
          <div>
            <div className="text-[#6B6B6B]">TENANT ISOLATION</div>
            <div className="text-[#D4FF3F] font-bold mt-1">STRICT RLS SCOPE</div>
          </div>
          <div className="hidden sm:block">
            <div className="text-[#6B6B6B]">LATENCY TELEMETRY</div>
            <div className="text-[#F4F1EA] font-bold mt-1">&lt; 1.2ms PIPELINE</div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: 380px Form Rail with Hairline Inputs */}
      <div className="w-full md:w-[420px] shrink-0 p-8 md:p-14 flex flex-col justify-between relative z-10 bg-[#0a0b0e]">
        {/* Form Container */}
        <div className="space-y-10 my-auto">
          {/* Header */}
          <div className="space-y-2 border-b border-[#1a1c23] pb-5">
            <div className="text-[10px] text-[#8E929F] uppercase tracking-widest flex items-center justify-between">
              <span>01 // AUTHENTICATION</span>
              <span className="text-[#D4FF3F]">READY</span>
            </div>
            <h2 className="text-lg font-bold tracking-wider text-[#F5F5F7] uppercase">
              Operator Sign-In
            </h2>
          </div>

          {/* Error Readout */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-hatched-negative border border-[#FF3B30] text-[#FF3B30] text-[11px] tracking-wider uppercase"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email Input: No rounded corners, underline only */}
            <div className="space-y-2 relative">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                <label
                  className={`transition-colors ${
                    focusedField === 'email' ? 'text-[#D4FF3F] font-bold' : 'text-[#8E929F]'
                  }`}
                >
                  Account Identity (Email)
                </label>
                {email && <span className="text-[#D4FF3F]">✓</span>}
              </div>
              <input
                type="email"
                required
                value={email}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenant_a@example.com"
                className="w-full bg-transparent py-2 text-xs text-[#F5F5F7] placeholder-[#4A4E5D] focus:outline-none tracking-wider border-b border-[#1a1c23] focus:border-[#D4FF3F] transition-colors rounded-none"
              />
            </div>

            {/* Password Input: Underline only */}
            <div className="space-y-2 relative">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                <label
                  className={`transition-colors ${
                    focusedField === 'password' ? 'text-[#D4FF3F] font-bold' : 'text-[#8E929F]'
                  }`}
                >
                  Access Password
                </label>
                {password && <span className="text-[#D4FF3F]">✓</span>}
              </div>
              <input
                type="password"
                required
                value={password}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-transparent py-2 text-xs text-[#F5F5F7] placeholder-[#4A4E5D] focus:outline-none tracking-wider border-b border-[#1a1c23] focus:border-[#D4FF3F] transition-colors rounded-none"
              />
            </div>

            {/* Submit Button with Loading Scanline */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#D4FF3F] hover:bg-[#c2ef30] active:bg-[#b0dc28] text-[#050505] font-bold text-xs uppercase tracking-widest transition-all relative overflow-hidden disabled:opacity-50 cursor-pointer rounded-[2px]"
            >
              {loading ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <span className="text-[#050505]">VERIFYING CREDENTIALS...</span>
                  <div className="absolute inset-0 bg-[#050505]/20 animate-scanline" />
                </div>
              ) : (
                <div className="flex items-center justify-between px-4">
                  <span>AUTHENTICATE OPERATOR</span>
                  <span>→</span>
                </div>
              )}
            </button>
          </form>

          {/* Quick Fill Spec Sheet with Keyboard Shortcuts */}
          <div className="pt-8 border-t border-[#1a1c23] space-y-3">
            <div className="flex justify-between items-center text-[10px] text-[#8E929F] uppercase tracking-widest">
              <span>SEEDED DEMO TENANTS</span>
              <span className="text-[#4A4E5D]">SHORTCUTS AVAILABLE</span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickFill('tenant_a@example.com')}
                className="w-full p-3 bg-[#050505] hover:bg-[#111318] border border-[#1a1c23] hover:border-[#D4FF3F]/50 text-left transition-all cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-[#F5F5F7] group-hover:text-[#D4FF3F] tracking-wider">
                    TENANT 1 // ALPHA CAPITAL
                  </div>
                  <div className="text-[10px] text-[#8E929F]">tenant_a@example.com</div>
                </div>
                <span className="text-[10px] text-[#4A4E5D] group-hover:text-[#D4FF3F] border border-[#1a1c23] px-1.5 py-0.5 rounded-[2px]">
                  ⌘1
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('tenant_b@example.com')}
                className="w-full p-3 bg-[#050505] hover:bg-[#111318] border border-[#1a1c23] hover:border-[#D4FF3F]/50 text-left transition-all cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-[#F5F5F7] group-hover:text-[#D4FF3F] tracking-wider">
                    TENANT 2 // BEACON ADVISORS
                  </div>
                  <div className="text-[10px] text-[#8E929F]">tenant_b@example.com</div>
                </div>
                <span className="text-[10px] text-[#4A4E5D] group-hover:text-[#D4FF3F] border border-[#1a1c23] px-1.5 py-0.5 rounded-[2px]">
                  ⌘2
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-[#4A4E5D] uppercase tracking-widest text-center pt-6">
          NORTHSTAR V1.0 // ALL RIGHTS RESERVED
        </div>
      </div>
    </div>
  );
};
