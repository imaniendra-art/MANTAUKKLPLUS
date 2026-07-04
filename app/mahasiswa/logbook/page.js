"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";
import { FileSignature } from "lucide-react";

export default function LogbookPage() {
  const { data: session } = useSession();
  
  const [pokja, setPokja] = useState(null);
  const [prokers, setProkers] = useState([]);
  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tipe Logbook Tab
  const [activeTab, setActiveTab] = useState('individu'); // individu atau pokja

  const getTodayLocal = () => {
    if (typeof window === 'undefined') return "";
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    return (new Date(today - tzOffset)).toISOString().split('T')[0];
  };
  
  const [tanggal, setTanggal] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [buktiFoto, setBuktiFoto] = useState("");
  const [prokerId, setProkerId] = useState(""); // Hanya untuk tipe pokja
  
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

        // Fetch Logbooks berdasarkan tab (individu = mhsId, pokja = pokjaId)
        let url = `/api/logbook?tipe=${activeTab}`;
        if (activeTab === 'individu') {
          url += `&mhsId=${session.user.id}`;
        } else {
          url += `&pokjaId=${dataP._id}`;
        }
        const resL = await fetch(url);
        const dataL = await resL.json();
        setLogbooks(Array.isArray(dataL) ? dataL : []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [session, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    
    if (deskripsi.trim().split(/\s+/).length < 10) {
      alert("Deskripsi kegiatan terlalu singkat. Mohon tuliskan minimal 10 kata.");
      return;
    }
    
    if (!buktiFoto) {
      alert("Wajib mengunggah file bukti kegiatan nyata di lapangan.");
      return;
    }
    
    setSubmitting(true);

    try {
      const payload = {
        pokja_id: pokja._id,
        mahasiswa_id: session.user.id,
        tipe_logbook: activeTab,
        tanggal,
        deskripsi_kegiatan: deskripsi,
        bukti_kegiatan: buktiFoto
      };

      if (activeTab === 'pokja' && prokerId) {
        payload.proker_id = prokerId;
      }

      const res = await fetch('/api/logbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setTanggal(getTodayLocal());
        setDeskripsi("");
        setBuktiFoto("");
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

  const isKetua = pokja?.ketua_id?._id === session?.user?.id || pokja?.ketua_id === session?.user?.id;

  return (
    <DashboardLayout title="Logbook KKL Plus">
      
      {loading ? (
        <div className="text-center py-20 text-slate-500 font-bold animate-pulse">Memuat data logbook...</div>
      ) : !pokja || pokja.status_pokja !== 'berjalan' ? (
        <div className="max-w-2xl mx-auto mt-10">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-10 rounded-3xl border border-white/60 dark:border-slate-700 shadow-sm text-center">
            <div className="w-20 h-20 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🔒</div>
            <h2 className="text-2xl font-black mb-2 text-slate-800 dark:text-white">Akses Terkunci</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Logbook Harian terbuka **setelah** POKJA Anda disetujui oleh LPPM dan statusnya berjalan.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            <div className="flex bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl p-1 border border-white/60 dark:border-slate-700">
              <button 
                onClick={() => setActiveTab('individu')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === 'individu' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                Logbook Individu
              </button>
              <button 
                onClick={() => setActiveTab('pokja')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === 'pokja' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                Logbook POKJA
              </button>
            </div>

            {/* Form Pengisian */}
            {activeTab === 'individu' || (activeTab === 'pokja' && isKetua) ? (
              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-slate-700 shadow-sm overflow-hidden sticky top-28">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-indigo-50/30 dark:bg-indigo-900/10">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Tulis Logbook {activeTab === 'pokja' ? 'Kelompok' : 'Harian'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Isi berdasarkan aktivitas rill di {pokja.mitra_id?.nama_instansi}.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tanggal Kegiatan</label>
                    <input required value={tanggal} onChange={(e) => setTanggal(e.target.value)} type="date" className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/20" />
                  </div>
                  
                  {activeTab === 'pokja' && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Program Kerja Terkait</label>
                      <select value={prokerId} onChange={(e) => setProkerId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/20">
                        <option value="">-- Pilih Proker (Opsional) --</option>
                        {prokers.map(p => (
                          <option key={p._id} value={p._id}>{p.nama_proker}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Kegiatan</label>
                    <textarea required minLength="50" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows="5" className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/20 text-sm"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Upload Bukti Foto <span className="text-red-500">*</span></label>
                    <input required id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="w-full px-4 py-2.5 rounded-xl border border-white/60 dark:border-slate-700 bg-white/20 dark:bg-slate-900/20 text-sm" />
                  </div>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 py-3.5 text-sm font-bold text-white rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Logbook'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-8 rounded-3xl border border-white/60 dark:border-slate-700 text-center">
                <p className="text-slate-500">Hanya Ketua POKJA yang dapat mengisi Logbook Kelompok.</p>
              </div>
            )}
          </div>

          {/* KANAN: Riwayat Logbook */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Riwayat Logbook {activeTab === 'pokja' ? 'POKJA' : 'Individu'}</h3>
            
            {logbooks.length === 0 ? (
              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-10 rounded-3xl border border-white/60 dark:border-slate-700 shadow-sm text-center">
                <div className="text-4xl mb-4"><FileSignature className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /></div>
                <p className="text-slate-500 font-medium">Belum ada riwayat logbook.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logbooks.map(log => (
                  <div key={log._id} className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{new Date(log.tanggal).toLocaleDateString('id-ID', { weekday: 'long', month: 'short', year: 'numeric' })}</p>
                        {activeTab === 'pokja' && log.proker_id && (
                          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1">Proker: {log.proker_id.nama_proker}</p>
                        )}
                        {activeTab === 'pokja' && (
                          <p className="text-xs text-slate-500 mt-1">Oleh: {log.mahasiswa_id?.nama_lengkap}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {log.bukti_kegiatan && (
                          <button onClick={() => handleViewFile(log.bukti_kegiatan)} className="text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                            🖼️ Bukti
                          </button>
                        )}
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-md uppercase tracking-wider">{log.status_validasi}</span>
                      </div>
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 text-sm mt-4 leading-relaxed">{log.deskripsi_kegiatan}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      )}
    </DashboardLayout>
  );
}
