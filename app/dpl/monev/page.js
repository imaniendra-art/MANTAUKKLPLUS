"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Camera, MapPin, CheckCircle2, UploadCloud, Loader2, X, PlusCircle } from "lucide-react";

export default function MonevDPLPage() {
  const [pokjas, setPokjas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [toastMessage, setToastMessage] = useState("");
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPokja, setSelectedPokja] = useState(null);
  const [selectedJenis, setSelectedJenis] = useState("");
  const [filterPokjaId, setFilterPokjaId] = useState("ALL");

  const [tanggal, setTanggal] = useState("");
  const [catatan, setCatatan] = useState("");
  const [fotoBase64, setFotoBase64] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const fileInputRef = useRef(null);

  const jenisKunjungan = ["Pengantaran", "Pertengahan", "Penarikan"];

  const fetchMonev = async () => {
    try {
      const res = await fetch("/api/dpl/monev");
      const data = await res.json();
      if (res.ok) {
        setPokjas(data.pokjas || []);
      }
    } catch (error) {
      showToast("Gagal mengambil data Monev.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonev();
  }, []);

  const handleOpenModal = (pokja, jenis) => {
    setSelectedPokja(pokja);
    setSelectedJenis(jenis);
    setTanggal(new Date().toISOString().split("T")[0]);
    setCatatan("");
    setFotoBase64("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPokja(null);
    setSelectedJenis("");
    setTanggal("");
    setCatatan("");
    setFotoBase64("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Ukuran file terlalu besar (Maks 2MB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setFotoBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fotoBase64) {
      showToast("Foto wajib diunggah.");
      return;
    }
    setSubmitLoading(true);

    try {
      // 1. Upload photo
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: fotoBase64, prefix: "monev" }),
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Gagal upload foto");

      // 2. Submit monev data
      const monevRes = await fetch("/api/dpl/monev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pokja_id: selectedPokja._id,
          jenis_kunjungan: selectedJenis,
          tanggal_kunjungan: tanggal,
          catatan,
          foto_url: uploadData.url,
        }),
      });
      const monevData = await monevRes.json();
      if (!monevRes.ok) throw new Error(monevData.error || "Gagal menyimpan data");

      showToast(`Dokumentasi ${selectedJenis} berhasil disimpan!`);
      handleCloseModal();
      fetchMonev(); // Refresh data
    } catch (error) {
      showToast(error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <DashboardLayout title="Monev Lapangan">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in-down">
          <CheckCircle2 className="w-5 h-5 text-teal-400" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
      
      <div className="space-y-6 pb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-8 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Camera className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <h1 className="text-3xl font-black mb-2">Dokumentasi Kunjungan (Monev)</h1>
              <p className="text-teal-50 text-sm md:text-base leading-relaxed max-w-2xl font-medium">
                DPL wajib melaksanakan minimal 3 kali kunjungan ke lokasi instansi: Pengantaran, Pertengahan, dan Penarikan. Silakan unggah bukti foto dan catatan temuan kunjungan Anda di sini.
              </p>
            </div>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : pokjas.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-slate-500">Anda belum memiliki kelompok bimbingan yang aktif.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Dropdown Filter Kelompok */}
                {pokjas.length > 1 && (
                  <div className="flex justify-end items-center mb-6">
                    <label className="text-sm font-semibold text-slate-700 mr-3">Tampilkan Kelompok:</label>
                    <select
                      value={filterPokjaId}
                      onChange={(e) => setFilterPokjaId(e.target.value)}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="ALL">-- Semua Kelompok --</option>
                      {pokjas.map(p => (
                        <option key={`filter-${p._id}`} value={p._id}>
                          {p.nama_pokja ? p.nama_pokja : `Kelompok ${p.ketua_id?.nama_lengkap || 'Tanpa Ketua'}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-8">
                  {pokjas
                    .filter(p => filterPokjaId === "ALL" || p._id === filterPokjaId)
                    .map((pokja) => {
                    const monevs = pokja.monev || [];
                    const progress = monevs.length;

                    return (
                      <div key={pokja._id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <div className="bg-white p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            {pokja.nama_pokja && <span className="bg-teal-600 text-white px-2 py-0.5 rounded text-xs">{pokja.nama_pokja}</span>}
                            Ketua: {pokja.ketua_id?.nama_lengkap || "Belum ada ketua"}
                          </h2>
                          <p className="text-sm text-slate-600 flex items-center mt-1">
                            <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                            {pokja.mitra_id?.nama_mitra || "-"} ({pokja.mitra_id?.wilayah || "-"})
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-600">Progress:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${progress === 3 ? "bg-teal-100 text-teal-700" : progress > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-600"}`}>
                            {progress} / 3 Kunjungan
                          </span>
                        </div>
                      </div>

                      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {jenisKunjungan.map((jenis) => {
                          const monevRecord = monevs.find((m) => m.jenis_kunjungan === jenis);

                          return (
                            <div key={jenis} className={`rounded-xl border p-5 flex flex-col h-full ${monevRecord ? "bg-teal-50 border-teal-200" : "bg-white border-slate-200"}`}>
                              <h3 className="font-bold text-slate-800 flex items-center justify-between mb-4">
                                {jenis}
                                {monevRecord && <CheckCircle2 className="w-5 h-5 text-teal-600" />}
                              </h3>

                              {monevRecord ? (
                                <div className="space-y-3 flex-grow flex flex-col">
                                  <div className="text-sm text-slate-600">
                                    <span className="font-semibold block">Tanggal:</span>
                                    {new Date(monevRecord.tanggal_kunjungan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                  </div>
                                  <div className="text-sm text-slate-600 flex-grow">
                                    <span className="font-semibold block">Catatan:</span>
                                    <p className="line-clamp-3">{monevRecord.catatan || "-"}</p>
                                  </div>
                                  <div className="mt-auto pt-4">
                                    <a href={monevRecord.foto_url} target="_blank" rel="noopener noreferrer" className="block w-full py-2 text-center text-sm font-semibold text-teal-700 bg-teal-100 rounded-lg hover:bg-teal-200 transition">
                                      Lihat Foto
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center flex-grow py-8 text-center">
                                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                    <Camera className="w-6 h-6 text-slate-400" />
                                  </div>
                                  <p className="text-sm text-slate-500 mb-4">Belum ada dokumentasi</p>
                                  <button
                                    onClick={() => handleOpenModal(pokja, jenis)}
                                    className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition flex items-center gap-2"
                                  >
                                    <PlusCircle className="w-4 h-4" /> Upload
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                </div>
                
                {pokjas.filter(p => filterPokjaId === "ALL" || p._id === filterPokjaId).length === 0 && (
                  <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                    Tidak ada kelompok yang sesuai dengan filter.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden max-h-[95vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">Upload Dokumentasi {selectedJenis}</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal Kunjungan</label>
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full border-slate-200 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Foto Dokumentasi</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition"
                >
                  {fotoBase64 ? (
                    <img src={fotoBase64} alt="Preview" className="h-40 object-contain rounded-lg" />
                  ) : (
                    <>
                      <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500 font-medium">Klik untuk memilih foto (Maks 2MB)</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Catatan Kunjungan (Opsional)</label>
                <textarea
                  rows="3"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Kondisi lapangan, kendala, atau arahan yang diberikan..."
                  className="w-full border-slate-200 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                ></textarea>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitLoading}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || !fotoBase64 || !tanggal}
                  className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                  ) : "Simpan Dokumentasi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
