"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function CpmkMasterData() {
  const [paket, setPaket] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchPaket = async () => {
    try {
      const res = await fetch('/api/paket-matkul');
      const data = await res.json();
      setPaket(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaket();
  }, []);

  const handleGenerateAI = async (paket_id, matkul_id, cpmk_id) => {
    setGenerating(true);
    try {
      const res = await fetch('/api/ai/translate-cpmk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paket_id, matkul_id, cpmk_id })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Berhasil menghasilkan saran kegiatan!");
        fetchPaket(); // Refresh data
      } else {
        alert("Gagal: " + data.error);
      }
    } catch (error) {
      alert("Terjadi kesalahan: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardLayout title="Master Data CPMK & AI Translator">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="bg-teal-50 border border-teal-100 p-6 rounded-2xl mb-8">
          <h2 className="text-xl font-black text-teal-900 mb-2">✨ AI Translator CPMK</h2>
          <p className="text-sm text-teal-700 leading-relaxed font-medium">
            Seringkali bahasa akademis sulit dipahami oleh mahasiswa saat KKL Plus. Gunakan tombol <strong>Generate Saran AI</strong> pada setiap indikator di bawah ini untuk menerjemahkan bahasa dosen menjadi contoh kegiatan lapangan yang praktis. Saran ini akan sangat membantu AI Sistem saat menilai Logbook Harian mahasiswa!
          </p>
        </div>

        {loading ? (
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-32 bg-slate-200 rounded-2xl"></div>
          </div>
        ) : (
          paket.map((p) => (
            <div key={p._id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{p.nama_paket}</h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">Skema: <span className="uppercase text-slate-700">{p.jenis_skema}</span></p>
                </div>
              </div>
              
              <div className="p-6 space-y-8">
                {p.mata_kuliah?.map((mk) => (
                  <div key={mk._id} className="border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="bg-slate-100 p-4 border-b border-slate-200">
                      <p className="font-bold text-slate-800">{mk.kode} - {mk.nama}</p>
                      <p className="text-xs text-slate-500 font-medium">{mk.sks} SKS</p>
                    </div>
                    
                    <div className="p-4 space-y-6">
                      {mk.cpmk?.map((c) => (
                        <div key={c._id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm relative">
                          <p className="font-bold text-slate-800 mb-3 pr-40">{c.nama_cpmk}</p>
                          
                          <div className="mb-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Indikator Akademik:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              {c.indikator?.map((ind, i) => (
                                <li key={i} className="text-sm text-slate-600 font-medium">{ind}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-xs font-black text-amber-800 uppercase tracking-wider">💡 Saran Kegiatan (Bahasa Lapangan):</p>
                              <button 
                                onClick={() => handleGenerateAI(p._id, mk._id, c._id)}
                                disabled={generating}
                                className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold rounded-lg shadow-sm hover:from-amber-500 hover:to-amber-600 transition-all disabled:opacity-50 flex items-center gap-2"
                              >
                                {generating ? "Memproses..." : "✨ Generate AI"}
                              </button>
                            </div>
                            
                            {c.saran_kegiatan ? (
                              <div className="text-sm text-slate-700 whitespace-pre-line font-medium leading-relaxed">
                                {c.saran_kegiatan}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-400 italic">Belum ada saran kegiatan yang di-generate. Klik tombol di atas untuk membuat.</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
