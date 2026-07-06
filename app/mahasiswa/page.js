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
  const [showMitraProfileModal, setShowMitraProfileModal] = useState(false);
  const [mitraProfileForm, setMitraProfileForm] = useState({
    alamat_lengkap: "", kecamatan: "", kabupaten_kota: "", titik_koordinat: "", link_maps: "",
    nama_pimpinan: "", kontak_mitra: "", status_kerjasama: "Belum Ada", kuota_maksimal: 5, fasilitas_khusus: ""
  });
  
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

  const handleMitraProfileSubmit = async (e) => {
    e.preventDefault();
    if (!pokja?.mitra_id?._id) return;
    
    try {
      const res = await fetch('/api/mitra', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pokja.mitra_id._id,
          ...mitraProfileForm,
          is_lengkap: true
        })
      });
      if (res.ok) {
        setShowMitraProfileModal(false);
        fetchPokja(); // Refresh data to get updated mitra info
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e, documentType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('pokjaId', pokja._id);
    formData.append('documentType', documentType); // 'loa' atau 'sertifikat'

    try {
      const res = await fetch('/api/upload/surat', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert("Dokumen berhasil diunggah!");
        fetchPokja();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal mengunggah dokumen");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Terjadi kesalahan saat mengunggah dokumen.");
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
                  <span className="text-sm px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-bold uppercase tracking-wider">
                    {pokja.status_pokja === 'disetujui_lppm' ? 'Persiapan' : pokja.status_pokja.replace(/_/g, ' ')}
                  </span>
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

            {pokja.status_pokja === 'draft' && !pokja.mitra_id && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Lokasi Mitra KKL Plus</h3>
                <div className="p-6 bg-white/20 dark:bg-slate-900/20 rounded-2xl border border-slate-200 border-dashed text-center">
                  <p className="text-slate-500 mb-4">Lokasi instansi belum dipilih.</p>
                  {isKetua && (
                    <button onClick={() => router.push('/mahasiswa/pengajuan')} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm">Pilih Lokasi Mitra</button>
                  )}
                </div>
              </div>
            )}

            {/* Kelola Dokumen Section */}
            {pokja.mitra_id && ['disetujui_lppm', 'berjalan', 'selesai'].includes(pokja.status_pokja) && (
              <div className="mt-6">
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm text-indigo-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white">Pusat Dokumen KKL Plus</h3>
                      <p className="text-sm text-slate-500">Kelola Surat Pengantar, LOA, dan Sertifikat di sini.</p>
                    </div>
                  </div>
                  <button onClick={() => router.push('/mahasiswa/pengajuan')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-colors whitespace-nowrap">
                    Buka Dokumen
                  </button>
                </div>
              </div>
            )}

            {pokja.status_pokja === 'berjalan' && (
              <div className="mt-6 flex gap-4">
                <button onClick={() => router.push('/mahasiswa/proker')} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-sm text-center">Rancang Proker</button>
                <button onClick={() => router.push('/mahasiswa/logbook')} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-sm text-center">Isi Logbook Harian</button>
              </div>
            )}

            {/* Lokasi Mitra Section (muncul setelah status Berjalan) */}
            {['berjalan', 'selesai'].includes(pokja.status_pokja) && (
              <div className="space-y-4 mt-8">
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Lokasi Mitra KKL Plus</h3>
                <div className="flex flex-col gap-4 p-5 bg-white/20 dark:bg-slate-900/20 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl"><Building className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /></div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {pokja.mitra_id?.nama_instansi}
                        {pokja.mitra_id?.is_lengkap ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] uppercase font-black tracking-wider rounded-md">Profil Lengkap</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] uppercase font-black tracking-wider rounded-md">Profil Belum Lengkap</span>
                        )}
                      </h4>
                      <p className="text-sm text-slate-500">{pokja.mitra_id?.kategori}</p>
                    </div>
                  </div>
                  
                  {isKetua && !pokja.mitra_id?.is_lengkap && (
                    <div className="mt-2 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-indigo-900 text-sm">Lengkapi Profil Mitra</h5>
                        <p className="text-xs text-indigo-700 mt-1">Anda wajib melengkapi detail lokasi instansi untuk memulai KKL Plus.</p>
                      </div>
                      <button 
                        onClick={() => {
                          setMitraProfileForm({
                            alamat_lengkap: pokja.mitra_id.alamat_lengkap || "",
                            kecamatan: pokja.mitra_id.kecamatan || "",
                            kabupaten_kota: pokja.mitra_id.kabupaten_kota || "",
                            titik_koordinat: pokja.mitra_id.titik_koordinat || "",
                            link_maps: pokja.mitra_id.link_maps || "",
                            nama_pimpinan: pokja.mitra_id.nama_pimpinan || "",
                            kontak_mitra: pokja.mitra_id.kontak_mitra || "",
                            status_kerjasama: pokja.mitra_id.status_kerjasama || "Belum Ada",
                            kuota_maksimal: pokja.mitra_id.kuota_maksimal || 5,
                            fasilitas_khusus: pokja.mitra_id.fasilitas_khusus || ""
                          });
                          setShowMitraProfileModal(true);
                        }} 
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm shadow-sm transition-colors"
                      >
                        Lengkapi Sekarang
                      </button>
                    </div>
                  )}
                  {pokja.mitra_id?.is_lengkap && (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p><strong>Alamat:</strong> {pokja.mitra_id.alamat_lengkap}, Kec. {pokja.mitra_id.kecamatan}, {pokja.mitra_id.kabupaten_kota}</p>
                          <p><strong>Kontak:</strong> {pokja.mitra_id.nama_pimpinan} ({pokja.mitra_id.kontak_mitra})</p>
                        </div>
                        {isKetua && (
                          <button 
                            onClick={() => {
                              setMitraProfileForm({
                                alamat_lengkap: pokja.mitra_id.alamat_lengkap || "",
                                kecamatan: pokja.mitra_id.kecamatan || "",
                                kabupaten_kota: pokja.mitra_id.kabupaten_kota || "",
                                titik_koordinat: pokja.mitra_id.titik_koordinat || "",
                                link_maps: pokja.mitra_id.link_maps || "",
                                nama_pimpinan: pokja.mitra_id.nama_pimpinan || "",
                                kontak_mitra: pokja.mitra_id.kontak_mitra || "",
                                status_kerjasama: pokja.mitra_id.status_kerjasama || "Belum Ada",
                                kuota_maksimal: pokja.mitra_id.kuota_maksimal || 5,
                                fasilitas_khusus: pokja.mitra_id.fasilitas_khusus || ""
                              });
                              setShowMitraProfileModal(true);
                            }}
                            className="px-4 py-2 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 transition-colors"
                          >
                            Edit Profil
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="text-center">
                          <p className="font-bold text-xs mb-2">Foto Kantor Desa</p>
                          {pokja.mitra_id.foto_kantor_desa ? (
                            <img src={pokja.mitra_id.foto_kantor_desa} alt="Kantor Desa" className="w-full h-24 object-cover rounded-xl shadow-sm border border-slate-200 mb-2" />
                          ) : (
                            <div className="w-full h-24 bg-slate-100 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 flex items-center justify-center mb-2">
                              <span className="text-[10px] text-slate-400">Belum ada foto</span>
                            </div>
                          )}
                          {isKetua && (
                            <label className="cursor-pointer text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg font-bold">
                              Upload
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'foto_kantor_desa')} />
                            </label>
                          )}
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-xs mb-2">Foto BUMDes</p>
                          {pokja.mitra_id.foto_kantor_bumdes ? (
                            <img src={pokja.mitra_id.foto_kantor_bumdes} alt="Kantor BUMDes" className="w-full h-24 object-cover rounded-xl shadow-sm border border-slate-200 mb-2" />
                          ) : (
                            <div className="w-full h-24 bg-slate-100 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 flex items-center justify-center mb-2">
                              <span className="text-[10px] text-slate-400">Belum ada foto</span>
                            </div>
                          )}
                          {isKetua && (
                            <label className="cursor-pointer text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg font-bold">
                              Upload
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'foto_kantor_bumdes')} />
                            </label>
                          )}
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-xs mb-2">Logo Instansi</p>
                          {pokja.mitra_id.logo_mitra ? (
                            <img src={pokja.mitra_id.logo_mitra} alt="Logo" className="w-full h-24 object-contain rounded-xl shadow-sm border border-slate-200 mb-2 bg-white p-2" />
                          ) : (
                            <div className="w-full h-24 bg-slate-100 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 flex items-center justify-center mb-2">
                              <span className="text-[10px] text-slate-400">Belum ada logo</span>
                            </div>
                          )}
                          {isKetua && (
                            <label className="cursor-pointer text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg font-bold">
                              Upload
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo_mitra')} />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Panel (Anggota) */}
        <div className="space-y-6">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white">Anggota Kelompok</h3>
              <span className="text-xs font-bold text-slate-500">
                {pokja.anggota.filter(m => m.user_id?._id !== pokja.ketua_id?._id).length + 1} Orang (Total)
              </span>
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

        {/* Mitra Profile Modal */}
        {showMitraProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-4xl shadow-2xl my-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Lengkapi Profil Mitra</h3>
                <button onClick={() => setShowMitraProfileModal(false)} className="text-slate-500 hover:text-red-500 text-2xl font-bold">&times;</button>
              </div>
              
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
                <p className="text-sm text-indigo-800">
                  <strong>Penting:</strong> Data profil ini bersifat krusial untuk persetujuan LPPM. Pastikan Anda mengisi alamat, kontak, dan status kerja sama dengan sebenar-benarnya sesuai hasil observasi.
                </p>
              </div>

              <form onSubmit={handleMitraProfileSubmit} className="space-y-6">
                
                {/* Bagian Alamat */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 border-b pb-2">Informasi Alamat</h4>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Alamat Lengkap</label>
                    <textarea required value={mitraProfileForm.alamat_lengkap} onChange={e => setMitraProfileForm({...mitraProfileForm, alamat_lengkap: e.target.value})} rows="2" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-indigo-500" placeholder="Jl. Raya Contoh No. 123..."></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Kecamatan</label>
                      <input required type="text" value={mitraProfileForm.kecamatan} onChange={e => setMitraProfileForm({...mitraProfileForm, kecamatan: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-indigo-500" placeholder="Kecamatan..." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Kabupaten / Kota</label>
                      <input required type="text" value={mitraProfileForm.kabupaten_kota} onChange={e => setMitraProfileForm({...mitraProfileForm, kabupaten_kota: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-indigo-500" placeholder="Kabupaten/Kota..." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Link Google Maps (Opsional)</label>
                    <div className="flex gap-2">
                      <input type="text" value={mitraProfileForm.link_maps} onChange={e => setMitraProfileForm({...mitraProfileForm, link_maps: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-indigo-500" placeholder="https://maps.app.goo.gl/..." />
                      {mitraProfileForm.link_maps && (
                        <a href={mitraProfileForm.link_maps.startsWith('http') ? mitraProfileForm.link_maps : `https://${mitraProfileForm.link_maps}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold rounded-xl whitespace-nowrap flex items-center justify-center">
                          Buka Maps
                        </a>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Titik Koordinat (Opsional)</label>
                    <input type="text" value={mitraProfileForm.titik_koordinat} onChange={e => setMitraProfileForm({...mitraProfileForm, titik_koordinat: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-indigo-500" placeholder="-5.1333, 119.4166 (Dari Google Maps)" />
                  </div>
                </div>

                {/* Bagian Kontak */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 border-b pb-2">Kontak Penanggung Jawab / Pimpinan</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Nama Pimpinan / PIC</label>
                      <input required type="text" value={mitraProfileForm.nama_pimpinan} onChange={e => setMitraProfileForm({...mitraProfileForm, nama_pimpinan: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-indigo-500" placeholder="Nama PIC di lokasi..." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Nomor Kontak (WhatsApp)</label>
                      <input required type="text" value={mitraProfileForm.kontak_mitra} onChange={e => setMitraProfileForm({...mitraProfileForm, kontak_mitra: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-indigo-500" placeholder="081234567890" />
                    </div>
                  </div>
                </div>

                {/* Bagian Administrasi & Fasilitas */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 border-b pb-2">Administrasi & Kesepakatan</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Status Kerja Sama</label>
                      <select required value={mitraProfileForm.status_kerjasama} onChange={e => setMitraProfileForm({...mitraProfileForm, status_kerjasama: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-indigo-500 bg-white">
                        <option value="Belum Ada">Belum Ada MoU/MoA</option>
                        <option value="Proses Penjajakan (Siap MoU)">Proses Penjajakan (Siap MoU)</option>
                        <option value="Memorandum of Understanding (MoU)">Memorandum of Understanding (MoU)</option>
                        <option value="Memorandum of Agreement (MoA)">Memorandum of Agreement (MoA)</option>
                        <option value="Implementation Arrangement (IA)">Implementation Arrangement (IA)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2 whitespace-nowrap">Kemampuan Penerimaan Kuota Mahasiswa KKL Plus / Semester</label>
                      <input required type="number" min="1" max="100" value={mitraProfileForm.kuota_maksimal} onChange={e => setMitraProfileForm({...mitraProfileForm, kuota_maksimal: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-indigo-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Fasilitas Khusus dari Mitra (Opsional)</label>
                    <textarea value={mitraProfileForm.fasilitas_khusus} onChange={e => setMitraProfileForm({...mitraProfileForm, fasilitas_khusus: e.target.value})} rows="2" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-indigo-500" placeholder="Misal: Disediakan mess / uang makan / transport lokal..."></textarea>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button type="button" onClick={() => setShowMitraProfileModal(false)} className="px-6 py-2 font-bold text-slate-500">Batal</button>
                  <button type="submit" className="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg">Simpan & Lengkapi</button>
                </div>
              </form>
            </div>
          </div>
        )}

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
