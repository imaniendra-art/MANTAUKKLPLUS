"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";
import { Check, X } from "lucide-react";

export default function DplValidasiLaporan() {
  const { data: session } = useSession();
  const [laporans, setLaporans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState(null);
  const [catatan, setCatatan] = useState("");

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/laporan-akhir?role=dpl&dplId=${session.user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) setLaporans(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleValidasi = async (id, newStatus, catatan_dpl = "") => {
    try {
      const res = await fetch('/api/laporan-akhir', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, catatan_dpl })
      });
      if (res.ok) {
        showToast(newStatus === 'disetujui' ? "Laporan Berhasil Disetujui!" : "Laporan dikembalikan untuk revisi.");
        setShowModal(false);
        setCatatan("");
        fetchData();
      } else {
        const errorData = await res.json();
        alert(`Gagal mengupdate laporan: ${errorData.error || 'Server error'}`);
      }
    } catch (error) {
      alert(`Terjadi kesalahan sistem: ${error.message}`);
    }
  };

  const openRevisiModal = (laporan) => {
    setSelectedLaporan(laporan);
    setCatatan(laporan.catatan_dpl || "");
    setShowModal(true);
  };

  return (
    <DashboardLayout title="Validasi Laporan Akhir (DPL)">
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-3.5 rounded-full shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-300 font-bold flex items-center gap-2.5 border border-emerald-500">
          <span><Check className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /></span> {toastMessage}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-slate-500 font-bold animate-pulse">Memuat laporan...</div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6 font-bold">Mahasiswa</th>
                    <th className="py-4 px-6 font-bold">Tempat KKL Plus</th>
                    <th className="py-4 px-6 font-bold text-center">Status</th>
                    <th className="py-4 px-6 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {laporans.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-500 font-medium">
                        Belum ada laporan akhir yang disubmit oleh mahasiswa bimbingan Anda.
                      </td>
                    </tr>
                  ) : (
                    laporans.map((laporan) => (
                      <tr key={laporan._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 align-middle">
                          <p className="font-bold text-sm text-slate-800">{laporan.mahasiswa_id?.nama_lengkap}</p>
                          <p className="text-xs text-slate-500 mt-1">{laporan.mahasiswa_id?.nim_nidn}</p>
                        </td>
                        <td className="py-4 px-6 align-middle">
                          <p className="text-sm font-medium text-slate-700">
                            {laporan.pengajuan_id?.mitra_id?.nama_perusahaan || laporan.pengajuan_id?.detail_tempat?.nama}
                          </p>
                        </td>
                        <td className="py-4 px-6 align-middle text-center">
                          {laporan.status === 'submitted' && (
                            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">Perlu Diperiksa</span>
                          )}
                          {laporan.status === 'revisi' && (
                            <span className="text-xs font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full">Menunggu Revisi</span>
                          )}
                          {laporan.status === 'disetujui' && (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">Disetujui</span>
                          )}
                        </td>
                        <td className="py-4 px-6 align-middle text-right">
                          <div className="flex justify-end gap-2">
                            <a 
                              href={`/mahasiswa/laporan/cetak/laporan?mhsId=${laporan.mahasiswa_id?._id}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors border border-blue-200"
                            >
                              📄 Lihat Laporan
                            </a>
                            
                            {laporan.status !== 'disetujui' && (
                              <>
                                <button 
                                  onClick={() => openRevisiModal(laporan)}
                                  className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-lg transition-colors border border-rose-200"
                                >
                                  <X className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Revisi
                                </button>
                                <button 
                                  onClick={() => {
                                    if(confirm("Apakah Anda yakin menyetujui laporan ini? Mahasiswa akan dapat mencetak laporan akhirnya.")) {
                                      handleValidasi(laporan._id, 'disetujui');
                                    }
                                  }}
                                  className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg transition-colors border border-emerald-200"
                                >
                                  <Check className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Setujui
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Revisi */}
      {showModal && selectedLaporan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Berikan Catatan Revisi</h3>
              <p className="text-sm text-slate-500 mb-4">Mahasiswa: <span className="font-bold text-slate-700">{selectedLaporan.mahasiswa_id?.nama_lengkap}</span></p>
              
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Tuliskan bagian mana yang perlu diperbaiki oleh mahasiswa..."
                className="w-full h-32 border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-rose-500 text-sm"
              ></textarea>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={() => handleValidasi(selectedLaporan._id, 'revisi', catatan)}
                  disabled={!catatan.trim()}
                  className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
                >
                  Kirim Revisi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
