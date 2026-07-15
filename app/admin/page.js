"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "@/components/AuthProvider";
import Link from "next/link";
import { Users, Building, FileText, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard-stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch dashboard stats:", err);
        setLoading(false);
      });
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="h-32 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700 rounded-2xl" />
            <div className="h-32 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700 rounded-2xl" />
            <div className="h-32 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700 rounded-2xl" />
            <div className="h-32 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700 rounded-2xl" />
          </div>
        </div>
      );
    }

    if (!stats) return null;

    return (
      <div className="w-full space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-5 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm flex flex-col justify-center">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Mitra / Instansi</p>
            <p className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-2 drop-shadow-sm">{stats.totalMitra}</p>
          </div>

          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-5 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm flex flex-col justify-center">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Kelompok (POKJA)</p>
            <p className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-2 drop-shadow-sm">{stats.totalAjuan}</p>
          </div>

          <div className={`p-5 rounded-2xl border flex flex-col justify-center backdrop-blur-xl shadow-sm ${stats.antreanValidasi > 0 ? 'bg-amber-500/20 border-amber-400/50 dark:bg-amber-500/10 dark:border-amber-500/30' : 'bg-white/40 border-white/60 dark:bg-slate-800/40 dark:border-slate-700'}`}>
            <p className={`text-sm font-semibold ${stats.antreanValidasi > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'}`}>Antrean Validasi POKJA</p>
            <p className={`text-3xl font-black mt-2 drop-shadow-sm ${stats.antreanValidasi > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-800 dark:text-slate-100'}`}>{stats.antreanValidasi}</p>
          </div>

          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-5 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm flex flex-col justify-center">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">POKJA Berjalan / Disetujui</p>
            <p className="text-3xl font-black text-teal-600 dark:text-teal-400 mt-2 drop-shadow-sm">{stats.posisiTerisi}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Dashboard Admin" notifications={renderContent()}>
    </DashboardLayout>
  );
}
