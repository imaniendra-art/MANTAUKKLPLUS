'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, FileCheck, Eye, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import DashboardLayout from "@/components/DashboardLayout";

export default function AdminLaporanDplPage() {
  const { data: session } = useSession();
  const [laporans, setLaporans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLaporan, setSelectedLaporan] = useState(null);

  useEffect(() => {
    fetchLaporans();
  }, []);

  const fetchLaporans = async () => {
    try {
      const res = await fetch('/api/admin/laporan-dpl');
      const data = await res.json();
      if (res.ok) {
        setLaporans(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    if (!confirm(`Apakah Anda yakin ingin melakukan ${action} pada laporan ini?`)) return;
    
    try {
      const res = await fetch('/api/admin/laporan-dpl', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      });
      if (res.ok) {
        fetchLaporans();
      } else {
        const error = await res.json();
        alert(error.error || 'Terjadi kesalahan');
      }
    } catch (err) {
      alert('Gagal menghubungi server');
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-white/60 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-lg">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Validasi Laporan DPL</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Terbitkan Lembar Pengesahan Digital (QR Code) untuk Laporan DPL yang telah disubmit.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {laporans.length === 0 && (
            <div className="p-10 text-center text-slate-500 dark:text-slate-400 bg-white/30 dark:bg-slate-800/30 backdrop-blur-md rounded-2xl border border-white/50 dark:border-slate-700">
              <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              Tidak ada laporan DPL yang perlu divalidasi saat ini.
            </div>
          )}

          {laporans.map((laporan) => (
            <div key={laporan._id} className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-white/60 dark:border-slate-700 shadow-sm transition-all hover:bg-white/70 dark:hover:bg-slate-800/70 hover:shadow-md group">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                
                {/* Bagian Kiri: Info DPL & Status */}
                <div className="w-full lg:w-[35%]">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{laporan.dpl_id?.nama_lengkap}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${
                        laporan.status === 'disetujui' ? 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20' : 
                        laporan.status === 'revisi' ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' : 
                        'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20'
                      }`}>
                        {laporan.status}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded whitespace-nowrap">
                        {new Date(laporan.updatedAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">NIDN: {laporan.dpl_id?.nim_nidn}</p>
                  </div>
                </div>

                {/* Bagian Tengah: Info Pokja */}
                <div className="flex-1 w-full">
                  {laporan.pokja_info && laporan.pokja_info.length > 0 ? (
                    <div className="space-y-2">
                      {laporan.pokja_info.map((p, idx) => (
                        <div key={idx} className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">{p.nama_pokja}</p>
                            <p className="text-xs mt-0.5">Ketua: <span className="font-medium text-slate-800 dark:text-slate-200">{p.ketua}</span></p>
                          </div>
                          <div className="sm:text-right">
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Lokasi</p>
                            <p className="text-teal-600 dark:text-teal-400 font-bold text-xs">{p.mitra}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400 italic bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                      Belum ada data POKJA
                    </div>
                  )}
                </div>
                
                {/* Bagian Kanan: Aksi */}
                <div className="flex shrink-0 w-full lg:w-auto">
                  {laporan.status === 'submitted' && (
                    <button onClick={() => setSelectedLaporan(laporan)} className="flex-1 md:flex-none flex items-center justify-center px-4 py-2.5 font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 transition-all shadow-md hover:-translate-y-0.5">
                      <Eye className="w-4 h-4 mr-2" />
                      Lihat & Validasi
                    </button>
                  )}
                  {laporan.status === 'disetujui' && (
                    <div className="w-full md:w-auto text-sm font-bold text-teal-700 dark:text-teal-400 flex items-center justify-center bg-teal-500/10 dark:bg-teal-500/20 px-4 py-3 rounded-xl border border-teal-500/20 dark:border-teal-500/30">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      QR Diterbitkan
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL PREVIEW */}
      {selectedLaporan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold">Preview Laporan: {selectedLaporan.dpl_id?.nama_lengkap}</h2>
              <button onClick={() => setSelectedLaporan(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8 text-sm text-slate-700 dark:text-slate-300 flex-1">
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 border-b pb-1">I. PENDAHULUAN</h3>
                <div>
                  <p className="font-bold">A. Latar Belakang</p>
                  <div className="whitespace-pre-wrap mt-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">{selectedLaporan.latar_belakang || '-'}</div>
                </div>
                <div>
                  <p className="font-bold">B. Tujuan Pembimbingan</p>
                  <div className="whitespace-pre-wrap mt-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">{selectedLaporan.tujuan_pembimbingan || '-'}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 border-b pb-1">II. PELAKSANAAN PEMBIMBINGAN</h3>
                <div>
                  <p className="font-bold">Jadwal Pembekalan</p>
                  <div className="whitespace-pre-wrap mt-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">{selectedLaporan.jadwal_pembekalan || '-'}</div>
                </div>
                <div>
                  <p className="font-bold">Jadwal Monitoring 1</p>
                  <div className="whitespace-pre-wrap mt-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">{selectedLaporan.jadwal_monitoring_1 || '-'}</div>
                </div>
                <div>
                  <p className="font-bold">Jadwal Monitoring 2</p>
                  <div className="whitespace-pre-wrap mt-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">{selectedLaporan.jadwal_monitoring_2 || '-'}</div>
                </div>
                <div>
                  <p className="font-bold">Jadwal Penarikan</p>
                  <div className="whitespace-pre-wrap mt-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">{selectedLaporan.jadwal_penarikan || '-'}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 border-b pb-1">III. EVALUASI KINERJA & CAPAIAN</h3>
                {selectedLaporan.evaluasi_prokers_mapped && Object.keys(selectedLaporan.evaluasi_prokers_mapped).length > 0 && (
                   <div>
                     <p className="font-bold mb-2">Evaluasi Per Program Kerja</p>
                     <div className="space-y-3">
                       {Object.entries(selectedLaporan.evaluasi_prokers_mapped).map(([judul, val], idx) => (
                         <div key={idx} className="p-3 bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/30 rounded-xl">
                            <p className="font-bold text-teal-800 dark:text-teal-300 text-xs mb-1 uppercase tracking-wider">{judul}</p>
                            <div className="whitespace-pre-wrap">{val || '-'}</div>
                         </div>
                       ))}
                     </div>
                   </div>
                )}
                <div>
                  <p className="font-bold mt-4">Evaluasi Umum</p>
                  <div className="whitespace-pre-wrap mt-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">{selectedLaporan.evaluasi_kinerja || '-'}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 border-b pb-1">IV. KENDALA & SOLUSI</h3>
                <div>
                  <p className="font-bold">Kendala Lapangan</p>
                  <div className="whitespace-pre-wrap mt-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">{selectedLaporan.kendala_lapangan || '-'}</div>
                </div>
                <div>
                  <p className="font-bold">Solusi Lapangan</p>
                  <div className="whitespace-pre-wrap mt-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">{selectedLaporan.solusi_lapangan || '-'}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 border-b pb-1">V. KESIMPULAN & SARAN</h3>
                <div>
                  <p className="font-bold">Kesimpulan</p>
                  <div className="whitespace-pre-wrap mt-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">{selectedLaporan.kesimpulan || '-'}</div>
                </div>
                <div>
                  <p className="font-bold">Saran</p>
                  <div className="whitespace-pre-wrap mt-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">{selectedLaporan.saran || '-'}</div>
                </div>
              </div>

            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3 shrink-0">
              <button onClick={() => { handleAction(selectedLaporan._id, 'reject'); setSelectedLaporan(null); }} className="px-6 py-3 font-bold rounded-xl text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
                Tolak & Revisi
              </button>
              <button onClick={() => { handleAction(selectedLaporan._id, 'approve'); setSelectedLaporan(null); }} className="px-6 py-3 font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-md flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Validasi Laporan
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
