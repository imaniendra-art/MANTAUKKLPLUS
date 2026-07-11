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

  useEffect(() => {
    if (session?.user?.id) fetchInit();
  }, [session]);

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
    formData.append('documentType', documentType);

    try {
      const res = await fetch('/api/upload/surat', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert("Dokumen berhasil diunggah!");
        fetchInit();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal mengunggah dokumen");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Terjadi kesalahan saat mengunggah dokumen.");
    }
  };

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

  if (loading) return <DashboardLayout title="Memuat..."><div className="p-10 text-center animate-pulse">Memuat data...</div></DashboardLayout>;

  // MODE: PUSAT DOKUMEN
  if (pokja?.mitra_id && ['disetujui_lppm', 'berjalan', 'selesai'].includes(pokja?.status_pokja)) {
    return (
      <DashboardLayout title="Pusat Dokumen KKL Plus">
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">Pusat Dokumen POKJA</h2>
            <p className="text-slate-500 mt-1">Kelola seluruh dokumen legalitas dan kerjasama KKL Plus Anda di sini.</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-700 dark:text-slate-300">Dokumen Kelompok (POKJA)</h3>
            <div className="bg-white/40 dark:bg-slate-900/20 rounded-2xl border border-slate-100 p-2 space-y-2">
              
              {/* Surat Pengantar */}
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">Surat Pengantar Observasi</h4>
                    <p className="text-xs text-slate-500">Otomatis dari sistem</p>
                  </div>
                </div>
                <button onClick={() => window.open(`/mahasiswa/surat/pengantar/${pokja._id}`, '_blank')} className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-600 text-xs font-bold rounded-lg transition-colors whitespace-nowrap">Generate PDF</button>
              </div>

              {/* LOA */}
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">Surat Balasan (LOA)</h4>
                    <p className="text-xs text-slate-500">Bukti diterima oleh Mitra</p>
                  </div>
                </div>
                {pokja.file_surat_balasan ? (
                  <div className="flex gap-2">
                    <a href={pokja.file_surat_balasan} target="_blank" className="px-3 py-1.5 bg-teal-50 text-teal-600 text-xs font-bold rounded-lg transition-colors whitespace-nowrap">Lihat Dokumen</a>
                    {isKetua && (
                      <>
                        <input type="file" id="upload-loa-ulang" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleFileUpload(e, 'loa')} />
                        <label htmlFor="upload-loa-ulang" className="cursor-pointer px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg whitespace-nowrap">Upload Ulang</label>
                      </>
                    )}
                  </div>
                ) : (
                  isKetua ? (
                    ['berjalan', 'selesai'].includes(pokja.status_pokja) ? (
                      <>
                        <input type="file" id="upload-loa" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleFileUpload(e, 'loa')} />
                        <label htmlFor="upload-loa" className="cursor-pointer px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap">Upload LOA</label>
                      </>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-600 text-right max-w-[150px] leading-tight">Upload tersedia setelah disetujui DPL di lokasi</span>
                    )
                  ) : (
                    <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Belum Diunggah</span>
                  )
                )}
              </div>

              {/* SK Penugasan */}
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">Surat Tugas (SK)</h4>
                    <p className="text-xs text-slate-500">Legalitas pelaksanaan KKL</p>
                  </div>
                </div>
                {pokja.file_surat_tugas ? (
                   <a href={pokja.file_surat_tugas} target="_blank" className="px-3 py-1.5 bg-teal-50 text-teal-600 text-xs font-bold rounded-lg transition-colors whitespace-nowrap">Lihat Dokumen</a>
                ) : (
                   <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Belum Tersedia</span>
                )}
              </div>

              {/* Sertifikat Akhir */}
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">Sertifikat Selesai</h4>
                    <p className="text-xs text-slate-500">Dari instansi mitra</p>
                  </div>
                </div>
                {pokja.file_surat_selesai ? (
                  <div className="flex gap-2">
                    <a href={pokja.file_surat_selesai} target="_blank" className="px-3 py-1.5 bg-teal-50 text-teal-600 text-xs font-bold rounded-lg transition-colors whitespace-nowrap">Lihat Dokumen</a>
                    {isKetua && (
                      <>
                        <input type="file" id="upload-sertif-ulang" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleFileUpload(e, 'sertifikat')} />
                        <label htmlFor="upload-sertif-ulang" className="cursor-pointer px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg whitespace-nowrap">Upload Ulang</label>
                      </>
                    )}
                  </div>
                ) : (
                    ['berjalan', 'selesai'].includes(pokja.status_pokja) && isKetua ? (
                      <>
                        <input type="file" id="upload-sertif" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleFileUpload(e, 'sertifikat')} />
                        <label htmlFor="upload-sertif" className="cursor-pointer px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap">Upload Sertifikat</label>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Belum Tersedia</span>
                    )
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-8">
            <h3 className="font-bold text-slate-700 dark:text-slate-300">Dokumen Kerjasama Mitra</h3>
            <div className="bg-white/40 dark:bg-slate-900/20 rounded-2xl border border-slate-100 p-2 space-y-2">
              
              {/* MOU */}
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">MOU (Memorandum of Understanding)</h4>
                    <p className="text-xs text-slate-500">Kerjasama tingkat universitas</p>
                  </div>
                </div>
                {pokja.mitra_id?.file_mou ? (
                  <a href={pokja.mitra_id.file_mou} target="_blank" className="px-3 py-1.5 bg-teal-50 text-teal-600 text-xs font-bold rounded-lg transition-colors whitespace-nowrap">Lihat MOU</a>
                ) : (
                  isKetua ? (
                    <>
                      <input type="file" id="upload-mou" className="hidden" accept=".pdf" onChange={(e) => handleFileUpload(e, 'mou')} />
                      <label htmlFor="upload-mou" className="cursor-pointer px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg whitespace-nowrap hover:bg-slate-200">Upload MOU</label>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Belum Tersedia</span>
                  )
                )}
              </div>

              {/* MOA */}
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">MOA (Memorandum of Agreement)</h4>
                    <p className="text-xs text-slate-500">Kerjasama tingkat fakultas</p>
                  </div>
                </div>
                {pokja.mitra_id?.file_moa ? (
                  <a href={pokja.mitra_id.file_moa} target="_blank" className="px-3 py-1.5 bg-amber-50 text-amber-600 text-xs font-bold rounded-lg transition-colors whitespace-nowrap">Lihat MOA</a>
                ) : (
                  isKetua ? (
                    <>
                      <input type="file" id="upload-moa" className="hidden" accept=".pdf" onChange={(e) => handleFileUpload(e, 'moa')} />
                      <label htmlFor="upload-moa" className="cursor-pointer px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg whitespace-nowrap hover:bg-slate-200">Upload MOA</label>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Belum Tersedia</span>
                  )
                )}
              </div>

              {/* IA */}
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">IA (Implementation Arrangement)</h4>
                    <p className="text-xs text-slate-500">Perjanjian teknis pelaksanaan</p>
                  </div>
                </div>
                {pokja.mitra_id?.file_ia ? (
                  <a href={pokja.mitra_id.file_ia} target="_blank" className="px-3 py-1.5 bg-amber-50 text-amber-600 text-xs font-bold rounded-lg transition-colors whitespace-nowrap">Lihat IA</a>
                ) : (
                  isKetua ? (
                    <>
                      <input type="file" id="upload-ia" className="hidden" accept=".pdf" onChange={(e) => handleFileUpload(e, 'ia')} />
                      <label htmlFor="upload-ia" className="cursor-pointer px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg whitespace-nowrap hover:bg-slate-200">Upload IA</label>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Belum Tersedia</span>
                  )
                )}
              </div>

            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // MODE: BURSA MITRA (DEFAULT)
  return (
    <DashboardLayout title="Pilih Lokasi Mitra KKL Plus">
      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/60 dark:border-slate-700 mb-6">
        <h2 className="text-xl font-bold mb-2">Bursa Lokasi KKL Plus</h2>
        <p className="text-slate-500 mb-4">Pilih tempat atau instansi di mana POKJA Anda akan melaksanakan program kerja. Memilih mitra akan langsung mengajukan POKJA ke LPPM untuk validasi.</p>
        
        {!isKetua && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-4">
            <p className="text-sm font-bold text-amber-700">Perhatian</p>
            <p className="text-sm text-amber-600 mt-1">Anda terdaftar sebagai anggota POKJA. Hanya ketua kelompok yang dapat memilih dan mengajukan lokasi mitra.</p>
          </div>
        )}

        {isKetua && pokja?.mitra_id && ['menunggu_persetujuan_lppm', 'disetujui_lppm', 'berjalan', 'selesai'].includes(pokja?.status_pokja) && (
          <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-r-lg">
            <p className="text-sm font-bold text-teal-700">Lokasi Sudah Diajukan</p>
            <p className="text-sm text-teal-600 mt-1">Anda sudah mengajukan lokasi mitra. Anda tidak dapat memilih lokasi lain kecuali ajuan sebelumnya ditolak oleh admin.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mitras.map(mitra => (
          <div key={mitra._id} className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/60 dark:border-slate-700 hover:shadow-lg transition-shadow flex flex-col">
            <div className="flex-1">
              <h3 className="font-black text-lg text-slate-800 dark:text-white mb-2">{mitra.nama_instansi}</h3>
              <span className={`inline-block mb-3 px-2.5 py-0.5 rounded-md text-[10px] font-bold ${mitra.kategori?.includes('Sektor Publik') ? 'bg-teal-50 text-teal-600' : mitra.kategori?.includes('Ekonomi Kerakyatan') ? 'bg-amber-50 text-amber-600' : mitra.kategori?.includes('Privat') ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-600'}`}>
                {mitra.kategori}
              </span>
              <p className="text-sm text-slate-500 mb-4">{mitra.alamat_lengkap ? `${mitra.alamat_lengkap}, ${mitra.kecamatan}, ${mitra.kabupaten_kota}` : 'Alamat belum dilengkapi'}</p>
              
              <div className="bg-teal-50 dark:bg-teal-900/30 p-3 rounded-xl mb-4 border border-teal-100 dark:border-teal-800/50">
                <p className="text-xs font-bold text-teal-700 dark:text-teal-300">Deskripsi/Profil:</p>
                <p className="text-sm text-teal-900 dark:text-teal-100 mt-1 line-clamp-3">{mitra.deskripsi_singkat || '-'}</p>
              </div>

              {mitra.kuota_maksimal > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
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
                  className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl shadow-sm hover:bg-teal-700 transition-colors disabled:opacity-50 mt-4"
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
