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
  const [isKetua, setIsKetua] = useState(false);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [resPokja, resMitra] = await Promise.all([
          fetch(`/api/pokja?mhsId=${session.user.id}`),
          fetch(`/api/mitra`)
        ]);
        const pokjaData = await resPokja.json();
        setPokja(pokjaData);
        setIsKetua(pokjaData?.ketua_id?._id === session.user.id || pokjaData?.ketua_id === session.user.id);
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
        <p className="text-slate-500 mb-4">Pilih tempat atau instansi di mana POKJA Anda akan melaksanakan program kerja. Memilih mitra akan langsung mengajukan POKJA ke LPPM untuk validasi.</p>
        
        {!isKetua && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg mb-4">
            <p className="text-sm font-bold text-orange-700">Perhatian</p>
            <p className="text-sm text-orange-600 mt-1">Anda terdaftar sebagai anggota POKJA. Hanya ketua kelompok yang dapat memilih dan mengajukan lokasi mitra.</p>
          </div>
        )}

        {isKetua && pokja?.mitra_id && ['menunggu_persetujuan_lppm', 'disetujui_lppm', 'berjalan', 'selesai'].includes(pokja?.status_pokja) && (
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
            <p className="text-sm font-bold text-indigo-700">Lokasi Sudah Diajukan</p>
            <p className="text-sm text-indigo-600 mt-1">Anda sudah mengajukan lokasi mitra. Anda tidak dapat memilih lokasi lain kecuali ajuan sebelumnya ditolak oleh admin.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mitras.map(mitra => (
          <div key={mitra._id} className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/60 dark:border-slate-700 hover:shadow-lg transition-shadow flex flex-col">
            <div className="flex-1">
              <h3 className="font-black text-lg text-slate-800 dark:text-white mb-2">{mitra.nama_instansi}</h3>
              <span className={`inline-block mb-3 px-2.5 py-0.5 rounded-md text-[10px] font-bold ${mitra.kategori?.includes('Sektor Publik') ? 'bg-teal-50 text-[#1398A5]' : mitra.kategori?.includes('Ekonomi Kerakyatan') ? 'bg-orange-50 text-orange-600' : mitra.kategori?.includes('Privat') ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                {mitra.kategori}
              </span>
              <p className="text-sm text-slate-500 mb-4">{mitra.alamat_lengkap ? `${mitra.alamat_lengkap}, ${mitra.kecamatan}, ${mitra.kabupaten_kota}` : 'Alamat belum dilengkapi'}</p>
              
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl mb-4 border border-indigo-100 dark:border-indigo-800/50">
                <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Deskripsi/Profil:</p>
                <p className="text-sm text-indigo-900 dark:text-indigo-100 mt-1 line-clamp-3">{mitra.deskripsi_singkat || '-'}</p>
              </div>

              {mitra.kuota_maksimal > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kuota Maksimal</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{mitra.kuota_maksimal} Orang</p>
                  </div>
                </div>
              )}
            </div>
            
            {isKetua ? (
              pokja?.mitra_id && ['menunggu_persetujuan_lppm', 'disetujui_lppm', 'berjalan', 'selesai'].includes(pokja?.status_pokja) ? (
                <button 
                  disabled
                  className="w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold rounded-xl mt-4 cursor-not-allowed"
                >
                  Lokasi Sudah Terkunci
                </button>
              ) : (
                <button 
                  disabled={submitting}
                  onClick={() => handleSelectMitra(mitra._id)}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 mt-4"
                >
                  {submitting ? 'Memproses...' : 'Pilih Lokasi & Ajukan ke LPPM'}
                </button>
              )
            ) : (
              <button 
                disabled
                className="w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold rounded-xl mt-4 cursor-not-allowed"
              >
                Hanya Ketua yang Dapat Memilih
              </button>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
