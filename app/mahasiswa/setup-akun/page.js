"use client";

import { useState, useEffect, Suspense } from 'react';
import { signOut } from 'next-auth/react';
import { Eye, EyeOff } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function SetupAkunContent() {
  const searchParams = useSearchParams();
  const inviteId = searchParams.get('invite');

  const [peranKelompok, setPeranKelompok] = useState(inviteId ? 'anggota' : 'ketua'); // 'ketua' atau 'anggota'
  const [namaKelompok, setNamaKelompok] = useState('');
  const [pokjaId, setPokjaId] = useState(inviteId || '');
  const [availablePokjas, setAvailablePokjas] = useState([]);
  const [nomorHp, setNomorHp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Fetch available pokjas when component mounts or when role changes to anggota
    if (peranKelompok === 'anggota') {
      fetch('/api/pokja/available')
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            setAvailablePokjas(data.data);
            if (inviteId && data.data.some(p => p._id === inviteId)) {
              setPokjaId(inviteId);
            }
          }
        })
        .catch(err => console.error("Gagal mengambil data kelompok:", err));
    }
  }, [peranKelompok, inviteId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!nomorHp || !password) {
      return setError('Nomor HP dan Password wajib diisi.');
    }

    if (peranKelompok === 'ketua' && !namaKelompok) {
      return setError('Nama Kelompok wajib diisi.');
    }
    
    if (peranKelompok === 'ketua' && !namaKelompok.toLowerCase().includes('manajemen')) {
      // Hanya himbauan, tapi kita bisa menampilkannya jika tidak ada sama sekali.
      // Sesuai konfirmasi, sekadar imbauan UI, jadi tidak di-block di backend, tapi kita bisa biarkan lewat.
      // Jika butuh sekadar notif:
      console.warn("Disarankan menggunakan kata 'manajemen'");
    }

    if (peranKelompok === 'anggota' && !pokjaId) {
      return setError('Silakan pilih kelompok yang ingin diikuti.');
    }

    if (password.length < 6) {
      return setError('Password baru minimal 6 karakter.');
    }

    setLoading(true);

    try {
      const res = await fetch('/api/mahasiswa/setup-akun', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          peran: peranKelompok, 
          namaKelompok, 
          pokjaId, 
          nomor_hp: nomorHp, 
          newPassword: password 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Terjadi kesalahan.');
      }

      setSuccess('Profil dan kelompok berhasil disimpan. Mengalihkan ke halaman login...');
      
      // Logout secara bersih menggunakan callbackUrl NextAuth
      setTimeout(async () => {
        await signOut({ callbackUrl: '/login' });
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 dark:border-slate-700 w-full max-w-lg overflow-hidden">
        <div className="bg-[#1398A5] p-6 text-white text-center">
          <h2 className="text-2xl font-bold tracking-tight">Setup Akun Mahasiswa</h2>
          <p className="text-sm text-teal-100 mt-2">Pilih Kelompok Kerja (Pokja) dan lengkapi profil Anda</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6 font-medium">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm mb-6 font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Peran dalam Kelompok KKL
              </label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center p-3 border rounded-xl transition-all ${peranKelompok === 'ketua' ? 'border-[#1398A5] bg-teal-50 dark:bg-teal-900/20 text-[#1398A5] font-bold' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'} ${inviteId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input type="radio" name="peran" value="ketua" disabled={!!inviteId} checked={peranKelompok === 'ketua'} onChange={() => setPeranKelompok('ketua')} className="hidden" />
                  Ketua Kelompok
                </label>
                <label className={`flex-1 flex items-center justify-center p-3 border rounded-xl transition-all ${peranKelompok === 'anggota' ? 'border-[#1398A5] bg-teal-50 dark:bg-teal-900/20 text-[#1398A5] font-bold' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'} ${inviteId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input type="radio" name="peran" value="anggota" disabled={!!inviteId} checked={peranKelompok === 'anggota'} onChange={() => setPeranKelompok('anggota')} className="hidden" />
                  Anggota
                </label>
              </div>
            </div>

            {peranKelompok === 'ketua' ? (
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Nama Kelompok Baru
                </label>
                <input
                  type="text"
                  required
                  value={namaKelompok}
                  onChange={(e) => setNamaKelompok(e.target.value)}
                  className="w-full px-4 py-3 border border-white/60 dark:border-slate-700 rounded-xl bg-white/20 dark:bg-slate-900/20 focus:ring-2 focus:ring-[#1398A5] focus:border-[#1398A5] text-slate-900 dark:text-white"
                  placeholder="Contoh: Manajemen Hebat"
                />
                <p className="text-xs text-slate-500 mt-2">ℹ️ Disarankan untuk menyertakan kata "Manajemen" pada nama kelompok Anda.</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Pilih Kelompok (Dibuat oleh Ketua)
                </label>
                {availablePokjas.length > 0 ? (
                  <select
                    required
                    disabled={!!inviteId}
                    value={pokjaId}
                    onChange={(e) => setPokjaId(e.target.value)}
                    className="w-full px-4 py-3 border border-white/60 dark:border-slate-700 rounded-xl bg-white/20 dark:bg-slate-900/20 focus:ring-2 focus:ring-[#1398A5] focus:border-[#1398A5] text-slate-900 dark:text-white appearance-none disabled:opacity-75 disabled:bg-slate-100"
                  >
                    <option value="" disabled>-- Pilih Kelompok Anda --</option>
                    {availablePokjas.map(p => {
                      const totalMembers = p.jumlah_anggota + 1; // 1 for Ketua
                      const isFull = p.jumlah_anggota >= 4;
                      return (
                        <option key={p._id} value={p._id} disabled={isFull && p._id !== inviteId}>
                          {p.nama_pokja} (Ketua: {p.ketua_nama}) - {isFull ? 'Penuh (5/5)' : `${totalMembers}/5 Orang`}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <div className="p-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm">
                    Belum ada kelompok yang tersedia. Minta ketua kelompok Anda untuk mendaftar terlebih dahulu.
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Nomor HP / WhatsApp
              </label>
              <input
                type="text"
                required
                value={nomorHp}
                onChange={(e) => setNomorHp(e.target.value)}
                className="w-full px-4 py-3 border border-white/60 dark:border-slate-700 rounded-xl bg-white/20 dark:bg-slate-900/20 focus:ring-2 focus:ring-[#1398A5] focus:border-[#1398A5] text-slate-900 dark:text-white"
                placeholder="Contoh: 081234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-white/60 dark:border-slate-700 rounded-xl bg-white/20 dark:bg-slate-900/20 focus:ring-2 focus:ring-[#1398A5] focus:border-[#1398A5] text-slate-900 dark:text-white pr-12"
                  placeholder="Masukkan password baru yang aman"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="pt-4 shrink-0 space-y-3">
              <button
                type="submit"
                disabled={loading || success || (peranKelompok === 'anggota' && availablePokjas.length === 0)}
                className="w-full py-3.5 bg-[#1398A5] hover:bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 transition-all disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : 'Simpan & Login Ulang'}
              </button>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/login' })}
                disabled={loading || success}
                className="w-full py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all disabled:opacity-50"
              >
                Batal & Ganti Akun
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SetupAkun() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4">Memuat...</div>}>
      <SetupAkunContent />
    </Suspense>
  );
}
