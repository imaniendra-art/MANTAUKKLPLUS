"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, ShieldCheck, Info, Loader2, CalendarCheck, MapPin, Users } from "lucide-react";
import { useParams } from "next/navigation";

export default function LaporanVerificationPage() {
  const params = useParams();
  const id = params?.id;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/verify/${id}`);
        const result = await res.json();
        
        if (!res.ok || !result.valid) {
          setError(result.error || "Dokumen tidak ditemukan atau tidak valid");
        } else {
          setData(result.dokumen);
        }
      } catch (err) {
        setError("Terjadi kesalahan jaringan.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="font-medium animate-pulse">Memverifikasi dokumen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-amber-100 dark:border-amber-900/30">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Verifikasi Gagal</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <p className="text-sm text-slate-400">Pastikan Anda memindai QR Code langsung dari dokumen resmi yang dikeluarkan oleh sistem MANTAU.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-teal-500/30 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-amber-600 flex items-center justify-center text-white font-black text-lg">
              K
            </div>
            <span className="font-bold text-slate-800 dark:text-white tracking-tight">KKL<span className="text-[#D4AF37]">Plus</span></span>
          </div>
          <span className="text-xs font-bold text-teal-600 bg-teal-50 dark:bg-teal-900/30 dark:text-teal-400 px-3 py-1.5 rounded-full border border-teal-100 dark:border-teal-800">
            Pusat Verifikasi
          </span>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 pt-12 pb-12">
        <div className="text-center mb-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="w-24 h-24 bg-teal-100 dark:bg-teal-900/30 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(20,184,166,0.3)]">
            <ShieldCheck className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">DOKUMEN SAH</h1>
          <p className="text-teal-600 dark:text-teal-400 font-bold uppercase tracking-widest text-sm">
            Terverifikasi Sistem
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-6 sm:p-8 animate-in zoom-in-95 duration-500 delay-100">
          <div className="space-y-6">
            
            <div className="flex items-start gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Peserta / Kelompok</p>
                <p className="font-bold text-lg text-slate-800 dark:text-slate-100">
                  {data?.nama_mahasiswa}
                </p>
                <p className="text-slate-500 text-sm">{data?.nim !== '-' ? `NIM: ${data?.nim}` : 'Laporan Kelompok (Pokja)'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-[#6B21A8]/10 text-[#6B21A8] dark:text-[#d8b4fe] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Instansi Mitra</p>
                <p className="font-bold text-lg text-slate-800 dark:text-slate-100">
                  {data?.mitra}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center shrink-0">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Disahkan Pada</p>
                <p className="font-bold text-slate-800 dark:text-slate-100">
                  {data?.terbit_pada ? new Date(data.terbit_pada).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                </p>
              </div>
            </div>

          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              Laporan Akhir ini merupakan dokumen resmi yang diterbitkan oleh sistem <strong>MANTAU STIMI YAPMI Makassar</strong>. Keabsahan tanda tangan secara digital telah direkam dalam basis data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
