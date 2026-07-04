"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import DashboardLayout from "@/components/DashboardLayout";
import * as XLSX from "xlsx";
import { Check } from "lucide-react";

export default function MasterData() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("mitra"); // 'mitra' | 'kurikulum'
  const [expandedMatkulId, setExpandedMatkulId] = useState(null);
  
  // Data State
  const [mitras, setMitras] = useState([]);
  const [pakets, setPakets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals State
  const [showMitraModal, setShowMitraModal] = useState(false);
  const [showAddMatkulModal, setShowAddMatkulModal] = useState(false);
  const [showEditMatkulModal, setShowEditMatkulModal] = useState(false);
  const [showAddCpmkModal, setShowAddCpmkModal] = useState(false);
  const [showAddIndikatorModal, setShowAddIndikatorModal] = useState(false);
  
  const [selectedMatkul, setSelectedMatkul] = useState(null);
  const [selectedCPMK, setSelectedCPMK] = useState(null);
  const [generatingAIId, setGeneratingAIId] = useState(null);
  
  // AI Preview Modal State
  const [showSaranModal, setShowSaranModal] = useState(false);
  const [saranPreview, setSaranPreview] = useState("");
  const [saranTarget, setSaranTarget] = useState(null);
  
  // Toast State
  const [toastMessage, setToastMessage] = useState("");

  // Form State
  const [mitraForm, setMitraForm] = useState({ id: null, nama_instansi: "", jenis_skema: "Corporate", alamat: "", deskripsi_mitra: "" });
  
  // Posisi State
  const [showKelolaPosisiModal, setShowKelolaPosisiModal] = useState(false);
  const [selectedMitraForPosisi, setSelectedMitraForPosisi] = useState(null);
  const [posisiList, setPosisiList] = useState([]);
  const [showPosisiFormModal, setShowPosisiFormModal] = useState(false);
  const [posisiForm, setPosisiForm] = useState({ 
    id: null, nama_posisi: "", konsentrasi: "SDM", kuota: 1, 
    deskripsi_pekerjaan: "", kriteria_kandidat: "", sistem_kerja: "WFO" 
  });
  const [matkulForm, setMatkulForm] = useState({ kode: "", nama: "", sks: 3 });
  const [cpmkForm, setCpmkForm] = useState({ nama_cpmk: "" });
  const [indikatorForm, setIndikatorForm] = useState({ indikator: "" });

  // Pagination State for Mitra
  const [currentPageMitra, setCurrentPageMitra] = useState(1);
  const itemsPerPage = 8;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mitraRes, paketRes] = await Promise.all([
        fetch('/api/mitra'),
        fetch('/api/paket-matkul')
      ]);
      const mitraData = await mitraRes.json();
      const paketData = await paketRes.json();
      
      if (Array.isArray(mitraData)) setMitras(mitraData);
      if (Array.isArray(paketData)) setPakets(paketData);
    } catch (error) {
      console.error("Gagal mengambil data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async (paketId, matkulId, cpmkId) => {
    setGeneratingAIId(cpmkId);
    try {
      const res = await fetch('/api/ai/translate-cpmk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paket_id: paketId, matkul_id: matkulId, cpmk_id: cpmkId })
      });
      const data = await res.json();
      if (res.ok) {
        setSaranPreview(data.saran_kegiatan);
        setSaranTarget({ paketId, matkulId, cpmkId });
        setShowSaranModal(true);
      } else {
        showToast("Gagal: " + data.error);
      }
    } catch (error) {
      showToast("Terjadi kesalahan sistem.");
    } finally {
      setGeneratingAIId(null);
    }
  };

  const handleSaveSaran = async () => {
    if (!saranTarget) return;
    try {
      // Parse saranPreview into array of strings
      const newIndikators = saranPreview.split('\n')
        .map(line => line.replace(/^[-*•\d.\s]+/, '').trim())
        .filter(line => line.length > 5);

      if (newIndikators.length === 0) {
        return showToast("Tidak ada saran valid untuk disimpan.");
      }

      const res = await fetch('/api/paket-matkul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'save_saran', 
          paketId: saranTarget.paketId, 
          matkulId: saranTarget.matkulId, 
          cpmkId: saranTarget.cpmkId,
          indikators: newIndikators
        })
      });
      if (res.ok) {
        setShowSaranModal(false);
        showToast("Saran kegiatan berhasil disimpan!");
        fetchData();
      } else {
        showToast("Gagal menyimpan saran.");
      }
    } catch (error) {
      showToast("Terjadi kesalahan saat menyimpan.");
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchData();
    };
    load();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleMitraSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = '/api/mitra';
      const method = mitraForm.id ? 'PATCH' : 'POST';
      const body = {
        nama_instansi: mitraForm.nama_instansi,
        jenis_skema: mitraForm.jenis_skema.toLowerCase(),
        alamat: mitraForm.alamat,
        deskripsi_mitra: mitraForm.deskripsi_mitra
      };
      if (mitraForm.id) body.id = mitraForm.id;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowMitraModal(false);
        setMitraForm({ id: null, nama_instansi: "", jenis_skema: "Corporate", alamat: "", deskripsi_mitra: "" });
        showToast(mitraForm.id ? "Data Mitra berhasil diperbarui!" : "Data Mitra berhasil disimpan!");
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteMitra = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus Mitra ini? Semua posisi KKL Plus yang terkait akan ikut terhapus!")) return;
    try {
      const res = await fetch(`/api/mitra?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast("Mitra berhasil dihapus!");
        fetchData();
      }
    } catch (error) { console.error(error); }
  };

  // Posisi Handlers
  const fetchPosisi = async (mitraId) => {
    try {
      const res = await fetch(`/api/posisi?mitraId=${mitraId}`);
      if (res.ok) {
        const data = await res.json();
        setPosisiList(data);
      }
    } catch (error) { console.error("Gagal fetch posisi", error); }
  };

  const handleOpenKelolaPosisi = (mitra) => {
    setSelectedMitraForPosisi(mitra);
    fetchPosisi(mitra._id);
    setShowKelolaPosisiModal(true);
  };

  const handlePosisiSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = '/api/posisi';
      const method = posisiForm.id ? 'PATCH' : 'POST';
      const body = { ...posisiForm, mitra_id: selectedMitraForPosisi._id };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowPosisiFormModal(false);
        setPosisiForm({ id: null, nama_posisi: "", konsentrasi: "SDM", kuota: 1, deskripsi_pekerjaan: "", kriteria_kandidat: "", sistem_kerja: "WFO" });
        showToast(posisiForm.id ? "Posisi berhasil diperbarui!" : "Posisi berhasil ditambahkan!");
        fetchPosisi(selectedMitraForPosisi._id);
      }
    } catch (error) { console.error(error); }
  };

  const handleDeletePosisi = async (id) => {
    if (!window.confirm("Hapus posisi KKL Plus ini?")) return;
    try {
      const res = await fetch(`/api/posisi?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast("Posisi berhasil dihapus!");
        fetchPosisi(selectedMitraForPosisi._id);
      }
    } catch (error) { console.error(error); }
  };

  const handleMatkulSubmit = async (e) => {
    e.preventDefault();
    try {
      const paketId = pakets[0]?._id;
      if (!paketId) return showToast("Paket utama tidak ditemukan");
      const res = await fetch('/api/paket-matkul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_matkul', paketId, ...matkulForm })
      });
      if (res.ok) {
        setShowAddMatkulModal(false);
        setMatkulForm({ kode: "", nama: "", sks: 3 });
        showToast("Mata Kuliah berhasil ditambahkan!");
        fetchData();
      }
    } catch (error) { console.error(error); }
  };

  const handleEditMatkulSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMatkul) return;
    try {
      const res = await fetch('/api/paket-matkul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit_matkul',
          paketId: selectedMatkul.paketId,
          matkulId: selectedMatkul.matkulId,
          ...matkulForm
        })
      });
      if (res.ok) {
        setShowEditMatkulModal(false);
        setMatkulForm({ kode: "", nama: "", sks: 3 });
        showToast("Mata Kuliah berhasil diperbarui!");
        fetchData();
      }
    } catch (error) { console.error(error); }
  };

  // Dynamic form handlers for CPMK & Indikator
  const handleAddCpmkField = () => {
    setMatkulForm(prev => ({
      ...prev,
      cpmk: [...(prev.cpmk || []), { nama_cpmk: "", indikator: [] }]
    }));
  };

  const handleUpdateCpmkField = (index, value) => {
    setMatkulForm(prev => {
      const newCpmk = [...(prev.cpmk || [])];
      newCpmk[index].nama_cpmk = value;
      return { ...prev, cpmk: newCpmk };
    });
  };

  const handleRemoveCpmkField = (index) => {
    if (!window.confirm("Hapus CPMK ini beserta semua indikatornya?")) return;
    setMatkulForm(prev => {
      const newCpmk = [...(prev.cpmk || [])];
      newCpmk.splice(index, 1);
      return { ...prev, cpmk: newCpmk };
    });
  };

  const handleAddIndikatorField = (cpmkIndex) => {
    setMatkulForm(prev => {
      const newCpmk = [...(prev.cpmk || [])];
      newCpmk[cpmkIndex].indikator.push("");
      return { ...prev, cpmk: newCpmk };
    });
  };

  const handleUpdateIndikatorField = (cpmkIndex, indIndex, value) => {
    setMatkulForm(prev => {
      const newCpmk = [...(prev.cpmk || [])];
      newCpmk[cpmkIndex].indikator[indIndex] = value;
      return { ...prev, cpmk: newCpmk };
    });
  };

  const handleRemoveIndikatorField = (cpmkIndex, indIndex) => {
    setMatkulForm(prev => {
      const newCpmk = [...(prev.cpmk || [])];
      newCpmk[cpmkIndex].indikator.splice(indIndex, 1);
      return { ...prev, cpmk: newCpmk };
    });
  };

  const handleAddCpmkSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMatkul) return;
    try {
      const res = await fetch('/api/paket-matkul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_cpmk',
          paketId: selectedMatkul.paketId,
          matkulId: selectedMatkul.matkulId,
          nama_cpmk: cpmkForm.nama_cpmk
        })
      });
      if (res.ok) {
        setShowAddCpmkModal(false);
        setCpmkForm({ nama_cpmk: "" });
        showToast("CPMK berhasil ditambahkan!");
        fetchData();
      }
    } catch (error) { console.error(error); }
  };

  const handleAddIndikatorSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCPMK) return;
    try {
      const res = await fetch('/api/paket-matkul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_indikator',
          paketId: selectedCPMK.paketId,
          matkulId: selectedCPMK.matkulId,
          cpmkId: selectedCPMK.cpmkId,
          indikator: indikatorForm.indikator
        })
      });
      if (res.ok) {
        setShowAddIndikatorModal(false);
        setIndikatorForm({ indikator: "" });
        showToast("Indikator berhasil ditambahkan!");
        fetchData();
      }
    } catch (error) { console.error(error); }
  };

  const handleDeleteMatkul = async (paketId, matkulId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus Mata Kuliah ini? Tindakan ini tidak dapat dibatalkan.")) return;
    try {
      const res = await fetch('/api/paket-matkul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_matkul', paketId, matkulId })
      });
      if (res.ok) { showToast("Mata Kuliah berhasil dihapus!"); fetchData(); }
    } catch (error) { console.error(error); }
  };

  const handleDeleteCpmk = async (paketId, matkulId, cpmkId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus CPMK ini? Tindakan ini tidak dapat dibatalkan.")) return;
    try {
      const res = await fetch('/api/paket-matkul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_cpmk', paketId, matkulId, cpmkId })
      });
      if (res.ok) { showToast("CPMK berhasil dihapus!"); fetchData(); }
    } catch (error) { console.error(error); }
  };

  const handleDeleteIndikator = async (paketId, matkulId, cpmkId, indikatorIndex) => {
    if (!window.confirm("Hapus indikator ini?")) return;
    try {
      const res = await fetch('/api/paket-matkul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_indikator', paketId, matkulId, cpmkId, indikatorIndex })
      });
      if (res.ok) { showToast("Indikator berhasil dihapus!"); fetchData(); }
    } catch (error) { console.error(error); }
  };

  // Ekstrak semua matkul untuk ditampilkan di UI
  const allMatkuls = pakets.flatMap(paket => 
    (paket.mata_kuliah || []).map(mk => ({ ...mk, paketId: paket._id, matkulId: mk._id }))
  );

  const getPetunjukSheet = () => {
    const sheetData = [
      ["PETUNJUK PENGISIAN FORMAT EXCEL CAPAIAN PEMBELAJARAN (MAGANG BERDAMPAK)"],
      [],
      ["Langkah 1:", "Isi 'Kode Mata Kuliah', 'Nama Mata Kuliah', 'SKS', dan 'Dosen Pengampu' pada baris yang telah disediakan."],
      ["Langkah 2:", "Tentukan CPMK (Capaian Pembelajaran Mata Kuliah)."],
      ["", "Contoh penulisan baris: CPMK 1: Mahasiswa mampu mengevaluasi strategi pemasaran digital."],
      ["Langkah 3:", "Di bawah CPMK, berikan baris bertuliskan 'Indikator:'."],
      ["Langkah 4:", "Di bawah baris 'Indikator:', jabarkan 3-5 Indikator (Aktivitas Nyata di lapangan) yang harus dicapai mahasiswa."],
      ["", "PENTING: Gunakan bahasa yang mudah dipahami mahasiswa! Semakin spesifik kegiatan di lapangan, semakin mudah AI mencocokkan logbook mahasiswa."],
      ["", "Contoh Indikator yang BAIK: 1. Membantu membuat konten sosial media."],
      ["", "                            2. Merekap insight/statistik penjualan di Instagram."],
      ["", "Contoh Indikator yang BURUK (Terlalu Akademis): 1. Memahami konsep segmentasi pasar."],
      [],
      ["CATATAN:", "Buat Sheet baru untuk setiap Mata Kuliah yang berbeda. Jangan ubah nama Sheet PETUNJUK ini."],
    ];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = [{ wch: 15 }, { wch: 100 }];
    return ws;
  };

  const handleExportExcel = () => {
    if (!allMatkuls || allMatkuls.length === 0) {
      return showToast("Tidak ada data mata kuliah untuk diexport!");
    }
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, getPetunjukSheet(), "PETUNJUK");
    
    allMatkuls.forEach((mk) => {
      const sheetData = [];
      
      sheetData.push(["Kode Mata Kuliah", mk.kode]);
      sheetData.push(["Nama Mata Kuliah", mk.nama]);
      sheetData.push(["SKS", mk.sks]);
      sheetData.push(["Dosen Pengampu", mk.dosen_pengampu || ""]);
      sheetData.push([]);
      
      if (mk.cpmk && mk.cpmk.length > 0) {
        mk.cpmk.forEach((cpmk, index) => {
          let cpmkText = cpmk.nama_cpmk;
          if (!cpmkText.toUpperCase().startsWith("CPMK")) {
            cpmkText = `CPMK ${index + 1}: ${cpmkText}`;
          }
          sheetData.push([cpmkText]);
          sheetData.push(["Indikator:"]);
          
          if (cpmk.indikator && cpmk.indikator.length > 0) {
            cpmk.indikator.forEach((ind, i) => {
              sheetData.push(["", `${i+1}. ${ind}`]);
            });
          } else {
            sheetData.push(["", "(Belum ada indikator)"]);
          }
          sheetData.push([]);
        });
      } else {
        sheetData.push(["(Belum ada CPMK)"]);
      }
      
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      
      // Auto-size columns slightly
      ws['!cols'] = [{ wch: 40 }, { wch: 80 }];
      
      let sheetName = mk.kode ? mk.kode.toString().replace(/[?*/\[\]\\]/g, "") : `MK_${mk.matkulId.substring(0,6)}`;
      sheetName = sheetName.substring(0, 31);
      
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
    
    XLSX.writeFile(wb, "DAFTAR MATKUL DI KONVERSI.xlsx");
  };

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, getPetunjukSheet(), "PETUNJUK");
    
    const templateData = [
      ["Kode Mata Kuliah", "MK.001"],
      ["Nama Mata Kuliah", "Contoh Mata Kuliah"],
      ["SKS", 3],
      ["Dosen Pengampu", ""],
      [],
      ["CPMK 1: Mahasiswa mampu melakukan analisis dasar."],
      ["Indikator:"],
      ["", "1. Mahasiswa mengumpulkan data lapangan."],
      ["", "2. Mahasiswa menyusun laporan mingguan."],
    ];
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    ws['!cols'] = [{ wch: 40 }, { wch: 80 }];
    XLSX.utils.book_append_sheet(wb, ws, "MK.001");
    
    XLSX.writeFile(wb, "Template_Kurikulum.xlsx");
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const paketId = pakets[0]?._id;
    if (!paketId) {
      e.target.value = null;
      return showToast("Paket utama tidak ditemukan, silakan buat paket terlebih dahulu!");
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        
        const mata_kuliah_list = [];
        
        wb.SheetNames.forEach(sheetName => {
          if (sheetName.toUpperCase() === "PETUNJUK") return;
          
          const ws = wb.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
          
          let kode = sheetName;
          let nama = "Mata Kuliah Baru";
          let sks = 2;
          let dosen_pengampu = "";
          const cpmkList = [];
          
          let currentCpmk = null;
          
          data.forEach(row => {
            if (!row || row.length === 0) return;
            const col1 = row[0] ? row[0].toString().trim() : "";
            const col2 = row[1] ? row[1].toString().trim() : "";
            
            if (col1.toLowerCase() === "kode mata kuliah" && col2) kode = col2;
            else if (col1.toLowerCase() === "nama mata kuliah" && col2) nama = col2;
            else if (col1.toLowerCase() === "sks" && col2) sks = Number(col2) || 2;
            else if (col1.toLowerCase() === "dosen pengampu" && col2) dosen_pengampu = col2;
            else if (col1.toUpperCase().startsWith("CPMK")) {
              currentCpmk = { nama_cpmk: col1, indikator: [] };
              cpmkList.push(currentCpmk);
            }
            else if (col1.toLowerCase() === "indikator:" || col1.toLowerCase() === "indikator" || col1.toLowerCase() === "indikator :") {
              // Abaikan header indikator
            }
            else if (currentCpmk) {
              // Ambil teks apapun yang ada di kolom 1 atau kolom 2 setelah CPMK ditemukan (kecuali header)
              let text = col2 || col1;
              if (text && text.length > 4) {
                // Bersihkan prefix umum seperti "-> ", "- ", "* ", "1. ", "1) ", dll.
                text = text.replace(/^(\s*(->|=>|-|\*|\d+[\.\)]|\u2022)\s*)+/g, "").trim();
                if (text) currentCpmk.indikator.push(text);
              }
            }
          });
          
          mata_kuliah_list.push({ kode, nama, sks, dosen_pengampu, cpmk: cpmkList });
        });
        
        if (mata_kuliah_list.length === 0) {
          e.target.value = null;
          return showToast("Tidak ada data mata kuliah valid yang ditemukan di file!");
        }

        const res = await fetch('/api/paket-matkul', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'batch_import',
            paketId,
            mata_kuliah_list
          })
        });
        
        if (res.ok) {
          showToast(`Berhasil mengimpor ${mata_kuliah_list.length} Mata Kuliah!`);
          fetchData();
        } else {
          showToast("Gagal mengimpor data");
        }
      } catch (err) {
        console.error(err);
        showToast("Terjadi kesalahan saat memproses file Excel.");
      }
      e.target.value = null;
    };
    reader.readAsBinaryString(file);
  };

  // Pagination Calculations
  const indexOfLastMitra = currentPageMitra * itemsPerPage;
  const indexOfFirstMitra = indexOfLastMitra - itemsPerPage;
  const currentMitras = mitras.slice(indexOfFirstMitra, indexOfLastMitra);
  const totalPagesMitra = Math.ceil(mitras.length / itemsPerPage);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ... (inside return statement)
  return (
    <DashboardLayout title="Master Data & OBE">
      
      {/* Toast Notification (Portaled) */}
      {mounted && toastMessage && createPortal(
        <div style={{ zIndex: 999999 }} className="fixed top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-8 py-3 rounded-2xl shadow-xl shadow-slate-900/20 animate-in slide-in-from-top-10 fade-in duration-300 font-bold border border-slate-700/50 flex items-center gap-3">
          <span className="text-emerald-400 text-lg"><Check className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /></span> {toastMessage}
        </div>,
        document.body
      )}

      {/* Tabs Navigation */}
      <div className="flex space-x-1 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border-white/60 dark:border-slate-700 shadow-sm p-1.5 rounded-xl w-max mb-8 border border-white/60 dark:border-slate-700">
        <button 
          onClick={() => setActiveTab("mitra")}
          className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
            activeTab === "mitra" 
            ? "bg-[#1398A5] text-amber-300 shadow-sm" 
            : "text-slate-500 dark:text-slate-400 hover:text-white"
          }`}
        >
          Mitra Tempat KKL Plus
        </button>
        <button 
          onClick={() => setActiveTab("kurikulum")}
          className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
            activeTab === "kurikulum" 
            ? "bg-[#1398A5] text-amber-300 shadow-sm" 
            : "text-slate-500 dark:text-slate-400 hover:text-white"
          }`}
        >
          Kurikulum Konversi OBE
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400 font-bold animate-pulse">Memuat data dari database...</div>
      ) : (
        <>
          {/* Tab 1: Mitra Tempat KKL Plus */}
          {activeTab === "mitra" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Daftar Instansi / Mitra KKL Plus</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola perusahaan tempat mahasiswa melakukan kegiatan KKL Plus.</p>
                </div>
                <button 
                  onClick={() => setShowMitraModal(true)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-200/50"
                >
                  + Tambah Mitra Baru
                </button>
              </div>

              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-white/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold">
                      <th className="py-4 px-6 w-16 text-center">No</th>
                      <th className="py-4 px-6">Nama Instansi</th>
                      <th className="py-4 px-6">Jumlah Tersedia</th>
                      <th className="py-4 px-6">Divisi / Posisi</th>
                      <th className="py-4 px-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {currentMitras.length === 0 ? (
                      <tr><td colSpan="5" className="py-8 text-center text-slate-500 dark:text-slate-400">Belum ada data mitra.</td></tr>
                    ) : (
                      currentMitras.map((mitra, index) => (
                        <tr key={mitra._id} className="hover:bg-slate-50 dark:bg-slate-800/80 transition-colors">
                          <td className="py-4 px-6 text-center text-slate-500 dark:text-slate-400 font-medium">{indexOfFirstMitra + index + 1}</td>
                          <td className="py-4 px-6">
                            <div className="font-semibold text-slate-800 dark:text-slate-100">{mitra.nama_instansi}</div>
                            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold capitalize ${mitra.jenis_skema === 'corporate' ? 'bg-teal-50 text-[#1398A5]' : mitra.jenis_skema === 'wirausaha' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                              {mitra.kategori || mitra.jenis_skema}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {(mitra.posisi_list || []).reduce((acc, pos) => acc + (pos.kuota || 0), 0)} Slot
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-wrap gap-1.5">
                              {(mitra.posisi_list || []).length === 0 ? (
                                <span className="text-xs text-slate-400 italic">Belum ada posisi</span>
                              ) : (
                                (mitra.posisi_list || []).map(pos => (
                                  <span key={pos._id} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] rounded-md font-semibold border border-slate-200 dark:border-slate-600">
                                    {pos.nama_posisi}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => { setMitraForm({ id: mitra._id, nama_instansi: mitra.nama_instansi, jenis_skema: mitra.jenis_skema === 'wirausaha' ? 'Wirausaha' : mitra.jenis_skema === 'Pemerintahan' ? 'Pemerintahan' : 'Corporate', alamat: mitra.alamat, deskripsi_mitra: mitra.deskripsi_mitra || "" }); setShowMitraModal(true); }} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Edit</button>
                              <button onClick={() => handleDeleteMitra(mitra._id)} className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Hapus</button>
                              <button onClick={() => handleOpenKelolaPosisi(mitra)} className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors">Kelola Posisi</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPagesMitra > 1 && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Menampilkan {indexOfFirstMitra + 1} - {Math.min(indexOfLastMitra, mitras.length)} dari total {mitras.length} mitra
                  </span>
                  <div className="flex gap-2">
                    <button 
                      disabled={currentPageMitra === 1}
                      onClick={() => setCurrentPageMitra(prev => prev - 1)}
                      className="w-9 h-9 flex items-center justify-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                    >
                      &lt;
                    </button>
                    {Array.from({ length: totalPagesMitra }).map((_, i) => (
                      <button 
                        key={i}
                        onClick={() => setCurrentPageMitra(i + 1)}
                        className={`w-9 h-9 flex items-center justify-center font-bold rounded-lg shadow-sm transition-colors border ${currentPageMitra === i + 1 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border-white/60 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button 
                      disabled={currentPageMitra === totalPagesMitra}
                      onClick={() => setCurrentPageMitra(prev => prev + 1)}
                      className="w-9 h-9 flex items-center justify-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Kurikulum Konversi OBE */}
          {activeTab === "kurikulum" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Master Data Capaian Pembelajaran</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola indikator penilaian logbook mahasiswa untuk konversi SKS Mata Kuliah.</p>
                </div>
                <div className="flex gap-3">
                  <input type="file" id="import-excel" accept=".xlsx, .xls" className="hidden" onChange={handleImportExcel} />
                  <label 
                    htmlFor="import-excel"
                    className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-sky-200/50 flex items-center gap-2 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Import Excel
                  </label>
                  <button 
                    onClick={handleDownloadTemplate}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition-all border border-slate-300 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Template
                  </button>
                  <button 
                    onClick={handleExportExcel}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-200/50 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Export
                  </button>
                  <button 
                    onClick={() => setShowAddMatkulModal(true)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-200/50"
                  >
                    + Matakuliah
                  </button>
                </div>
              </div>

              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-white/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold">
                      <th className="py-4 px-6 w-16 text-center">No</th>
                      <th className="py-4 px-6">Mata Kuliah</th>
                      <th className="py-4 px-6 w-24 text-center">SKS</th>
                      <th className="py-4 px-6 w-32 text-center">Jml CPMK</th>
                      <th className="py-4 px-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {allMatkuls.length === 0 ? (
                      <tr><td colSpan="5" className="py-8 text-center text-slate-500 dark:text-slate-400">Belum ada data mata kuliah.</td></tr>
                    ) : (
                      allMatkuls.map((mk, index) => (
                        <React.Fragment key={mk.matkulId}>
                          <tr 
                            onClick={() => setExpandedMatkulId(expandedMatkulId === mk.matkulId ? null : mk.matkulId)}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group"
                          >
                            <td className="py-4 px-6 text-center text-slate-500 dark:text-slate-400 font-medium">
                              {index + 1}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 dark:text-slate-100">{mk.nama}</span>
                                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">{mk.kode}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-center font-bold text-indigo-600 dark:text-indigo-400">
                              {mk.sks} SKS
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold">
                                {mk.cpmk ? mk.cpmk.length : 0}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => { 
                                    setSelectedMatkul({ paketId: mk.paketId, matkulId: mk.matkulId, nama: mk.nama }); 
                                    setMatkulForm({ 
                                      kode: mk.kode || "", 
                                      nama: mk.nama, 
                                      sks: mk.sks,
                                      cpmk: mk.cpmk ? JSON.parse(JSON.stringify(mk.cpmk)) : []
                                    }); 
                                    setShowEditMatkulModal(true); 
                                  }}
                                  className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                                >
                                  Edit Matkul
                                </button>
                                <button 
                                  onClick={() => handleDeleteMatkul(mk.paketId, mk.matkulId)}
                                  className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                                >
                                  Hapus
                                </button>
                                <button 
                                  onClick={() => { setSelectedMatkul({ paketId: mk.paketId, matkulId: mk.matkulId, nama: mk.nama }); setShowAddCpmkModal(true); }}
                                  className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                                >
                                  + CPMK
                                </button>
                                <button className="px-2 text-slate-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${expandedMatkulId === mk.matkulId ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                          
                          {/* Accordion Content for CPMK */}
                          {expandedMatkulId === mk.matkulId && (
                            <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-t-0">
                              <td colSpan="5" className="p-0">
                                <div className="p-6 border-b border-white/60 dark:border-slate-700 animate-in slide-in-from-top-2 fade-in duration-200">
                                  <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                                      Daftar CPMK & Indikator Harian
                                    </h4>
                                  </div>
                                  
                                  {!mk.cpmk || mk.cpmk.length === 0 ? (
                                    <div className="p-8 text-center border-2 border-dashed border-white/50 dark:border-slate-600 rounded-2xl">
                                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Belum ada CPMK untuk mata kuliah ini.</p>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                      {mk.cpmk.map((c, i) => (
                                        <div key={c._id || i} className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm flex flex-col h-full hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors group/card">
                                          <div className="flex items-start gap-2 mb-3">
                                            <div className="w-6 h-6 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                              C{i+1}
                                            </div>
                                            <div className="flex-1">
                                              <p className="text-sm text-slate-800 dark:text-slate-100 font-bold leading-snug transition-all">{c.nama_cpmk}</p>
                                            </div>
                                          </div>
                                          
                                          <div className="flex-1 pr-1 mb-3 space-y-2">
                                            {!c.indikator || c.indikator.length === 0 ? (
                                              <p className="text-xs text-slate-400 dark:text-slate-500 italic">Belum ada indikator.</p>
                                            ) : (
                                              c.indikator.map((ind, j) => (
                                                <div key={j} className="flex justify-between items-start border-l-2 border-indigo-200 dark:border-indigo-800 pl-2 group/ind">
                                                  <div className="flex items-start gap-1.5">
                                                    <div className="w-1 h-1 rounded-full bg-indigo-400 dark:bg-indigo-500 mt-1.5 shrink-0" />
                                                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{ind}</p>
                                                  </div>
                                                  <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteIndikator(mk.paketId, mk.matkulId, c._id, j); }}
                                                    className="opacity-0 group-hover/ind:opacity-100 text-slate-300 hover:text-red-500 transition-opacity p-0.5"
                                                    title="Hapus Indikator"
                                                  >
                                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                  </button>
                                                </div>
                                              ))
                                            )}
                                          </div>

                                          <div className="pt-3 border-t border-slate-100 dark:border-slate-700 mt-auto flex flex-col gap-2">
                                            <div className="flex justify-between gap-1">
                                              <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteCpmk(mk.paketId, mk.matkulId, c._id); }}
                                                className="px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                              >
                                                Hapus
                                              </button>
                                              <div className="flex gap-1">
                                                <button 
                                                  onClick={(e) => { e.stopPropagation(); handleGenerateAI(mk.paketId, mk.matkulId, c._id); }}
                                                  disabled={generatingAIId === c._id}
                                                  className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 text-[10px] font-bold rounded transition-colors disabled:opacity-50"
                                                >
                                                  {generatingAIId === c._id ? "⏳..." : "✨ Saran AI"}
                                                </button>
                                                <button 
                                                  onClick={(e) => { e.stopPropagation(); setSelectedCPMK({ paketId: mk.paketId, matkulId: mk.matkulId, cpmkId: c._id, nama_cpmk: c.nama_cpmk }); setShowAddIndikatorModal(true); }}
                                                  className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded transition-colors"
                                                >
                                                  + Indikator
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODALS */}

      {/* Modal Preview Saran AI */}
      {mounted && showSaranModal && createPortal(
        <div style={{ zIndex: 999999 }} className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-sm w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-white/60 dark:border-slate-700">
            <div className="px-6 py-5 border-b border-white/50 dark:border-slate-600 flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
              <h3 className="text-lg font-black text-amber-800 dark:text-amber-500 flex items-center gap-2">
                <span>✨</span> Preview Saran Kegiatan (AI)
              </h3>
              <button onClick={() => setShowSaranModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-4">
                Berikut adalah saran kegiatan yang dihasilkan oleh AI. Anda dapat membacanya, merevisinya jika kurang pas, lalu menyimpannya.
              </p>
              <textarea 
                value={saranPreview} 
                onChange={(e) => setSaranPreview(e.target.value)} 
                rows="6" 
                className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-amber-50/30 dark:bg-slate-900/50 text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed"
              ></textarea>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-white/50 dark:border-slate-600 flex justify-end gap-3">
              <button type="button" onClick={() => setShowSaranModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
              <button onClick={handleSaveSaran} className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md transition-colors flex items-center gap-2">
                Simpan Saran
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Tambah Mitra */}
      {showMitraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-sm w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-white/50 dark:border-slate-600 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Tambah Mitra KKL Plus Baru</h3>
              <button onClick={() => setShowMitraModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleMitraSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Nama Instansi</label>
                  <input required value={mitraForm.nama_instansi} onChange={(e) => setMitraForm({...mitraForm, nama_instansi: e.target.value})} type="text" placeholder="PT Contoh Sukses" className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-800/80" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Jenis Skema</label>
                  <select value={mitraForm.jenis_skema} onChange={(e) => setMitraForm({...mitraForm, jenis_skema: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-800/80 appearance-none">
                    <option value="Corporate">Corporate / Perusahaan</option>
                    <option value="Wirausaha">Wirausaha / BUMDes</option>
                    <option value="Pemerintahan">Pemerintahan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Alamat Lengkap</label>
                  <textarea required value={mitraForm.alamat} onChange={(e) => setMitraForm({...mitraForm, alamat: e.target.value})} rows="2" placeholder="Jl. Raya Makmur No 123..." className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-800/80"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Deskripsi Mitra</label>
                  <textarea value={mitraForm.deskripsi_mitra} onChange={(e) => setMitraForm({...mitraForm, deskripsi_mitra: e.target.value})} rows="3" placeholder="Tentang perusahaan..." className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-800/80"></textarea>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-white/50 dark:border-slate-600 flex justify-end gap-3">
                <button type="button" onClick={() => setShowMitraModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-100 bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Matakuliah */}
      {showAddMatkulModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-sm w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-white/50 dark:border-slate-600 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Tambah Mata Kuliah</h3>
              <button onClick={() => { setShowAddMatkulModal(false); setMatkulForm({ kode: "", nama: "", sks: 3 }); }} className="text-slate-500 dark:text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleMatkulSubmit}>
              <div className="p-6 space-y-4">
                <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Kode</label>
                    <input required value={matkulForm.kode} onChange={(e) => setMatkulForm({...matkulForm, kode: e.target.value})} type="text" placeholder="MK.001" className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl/80" />
                  </div>
                  <div className="w-2/3">
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">SKS</label>
                    <input required value={matkulForm.sks} onChange={(e) => setMatkulForm({...matkulForm, sks: e.target.value})} type="number" min="1" max="6" className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl/80" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Nama Mata Kuliah</label>
                  <input required value={matkulForm.nama} onChange={(e) => setMatkulForm({...matkulForm, nama: e.target.value})} type="text" placeholder="Contoh: Manajemen Bisnis" className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl/80" />
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-white/50 dark:border-slate-600 flex justify-end gap-3">
                <button type="button" onClick={() => { setShowAddMatkulModal(false); setMatkulForm({ kode: "", nama: "", sks: 3 }); }} className="px-5 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-100 bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors">Simpan Matkul</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Matakuliah (Besar dengan CPMK) */}
      {showEditMatkulModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/60 dark:border-slate-700 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-300 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Edit Mata Kuliah</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Ubah detail dan kelola CPMK & Indikator sekaligus.</p>
              </div>
              <button onClick={() => { setShowEditMatkulModal(false); setMatkulForm({ kode: "", nama: "", sks: 3 }); }} className="text-slate-500 dark:text-slate-400 hover:text-red-500 font-bold text-2xl">&times;</button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-6">
              <form id="form-edit-matkul" onSubmit={handleEditMatkulSubmit} className="space-y-8">
                
                {/* Informasi Dasar */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Informasi Dasar</h4>
                  <div className="flex gap-4">
                    <div className="w-1/4">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Kode</label>
                      <input required value={matkulForm.kode} onChange={(e) => setMatkulForm({...matkulForm, kode: e.target.value})} type="text" className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-800" />
                    </div>
                    <div className="w-1/4">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">SKS</label>
                      <input required value={matkulForm.sks} onChange={(e) => setMatkulForm({...matkulForm, sks: e.target.value})} type="number" min="1" max="6" className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-800" />
                    </div>
                    <div className="w-2/4">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nama Mata Kuliah</label>
                      <input required value={matkulForm.nama} onChange={(e) => setMatkulForm({...matkulForm, nama: e.target.value})} type="text" className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-800" />
                    </div>
                  </div>
                </div>

                <hr className="border-white/60 dark:border-slate-700" />

                {/* Pengelolaan CPMK & Indikator */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Pengelolaan CPMK & Indikator</h4>
                  </div>

                  <div className="space-y-6">
                    {(!matkulForm.cpmk || matkulForm.cpmk.length === 0) && (
                      <div className="p-8 text-center border-2 border-dashed border-white/50 dark:border-slate-600 rounded-2xl">
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada CPMK untuk mata kuliah ini.</p>
                      </div>
                    )}

                    {(matkulForm.cpmk || []).map((cpmk, cpmkIndex) => (
                      <div key={cpmkIndex} className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-white/50 dark:border-slate-600 p-5 space-y-4 relative group">
                        
                        <div className="flex gap-3 items-start">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0 mt-1 shadow-sm">
                            C{cpmkIndex + 1}
                          </div>
                          <div className="flex-1">
                            <textarea 
                              required
                              value={cpmk.nama_cpmk} 
                              onChange={(e) => handleUpdateCpmkField(cpmkIndex, e.target.value)}
                              placeholder="Nama/Deskripsi CPMK..."
                              rows="2"
                              className="w-full px-4 py-2.5 rounded-xl border border-white/50 dark:border-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl font-semibold text-slate-800 dark:text-slate-100 shadow-sm transition-colors"
                            />
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleRemoveCpmkField(cpmkIndex)}
                            className="w-10 h-10 rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 hover:border-red-300 flex items-center justify-center transition-colors shadow-sm mt-1"
                            title="Hapus CPMK"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>

                        {/* Indikator List per CPMK */}
                        <div className="pl-11 space-y-3">
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Indikator Penilaian:</p>
                          
                          {(!cpmk.indikator || cpmk.indikator.length === 0) && (
                            <p className="text-sm text-slate-400 italic">Belum ada indikator.</p>
                          )}

                          {cpmk.indikator.map((ind, indIndex) => (
                            <div key={indIndex} className="flex gap-2 items-start group/ind">
                              <div className="w-6 flex items-center justify-center shrink-0 mt-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"></div>
                              </div>
                              <input 
                                required
                                value={ind}
                                onChange={(e) => handleUpdateIndikatorField(cpmkIndex, indIndex, e.target.value)}
                                type="text"
                                placeholder="Detail indikator..."
                                className="flex-1 px-3 py-2 rounded-lg border border-white/50 dark:border-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl text-sm shadow-sm transition-colors"
                              />
                              <button 
                                type="button"
                                onClick={() => handleRemoveIndikatorField(cpmkIndex, indIndex)}
                                className="w-9 h-9 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center transition-colors"
                                title="Hapus Indikator"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ))}
                          
                          <button 
                            type="button"
                            onClick={() => handleAddIndikatorField(cpmkIndex)}
                            className="mt-2 px-3 py-1.5 bg-white dark:bg-slate-700 border border-white/50 dark:border-slate-600 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                          >
                            + Tambah Indikator
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-center pt-2">
                      <button 
                        type="button"
                        onClick={handleAddCpmkField}
                        className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-dashed border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-sm font-bold rounded-xl transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Tambah CPMK Baru
                      </button>
                    </div>

                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-300 dark:border-slate-700 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => { setShowEditMatkulModal(false); setMatkulForm({ kode: "", nama: "", sks: 3 }); }} className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-white/50 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-xl transition-colors shadow-sm">Batal</button>
              <button form="form-edit-matkul" type="submit" className="px-8 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all">Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah CPMK */}
      {showAddCpmkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-sm w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-white/50 dark:border-slate-600 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Tambah CPMK</h3>
              <button onClick={() => setShowAddCpmkModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleAddCpmkSubmit}>
              <div className="p-6 space-y-4">
                <div className="bg-indigo-50 text-indigo-700 p-4 rounded-xl text-sm mb-2 border border-indigo-100">
                  Menambah CPMK untuk matkul: <br/><strong className="text-base">{selectedMatkul?.nama}</strong>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Nama CPMK</label>
                  <textarea required value={cpmkForm.nama_cpmk} onChange={(e) => setCpmkForm({nama_cpmk: e.target.value})} rows="3" placeholder="Contoh: CPMK 1: Mampu mengidentifikasi..." className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-800/80"></textarea>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-white/50 dark:border-slate-600 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddCpmkModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-100 bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors">Simpan CPMK</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Indikator CPMK */}
      {showAddIndikatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-sm w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-white/50 dark:border-slate-600 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Tambah Indikator OBE</h3>
              <button onClick={() => setShowAddIndikatorModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleAddIndikatorSubmit}>
              <div className="p-6 space-y-4">
                <div className="bg-indigo-50 text-indigo-700 p-4 rounded-xl text-sm mb-2 border border-indigo-100">
                  Menambah indikator untuk: <br/><strong className="text-base">{selectedCPMK?.nama_cpmk}</strong>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Deskripsi Indikator</label>
                  <textarea required value={indikatorForm.indikator} onChange={(e) => setIndikatorForm({indikator: e.target.value})} rows="4" placeholder="Mahasiswa mampu..." className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-800/80"></textarea>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Indikator ini akan digunakan DPL dan Mentor saat memvalidasi logbook harian.</p>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-white/50 dark:border-slate-600 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddIndikatorModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-100 bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors">Simpan Indikator</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola Posisi (Besar) */}
      {showKelolaPosisiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-sm w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-white/60 dark:border-slate-700">
            <div className="px-6 py-5 border-b border-white/50 dark:border-slate-600 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Lowongan / Posisi KKL Plus</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedMitraForPosisi?.nama_instansi}</p>
              </div>
              <button onClick={() => setShowKelolaPosisiModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex justify-between mb-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">Daftar Divisi/Posisi Tersedia</h4>
                <button 
                  onClick={() => { setPosisiForm({ id: null, nama_posisi: "", konsentrasi: "SDM", kuota: 1, deskripsi_pekerjaan: "", kriteria_kandidat: "", sistem_kerja: "WFO" }); setShowPosisiFormModal(true); }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm shadow-sm transition-colors"
                >
                  + Tambah Posisi
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posisiList.length === 0 ? (
                  <div className="col-span-full py-10 text-center text-slate-500 border border-dashed border-white/50 dark:border-slate-600 rounded-2xl">Belum ada posisi dibuka.</div>
                ) : (
                  posisiList.map(pos => (
                    <div key={pos._id} className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700 p-5 rounded-2xl shadow-sm relative group hover:shadow-md transition-all">
                      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setPosisiForm({ id: pos._id, nama_posisi: pos.nama_posisi, konsentrasi: pos.konsentrasi, kuota: pos.kuota, deskripsi_pekerjaan: pos.deskripsi_pekerjaan || "", kriteria_kandidat: pos.kriteria_kandidat || "", sistem_kerja: pos.sistem_kerja || "WFO" }); setShowPosisiFormModal(true); }} className="p-1.5 bg-slate-100 hover:bg-indigo-100 text-indigo-600 rounded-md"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                        <button onClick={() => handleDeletePosisi(pos._id)} className="p-1.5 bg-slate-100 hover:bg-red-100 text-red-600 rounded-md"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                      </div>
                      <h5 className="font-bold text-slate-800 dark:text-slate-100 pr-12">{pos.nama_posisi}</h5>
                      <span className={`inline-block mt-2 px-2.5 py-1 text-xs font-bold rounded-md ${pos.sistem_kerja === 'WFH' ? 'bg-green-50 text-green-600' : pos.sistem_kerja === 'Hybrid' ? 'bg-purple-50 text-purple-600' : 'bg-teal-50 text-[#1398A5]'}`}>{pos.sistem_kerja || 'WFO'}</span>
                      <div className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex justify-between"><span>Konsentrasi:</span> <strong className="text-slate-700 dark:text-slate-300 text-right">{pos.konsentrasi}</strong></div>
                        <div className="flex justify-between"><span>Kuota Tersedia:</span> <strong className="text-slate-700 dark:text-slate-300">{pos.kuota} Mahasiswa</strong></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Posisi (Nested) */}
      {showPosisiFormModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-white/60 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{posisiForm.id ? 'Edit' : 'Tambah'} Posisi KKL Plus</h3>
              <button onClick={() => setShowPosisiFormModal(false)} className="text-slate-500 hover:text-red-500 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-6">
              <form id="posisiForm" onSubmit={handlePosisiSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Nama Divisi / Posisi</label>
                    <input required value={posisiForm.nama_posisi} onChange={e => setPosisiForm({...posisiForm, nama_posisi: e.target.value})} type="text" className="w-full px-4 py-2.5 rounded-xl border border-white/50 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700" placeholder="Contoh: Digital Marketing" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Konsentrasi Manajemen</label>
                    <select value={posisiForm.konsentrasi} onChange={e => setPosisiForm({...posisiForm, konsentrasi: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-white/50 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700">
                      <option value="SDM">Manajemen SDM</option>
                      <option value="Keuangan">Manajemen Keuangan</option>
                      <option value="Pemasaran">Manajemen Pemasaran</option>
                      <option value="Pengembangan Bisnis">Pengembangan Bisnis</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Kuota Penerimaan</label>
                    <input required value={posisiForm.kuota} onChange={e => setPosisiForm({...posisiForm, kuota: Number(e.target.value)})} type="number" min="1" className="w-full px-4 py-2.5 rounded-xl border border-white/50 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Sistem Kerja</label>
                    <select value={posisiForm.sistem_kerja} onChange={e => setPosisiForm({...posisiForm, sistem_kerja: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-white/50 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700">
                      <option value="WFO">WFO (Work From Office)</option>
                      <option value="WFH">WFH (Work From Home)</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Deskripsi Pekerjaan</label>
                  <textarea value={posisiForm.deskripsi_pekerjaan} onChange={e => setPosisiForm({...posisiForm, deskripsi_pekerjaan: e.target.value})} rows="3" className="w-full px-4 py-2.5 rounded-xl border border-white/50 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700" placeholder="Uraikan tugas harian divisi ini..."></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Kriteria Kandidat</label>
                  <textarea value={posisiForm.kriteria_kandidat} onChange={e => setPosisiForm({...posisiForm, kriteria_kandidat: e.target.value})} rows="3" className="w-full px-4 py-2.5 rounded-xl border border-white/50 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700" placeholder="Syarat: Menguasai Excel, Analitis..."></textarea>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-white/60 dark:border-slate-700 flex justify-end gap-3">
              <button onClick={() => setShowPosisiFormModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
              <button type="submit" form="posisiForm" className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors">Simpan Posisi</button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
