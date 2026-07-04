"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";

export default function RancanganProker() {
  const { data: session } = useSession();
  const [pokja, setPokja] = useState(null);
  const [prokers, setProkers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    nama_proker: "",
    deskripsi: "",
    target_capaian: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const resPokja = await fetch(`/api/pokja?mhsId=${session.user.id}`);
        const dataPokja = await resPokja.json();
        setPokja(dataPokja);

        if (dataPokja && !dataPokja.error) {
          const resProker = await fetch(`/api/proker?pokjaId=${dataPokja._id}`);
          setProkers(await resProker.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (session?.user?.id) fetchInit();
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pokja || !pokja._id) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/proker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pokja_id: pokja._id,
          ...formData
        })
      });
      if (res.ok) {
        setFormData({ nama_proker: "", deskripsi: "", target_capaian: "" });
        const resProker = await fetch(`/api/proker?pokjaId=${pokja._id}`);
        setProkers(await resProker.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout title="Rancangan Proker"><div className="p-10 text-center animate-pulse">Memuat...</div></DashboardLayout>;

  return (
    <DashboardLayout title="Rancangan Program Kerja (Proker)">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Form Tambah Proker */}
        <div className="flex-1 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/60 dark:border-slate-700 h-fit">
          <h2 className="text-xl font-bold mb-4">Buat Program Kerja Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nama Program Kerja</label>
              <input 
                required
                type="text" 
                value={formData.nama_proker}
                onChange={(e) => setFormData({...formData, nama_proker: e.target.value})}
                placeholder="Misal: Pembuatan Sistem Inventory"
                className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/20"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Deskripsi Kegiatan</label>
              <textarea 
                required
                rows={3}
                value={formData.deskripsi}
                onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/20"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Target Capaian</label>
              <textarea 
                required
                rows={2}
                value={formData.target_capaian}
                onChange={(e) => setFormData({...formData, target_capaian: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/20"
              />
            </div>
            <button 
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Tambahkan Proker'}
            </button>
          </form>
        </div>

        {/* Daftar Proker */}
        <div className="flex-1 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/60 dark:border-slate-700">
          <h2 className="text-xl font-bold mb-4">Daftar Proker POKJA</h2>
          {prokers.length === 0 ? (
            <div className="text-center p-6 text-slate-500 bg-white/20 dark:bg-slate-900/20 rounded-xl border border-dashed border-white/60 dark:border-slate-700">
              Belum ada program kerja yang dirancang.
            </div>
          ) : (
            <div className="space-y-4">
              {prokers.map((p, idx) => (
                <div key={p._id} className="p-4 bg-white/20 dark:bg-slate-900/20 rounded-xl border border-white/60 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">{idx + 1}</span>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{p.nama_proker}</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 ml-11">{p.deskripsi}</p>
                  <div className="ml-11 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 mb-1">🎯 Target Capaian:</p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">{p.target_capaian}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
