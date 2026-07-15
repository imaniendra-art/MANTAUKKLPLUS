"use client";

import { useState } from 'react';
import { signIn } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn({ email, password });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        const session = { user: res.user };
        
        if (session?.user?.role) {
          if (session.user.role === 'mahasiswa') {
            const searchParams = new URLSearchParams(window.location.search);
            const callbackUrl = searchParams.get('callbackUrl');

            // KONDISI 1: Mutlak arahkan ke setup akun jika isFirstLogin === true
            if (session.user.isFirstLogin === true) {
              // Jika ada callbackUrl yang mengarah ke link join undangan, arahkan ke setup akun dengan param invite
              if (callbackUrl && callbackUrl.includes('/mahasiswa/join?invite=')) {
                const inviteId = new URLSearchParams(callbackUrl.split('?')[1]).get('invite');
                window.location.href = `/mahasiswa/setup-akun?invite=${inviteId}`;
              } else {
                window.location.href = '/mahasiswa/setup-akun';
              }
            } else {
              // KONDISI 1.5: Jika login berhasil, isFirstLogin === false, tapi punya callbackUrl undangan join, arahkan ke join
              if (callbackUrl && callbackUrl.includes('/mahasiswa/join?invite=')) {
                window.location.href = callbackUrl;
                return;
              }

              // KONDISI 2: Smart Redirect berdasarkan localStorage (Landing Page Memory)
              const targetMagang = localStorage.getItem('target_kkl');
              if (targetMagang) {
                try {
                  const parsedTarget = JSON.parse(targetMagang);
                  if (parsedTarget.mitra_id && parsedTarget.posisi_id) {
                    window.location.href = `/mahasiswa/pengajuan/detail?mitra_id=${parsedTarget.mitra_id}&posisi_id=${parsedTarget.posisi_id}`;
                    return;
                  }
                } catch(e) {
                  console.error('Data target_kkl tidak valid:', e);
                }
              }
              // KONDISI 3: Default landing point jika tidak ada memori
              window.location.href = '/mahasiswa';
            }
          }
          else if (session.user.role === 'dpl') window.location.href = '/dpl';
          else if (session.user.role === 'admin') window.location.href = '/admin';
          else if (session.user.role === 'mentor') window.location.href = '/mentor';
          else window.location.href = '/';
        } else {
          window.location.href = '/';
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Image from Landing Page */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/mantau_hero.png')" }}></div>
      <div className="absolute inset-0 bg-white/40 pointer-events-none z-0"></div> {/* Light overlay */}
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.8),_transparent_60%)] pointer-events-none z-0"></div>

      <div className="max-w-md w-full relative z-10 space-y-8 bg-white/30 backdrop-blur-2xl p-10 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/60">
        <div>
          <div className="text-center">
            <Link href="/" className="inline-block mb-2">
              <img src="/mk_gelap.png" alt="MANTAUKKLPLUS Logo" className="h-12 mx-auto drop-shadow-md" />
            </Link>
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900">
            Selamat Datang
          </h2>
          <p className="mt-2 text-center text-sm text-slate-700 font-medium">
            Masuk untuk memantau aktivitas KKL Plus Anda
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-600 p-4 rounded-xl text-sm text-center font-bold shadow-sm">
              {error}
            </div>
          )}
          
          <div className="bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 text-amber-800 p-4 rounded-xl text-sm mb-6 shadow-sm">
            <p className="text-sm font-medium leading-relaxed">
              <span className="font-bold mr-1">💡 Informasi:</span> 
              Gunakan ID / Username / NIM Anda untuk masuk. <strong>Password default adalah Nomor HP Anda</strong> (atau gunakan NIM/ID jika Nomor HP kosong). 
              Pastikan untuk segera memperbarui password setelah berhasil masuk.
            </p>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="email">Email / NIM / Username</label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                required
                className="appearance-none relative block w-full px-4 py-3.5 border border-slate-300 placeholder:text-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 sm:text-sm bg-white/70 backdrop-blur-md transition-all shadow-sm"
                placeholder="Masukkan Email atau NIM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-700" htmlFor="password">Password</label>
                <a href="#" className="text-xs font-bold text-teal-600 hover:text-[#0f7a85] transition-colors">Lupa password?</a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-4 py-3.5 border border-slate-300 placeholder:text-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 sm:text-sm bg-white/70 backdrop-blur-md transition-all pr-12 shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-teal-600 hover:bg-[#0f7a85] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 disabled:opacity-50 transition-all shadow-lg shadow-teal-600/30 hover:-translate-y-0.5"
            >
              {loading ? 'Memproses...' : 'Masuk ke Sistem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
