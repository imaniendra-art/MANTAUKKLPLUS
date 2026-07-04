"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users, Building, Plus, CheckCircle, Clock } from "lucide-react";;
import { Suspense } from "react";

function MahasiswaDashboardContent() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [pokja, setPokja] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [namaPokja, setNamaPokja] = useState("");
  
  const fetchPokja = async () => {
    if (session?.user?.id) {
      try {
        const res = await fetch(`/api/pokja?mhsId=${session.user.id}`);
        const data = await res.json();
        setPokja(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchPokja();
  }, [session]);

  const handleCreatePokja = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/pokja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ketua_id: session.user.id,
          nama_pokja: namaPokja
        })
      });
      if (res.ok) {
        setShowCreateModal(false);
        fetchPokja();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRespondInvite = async (status) => {
    try {
      const res = await fetch('/api/pokja', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pokja._id,
          mhs_id: session.user.id,
          action: 'respond_invite',
          status_pokja: status // ini akan di-map ke status_undangan di backend
        })
      });
      if (res.ok) fetchPokja();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Ruang POKJA KKL Plus" notifications={<></>}>
        <div className="flex justify-center p-10"><div className="animate-spin text-4xl">⏳</div></div>
      </DashboardLayout>
    );
  }

  // JIKA BELUM ADA POKJA
  if (!pokja || pokja.error) {
    return (
      <DashboardLayout title="Ruang POKJA KKL Plus" notifications={<></>}>
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-sm text-center max-w-2xl mx-auto mt-10">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 text-3xl">
            🤝
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Anda Belum Tergabung di POKJA</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            Kegiatan KKL Plus dilakukan secara berkelompok. Anda bisa membuat POKJA (Kelompok Kerja) baru dan menjadi ketua, atau menunggu undangan dari teman Anda.
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all"
          >
            Buat POKJA Baru
          </button>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-2xl w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold mb-4">Buat Kelompok KKL Plus</h3>
              <form onSubmit={handleCreatePokja}>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Kelompok (Opsional)</label>
                <input 
                  type="text" 
                  value={namaPokja}
                  onChange={(e) => setNamaPokja(e.target.value)}
                  placeholder="Misal: Kelompok 1, atau Tim Hebat"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 mb-6 focus:outline-indigo-500 text-slate-900"
                />
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 font-bold text-slate-500">Batal</button>
                  <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl">Buat POKJA</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    );
  }

  // JIKA SUDAH ADA POKJA
  const isKetua = pokja.ketua_id?._id === session?.user?.id;
  const myStatus = pokja.anggota.find(a => a.user_id?._id === session?.user?.id)?.status_undangan;

  return (
    <DashboardLayout title="Ruang POKJA KKL Plus" notifications={<></>}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                  {pokja.nama_pokja} 
                  <span className="text-sm px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-bold uppercase tracking-wider">{pokja.status_pokja.replace(/_/g, ' ')}</span>
                </h2>
                <p className="text-slate-500 mt-1">Dosen Pembimbing: {pokja.dpl_id ? pokja.dpl_id.nama_lengkap : 'Belum ditentukan'}</p>
              </div>
            </div>

            {myStatus === 'menunggu' && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-6 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-amber-800">Undangan Bergabung</h4>
                  <p className="text-sm text-amber-700">Anda diundang untuk bergabung di kelompok ini.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleRespondInvite('ditolak')} className="px-4 py-2 text-rose-600 font-bold bg-white rounded-lg">Tolak</button>
                  <button onClick={() => handleRespondInvite('bergabung')} className="px-4 py-2 bg-amber-600 text-white font-bold rounded-lg shadow">Terima Undangan</button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-bold text-slate-700 dark:text-slate-300">Lokasi Mitra KKL Plus</h3>
              {pokja.mitra_id ? (
                <div className="flex items-center gap-4 p-4 bg-white/20 dark:bg-slate-900/20 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl"><Building className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /></div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{pokja.mitra_id.nama_instansi}</h4>
                    <p className="text-sm text-slate-500">{pokja.mitra_id.alamat}</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-white/20 dark:bg-slate-900/20 rounded-2xl border border-slate-200 border-dashed text-center">
                  <p className="text-slate-500 mb-4">Lokasi instansi belum dipilih.</p>
                  {isKetua && (
                    <button onClick={() => router.push('/mahasiswa/bursa')} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm">Pilih Lokasi Mitra</button>
                  )}
                </div>
              )}
            </div>

            {pokja.status_pokja === 'berjalan' && (
              <div className="mt-6 flex gap-4">
                <button onClick={() => router.push('/mahasiswa/proker')} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-sm text-center">Rancang Proker</button>
                <button onClick={() => router.push('/mahasiswa/logbook')} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-sm text-center">Isi Logbook Harian</button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Panel (Anggota) */}
        <div className="space-y-6">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white">Anggota Kelompok</h3>
              <span className="text-xs font-bold text-slate-500">{pokja.anggota.length} Orang</span>
            </div>
            
            <div className="space-y-3">
              {/* Ketua */}
              <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-sm font-bold text-indigo-700">
                    {pokja.ketua_id?.nama_lengkap?.charAt(0) || 'K'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">{pokja.ketua_id?.nama_lengkap}</p>
                    <p className="text-[10px] uppercase font-black tracking-wider text-indigo-500">Ketua</p>
                  </div>
                </div>
              </div>

              {/* Anggota */}
              {pokja.anggota.map((member, idx) => {
                if (member.user_id?._id === pokja.ketua_id?._id) return null; // Skip ketua
                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/20 dark:bg-slate-900/20/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                        {member.user_id?.nama_lengkap?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{member.user_id?.nama_lengkap}</p>
                        <p className="text-[10px] capitalize font-bold text-slate-400">Status: {member.status_undangan}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {isKetua && pokja.status_pokja === 'draft' && (
              <button 
                onClick={() => {
                  const link = `${window.location.origin}/mahasiswa/join?invite=${pokja._id}`;
                  navigator.clipboard.writeText(link);
                  alert('Link undangan berhasil disalin!\n' + link);
                }} 
                className="w-full mt-4 py-2 border-2 border-dashed border-white/50 dark:border-slate-600 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                🔗 Salin Link Undangan
              </button>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default function MahasiswaDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
      <MahasiswaDashboardContent />
    </Suspense>
  );
}
