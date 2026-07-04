"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function GantiPassword() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      return setError('Password baru dan konfirmasi password tidak cocok.');
    }

    if (newPassword.length < 6) {
      return setError('Password baru minimal 6 karakter.');
    }

    setLoading(true);

    try {
      const res = await fetch('/api/mahasiswa/ganti-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Terjadi kesalahan.');
      }

      setSuccess('Password berhasil diubah. Anda akan diarahkan untuk login ulang...');
      
      // Logout after 2 seconds to refresh token
      setTimeout(async () => {
        await signOut({ redirect: false });
        router.push('/login');
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 p-4 rounded-xl text-sm mb-6">
        <span className="font-bold">Keamanan Akun:</span> Anda menggunakan password default. Silakan perbarui password Anda terlebih dahulu untuk melanjutkan penggunaan aplikasi.
      </div>

      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-sm border border-white/60 dark:border-slate-700 p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Ganti Password</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-xl text-sm mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Password Saat Ini (Default NIM)
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 border border-white/60 dark:border-slate-700 rounded-xl bg-white/20 dark:bg-slate-900/20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Masukkan password saat ini"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Password Baru
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-white/60 dark:border-slate-700 rounded-xl bg-white/20 dark:bg-slate-900/20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Masukkan password baru"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-white/60 dark:border-slate-700 rounded-xl bg-white/20 dark:bg-slate-900/20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ulangi password baru"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
