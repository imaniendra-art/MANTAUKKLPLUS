"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function BursaMitra() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [pokja, setPokja] = useState(null);
  const [mitras, setMitras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [resPokja, resMitra] = await Promise.all([
          fetch(`/api/pokja?mhsId=${session.user.id}`),
          fetch(`/api/mitra`)
        ]);
        setPokja(await resPokja.json());
        setMitras(await resMitra.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (session?.user?.id) fetchInit();
  }, [session]);

  const handleSelectMitra = async (mitraId) => {
    if (!pokja || !pokja._id) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/pokja', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pokja._id,
          mitra_id: mitraId,
          status_pokja: 'menunggu_persetujuan_lppm' // Jika mitra dipilih, ajukan ke LPPM
        })
      });
      if (res.ok) {
        alert("Mitra berhasil dipilih dan diajukan ke LPPM!");
        router.push('/mahasiswa');
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan lokasi mitra.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout title="Bursa Mitra"><div className="p-10 text-center animate-pulse">Memuat data mitra...</div></DashboardLayout>;

  return (
    <DashboardLayout title="Pilih Lokasi Mitra KKL Plus">
      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/60 dark:border-slate-700 mb-6">
        <h2 className="text-xl font-bold mb-2">Bursa Lokasi KKL Plus</h2>
        <p className="text-slate-500">Pilih tempat atau instansi di mana POKJA Anda akan melaksanakan program kerja. Memilih mitra akan langsung mengajukan POKJA ke LPPM untuk validasi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mitras.map(mitra => (
          <div key={mitra._id} className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/60 dark:border-slate-700 hover:shadow-lg transition-shadow flex flex-col">
            <div className="flex-1">
              <h3 className="font-black text-lg text-slate-800 dark:text-white mb-2">{mitra.nama_instansi}</h3>
              <p className="text-sm text-slate-500 mb-4">{mitra.alamat}</p>
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl mb-4 border border-indigo-100 dark:border-indigo-800/50">
                <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Deskripsi/Profil:</p>
                <p className="text-sm text-indigo-900 dark:text-indigo-100 mt-1 line-clamp-3">{mitra.profil_perusahaan || '-'}</p>
              </div>
            </div>
            
            <button 
              disabled={submitting}
              onClick={() => handleSelectMitra(mitra._id)}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 mt-4"
            >
              {submitting ? 'Memproses...' : 'Pilih & Ajukan ke LPPM'}
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
