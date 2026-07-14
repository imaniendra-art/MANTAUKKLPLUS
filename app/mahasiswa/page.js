"use client";

import { useState, useEffect } from "react";
import DashboardLayout, { MENU_CONFIG } from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users, Building, Plus, CheckCircle, Clock, Edit, MapPin, User, Handshake, CheckCircle2 } from "lucide-react";
import { Suspense } from "react";

function MahasiswaDashboardContent() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [pokja, setPokja] = useState(null);
  const [prokerList, setProkerList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [namaPokja, setNamaPokja] = useState("");
  const [showMitraProfileModal, setShowMitraProfileModal] = useState(false);
  
  const [showEditNamaModal, setShowEditNamaModal] = useState(false);
  const [editNamaPokja, setEditNamaPokja] = useState("");
  const [mitraProfileForm, setMitraProfileForm] = useState({
    alamat_lengkap: "", desa_kelurahan: "", kecamatan: "", kabupaten_kota: "", titik_koordinat: "", link_maps: "",
    nama_pimpinan: "", kontak_mitra: "", status_kerjasama: "Belum Ada", kuota_maksimal: 5, fasilitas_khusus: ""
  });
  
  const fetchProker = async (pokjaId) => {
    try {
      const res = await fetch(`/api/proker?pokjaId=${pokjaId}`);
      if (res.ok) {
        const data = await res.json();
        setProkerList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPokja = async () => {
    if (session?.user?.id) {
      try {
        const res = await fetch(`/api/pokja?mhsId=${session.user.id}`);
        const data = await res.json();
        setPokja(data);
        if (data && data._id && !data.error) {
          fetchProker(data._id);
        }
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
      } else {
        alert("Gagal membuat kelompok");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan sistem.");
    }
  };

  const handleEditNama = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/pokja', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pokja._id, action: 'rename', nama_pokja: editNamaPokja })
      });
      if (res.ok) {
        setShowEditNamaModal(false);
        fetchPokja();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal mengganti nama kelompok");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan sistem.");
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
          <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-600 text-3xl">
            🤝
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Anda Belum Tergabung di POKJA</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            Kegiatan KKL Plus dilakukan secara berkelompok. Anda bisa membuat POKJA (Kelompok Kerja) baru dan menjadi ketua, atau menunggu undangan dari teman Anda.
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-200 transition-all"
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
                  <button type="submit" className="px-6 py-2 bg-teal-600 text-white font-bold rounded-xl">Buat POKJA</button>
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

  const customMenus = [...MENU_CONFIG.mahasiswa.menus];
  if (pokja && ['disetujui_admin', 'berjalan', 'selesai'].includes(pokja.status_pokja)) {
    const pengajuanIdx = customMenus.findIndex(m => m.href === '/mahasiswa/pengajuan');
    if (pengajuanIdx >= 0) {
      customMenus[pengajuanIdx] = { ...customMenus[pengajuanIdx], name: "Berkas Dokumen KKL Plus", desc: "Kelola dokumen LOA, MOU, MOA, IA" };
    }
  }

  return (
    <DashboardLayout title="Ruang POKJA KKL Plus" notifications={<></>} customMenus={customMenus}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-blue-950 dark:text-white flex items-center gap-2">
                  {pokja.nama_pokja} 
                  {isKetua && (
                    <button 
                      onClick={() => { setEditNamaPokja(pokja.nama_pokja); setShowEditNamaModal(true); }}
                      className="text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 p-1.5 rounded-lg transition-colors shadow-sm ml-1"
                      title="Ganti Nama Kelompok"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  <span className="text-sm px-3 py-1 bg-teal-100 text-teal-700 rounded-full font-bold uppercase tracking-wider ml-2">
                    {pokja.status_pokja === 'disetujui_admin' ? 'Persiapan' : pokja.status_pokja.replace(/_/g, ' ')}
                  </span>
                </h2>
                <div className="mt-4 flex flex-col gap-2 text-sm">
                  <p className="text-slate-600 dark:text-slate-400">
                    <span className="font-bold">Dosen Pembimbing:</span> {pokja.dpl_id ? `${pokja.dpl_id.nama_lengkap} (${pokja.dpl_id.nomor_hp || 'Belum ada kontak'})` : 'Belum ditentukan'}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    <span className="font-bold">Mentor Instansi:</span> {pokja.mentor_id ? `${pokja.mentor_id.nama_lengkap} (${pokja.mentor_id.nomor_hp || 'Belum ada kontak'})` : 'Belum ditentukan'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {myStatus === 'menunggu' && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-amber-800">Undangan Bergabung</h4>
                <p className="text-sm text-amber-700">Anda diundang untuk bergabung di kelompok ini.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleRespondInvite('ditolak')} className="px-4 py-2 text-amber-600 font-bold bg-white rounded-lg">Tolak</button>
                <button onClick={() => handleRespondInvite('bergabung')} className="px-4 py-2 bg-amber-600 text-white font-bold rounded-lg shadow">Terima Undangan</button>
              </div>
            </div>
          )}

          {/* 2-Column Split for Biodata & Proker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Biodata Lokasi Mitra */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-700 dark:text-slate-300">Lokasi Mitra KKL Plus</h3>
              
              {!pokja.mitra_id ? (
                <div className="p-6 bg-white/20 dark:bg-slate-900/20 rounded-2xl border border-slate-200 border-dashed text-center h-full flex flex-col justify-center">
                  <p className="text-slate-500 mb-4">Lokasi instansi belum dipilih.</p>
                  {isKetua && (
                    <button onClick={() => router.push('/mahasiswa/pengajuan')} className="px-6 py-2 bg-teal-600 text-white font-bold rounded-xl shadow-sm mx-auto">Pilih Lokasi Mitra</button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col p-5 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-100 dark:border-slate-700 h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl shrink-0 text-blue-900"><Building className="w-5 h-5 inline-block -mt-0.5" /></div>
                    <div className="flex-1">
                      <h4 className="font-bold text-blue-950 dark:text-white flex items-center gap-2">
                        {pokja.mitra_id.nama_instansi}
                        {pokja.mitra_id.is_lengkap ? (
                          <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-[10px] uppercase font-black tracking-wider rounded-md">Profil Lengkap</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] uppercase font-black tracking-wider rounded-md">Belum Lengkap</span>
                        )}
                      </h4>
                      <p className="text-sm text-slate-500">{pokja.mitra_id.kategori}</p>
                    </div>
                  </div>
                  
                  {isKetua && !pokja.mitra_id.is_lengkap ? (
                    <div className="mt-auto p-4 bg-teal-50 border border-teal-100 rounded-xl flex flex-col gap-3">
                      <div>
                        <h5 className="font-bold text-teal-900 text-sm">Lengkapi Profil Mitra</h5>
                        <p className="text-xs text-teal-700 mt-1">Anda wajib melengkapi detail lokasi instansi untuk memulai KKL Plus.</p>
                      </div>
                      <button 
                        onClick={() => {
                          setMitraProfileForm({
                            alamat_lengkap: pokja.mitra_id.alamat_lengkap || "",
                            desa_kelurahan: pokja.mitra_id.desa_kelurahan || "",
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
                        className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-sm shadow-sm transition-colors text-center"
                      >
                        Lengkapi Sekarang
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400 flex flex-col h-full">
                      <div className="space-y-3 mb-4">
                        <div className="flex gap-2 items-start">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <p>
                            {pokja.mitra_id.alamat_lengkap}, Desa {pokja.mitra_id.desa_kelurahan || '—'}, Kec. {pokja.mitra_id.kecamatan}, {pokja.mitra_id.kabupaten_kota}
                            {pokja.mitra_id.link_maps && (
                              <a href={pokja.mitra_id.link_maps.startsWith('http') ? pokja.mitra_id.link_maps : `https://${pokja.mitra_id.link_maps}`} target="_blank" className="text-teal-600 hover:underline ml-1">(Buka Maps)</a>
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2 items-start">
                          <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <p>Pimpinan: <strong>{pokja.mitra_id.nama_pimpinan}</strong> ({pokja.mitra_id.kontak_mitra})</p>
                        </div>
                        <div className="flex gap-2 items-start">
                          <Handshake className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <p>Status: <strong>{pokja.mitra_id.status_kerjasama}</strong></p>
                        </div>
                        {pokja.mitra_id.fasilitas_khusus && (
                          <div className="flex gap-2 items-start">
                            <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <p>Fasilitas: <strong>{pokja.mitra_id.fasilitas_khusus}</strong></p>
                          </div>
                        )}
                      </div>
                      {isKetua && (
                        <button 
                          onClick={() => {
                            setMitraProfileForm({
                              alamat_lengkap: pokja.mitra_id.alamat_lengkap || "",
                              desa_kelurahan: pokja.mitra_id.desa_kelurahan || "",
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
                          className="w-full mt-auto px-4 py-2 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 transition-colors"
                        >
                          Edit Profil
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Proker */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Program Kerja</h3>
              </div>
              
              {['berjalan', 'selesai'].includes(pokja.status_pokja) ? (
                <div className="flex flex-col gap-4">
                  <button onClick={() => router.push('/mahasiswa/proker')} className="w-full py-3 bg-amber-500 text-white font-bold rounded-xl shadow-sm shadow-amber-200 text-center flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]">
                    <Plus className="w-4 h-4" /> Rancang Proker
                  </button>
                  
                  {/* Proker List */}
                  <div className="space-y-3 mt-1">
                    {prokerList.length > 0 ? (
                      prokerList.slice(0, 3).map((p, idx) => (
                        <div key={idx} className="p-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-100 dark:border-slate-700 rounded-xl flex flex-col gap-1 shadow-sm">
                          <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{p.judul_proker}</h5>
                          <div className="flex justify-between items-center text-xs mt-1">
                            <span className="text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md truncate max-w-[60%]">{p.jenis_proker}</span>
                            <span className={`font-bold ${p.status_pelaksanaan === 'Selesai' ? 'text-teal-600' : p.status_pelaksanaan === 'Sedang Berjalan' ? 'text-amber-600' : 'text-slate-400'}`}>
                              {p.status_pelaksanaan}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed">
                        Belum ada Program Kerja.
                      </div>
                    )}
                    {prokerList.length > 3 && (
                      <button onClick={() => router.push('/mahasiswa/proker')} className="w-full py-2 text-xs font-bold text-teal-600 text-center hover:underline">
                        Lihat Semua ({prokerList.length}) Proker
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 border-dashed text-center h-[200px] flex items-center justify-center">
                  <p className="text-slate-500 text-sm">Rancang Proker tersedia saat status <br/>POKJA sudah Berjalan.</p>
                </div>
              )}
            </div>

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
              <div className={`flex items-center justify-between p-3 rounded-xl ${
                String(pokja.ketua_id?._id) === String(session?.user?.id) 
                  ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-900 dark:text-teal-100'
                  : 'bg-white/20 dark:bg-slate-900/20 text-slate-700 dark:text-slate-300'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    String(pokja.ketua_id?._id) === String(session?.user?.id) 
                      ? 'bg-teal-200 text-teal-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {pokja.ketua_id?.nama_lengkap?.charAt(0) || 'K'}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{pokja.ketua_id?.nama_lengkap}</p>
                    <p className={`text-[10px] uppercase font-black tracking-wider ${
                      String(pokja.ketua_id?._id) === String(session?.user?.id) ? 'text-teal-500' : 'text-slate-400'
                    }`}>Ketua</p>
                  </div>
                </div>
              </div>

              {/* Anggota */}
              {pokja.anggota.map((member, idx) => {
                if (String(member.user_id?._id) === String(pokja.ketua_id?._id)) return null; // Skip ketua
                const isCurrentUser = String(member.user_id?._id) === String(session?.user?.id);
                return (
                  <div key={idx} className={`flex items-center justify-between p-3 rounded-xl ${
                    isCurrentUser
                      ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-900 dark:text-teal-100'
                      : 'bg-white/20 dark:bg-slate-900/20 text-slate-700 dark:text-slate-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isCurrentUser
                          ? 'bg-teal-200 text-teal-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {member.user_id?.nama_lengkap?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{member.user_id?.nama_lengkap}</p>
                        <p className={`text-[10px] capitalize font-bold ${
                          isCurrentUser ? 'text-teal-500' : 'text-slate-400'
                        }`}>Status: {member.status_undangan}</p>
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
              
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-6">
                <p className="text-sm text-teal-800">
                  <strong>Penting:</strong> Data profil ini bersifat krusial untuk persetujuan Admin. Pastikan Anda mengisi alamat, kontak, dan status kerja sama dengan sebenar-benarnya sesuai hasil observasi.
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Desa / Kelurahan</label>
                      <input required type="text" value={mitraProfileForm.desa_kelurahan || ''} onChange={e => setMitraProfileForm({...mitraProfileForm, desa_kelurahan: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-indigo-500" placeholder="Desa..." />
                    </div>
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
                        <a href={mitraProfileForm.link_maps.startsWith('http') ? mitraProfileForm.link_maps : `https://${mitraProfileForm.link_maps}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-teal-100 text-teal-700 hover:bg-teal-200 font-bold rounded-xl whitespace-nowrap flex items-center justify-center">
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

                {/* Bagian Foto Profil Instansi */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 border-b pb-2">Foto Profil Instansi</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="font-bold text-xs mb-2">Foto Luar Bangunan / Gedung</p>
                      {pokja?.mitra_id?.foto_kantor_desa ? (
                        <img src={pokja.mitra_id.foto_kantor_desa} alt="Luar Bangunan" className="w-full h-24 object-cover rounded-xl shadow-sm border border-slate-200 mb-2" />
                      ) : (
                        <div className="w-full h-24 bg-slate-100 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 flex items-center justify-center mb-2">
                          <span className="text-[10px] text-slate-400">Belum ada foto</span>
                        </div>
                      )}
                      {isKetua && (
                        <label className="cursor-pointer text-[10px] bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg font-bold">
                          Upload Langsung
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'foto_kantor_desa')} />
                        </label>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-xs mb-2">Foto Dalam Kantor / Ruangan</p>
                      {pokja?.mitra_id?.foto_kantor_bumdes ? (
                        <img src={pokja.mitra_id.foto_kantor_bumdes} alt="Dalam Ruangan" className="w-full h-24 object-cover rounded-xl shadow-sm border border-slate-200 mb-2" />
                      ) : (
                        <div className="w-full h-24 bg-slate-100 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 flex items-center justify-center mb-2">
                          <span className="text-[10px] text-slate-400">Belum ada foto</span>
                        </div>
                      )}
                      {isKetua && (
                        <label className="cursor-pointer text-[10px] bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg font-bold">
                          Upload Langsung
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'foto_kantor_bumdes')} />
                        </label>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-xs mb-2">Logo Instansi</p>
                      {pokja?.mitra_id?.logo_mitra ? (
                        <img src={pokja.mitra_id.logo_mitra} alt="Logo" className="w-full h-24 object-contain rounded-xl shadow-sm border border-slate-200 mb-2 bg-white p-2" />
                      ) : (
                        <div className="w-full h-24 bg-slate-100 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 flex items-center justify-center mb-2">
                          <span className="text-[10px] text-slate-400">Belum ada logo</span>
                        </div>
                      )}
                      {isKetua && (
                        <label className="cursor-pointer text-[10px] bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg font-bold">
                          Upload Langsung
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo_mitra')} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button type="button" onClick={() => setShowMitraProfileModal(false)} className="px-6 py-2 font-bold text-slate-500">Batal</button>
                  <button type="submit" className="px-8 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg">Simpan & Lengkapi</button>
                </div>
              </form>
            </div>
          </div>
        )}
        
      {/* Modal Edit Nama Kelompok */}
      {showEditNamaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Ganti Nama Kelompok</h3>
            <form onSubmit={handleEditNama}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nama Kelompok Baru</label>
                <input 
                  type="text" 
                  required 
                  value={editNamaPokja} 
                  onChange={(e) => setEditNamaPokja(e.target.value)} 
                  placeholder="Misal: Kelompok 1 - ITB"
                  className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowEditNamaModal(false)} className="px-5 py-2 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-600/30 transition-all">Simpan Perubahan</button>
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
