"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";
import { FileSignature, User, Briefcase } from "lucide-react";

export default function LogbookPage() {
  const { data: session } = useSession();
  
  const [pokja, setPokja] = useState(null);
  const [prokers, setProkers] = useState([]);
  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('individu');
  
  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const getTodayLocal = () => {
    if (typeof window === 'undefined') return "";
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    return (new Date(today - tzOffset)).toISOString().split('T')[0];
  };
  
  const [tanggal, setTanggal] = useState("");
  const [rencanaTarget, setRencanaTarget] = useState("");
  const [uraianKegiatan, setUraianKegiatan] = useState("");
  const [hasilOutput, setHasilOutput] = useState("");
  const [kendalaSolusi, setKendalaSolusi] = useState("");
  const [buktiFoto, setBuktiFoto] = useState("");
  const [keteranganBukti, setKeteranganBukti] = useState("");
  const [prokerId, setProkerId] = useState(""); 
  
  const [submitting, setSubmitting] = useState(false);

  // Set default date on mount
  useEffect(() => {
    setTanggal(getTodayLocal());
  }, []);

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const resP = await fetch(`/api/pokja?mhsId=${session.user.id}`);
      const dataP = await resP.json();
      setPokja(dataP);

      if (dataP && !dataP.error) {
        // Fetch Proker untuk Dropdown
        const resProker = await fetch(`/api/proker?pokjaId=${dataP._id}`);
        setProkers(await resProker.json());

        // Fetch Logbooks with Pagination
        const resL = await fetch(`/api/logbook?mhsId=${session.user.id}&tipe=${activeTab}&page=${page}&limit=${limit}`);
        const dataL = await resL.json();
        
        if (dataL.data && dataL.pagination) {
          setLogbooks(dataL.data);
          setTotalItems(dataL.pagination.total);
          setTotalPages(dataL.pagination.totalPages);
        } else {
          setLogbooks(Array.isArray(dataL) ? dataL : []);
          setTotalItems(Array.isArray(dataL) ? dataL.length : 0);
          setTotalPages(1);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [session, activeTab, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Tab Switch
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setProkerId(""); // reset proker selection
    setPage(1); // reset pagination
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file maksimal 2MB");
        e.target.value = null;
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBuktiFoto(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setBuktiFoto("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pokja || pokja.status_pokja !== 'berjalan') return;
    
    if (rencanaTarget.trim().length < 5 || uraianKegiatan.trim().length < 10 || hasilOutput.trim().length < 5) {
      alert("Mohon isi Rencana, Uraian, dan Hasil dengan detail yang cukup.");
      return;
    }
    
    if (!buktiFoto) {
      alert("Wajib mengunggah file bukti kegiatan nyata di lapangan.");
      return;
    }
    
    // Validasi untuk tipe pokja
    if (activeTab === 'pokja' && !prokerId) {
      alert("Pilih Program Kerja terlebih dahulu!");
      return;
    }
    
    setSubmitting(true);

    try {
      let finalBuktiFoto = buktiFoto;
      
      // Jika buktiFoto adalah Base64, kirim ke MinIO dulu
      if (buktiFoto && buktiFoto.startsWith('data:image')) {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: buktiFoto })
        });
        
        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          alert("Gagal mengunggah foto ke server kampus: " + (err.error || uploadRes.statusText));
          setSubmitting(false);
          return;
        }
        
        const uploadData = await uploadRes.json();
        finalBuktiFoto = uploadData.url;
      }

      const payload = {
        pokja_id: pokja._id,
        mahasiswa_id: session.user.id,
        tipe_logbook: activeTab, // 'individu' atau 'pokja'
        tanggal,
        rencana_target: rencanaTarget,
        uraian_kegiatan: uraianKegiatan,
        hasil_output: hasilOutput,
        kendala_solusi: kendalaSolusi,
        bukti_kegiatan: finalBuktiFoto,
        keterangan_bukti: keteranganBukti
      };

      if (prokerId) {
        payload.proker_id = prokerId;
      }

      const res = await fetch('/api/logbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setTanggal(getTodayLocal());
        setRencanaTarget("");
        setUraianKegiatan("");
        setHasilOutput("");
        setKendalaSolusi("");
        setBuktiFoto("");
        setKeteranganBukti("");
        setProkerId("");
        
        const fileInput = document.getElementById("file-upload");
        if (fileInput) fileInput.value = "";
        
        fetchData();
      } else {
        const err = await res.json();
        alert("Gagal: " + err.error);
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewFile = (dataUrl) => {
    try {
      const arr = dataUrl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch) return window.open(dataUrl, '_blank');
      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) u8arr[n] = bstr.charCodeAt(n);
      const blob = new Blob([u8arr], { type: mime });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      window.open(dataUrl, '_blank');
    }
  };

  // Logic untuk proker dropdown
  const filteredProkers = useMemo(() => {
    if (!pokja || !session?.user?.id) return [];
    
    // The schema specifies ketua_id as a reference. Let's compare id.
    const isKetua = pokja.ketua_id?._id === session.user.id || pokja.ketua_id === session.user.id;
    
    return prokers.filter(p => {
      const isPIC = p.pic_id?._id === session.user.id || p.pic_id === session.user.id;
      if (p.jenis_proker === 'Utama') {
        return isKetua;
      } else {
        return isPIC;
      }
    });
  }, [prokers, pokja, session]);

  const displayedLogbooks = logbooks; // Sudah di-filter dari API

  return (
    <DashboardLayout title="Logbook Harian Mahasiswa">
      
      {loading ? (
        <div className="text-center py-20 text-slate-500 font-bold animate-pulse">Memuat data logbook...</div>
      ) : !pokja || pokja.status_pokja !== 'berjalan' ? (
        <div className="max-w-2xl mx-auto mt-10">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-10 rounded-3xl border border-white/60 dark:border-slate-700 shadow-sm text-center">
            <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🔒</div>
            <h2 className="text-2xl font-black mb-2 text-slate-800 dark:text-white">Akses Terkunci</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Logbook Harian terbuka **setelah** POKJA Anda disetujui oleh LPPM dan statusnya berjalan.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Tabs Selector */}
            <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700/50 w-full">
              <button
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'individu' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                onClick={() => handleTabChange('individu')}
              >
                <User className="w-4 h-4" /> Logbook Personal
              </button>
              <button
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'pokja' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                onClick={() => handleTabChange('pokja')}
              >
                <Briefcase className="w-4 h-4" /> Logbook Proker
              </button>
            </div>

            {/* Form Pengisian */}
            <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-slate-700 shadow-sm overflow-hidden sticky top-28">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-teal-50/30 dark:bg-teal-900/10">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Tulis Logbook {activeTab === 'individu' ? 'Personal' : 'Proker'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {activeTab === 'individu' 
                    ? `Ceritakan aktivitas dan kehadiran Anda secara personal di ${pokja.mitra_id?.nama_instansi}.` 
                    : `Laporkan progress dan capaian kumulatif Proker yang menjadi tanggung jawab Anda.`}
                </p>
              </div>
              
              {activeTab === 'pokja' && filteredProkers.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="text-4xl mb-4">🚫</div>
                  <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Akses Dibatasi</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Anda bukan Ketua (Proker Utama) maupun PIC (Proker Pendukung) yang berhak mengisi form Proker.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tanggal Kegiatan</label>
                    <input required value={tanggal} onChange={(e) => setTanggal(e.target.value)} type="date" className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/20" />
                  </div>
                  
                  {activeTab === 'pokja' ? (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Pilih Program Kerja <span className="text-red-500">*</span></label>
                      <select required value={prokerId} onChange={(e) => setProkerId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/20">
                        <option value="">-- Pilih Proker --</option>
                        {filteredProkers.map(p => (
                          <option key={p._id} value={p._id}>
                            {p.judul_proker} {p.jenis_proker === 'Utama' ? '— (🌟 Utama)' : '— (Pendukung)'}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Program Kerja Terkait (Opsional)</label>
                      <select value={prokerId} onChange={(e) => setProkerId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/20">
                        <option value="">-- Tidak Terkait Proker Khusus --</option>
                        {prokers.map(p => (
                          <option key={p._id} value={p._id}>
                            {p.judul_proker} {p.jenis_proker === 'Utama' ? '— (🌟 Utama)' : '— (Pendukung)'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Rencana/Target Hari Ini <span className="text-red-500">*</span></label>
                    <input required value={rencanaTarget} onChange={(e) => setRencanaTarget(e.target.value)} type="text" placeholder="Cth: Mengadakan observasi ke balai desa" className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/20 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Uraian Kegiatan <span className="text-red-500">*</span></label>
                    <textarea required minLength="20" value={uraianKegiatan} onChange={(e) => setUraianKegiatan(e.target.value)} rows="3" placeholder="Ceritakan detail apa saja yang dilakukan..." className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/20 text-sm"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Hasil/Output <span className="text-red-500">*</span></label>
                    <input required value={hasilOutput} onChange={(e) => setHasilOutput(e.target.value)} type="text" placeholder="Cth: Mendapat data monografi desa" className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/20 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Kendala & Solusi (Opsional)</label>
                    <textarea value={kendalaSolusi} onChange={(e) => setKendalaSolusi(e.target.value)} rows="2" placeholder="Jika ada kendala, bagaimana mengatasinya?" className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/20 text-sm"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Upload Bukti Foto <span className="text-red-500">*</span></label>
                    <input required id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="w-full px-4 py-2.5 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/20 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Keterangan Gambar / Foto <span className="text-red-500">*</span></label>
                    <input required value={keteranganBukti} onChange={(e) => setKeteranganBukti(e.target.value)} type="text" placeholder="Cth: Foto bersama kepala desa di balai desa" className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/20 text-sm" />
                  </div>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-teal-600 hover:bg-teal-700 py-3.5 text-sm font-bold text-white rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Logbook'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* KANAN: Riwayat Logbook */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Riwayat {activeTab === 'individu' ? 'Personal' : 'Proker'}</h3>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                Total: {totalItems} Data
              </span>
            </div>
            
            {displayedLogbooks.length === 0 ? (
              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-10 rounded-3xl border border-white/60 dark:border-slate-700 shadow-sm text-center">
                <div className="text-4xl mb-4"><FileSignature className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /></div>
                <p className="text-slate-500 font-medium">Belum ada riwayat logbook di kategori ini.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedLogbooks.map(log => (
                  <div key={log._id} className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{new Date(log.tanggal).toLocaleDateString('id-ID', { weekday: 'long', month: 'short', year: 'numeric' })}</p>
                        {log.proker_id && (
                          <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-1">Proker: {log.proker_id.judul_proker}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {log.bukti_kegiatan && (
                          <button onClick={() => handleViewFile(log.bukti_kegiatan)} className="text-[11px] font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-100">
                            🖼️ Bukti
                          </button>
                        )}
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-md uppercase tracking-wider">{log.status_validasi.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div className="text-slate-700 dark:text-slate-300 text-sm mt-4 leading-relaxed space-y-1">
                      <p><strong>Rencana:</strong> {log.rencana_target}</p>
                      <p><strong>Uraian:</strong> {log.uraian_kegiatan}</p>
                      <p><strong>Hasil:</strong> {log.hasil_output}</p>
                      {log.kendala_solusi && <p><strong>Kendala/Solusi:</strong> {log.kendala_solusi}</p>}
                    </div>
                  </div>
                ))}

                {/* PAGINATION UI */}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700 gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Tampilkan:</span>
                    <select 
                      value={limit} 
                      onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      disabled={page === 1} 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      Sebelumnya
                    </button>
                    <span className="text-sm font-bold px-2 text-slate-700 dark:text-slate-300">
                      Hal {page} / {totalPages || 1}
                    </span>
                    <button 
                      disabled={page >= totalPages} 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      Berikutnya
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
        </div>
      )}
    </DashboardLayout>
  );
}
