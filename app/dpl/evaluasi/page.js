"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";
import { GraduationCap } from "lucide-react";

export default function DplEvaluasi() {
  const { data: session } = useSession();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/evaluasi?dplId=${session.user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) setStudents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const load = async () => {
      await fetchData();
    };
    load();
  }, [fetchData]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleSaveEvaluasi = async (id, rekSistem, mutlak, catatan) => {
    if (!mutlak || mutlak < 0 || mutlak > 100) {
      alert("Nilai mutlak harus antara 0 - 100");
      return;
    }
    
    try {
      const res = await fetch('/api/evaluasi', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          nilai_rekomendasi_sistem: rekSistem,
          nilai_akhir_mutlak: mutlak,
          catatan_evaluasi: catatan
        })
      });
      if (res.ok) {
        showToast("Nilai Akhir Berhasil Dikunci!");
        fetchData();
      } else {
        alert("Gagal menyimpan evaluasi");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    }
  };

  return (
    <DashboardLayout title="Evaluasi & Keputusan Pleno">
      {toastMessage && (
        <div className="fixed top-24 right-8 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-6 py-3 rounded-xl shadow-lg z-50 animate-in slide-in-from-right-10 fade-in duration-300 font-bold backdrop-blur-sm">
          {toastMessage}
        </div>
      )}

      <div className="bg-gradient-to-r from-slate-800 to-indigo-900 rounded-3xl p-8 text-slate-800 dark:text-slate-100 shadow-xl mb-8 border border-white/60 dark:border-slate-700">
        <h2 className="text-2xl font-black mb-2">Penilaian Akhir Mahasiswa</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-3xl">Tentukan Nilai Akhir Mutlak bagi mahasiswa bimbingan Anda. Nilai Rekomendasi Sistem dihasilkan secara otomatis dari rata-rata validasi logbook harian, namun Anda dan Mentor memiliki hak penuh untuk menetapkan nilai akhir berdasarkan pleno.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400 font-bold animate-pulse">Memuat data evaluasi mahasiswa...</div>
      ) : students.length === 0 ? (
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm p-12 rounded-3xl border border-white/60 dark:border-slate-700 text-center">
          <div className="text-5xl mb-4"><GraduationCap className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /></div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Belum Ada Mahasiswa</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Tidak ada mahasiswa bimbingan yang siap dievaluasi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {students.map(mhs => {
            return <StudentEvaluasiCard key={mhs._id} mhs={mhs} onSave={handleSaveEvaluasi} />;
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

function StudentEvaluasiCard({ mhs, onSave }) {
  const [nilaiMutlak, setNilaiMutlak] = useState(mhs.nilai_akhir_mutlak || "");
  const [catatan, setCatatan] = useState(mhs.catatan_evaluasi || "");
  const isLocked = mhs.nilai_akhir_mutlak !== undefined && mhs.nilai_akhir_mutlak !== null;

  return (
    <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm rounded-3xl border border-white/60 dark:border-slate-700 overflow-hidden flex flex-col relative">
      {isLocked && (
        <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-4 py-1.5 rounded-bl-xl z-10 flex items-center gap-1 border-b border-l border-emerald-500/30">
          <span>🔒 NILAI TERKUNCI</span>
        </div>
      )}
      
      <div className="p-6 border-b border-white/60 dark:border-slate-700 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xl shrink-0">
          {mhs.mahasiswa_id?.nama_lengkap.charAt(0)}
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">{mhs.mahasiswa_id?.nama_lengkap}</h3>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{mhs.mahasiswa_id?.nim_nidn}</p>
          <div className="mt-2 text-xs font-bold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full w-max border border-indigo-500/30">
            {mhs.detail_tempat?.nama}
          </div>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Kiri: Rekomendasi */}
        <div className="flex-1 space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 text-center h-full flex flex-col justify-center">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Nilai Rekomendasi Sistem</p>
            <div className="text-5xl font-black text-blue-300 mb-1">{mhs.computed_rekomendasi}</div>
            <p className="text-xs font-medium text-blue-400">Dari {mhs.logbook_count} Logbook Tervalidasi</p>
          </div>
        </div>
        
        {/* Kanan: Form Keputusan */}
        <div className="flex-[1.5]">
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Nilai Akhir Mutlak (0-100)</label>
          <input 
            type="number" 
            value={nilaiMutlak} 
            onChange={(e) => setNilaiMutlak(e.target.value)} 
            disabled={isLocked}
            className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-indigo-500 bg-slate-50 dark:bg-slate-800/80 font-black text-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-500 disabled:bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl disabled:text-slate-500 disabled:border-white/50 dark:border-slate-600" 
            placeholder="Misal: 88" 
            min="0" max="100"
          />
          
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mt-4 mb-2">Catatan Evaluasi / Pleno</label>
          <textarea 
            value={catatan} 
            onChange={(e) => setCatatan(e.target.value)} 
            disabled={isLocked}
            rows="2" 
            className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-indigo-500 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-500 disabled:bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl disabled:text-slate-500 disabled:border-white/50 dark:border-slate-600" 
            placeholder="Catatan kelebihan, kekurangan, atau evaluasi akhir..."
          ></textarea>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border-t border-white/50 dark:border-slate-600 flex justify-end">
        {!isLocked && (
          <button 
            onClick={() => onSave(mhs._id, mhs.computed_rekomendasi, parseInt(nilaiMutlak), catatan)}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-slate-800 dark:text-slate-100 font-bold text-sm rounded-xl shadow-md transition-all"
          >
            Kunci Nilai Akhir
          </button>
        )}
      </div>
    </div>
  );
}
