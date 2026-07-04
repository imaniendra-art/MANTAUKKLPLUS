"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";
import { Check, FileSignature, GraduationCap } from "lucide-react";

export default function DPLDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ totalMhs: 0, pendingValidasi: 0, pendingEvaluasi: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      Promise.all([
        fetch(`/api/logbook?role=dpl&userId=${session.user.id}`).then(r => r.json()).catch(() => []),
        fetch(`/api/evaluasi?dplId=${session.user.id}`).then(r => r.json()).catch(() => []),
      ]).then(([logbooks, students]) => {
        setStats({
          totalMhs: Array.isArray(students) ? students.length : 0,
          pendingValidasi: Array.isArray(logbooks) ? logbooks.filter(l => l.status_validasi === 'menunggu_mentor').length : 0,
          pendingEvaluasi: Array.isArray(students) ? students.filter(s => !s.nilai_akhir_mutlak).length : 0,
        });
        setLoading(false);
      });
    }
  }, [session]);

  const notificationCards = loading ? (
    <>
      <div className="h-32 bg-[#0F172A]/15 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm dark:shadow-none rounded-2xl animate-pulse border border-white/50 dark:border-slate-600" />
      <div className="h-32 bg-[#0F172A]/15 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm dark:shadow-none rounded-2xl animate-pulse border border-white/50 dark:border-slate-600" />
    </>
  ) : (
    <>
      {/* Password Change Alert */}
      {session?.user?.isFirstLogin && (
        <div className="bg-[#0F172A]/15 dark:bg-slate-800/40 backdrop-blur-xl p-5 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 flex items-start gap-4 shadow-sm dark:shadow-none mb-6 transition-all hover:shadow-md">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center text-xl shrink-0">
            ⚠️
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100">Keamanan Akun</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Anda masih menggunakan password default. Demi keamanan, silakan segera ubah password Anda dengan mengklik menu pengguna di pojok kanan atas lalu pilih <strong>Pengaturan Profil</strong>.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mahasiswa Bimbingan */}
        <div className="bg-[#0F172A]/15 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm dark:shadow-none p-6 rounded-2xl border border-white/60 dark:border-slate-700 flex items-center gap-5 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center text-2xl shrink-0">
            👨‍<GraduationCap className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Mahasiswa Bimbingan</p>
            <p className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">{stats.totalMhs}</p>
          </div>
        </div>

        {/* Pending Validasi */}
        {stats.pendingValidasi > 0 ? (
          <div className="relative bg-[#0F172A]/15 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm dark:shadow-none p-6 rounded-2xl border border-blue-400/30 flex items-center gap-5 overflow-hidden transition-all hover:shadow-md">
            <div className="absolute -right-2 -bottom-2 text-7xl opacity-[0.06] pointer-events-none"><FileSignature className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /></div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20 flex items-center justify-center text-2xl shrink-0">
              ✍️
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-blue-500 dark:text-blue-400">Logbook Menunggu</p>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">{stats.pendingValidasi} <span className="text-base font-semibold text-slate-500 dark:text-slate-400">entri</span></p>
            </div>
          </div>
        ) : (
          <div className="bg-[#0F172A]/15 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm dark:shadow-none p-6 rounded-2xl border border-white/60 dark:border-slate-700 flex items-center gap-5 transition-all hover:shadow-md">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center text-2xl shrink-0">
              <Check className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Validasi Logbook</p>
              <p className="text-lg font-bold text-emerald-500 dark:text-emerald-400 mt-1">Semua tervalidasi</p>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <DashboardLayout title="Dashboard DPL" notifications={notificationCards}>
      {/* Children kosong — semua konten di hero + notif + menu cards */}
    </DashboardLayout>
  );
}
