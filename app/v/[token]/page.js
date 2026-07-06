"use client";

import React, { useState, useEffect } from "react";
import { Check, Calendar, Activity, Info, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

export default function MagicLinkValidasi() {
  const params = useParams();
  const token = params?.token;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/magic-link?token=${token}`);
        const result = await res.json();
        
        if (!res.ok) {
          setError(result.error || "Gagal memuat data");
        } else {
          setData(result);
        }
      } catch (err) {
        setError("Terjadi kesalahan jaringan.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleSetuju = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/magic-link', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const result = await res.json();
        setError(result.error || "Gagal menyimpan persetujuan.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="font-medium animate-pulse">Menyiapkan dokumen validasi...</p>
        </div>
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-rose-100 dark:border-rose-900/30">
          <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Tautan Tidak Valid</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <p className="text-sm text-slate-400">Silakan hubungi DPL atau mahasiswa untuk meminta tautan baru.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-emerald-100 dark:border-emerald-900/30 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-3">Terima Kasih, Bapak/Ibu!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">Anda telah berhasil menyetujui seluruh kegiatan KKL Plus mahasiswa untuk periode ini.</p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 py-3 px-4 rounded-xl">Anda kini dapat menutup halaman ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-500/30 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-amber-600 flex items-center justify-center text-white font-black text-lg">
              K
            </div>
            <span className="font-bold text-slate-800 dark:text-white tracking-tight">KKL<span className="text-[#D4AF37]">Plus</span></span>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800">
            Akses Publik
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">Validasi Kegiatan Mahasiswa</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Dosen Pembimbing Lapangan (<strong>{data.dpl_id?.nama_lengkap}</strong>) telah mengkurasi laporan kegiatan mahasiswa yang ditempatkan di desa Anda. Mohon kesediaannya untuk mereview dan menyetujui daftar di bawah ini.
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 sm:p-6 mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lokasi KKL Plus</p>
            <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>📍</span> Desa {data.pokja_id?.desa_kelurahan}, Kec. {data.pokja_id?.kecamatan}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Kegiatan</p>
            <p className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">
              {data.logbook_ids?.length || 0} Laporan
            </p>
          </div>
        </div>

        {/* Logbook List */}
        <div className="space-y-4 mb-12">
          {data.logbook_ids?.map((log, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">
                    🧑‍🎓
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{log.mahasiswa_id?.nama_lengkap}</p>
                    <p className="text-xs text-slate-500">{log.mahasiswa_id?.nim_nidn}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg w-fit">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(log.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
              </div>
              
              <div className="space-y-3">
                {log.proker_id && (
                  <div className="flex gap-2 text-sm">
                    <span className="font-bold text-slate-700 dark:text-slate-300 min-w-[80px]">Proker:</span>
                    <span className="text-slate-600 dark:text-slate-400">{log.proker_id.judul_proker}</span>
                  </div>
                )}
                <div className="flex gap-2 text-sm">
                  <span className="font-bold text-slate-700 dark:text-slate-300 min-w-[80px]">Rencana:</span>
                  <span className="text-slate-600 dark:text-slate-400 leading-relaxed">{log.rencana_target}</span>
                </div>
                <div className="flex gap-2 text-sm bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300 min-w-[80px]">Uraian:</span>
                  <span className="text-slate-600 dark:text-slate-400 leading-relaxed">{log.uraian_kegiatan}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="font-bold text-slate-700 dark:text-slate-300 min-w-[80px]">Hasil:</span>
                  <span className="text-emerald-600 dark:text-emerald-500 font-medium leading-relaxed">{log.hasil_output}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-4 sm:p-5 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
            Dengan menyetujui, Anda memvalidasi bahwa kegiatan di atas benar-benar dilakukan.
          </p>
          <button 
            onClick={handleSetuju}
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#D4AF37] hover:bg-[#c4a130] text-white font-black text-sm rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            {submitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
            ) : (
              <><Check className="w-5 h-5" /> Saya Setuju</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
