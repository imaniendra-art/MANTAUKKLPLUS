"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "@/components/AuthProvider";
import { FileSignature, User, Briefcase, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { compressImage, formatBytes } from "@/lib/imageCompressor";

export default function LogbookPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
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
  const [compressingImage, setCompressingImage] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState(null);

  // Set default date on mount
  useEffect(() => {
    setTanggal(getTodayLocal());
  }, []);

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const resP = await fetch(`/api/pokja?mhsId=${session.user.id}`);
      let dataP = null;
      if (resP.ok) {
        const textP = await resP.text();
        dataP = textP ? JSON.parse(textP) : null;
      }
      setPokja(dataP);

      if (dataP && dataP._id && !dataP.error) {
        // Fetch Proker untuk Dropdown
        try {
          const resProker = await fetch(`/api/proker?pokjaId=${dataP._id}`);
          if (resProker.ok) {
            const textProker = await resProker.text();
            const dataProker = textProker ? JSON.parse(textProker) : [];
            setProkers(Array.isArray(dataProker) ? dataProker : []);
          } else {
            setProkers([]);
          }
        } catch (errProker) {
          console.error("Gagal memuat data proker:", errProker);
          setProkers([]);
        }

        // Fetch Logbooks with Pagination
        try {
          const resL = await fetch(`/api/logbook?mhsId=${session.user.id}&tipe=${activeTab}&page=${page}&limit=${limit}`);
          if (resL.ok) {
            const textL = await resL.text();
            const dataL = textL ? JSON.parse(textL) : null;
            
            if (dataL && dataL.data && dataL.pagination) {
              setLogbooks(dataL.data);
              setTotalItems(dataL.pagination.total);
              setTotalPages(dataL.pagination.totalPages);
            } else {
              setLogbooks(Array.isArray(dataL) ? dataL : []);
              setTotalItems(Array.isArray(dataL) ? dataL.length : 0);
              setTotalPages(1);
            }
          } else {
            setLogbooks([]);
            setTotalItems(0);
            setTotalPages(1);
          }
        } catch (errLog) {
          console.error("Gagal memuat logbook:", errLog);
          setLogbooks([]);
        }
      }
    } catch (error) {
      console.error("Gagal memuat data:", error);
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

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setBuktiFoto("");
      setCompressionInfo(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert("Mohon pilih file gambar (JPG, PNG, atau WEBP)");
      e.target.value = null;
      return;
    }

    // Izinkan file resolusi tinggi hingga 20MB, karena akan dikompresi otomatis
    if (file.size > 20 * 1024 * 1024) {
      alert("Ukuran file foto terlalu besar (Maksimal 20MB sebelum kompresi).");
      e.target.value = null;
      return;
    }

    setCompressingImage(true);
    setCompressionInfo(null);

    try {
      // Kompres otomatis ke HD 1280px, quality 0.75 JPEG
      const result = await compressImage(file, { maxWidth: 1280, maxHeight: 1280, quality: 0.75 });
      setBuktiFoto(result.dataUrl);
      setCompressionInfo({
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        ratio: result.compressionRatio,
        width: result.width,
        height: result.height
      });
    } catch (err) {
      console.error("Kompresi gambar gagal, fallback ke pembaca biasa:", err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBuktiFoto(reader.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setCompressingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pokja || !['disetujui_admin', 'berjalan', 'selesai'].includes(pokja.status_pokja)) return;
    
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
        setCompressionInfo(null);
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

  // Logic untuk proker dropdown: Hanya proker yang telah disetujui DPL
  const approvedProkers = useMemo(() => {
    if (!pokja || !Array.isArray(prokers) || prokers.length === 0) return [];
    return prokers.filter(p => p.status === 'disetujui_dpl' || p.status === 'selesai');
  }, [prokers, pokja]);

  const filteredProkers = useMemo(() => {
    if (approvedProkers.length === 0) return [];
    
    const userId = String(session?.user?.id || session?.user?._id || '');
    
    // Urutkan agar proker yang mana user adalah PIC atau Proker Utama muncul di urutan atas
    return [...approvedProkers].sort((a, b) => {
      const aIsPIC = Array.isArray(a.pic_id)
        ? a.pic_id.some(pic => String(pic?._id || pic?.id || pic) === userId)
        : String(a.pic_id?._id || a.pic_id?.id || a.pic_id) === userId;
      const bIsPIC = Array.isArray(b.pic_id)
        ? b.pic_id.some(pic => String(pic?._id || pic?.id || pic) === userId)
        : String(b.pic_id?._id || b.pic_id?.id || b.pic_id) === userId;
      if (aIsPIC && !bIsPIC) return -1;
      if (!aIsPIC && bIsPIC) return 1;
      if (a.jenis_proker === 'Utama' && b.jenis_proker !== 'Utama') return -1;
      if (a.jenis_proker !== 'Utama' && b.jenis_proker === 'Utama') return 1;
      return 0;
    });
  }, [approvedProkers, session]);

  const displayedLogbooks = logbooks; // Sudah di-filter dari API

  return (
    <DashboardLayout title="Logbook Harian Mahasiswa">
      
      {loading ? (
        <div className="text-center py-20 text-slate-500 font-bold animate-pulse">Memuat data logbook...</div>
      ) : !pokja || !['disetujui_admin', 'berjalan', 'selesai'].includes(pokja.status_pokja) ? (
        <div className="max-w-2xl mx-auto mt-10">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-10 rounded-3xl border border-white/60 dark:border-slate-700 shadow-sm text-center">
            <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🔒</div>
            <h2 className="text-2xl font-black mb-2 text-slate-800 dark:text-white">Akses Terkunci</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Logbook Harian terbuka **setelah** POKJA Anda disetujui oleh Admin.
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
                    ? `Ceritakan aktivitas dan kehadiran Anda secara personal di ${pokja.mitra_id?.nama_instansi || 'lokasi KKL'}.` 
                    : `Laporkan progress dan capaian kumulatif Proker yang menjadi tanggung jawab Anda.`}
                </p>
              </div>

              {/* Tips Petunjuk Hari Awal KKL */}
              {activeTab === 'individu' && (
                <div className="mx-6 mt-4 p-3.5 bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/30 rounded-2xl flex items-start gap-3">
                  <span className="text-base">💡</span>
                  <p className="text-xs text-teal-800 dark:text-teal-300 leading-relaxed font-medium">
                    <strong>Kegiatan Awal KKL:</strong> Jika Program Kerja (Proker) masih dirumuskan atau belum disetujui DPL, Anda tetap dapat mencatat kegiatan harian (seperti rapat koordinasi, observasi instansi/desa, rembuk proker) di tab ini dengan memilih opsi <em>&quot;Tidak Terkait Proker Khusus&quot;</em>.
                  </p>
                </div>
              )}
              
              {activeTab === 'pokja' && filteredProkers.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl mx-auto shadow-inner">
                    {prokers.length === 0 ? '📂' : '⏳'}
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-base">
                    {prokers.length === 0 ? 'Belum Ada Program Kerja' : 'Program Kerja Menunggu Persetujuan DPL'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    {prokers.length === 0
                      ? 'Kelompok Anda belum memiliki rancangan Program Kerja. Untuk hari-hari awal, silakan gunakan tab Logbook Personal untuk mencatat kegiatan rapat dan observasi.'
                      : `Terdapat ${prokers.length} usulan Program Kerja yang masih dalam proses evaluasi/persetujuan oleh DPL. Silakan gunakan tab Logbook Personal untuk aktivitas harian Anda.`}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleTabChange('individu')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      Beralih ke Logbook Personal →
                    </button>
                    {prokers.length === 0 && pokja && (String(pokja.ketua_id?._id || pokja.ketua_id) === String(session?.user?.id)) && (
                      <button
                        type="button"
                        onClick={() => router.push('/mahasiswa/proker')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                      >
                        Rancang Proker Sekarang
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tanggal Kegiatan</label>
                    <input required value={tanggal} onChange={(e) => setTanggal(e.target.value)} type="date" className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/60 text-slate-900 dark:text-white" />
                  </div>
                  
                  {activeTab === 'pokja' ? (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Pilih Program Kerja <span className="text-red-500">*</span></label>
                      <select required value={prokerId} onChange={(e) => setProkerId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/60 text-slate-900 dark:text-white">
                        <option value="">-- Pilih Proker --</option>
                        {filteredProkers.map(p => {
                          const userId = String(session?.user?.id || session?.user?._id || '');
                          const isPIC = Array.isArray(p.pic_id)
                            ? p.pic_id.some(pic => String(pic?._id || pic?.id || pic) === userId)
                            : String(p.pic_id?._id || p.pic_id?.id || p.pic_id) === userId;

                          return (
                            <option key={p._id} value={p._id}>
                              {p.judul_proker} {p.jenis_proker === 'Utama' ? '— (🌟 Utama)' : isPIC ? '— (Pendukung • PIC Anda)' : '— (Pendukung)'}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Program Kerja Terkait (Opsional)</label>
                      <select value={prokerId} onChange={(e) => setProkerId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/60 text-slate-900 dark:text-white">
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
                    <input required value={rencanaTarget} onChange={(e) => setRencanaTarget(e.target.value)} type="text" placeholder="Cth: Mengadakan observasi ke balai desa" className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Uraian Kegiatan <span className="text-red-500">*</span></label>
                    <textarea required minLength="20" value={uraianKegiatan} onChange={(e) => setUraianKegiatan(e.target.value)} rows="3" placeholder="Ceritakan detail apa saja yang dilakukan..." className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Hasil/Output <span className="text-red-500">*</span></label>
                    <input required value={hasilOutput} onChange={(e) => setHasilOutput(e.target.value)} type="text" placeholder="Cth: Mendapat data monografi desa" className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Kendala & Solusi (Opsional)</label>
                    <textarea value={kendalaSolusi} onChange={(e) => setKendalaSolusi(e.target.value)} rows="2" placeholder="Jika ada kendala, bagaimana mengatasinya?" className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Upload Bukti Foto <span className="text-red-500">*</span></span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <Sparkles className="w-3 h-3 text-emerald-500" /> Auto-Compress Aktif
                      </span>
                    </label>
                    <input 
                      required 
                      id="file-upload" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="w-full px-4 py-2.5 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                    />

                    {/* Status Loading Kompresi */}
                    {compressingImage && (
                      <div className="flex items-center gap-2 mt-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-700 dark:text-amber-300 animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
                        <span>Mengompresi foto otomatis agar ringan diupload...</span>
                      </div>
                    )}

                    {/* Feedback Hasil Kompresi */}
                    {compressionInfo && !compressingImage && (
                      <div className="mt-2.5 p-3 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Foto Berhasil Dioptimalkan</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100 font-bold text-[10px]">
                            Hemat {compressionInfo.ratio}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                          <span>Ukuran: <span className="line-through text-slate-400">{formatBytes(compressionInfo.originalSize)}</span> ➔ <strong className="font-bold text-emerald-600 dark:text-emerald-400">{formatBytes(compressionInfo.compressedSize)}</strong></span>
                          <span>Resolusi: {compressionInfo.width}×{compressionInfo.height}px</span>
                        </div>
                      </div>
                    )}

                    {/* Preview Gambar */}
                    {buktiFoto && !compressingImage && (
                      <div className="mt-2.5 flex items-center gap-3 p-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <img 
                          src={buktiFoto} 
                          alt="Preview Bukti" 
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-xs shrink-0" 
                        />
                        <div className="text-xs truncate">
                          <p className="font-bold text-slate-700 dark:text-slate-200">Pratinjau Bukti Foto</p>
                          <p className="text-slate-500 text-[11px]">Foto siap diunggah bersama catatan logbook</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Keterangan Gambar / Foto <span className="text-red-500">*</span></label>
                    <input required value={keteranganBukti} onChange={(e) => setKeteranganBukti(e.target.value)} type="text" placeholder="Cth: Foto bersama kepala desa di balai desa" className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm" />
                  </div>
                  <button 
                    type="submit" 
                    disabled={submitting || compressingImage}
                    className="w-full bg-teal-600 hover:bg-teal-700 py-3.5 text-sm font-bold text-white rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyimpan Logbook...</span>
                      </>
                    ) : compressingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengompresi Foto...</span>
                      </>
                    ) : (
                      'Simpan Logbook'
                    )}
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
                {displayedLogbooks.map(log => {
                  const isUnvalidated = log.status_validasi === 'menunggu_dpl' || log.status_validasi === 'menunggu_mentor';
                  const isValidated = log.status_validasi === 'selesai' || log.status_validasi === 'selesai_tanpa_mentor';
                  
                  let cardBg = "bg-white/40 dark:bg-slate-800/40 border-white/60 dark:border-slate-700";
                  if (isUnvalidated) {
                    cardBg = "bg-rose-50/50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-900/50";
                  } else if (isValidated) {
                    cardBg = "bg-teal-50/30 dark:bg-teal-900/10 border-teal-200 dark:border-teal-900/50";
                  }

                  return (
                  <div key={log._id} className={`${cardBg} backdrop-blur-xl p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md`}>
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
                  );
                })}

                {/* PAGINATION UI */}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700 gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Tampilkan:</span>
                    <select 
                      value={limit} 
                      onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-medium"
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
