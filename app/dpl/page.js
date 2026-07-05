"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";
import { Check, FileSignature, GraduationCap } from "lucide-react";

export default function DPLDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ totalPokja: 0, pokjaBerjalan: 0 });
  const [pendingPokjas, setPendingPokjas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/pokja?dplId=${session.user.id}`)
        .then(r => r.json())
        .then(pokjasList => {
          if (Array.isArray(pokjasList)) {
            setStats({
              totalPokja: pokjasList.length,
              pokjaBerjalan: pokjasList.filter(p => p.status_pokja === 'berjalan' || p.status_pokja === 'selesai').length
            });
            setPendingPokjas(pokjasList.filter(p => p.status_pokja === 'disetujui_lppm'));
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  const handleApprovePokja = async (pokjaId) => {
    try {
      const res = await fetch('/api/pokja', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pokjaId, status_pokja: 'berjalan' })
      });
      if (res.ok) {
        setPendingPokjas(prev => prev.filter(p => p._id !== pokjaId));
        alert("Kelompok Kerja berhasil disetujui dan kini berstatus Berjalan.");
      } else {
        alert("Gagal menyetujui POKJA.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem.");
    }
  };

  const hasNotifications = session?.user?.isFirstLogin || pendingPokjas.length > 0;

  const dashboardContent = loading ? (
    <>
      <div className="h-32 bg-[#0F172A]/15 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm rounded-3xl animate-pulse border border-white/50 dark:border-slate-600" />
      <div className="h-32 bg-[#0F172A]/15 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm rounded-3xl animate-pulse border border-white/50 dark:border-slate-600" />
    </>
  ) : (
    <div className="space-y-8">
      
      {/* 1. Grid 2 Card Stats (Di atas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Kelompok */}
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm p-6 rounded-3xl border border-white/60 dark:border-slate-700 flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-1">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center text-3xl shrink-0">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Kelompok Bimbingan</p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mt-1">{stats.totalPokja}</p>
          </div>
        </div>

        {/* Kelompok Aktif */}
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm p-6 rounded-3xl border border-white/60 dark:border-slate-700 flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-1">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center text-3xl shrink-0">
            <Check className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Kelompok Aktif (Berjalan)</p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mt-1">{stats.pokjaBerjalan}</p>
          </div>
        </div>
      </div>

      {/* 2. Pusat Notifikasi (Satu Card Utama) */}
      {hasNotifications && (
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 dark:border-slate-700 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3 mb-6">
            <span className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">🔔</span>
            Pusat Notifikasi
          </h3>
          
          <div className="space-y-4">
            {/* Notifikasi Keamanan */}
            {session?.user?.isFirstLogin && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl transition-all hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center text-2xl shrink-0">⚠️</div>
                  <div>
                    <h4 className="font-bold text-amber-900 dark:text-amber-400 text-lg">Keamanan Akun</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">Anda masih menggunakan password default. Segera ganti demi keamanan!</p>
                  </div>
                </div>
                <button 
                  onClick={() => window.location.href = '/profil'}
                  className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-sm shadow-amber-500/20 transition-all shrink-0 whitespace-nowrap"
                >
                  Pengaturan Akun
                </button>
              </div>
            )}

            {/* Notifikasi Pending Pokja */}
            {pendingPokjas.map(pokja => (
              <div key={pokja._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl transition-all hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-2xl shrink-0">⏳</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-800 dark:text-white text-lg">{pokja.nama_pokja}</h4>
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-[10px] uppercase tracking-wider font-bold rounded-md">KKL Plus</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Menunggu persetujuan Anda. Ketua: <strong>{pokja.ketua_id?.nama_lengkap}</strong> | Lokasi: <strong>{pokja.mitra_id?.nama_instansi}</strong>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleApprovePokja(pokja._id)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-sm shadow-emerald-500/20 transition-all shrink-0 whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Setujui
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout title="Dashboard DPL" notifications={dashboardContent}>
    </DashboardLayout>
  );
}
