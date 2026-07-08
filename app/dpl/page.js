"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";
import { Check, FileSignature, GraduationCap, Briefcase, Bell, AlertTriangle, Clock, FileEdit, FileText } from "lucide-react";

export default function DPLDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ prokerMenungguValidasi: 0, pokjaBelumIA: 0, laporanMenungguValidasi: 0 });
  const [pendingPokjas, setPendingPokjas] = useState([]);
  const [activePokjas, setActivePokjas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      Promise.all([
        fetch(`/api/pokja?dplId=${session.user.id}`).then(r => r.json()),
        fetch(`/api/logbook?role=dpl&userId=${session.user.id}`).then(r => r.json()),
        fetch(`/api/laporan-akhir?role=dpl&dplId=${session.user.id}`).then(r => r.json())
      ]).then(([pokjasList, logs, laporans]) => {
        let pokjaBelumIA = 0;
        let prokerMenungguValidasi = 0;
        let laporanMenungguValidasi = 0;

        if (Array.isArray(pokjasList)) {
          const activeList = pokjasList.filter(p => p.status_pokja === 'berjalan' || p.status_pokja === 'selesai');
          pokjaBelumIA = activeList.filter(p => p.mitra_id?.status_kerjasama !== 'Implementation Arrangement (IA)').length;
          setPendingPokjas(pokjasList.filter(p => p.status_pokja === 'disetujui_lppm'));
          setActivePokjas(activeList);
        }

        if (Array.isArray(logs)) {
          prokerMenungguValidasi = logs.filter(l => l.status_validasi === 'menunggu_dpl').length;
        }

        if (Array.isArray(laporans)) {
          laporanMenungguValidasi = laporans.filter(l => l.status === 'submitted').length;
        }

        setStats({ prokerMenungguValidasi, pokjaBelumIA, laporanMenungguValidasi });
        setLoading(false);
      }).catch((err) => {
        console.error(err);
        setLoading(false);
      });
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

  const hasNotifications = session?.user?.isFirstLogin || pendingPokjas.length > 0 || stats.prokerMenungguValidasi > 0 || stats.pokjaBelumIA > 0;

  const dashboardContent = loading ? (
    <>
      <div className="h-32 bg-[#0F172A]/15 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm rounded-3xl animate-pulse border border-white/50 dark:border-slate-600" />
      <div className="h-32 bg-[#0F172A]/15 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm rounded-3xl animate-pulse border border-white/50 dark:border-slate-600" />
    </>
  ) : (
    <div className="space-y-8">
      
      {/* Top Cards Removed as requested */}

      {/* 2. Pusat Notifikasi (Satu Card Utama) */}
      {hasNotifications && (
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 dark:border-slate-700 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3 mb-6">
            <span className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Bell className="w-5 h-5" />
            </span>
            Pusat Notifikasi
          </h3>
          
          <div className="space-y-4">
            {/* Notifikasi Keamanan */}
            {session?.user?.isFirstLogin && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl transition-all hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
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
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
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
                  onClick={() => window.location.href = '/dpl/bimbingan'}
                  className="w-full sm:w-auto px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-sm shadow-indigo-500/20 transition-all shrink-0 whitespace-nowrap flex items-center justify-center gap-2"
                >
                  Lakukan Penyerahan
                </button>
              </div>
            ))}

            {/* Notifikasi Logbook */}
            {stats.prokerMenungguValidasi > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl transition-all hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <FileEdit className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-800 dark:text-white text-lg">Validasi Logbook Mingguan</h4>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Terdapat <strong>{stats.prokerMenungguValidasi}</strong> catatan logbook kegiatan mahasiswa yang menunggu divalidasi oleh Anda minggu ini.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => window.location.href = '/dpl/validasi'}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-sm transition-all shrink-0 whitespace-nowrap"
                >
                  Validasi Sekarang
                </button>
              </div>
            )}

            {/* Notifikasi Laporan Akhir */}
            {stats.laporanMenungguValidasi > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl transition-all hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                    <FileSignature className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-800 dark:text-white text-lg">Validasi Laporan Akhir</h4>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Terdapat <strong>{stats.laporanMenungguValidasi}</strong> Laporan Akhir (Individu/Kelompok) yang telah diajukan dan menunggu validasi Anda.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => window.location.href = '/dpl/validasi-laporan'}
                  className="w-full sm:w-auto px-6 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl shadow-sm transition-all shrink-0 whitespace-nowrap"
                >
                  Periksa Laporan
                </button>
              </div>
            )}

            {/* Notifikasi Dokumen Legal */}
            {activePokjas.filter(p => p.mitra_id?.status_kerjasama !== 'Implementation Arrangement (IA)').map(pokja => {
              const status = pokja.mitra_id?.status_kerjasama || 'Belum Ada';
              let suggestion = '';
              if (status === 'Belum Ada' || status === 'Proses Penjajakan (Siap MoU)') {
                suggestion = 'Status belum ada/proses. Sarankan untuk melaksanakan MoU pada kunjungan pertama, MoA pada kunjungan kedua, dan IA pada kunjungan ketiga.';
              } else if (status === 'Memorandum of Understanding (MoU)') {
                suggestion = 'Dokumen saat ini baru MoU. Sarankan untuk melaksanakan MoA dan IA pada agenda kunjungan Anda berikutnya.';
              } else if (status === 'Memorandum of Agreement (MoA)') {
                suggestion = 'Dokumen saat ini adalah MoA. Sarankan untuk melengkapinya menjadi Implementation Arrangement (IA) sebagai wujud teknis program.';
              }

              return (
                <div key={`legal-${pokja._id}`} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl transition-all hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-800 dark:text-white text-lg">{pokja.nama_pokja}</h4>
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 text-[10px] uppercase tracking-wider font-bold rounded-md">Status Legal: {status}</span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {suggestion}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.location.href = '/dpl/bimbingan'}
                    className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 font-bold rounded-xl shadow-sm transition-all shrink-0 whitespace-nowrap"
                  >
                    Detail Mitra
                  </button>
                </div>
              );
            })}
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
