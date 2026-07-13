"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Edit, Trash2, Check, Download, Upload } from "lucide-react";

export default function ManajemenPenggunaPage() {
  const [activeTab, setActiveTab] = useState("mahasiswa");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [addForm, setAddForm] = useState({ nim_nidn: "", nidn: "", nama_lengkap: "", nomor_hp: "", email: "", tipe_admin: "prodi" });

  // Edit User Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    nim_nidn: "",
    nidn: "",
    nama_lengkap: "",
    nomor_hp: "",
    email: "",
    program_studi: "",
    konsentrasi: "",
    kegiatan: "",
    tipe_admin: ""
  });

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const fetchUsers = async (role) => {
    setLoading(true);
    const roleToFetch = role === 'admin' ? 'admin' : role;
    try {
      const res = await fetch(`/api/admin/pengguna?role=${roleToFetch}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
      setCurrentPage(1); // Reset to page 1 on tab change or reload
      setSearchTerm(""); // Reset search term
      setSortConfig({ key: null, direction: 'asc' });
    } catch (error) {
      console.error("Gagal mengambil data pengguna", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(activeTab);
  }, [activeTab]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter & Sort Logic
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      (user.nama_lengkap && user.nama_lengkap.toLowerCase().includes(term)) ||
      (user.nim_nidn && user.nim_nidn.toLowerCase().includes(term)) ||
      (user.program_studi && user.program_studi.toLowerCase().includes(term)) ||
      (user.lokasi && user.lokasi.toLowerCase().includes(term))
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const valA = a[sortConfig.key] || "";
    const valB = b[sortConfig.key] || "";
    
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentUsers = sortedUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Helper render sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return " ↕";
    return sortConfig.direction === 'asc' ? " ↑" : " ↓";
  };

  // CSV Parser Helper
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return []; // Need at least header + 1 row
    
    // Auto-detect separator (koma atau titik koma)
    const separator = lines[0].includes(';') ? ';' : ',';
    
    const headers = lines[0].split(separator).map(h => h.trim().toLowerCase());
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(separator).map(v => v.trim());
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index] || "";
      });
      // Pastikan ada nim
      if (rowData.nim) {
        result.push(rowData);
      }
    }
    return result;
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Pilih file CSV terlebih dahulu.");

    setImporting(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const parsedData = parseCSV(text);

      if (parsedData.length === 0) {
        setImporting(false);
        return alert("Data kosong atau format CSV tidak sesuai. Pastikan ada header 'nim', 'nama', 'konsentrasi' (dipisahkan dengan koma).");
      }

      try {
        const res = await fetch('/api/admin/pengguna/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: parsedData })
        });
        
        const data = await res.json();
        setImportResult(data);
        
        if (res.ok) {
          fetchUsers(activeTab); // Refresh table
        }
      } catch (error) {
        console.error("Gagal import", error);
        setImportResult({ error: "Terjadi kesalahan sistem saat proses import." });
      } finally {
        setImporting(false);
      }
    };
    
    reader.readAsText(file);
  };

  const closeModal = () => {
    setShowImportModal(false);
    setFile(null);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddingUser(true);
    try {
      const res = await fetch('/api/admin/pengguna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addForm, role: activeTab === 'admin' ? 'admin' : activeTab })
      });
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || "Gagal menambahkan pengguna.");
      } else {
        alert("Pengguna berhasil ditambahkan. Password default sama dengan NIM/ID.");
        setShowAddModal(false);
        setAddForm({ nim_nidn: "", nidn: "", nama_lengkap: "", nomor_hp: "", email: "", tipe_admin: "prodi" });
        fetchUsers(activeTab);
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setAddingUser(false);
    }
  };

  const handleEditClick = (user) => {
    setEditForm({
      id: user._id,
      nim_nidn: user.nim_nidn || "",
      nidn: user.nidn || "",
      nama_lengkap: user.nama_lengkap || "",
      nomor_hp: user.nomor_hp || "",
      email: user.email || "",
      program_studi: user.program_studi || "",
      konsentrasi: user.konsentrasi || "",
      kegiatan: user.kegiatan || "",
      tipe_admin: user.tipe_admin || "prodi"
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditingUser(true);
    try {
      const res = await fetch('/api/admin/pengguna', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      
      if (!res.ok) alert(data.error || "Gagal memperbarui pengguna.");
      else {
        alert("Pengguna berhasil diperbarui.");
        setShowEditModal(false);
        fetchUsers(activeTab);
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setEditingUser(false);
    }
  };

  const handleResetPassword = async (user) => {
    if (confirm(`Yakin ingin me-reset password ${user.nama_lengkap} kembali menjadi Nomor HP atau ID-nya?`)) {
      try {
        const res = await fetch('/api/admin/pengguna', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: user._id, action: 'reset_password' })
        });
        if (res.ok) {
          alert("Password berhasil direset!");
          fetchUsers(activeTab);
        } else {
          alert("Gagal mereset password.");
        }
      } catch (e) {
        alert("Terjadi kesalahan sistem.");
      }
    }
  };

  const exportToCSV = () => {
    // Gunakan filteredUsers agar admin bisa memfilter dulu lalu mengekspornya
    if (filteredUsers.length === 0) return alert("Tidak ada data untuk di-export");

    let headers = [];
    if (activeTab === 'mahasiswa') {
      headers = ['NIM', 'Nama Mahasiswa', 'Prodi', 'Nama POKJA', 'Jabatan', 'Nomor HP', 'Email', 'Status Akun'];
    } else {
      headers = ['NIDN/ID', 'Nama Lengkap', 'Email'];
    }

    const csvRows = [headers.join(',')];

    for (const user of filteredUsers) {
      const row = [];
      // Gunakan kutipan ganda untuk menghindari masalah dengan koma di dalam teks
      const escape = (text) => `"${(text || '-').toString().replace(/"/g, '""')}"`;
      
      row.push(escape(user.nim_nidn));
      row.push(escape(user.nama_lengkap));
      
      if (activeTab === 'mahasiswa') {
        row.push(escape(user.program_studi));
        row.push(escape(user.konsentrasi));
        row.push(escape(user.kegiatan));
        row.push(escape(user.nomor_hp));
        row.push(escape(user.email));
        row.push(escape(user.isFirstLogin !== false ? 'Belum Aktif' : 'Aktif'));
      } else {
        row.push(escape(user.email));
      }
      
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Export_Data_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: "mahasiswa", label: "Data Mahasiswa" },
    { id: "dpl", label: "Data DPL" },
    { id: "admin", label: "Data Admin" },
  ];

  return (
    <DashboardLayout title="Manajemen Pengguna">
      <div className="w-full space-y-6">
        
      <div className="flex space-x-1 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm p-1.5 rounded-xl w-max mb-6 border border-white/60 dark:border-slate-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setUsers([]); }}
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-teal-600 text-amber-300 shadow-sm"
                : "text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

        {/* Header Card */}
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 dark:border-slate-700 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Direktori Pengguna</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola data akses seluruh entitas aplikasi Mantau KKL Plus</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={exportToCSV}
                className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Upload className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Export CSV
              </button>
              {activeTab === 'mahasiswa' ? (
                <>
                  <a 
                    href="/api/admin/pengguna/template"
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 px-5 py-3 rounded-xl font-bold text-sm hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    download
                  >
                    📄 Unduh Template
                  </a>
                  <button 
                    onClick={() => setShowImportModal(true)}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-teal-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Import Data
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-teal-600/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Tambah Pengguna
                </button>
              )}
            </div>
        </div>

        {/* Content Card */}
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 dark:border-slate-700 overflow-hidden">
          <div className="px-6 pt-4 pb-4 flex flex-col md:flex-row md:items-center justify-end gap-4 border-b border-white/60 dark:border-slate-700">            {/* Search Bar */}
            <div className="relative mb-2 md:mb-0 w-full md:w-64">
              <input 
                type="text" 
                placeholder="Cari nama, NIM..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-white/60 dark:border-slate-700 rounded-xl bg-white/20 dark:bg-slate-900/20 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-sm text-slate-900 dark:text-white"
              />
              <div className="absolute left-3 top-2.5 text-slate-400">
                🔍
              </div>
            </div>
          </div>

          {/* Table Area */}
          <div className="p-8">
            {loading ? (
              <div className="flex justify-center items-center h-48 animate-pulse text-slate-400 font-bold">Memuat data...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-white/20 dark:bg-slate-900/20/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                {searchTerm ? 'Pencarian tidak menemukan hasil.' : 'Belum ada data untuk role ini.'}
              </div>
            ) : (
              <div className="overflow-hidden">
                <div className="overflow-x-auto rounded-xl border border-white/60 dark:border-slate-700">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-white/20 dark:bg-slate-900/20">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">No</th>
                        <th 
                          scope="col" 
                          onClick={() => requestSort('nim_nidn')}
                          className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          {activeTab === 'mahasiswa' ? 'NIM' : 'ID'} {getSortIcon('nim_nidn')}
                        </th>
                        {activeTab === 'dpl' && (
                          <th 
                            scope="col" 
                            onClick={() => requestSort('nidn')}
                            className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            NIDN {getSortIcon('nidn')}
                          </th>
                        )}
                        <th 
                          scope="col" 
                          onClick={() => requestSort('nama_lengkap')}
                          className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          {activeTab === 'mahasiswa' ? 'Nama Mahasiswa' : 'Nama Lengkap'} {getSortIcon('nama_lengkap')}
                        </th>
                        <th 
                          scope="col" 
                          onClick={() => requestSort(activeTab === 'mahasiswa' ? 'program_studi' : 'email')}
                          className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          {activeTab === 'mahasiswa' ? 'Prodi' : 'Email'} {getSortIcon(activeTab === 'mahasiswa' ? 'program_studi' : 'email')}
                        </th>
                        {activeTab === 'mahasiswa' && (
                          <th 
                            scope="col" 
                            onClick={() => requestSort('konsentrasi')}
                            className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            Nama POKJA {getSortIcon('konsentrasi')}
                          </th>
                        )}
                        <th 
                          scope="col" 
                          onClick={() => requestSort(activeTab === 'admin' ? 'tipe_admin' : 'kegiatan')}
                          className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          {activeTab === 'dpl' ? 'Nomor HP' : activeTab === 'admin' ? 'Tipe Admin' : 'Jabatan'} {getSortIcon(activeTab === 'admin' ? 'tipe_admin' : 'kegiatan')}
                        </th>
                        {(activeTab === 'mahasiswa' || activeTab === 'admin') && (
                          <th 
                            scope="col" 
                            onClick={() => requestSort('nomor_hp')}
                            className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            Nomor HP {getSortIcon('nomor_hp')}
                          </th>
                        )}
                        {activeTab !== 'admin' && (
                          <th 
                            scope="col" 
                            onClick={() => requestSort('isFirstLogin')}
                            className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            Status Akun {getSortIcon('isFirstLogin')}
                          </th>
                        )}
                        <th scope="col" className="px-6 py-4 text-center text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl divide-y divide-slate-200 dark:divide-slate-700">
                      {currentUsers.map((user, idx) => (
                        <tr key={user._id} className="hover:bg-white/50 dark:hover:bg-slate-700/60 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">{startIndex + idx + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{user.nim_nidn}</td>
                          {activeTab === 'dpl' && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{user.nidn || '-'}</td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-white">{user.nama_lengkap}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{activeTab === 'dpl' ? (user.email || '-') : (user.program_studi || '-')}</td>
                          {activeTab === 'mahasiswa' && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{user.konsentrasi || '-'}</td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                            {activeTab === 'dpl' ? (user.nomor_hp || '-') : activeTab === 'admin' ? (
                              <span className="capitalize px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-xs">
                                {user.tipe_admin || 'Prodi'}
                              </span>
                            ) : (user.kegiatan || '-')}
                          </td>
                          {(activeTab === 'mahasiswa' || activeTab === 'admin') && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                              {user.nomor_hp || '-'}
                            </td>
                          )}
                          {activeTab !== 'admin' && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {user.isFirstLogin !== false ? (
                                <span className="px-2.5 py-1 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-800 whitespace-nowrap">Belum Aktif</span>
                              ) : (
                                <span className="px-2.5 py-1 bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 rounded-full text-xs font-bold uppercase tracking-wider border border-teal-200 dark:border-teal-800">Aktif</span>
                              )}
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="flex justify-center items-center space-x-2">
                              <button 
                                onClick={() => handleEditClick(user)}
                                className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300 bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/30 dark:hover:bg-teal-900/50 px-2 py-1 rounded transition-colors" title="Edit"
                              >
                                <Edit className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                              </button>
                              <button 
                                onClick={() => handleResetPassword(user)}
                                className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 px-2 py-1 rounded transition-colors" title="Reset Password"
                              >
                                🔄
                              </button>
                              <button 
                                onClick={async () => {
                                  if(confirm(`Yakin ingin menghapus ${user.nama_lengkap}?`)) {
                                    try {
                                      const res = await fetch(`/api/admin/pengguna?id=${user._id}`, { method: 'DELETE' });
                                      if(res.ok) {
                                        fetchUsers(activeTab);
                                      } else {
                                        alert("Gagal menghapus pengguna");
                                      }
                                    } catch (e) {
                                      alert("Terjadi kesalahan sistem");
                                    }
                                  }
                                }}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 px-2 py-1 rounded transition-colors" 
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-6 space-x-2">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-lg font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 disabled:opacity-50 transition-all"
                    >
                      &laquo;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                          currentPage === page
                            ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-lg font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 disabled:opacity-50 transition-all"
                    >
                      &raquo;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 dark:border-slate-700 w-full max-w-2xl overflow-hidden relative scale-in-95 duration-200">
            <div className="p-8 border-b border-white/60 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:white flex items-center gap-2">
                <Download className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Import Data Mahasiswa (SIAM)
              </h2>
            </div>
            
            <div className="p-8 bg-white/20 dark:bg-slate-900/20/50">
              <div className="mb-6 bg-teal-50 dark:bg-teal-900/20 text-teal-800 dark:text-teal-300 p-5 rounded-xl text-sm border border-teal-200 dark:border-teal-800">
                <p className="font-bold mb-2">Petunjuk Format CSV:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Baris pertama WAJIB ada header: <strong>nim, nama, prodi</strong> (boleh ada kolom 'no')</li>
                  <li>Pisahkan kolom dengan koma (,) atau titik koma (;).</li>
                  <li>Nama POKJA dan password akan diisi langsung oleh mahasiswa saat login pertama kali.</li>
                </ul>
                <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded border border-white/60 dark:border-slate-700 font-mono text-xs opacity-80 overflow-x-auto">
                  no;nim;nama;prodi<br/>
                  1;246120101;Budi Santoso;Manajemen (S1)<br/>
                  2;246120102;Ayu Lestari;Manajemen (S1)
                </div>
              </div>

              {importResult && (
                <div className={`mb-6 p-5 rounded-xl text-sm font-bold border ${importResult.error ? 'bg-red-50 text-red-700 border-red-200' : 'bg-teal-50 text-teal-700 border-teal-200'}`}>
                  {importResult.error ? (
                    <p>⚠️ {importResult.error}</p>
                  ) : (
                    <div>
                      <p><Check className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> {importResult.message}</p>
                      <p className="font-normal mt-1">Berhasil memproses: {importResult.inserted} data.</p>
                      {importResult.errors?.length > 0 && (
                        <div className="mt-3 text-red-600 font-normal max-h-32 overflow-y-auto bg-white p-2 rounded">
                          <p className="font-bold mb-1">Gagal diproses:</p>
                          <ul className="list-disc pl-4 text-xs space-y-1">
                            {importResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleImportSubmit}>
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files[0])}
                  ref={fileInputRef}
                  className="block w-full text-sm text-slate-500 dark:text-slate-400
                    file:mr-4 file:py-3 file:px-6
                    file:rounded-xl file:border-0
                    file:text-sm file:font-bold
                    file:bg-teal-50 file:text-teal-700
                    dark:file:bg-teal-900/30 dark:file:text-teal-400
                    hover:file:bg-teal-100 dark:hover:file:bg-teal-900/50
                    transition-all cursor-pointer bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-xl border border-white/60 dark:border-slate-700 p-2"
                />

                <div className="mt-8 flex items-center justify-end gap-3 border-t border-white/60 dark:border-slate-700 pt-6">
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="px-6 py-3 font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-all"
                  >
                    Tutup
                  </button>
                  <button 
                    type="submit" 
                    disabled={importing || !file}
                    className="px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
                  >
                    {importing ? 'Memproses Data...' : 'Mulai Import'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 dark:border-slate-700 w-full max-w-lg overflow-hidden relative scale-in-95 duration-200">
            <div className="p-8 border-b border-white/60 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Tambah {activeTab === 'dpl' ? 'DPL' : activeTab === 'mentor' ? 'Mentor' : activeTab === 'admin' ? 'Admin' : 'Mahasiswa'}
              </h3>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-8 bg-white/20 dark:bg-slate-900/20/50 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  ID (Username)
                </label>
                <input 
                  type="text" 
                  required
                  value={addForm.nim_nidn}
                  onChange={(e) => setAddForm({...addForm, nim_nidn: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600"
                  placeholder="Contoh: riswan"
                />
              </div>
              {activeTab === 'dpl' && (
                <div className="mb-4">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">NIDN</label>
                    <input
                      type="text"
                      required
                      value={addForm.nidn}
                      onChange={(e) => setAddForm({ ...addForm, nidn: e.target.value, nim_nidn: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600"
                      placeholder="Masukkan NIDN"
                    />
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Nama Lengkap
                </label>
                <input 
                  type="text" 
                  required
                  value={addForm.nama_lengkap}
                  onChange={(e) => setAddForm({...addForm, nama_lengkap: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Nomor HP
                </label>
                <input 
                  type="text" 
                  required
                  value={addForm.nomor_hp}
                  onChange={(e) => setAddForm({...addForm, nomor_hp: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600"
                  placeholder="0812xxxxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input 
                  type="email" 
                  value={addForm.email}
                  onChange={(e) => setAddForm({...addForm, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600"
                  placeholder="opsional@email.com"
                />
              </div>
              
              {activeTab === 'admin' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Tipe Admin
                  </label>
                  <select
                    value={addForm.tipe_admin}
                    onChange={(e) => setAddForm({...addForm, tipe_admin: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="prodi">Program Studi (Prodi)</option>
                    <option value="lppm">LPPM / Panitia Universitas</option>
                    <option value="fakultas">Fakultas</option>
                    <option value="superadmin">Super Admin</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
              )}
              
              <div className="mt-8 flex items-center justify-end gap-3 border-t border-white/60 dark:border-slate-700 pt-6">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={addingUser}
                  className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-600/30 hover:shadow-teal-600/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {addingUser ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 dark:border-slate-700 w-full max-w-lg overflow-hidden relative scale-in-95 duration-200">
            <div className="p-8 border-b border-white/60 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Edit Pengguna
              </h2>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-8 bg-white/20 dark:bg-slate-900/20/50 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {activeTab === 'mahasiswa' ? 'NIM' : 'ID'}
                </label>
                <input 
                  type="text" 
                  required
                  value={editForm.nim_nidn}
                  onChange={(e) => setEditForm({...editForm, nim_nidn: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600"
                />
              </div>
              {activeTab === 'dpl' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    NIDN
                  </label>
                  <input 
                    type="text" 
                    value={editForm.nidn}
                    onChange={(e) => setEditForm({...editForm, nidn: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Nama Lengkap
                </label>
                <input 
                  type="text" 
                  required
                  value={editForm.nama_lengkap}
                  onChange={(e) => setEditForm({...editForm, nama_lengkap: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Nomor HP
                </label>
                <input 
                  type="text" 
                  value={editForm.nomor_hp}
                  onChange={(e) => setEditForm({...editForm, nomor_hp: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input 
                  type="email" 
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600"
                />
              </div>
              
              {activeTab === 'mahasiswa' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Program Studi</label>
                    <input 
                      type="text" 
                      value={editForm.program_studi}
                      onChange={(e) => setEditForm({...editForm, program_studi: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nama POKJA</label>
                    <input 
                      type="text" 
                      value={editForm.konsentrasi}
                      onChange={(e) => setEditForm({...editForm, konsentrasi: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Jabatan</label>
                    <input 
                      type="text" 
                      value={editForm.kegiatan}
                      onChange={(e) => setEditForm({...editForm, kegiatan: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </>
              )}
              
              {activeTab === 'admin' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Tipe Admin
                  </label>
                  <select
                    value={editForm.tipe_admin}
                    onChange={(e) => setEditForm({...editForm, tipe_admin: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-white/50 dark:border-slate-600 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="prodi">Program Studi (Prodi)</option>
                    <option value="lppm">LPPM / Panitia Universitas</option>
                    <option value="fakultas">Fakultas</option>
                    <option value="superadmin">Super Admin</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
              )}

              <div className="mt-8 flex items-center justify-end gap-3 border-t border-white/60 dark:border-slate-700 pt-6">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={editingUser}
                  className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-600/30 hover:shadow-teal-600/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {editingUser ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </DashboardLayout>
  );
}
