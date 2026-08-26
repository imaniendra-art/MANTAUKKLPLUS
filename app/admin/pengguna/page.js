"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "@/components/AuthProvider";
import { 
  Plus, Edit2, Trash2, Check, Download, Upload, ShieldAlert, 
  Lock, GraduationCap, UserCheck, Shield, Search, RefreshCw, 
  KeyRound, ArrowUpDown, X, Phone, Mail, User, Users,
  CheckCircle, AlertCircle, Clock, Building2, ChevronLeft, ChevronRight,
  FileText, Info
} from "lucide-react";

export default function ManajemenPenggunaPage() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("mahasiswa");
  const [users, setUsers] = useState([]);
  const [roleCounts, setRoleCounts] = useState({ mahasiswa: 0, dpl: 0, admin: 0, mentor: 0 });
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPokjaStatus, setFilterPokjaStatus] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Pagination State
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [addForm, setAddForm] = useState({ 
    nim_nidn: "", 
    nidn: "", 
    nama_lengkap: "", 
    nomor_hp: "", 
    email: "", 
    program_studi: "Manajemen (S1)", 
    tipe_admin: "prodi" 
  });

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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Fetch Role Counts
  const fetchRoleCounts = async () => {
    try {
      const res = await fetch('/api/admin/pengguna?counts=true');
      if (res.ok) {
        const counts = await res.json();
        setRoleCounts(counts);
      }
    } catch (e) {
      console.error("Gagal mengambil data jumlah pengguna", e);
    }
  };

  const activeTabRef = useRef(activeTab);

  // Fetch Users for current tab
  const fetchUsers = async (role) => {
    setLoading(true);
    setUsers([]); // Segera bersihkan data tab sebelumnya agar tidak bocor
    try {
      const res = await fetch(`/api/admin/pengguna?role=${role}`);
      const data = await res.json();
      // Cegah race-condition: hanya pasang data jika tab yang dilihat masih sama
      if (activeTabRef.current === role) {
        setUsers(Array.isArray(data) ? data : []);
        setCurrentPage(1);
      }
    } catch (error) {
      if (activeTabRef.current === role) {
        console.error("Gagal mengambil data pengguna", error);
        showToast("Gagal mengambil data pengguna dari server");
      }
    } finally {
      if (activeTabRef.current === role) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchRoleCounts();
  }, []);

  useEffect(() => {
    activeTabRef.current = activeTab;
    fetchUsers(activeTab);
    fetchRoleCounts();
    setSearchTerm("");
    setFilterStatus("all");
    setFilterPokjaStatus("all");
    setSortConfig({ key: null, direction: 'asc' });
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
    // Proteksi mutlak: jangan tampilkan data role lain di tab aktif
    if (user.role && user.role !== activeTab) return false;

    const term = searchTerm.toLowerCase().trim();
    const namaMatch = user.nama_lengkap && user.nama_lengkap.toLowerCase().includes(term);
    const nimMatch = user.nim_nidn && user.nim_nidn.toLowerCase().includes(term);
    const nidnMatch = user.nidn && user.nidn.toLowerCase().includes(term);
    const prodiMatch = user.program_studi && user.program_studi.toLowerCase().includes(term);
    const pokjaMatch = user.konsentrasi && user.konsentrasi.toLowerCase().includes(term);
    const emailMatch = user.email && user.email.toLowerCase().includes(term);
    const hpMatch = user.nomor_hp && user.nomor_hp.toLowerCase().includes(term);
    
    const matchesSearch = !term || namaMatch || nimMatch || nidnMatch || prodiMatch || pokjaMatch || emailMatch || hpMatch;
    if (!matchesSearch) return false;

    // Filter Status Akun
    if (filterStatus === 'aktif' && user.isFirstLogin !== false) return false;
    if (filterStatus === 'belum_aktif' && user.isFirstLogin === false) return false;

    // Filter Mahasiswa Pokja
    if (activeTab === 'mahasiswa') {
      if (filterPokjaStatus === 'berkelompok' && (!user.kegiatan || user.kegiatan === '-')) return false;
      if (filterPokjaStatus === 'belum_berkelompok' && user.kegiatan && user.kegiatan !== '-') return false;
      if (filterPokjaStatus === 'ketua' && user.kegiatan !== 'Ketua') return false;
      if (filterPokjaStatus === 'anggota' && user.kegiatan !== 'Anggota') return false;
    }

    return true;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const valA = a[sortConfig.key] || "";
    const valB = b[sortConfig.key] || "";
    
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentUsers = sortedUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Helper sort indicator
  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-3 h-3 inline-block ml-1 opacity-40 group-hover:opacity-100" />;
    }
    return sortConfig.direction === 'asc' 
      ? <span className="text-teal-600 dark:text-teal-400 font-bold ml-1">↑</span> 
      : <span className="text-teal-600 dark:text-teal-400 font-bold ml-1">↓</span>;
  };

  // CSV Parser
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];
    
    const separator = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(separator).map(h => h.trim().toLowerCase());
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(separator).map(v => v.trim());
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index] || "";
      });
      if (rowData.nim) {
        result.push(rowData);
      }
    }
    return result;
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!file) return showToast("Pilih file CSV terlebih dahulu");

    setImporting(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const parsedData = parseCSV(text);

      if (parsedData.length === 0) {
        setImporting(false);
        return showToast("Data kosong atau format CSV tidak sesuai. Pastikan ada header 'nim', 'nama', 'prodi'.");
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
          showToast(`Berhasil memproses import: ${data.inserted} data`);
          fetchUsers(activeTab);
          fetchRoleCounts();
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
        showToast(data.error || "Gagal menambahkan pengguna");
      } else {
        showToast("Pengguna berhasil ditambahkan!");
        setShowAddModal(false);
        setAddForm({ 
          nim_nidn: "", 
          nidn: "", 
          nama_lengkap: "", 
          nomor_hp: "", 
          email: "", 
          program_studi: "Manajemen (S1)", 
          tipe_admin: "prodi" 
        });
        fetchUsers(activeTab);
        fetchRoleCounts();
      }
    } catch (error) {
      showToast("Terjadi kesalahan sistem.");
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
      
      if (!res.ok) {
        showToast(data.error || "Gagal memperbarui pengguna");
      } else {
        showToast("Data pengguna berhasil diperbarui!");
        setShowEditModal(false);
        fetchUsers(activeTab);
      }
    } catch (error) {
      showToast("Terjadi kesalahan sistem.");
    } finally {
      setEditingUser(false);
    }
  };

  const handleResetPassword = async (user) => {
    if (confirm(`Yakin ingin me-reset password untuk ${user.nama_lengkap}? Password akan dikembalikan ke Nomor HP / NIM default.`)) {
      try {
        const res = await fetch('/api/admin/pengguna', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: user._id, action: 'reset_password' })
        });
        if (res.ok) {
          showToast("Password berhasil direset!");
          fetchUsers(activeTab);
        } else {
          showToast("Gagal mereset password.");
        }
      } catch (e) {
        showToast("Terjadi kesalahan sistem.");
      }
    }
  };

  const exportToCSV = () => {
    if (filteredUsers.length === 0) return showToast("Tidak ada data untuk di-export");

    let headers = [];
    if (activeTab === 'mahasiswa') {
      headers = ['NIM', 'Nama Mahasiswa', 'Prodi', 'Nama POKJA', 'Jabatan', 'Nomor HP', 'Email', 'Status Akun'];
    } else if (activeTab === 'dpl') {
      headers = ['ID/Username', 'NIDN', 'Nama Lengkap DPL', 'Email', 'Nomor HP', 'Status Akun'];
    } else {
      headers = ['ID/Username', 'Nama Lengkap Admin', 'Tipe Admin', 'Email', 'Nomor HP'];
    }

    const csvRows = [headers.join(',')];
    const escape = (text) => `"${(text || '-').toString().replace(/"/g, '""')}"`;

    for (const user of filteredUsers) {
      const row = [];
      row.push(escape(user.nim_nidn));
      if (activeTab === 'dpl') row.push(escape(user.nidn));
      row.push(escape(user.nama_lengkap));
      
      if (activeTab === 'mahasiswa') {
        row.push(escape(user.program_studi));
        row.push(escape(user.konsentrasi));
        row.push(escape(user.kegiatan));
        row.push(escape(user.nomor_hp));
        row.push(escape(user.email));
        row.push(escape(user.isFirstLogin !== false ? 'Belum Aktif' : 'Aktif'));
      } else if (activeTab === 'dpl') {
        row.push(escape(user.email));
        row.push(escape(user.nomor_hp));
        row.push(escape(user.isFirstLogin !== false ? 'Belum Aktif' : 'Aktif'));
      } else {
        row.push(escape(user.tipe_admin));
        row.push(escape(user.email));
        row.push(escape(user.nomor_hp));
      }
      
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Export_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Data ${activeTab} berhasil diunduh!`);
  };

  const tabs = [
    { id: "mahasiswa", label: "Data Mahasiswa", icon: GraduationCap, count: roleCounts.mahasiswa },
    { id: "dpl", label: "Data DPL", icon: UserCheck, count: roleCounts.dpl },
    { id: "admin", label: "Data Admin", icon: Shield, count: roleCounts.admin },
  ];

  return (
    <DashboardLayout title="Manajemen Pengguna">
      
      {/* Toast Notification (Portaled) */}
      {mounted && toastMessage && createPortal(
        <div style={{ zIndex: 999999 }} className="fixed top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-8 py-3 rounded-2xl shadow-xl shadow-slate-900/20 animate-in slide-in-from-top-10 fade-in duration-300 font-bold border border-slate-700/50 flex items-center gap-3">
          <span className="text-teal-400 text-lg"><Check className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /></span> {toastMessage}
        </div>,
        document.body
      )}

      <div className="w-full space-y-6">
        
        {/* Navigation Tabs with Counts */}
        <div className="flex flex-wrap gap-2 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm p-1.5 rounded-xl w-max mb-6 border border-white/60 dark:border-slate-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full font-bold transition-colors ${
                  isActive 
                    ? "bg-teal-700/60 text-white" 
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}>
                  {tab.count || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Stats Mini Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {activeTab === 'mahasiswa' && (
            <>
              <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700 shadow-sm">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Mahasiswa</div>
                <div className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{roleCounts.mahasiswa || users.length}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Mahasiswa terdaftar</div>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 backdrop-blur-xl border border-teal-200/50 dark:border-teal-900/30 shadow-sm">
                <div className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">Akun Aktif</div>
                <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
                  {users.filter(u => u.isFirstLogin === false).length}
                </div>
                <div className="text-[11px] text-teal-600/80 dark:text-teal-400/80 mt-0.5">Sudah login / aktivasi</div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 backdrop-blur-xl border border-amber-200/50 dark:border-amber-900/30 shadow-sm">
                <div className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Belum Aktif</div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {users.filter(u => u.isFirstLogin !== false).length}
                </div>
                <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">Belum login pertama kali</div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-xl border border-blue-200/50 dark:border-blue-900/30 shadow-sm">
                <div className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Sudah Berkelompok</div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                  {users.filter(u => u.kegiatan === 'Ketua' || u.kegiatan === 'Anggota').length}
                </div>
                <div className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-0.5">Tergabung di POKJA</div>
              </div>
            </>
          )}

          {activeTab === 'dpl' && (
            <>
              <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700 shadow-sm">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total DPL</div>
                <div className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{roleCounts.dpl || users.length}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Dosen pembimbing lapangan</div>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 backdrop-blur-xl border border-teal-200/50 dark:border-teal-900/30 shadow-sm">
                <div className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">Membimbing POKJA</div>
                <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
                  {users.filter(u => u.kegiatan && u.kegiatan !== '-').length}
                </div>
                <div className="text-[11px] text-teal-600/80 dark:text-teal-400/80 mt-0.5">Aktif di kelompok kerja</div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-xl border border-blue-200/50 dark:border-blue-900/30 shadow-sm">
                <div className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Akun Aktif</div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                  {users.filter(u => u.isFirstLogin === false).length}
                </div>
                <div className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-0.5">Sudah login</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Belum Login</div>
                <div className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">
                  {users.filter(u => u.isFirstLogin !== false).length}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Password default aktif</div>
              </div>
            </>
          )}

          {activeTab === 'admin' && (
            <>
              <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700 shadow-sm">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Admin</div>
                <div className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{roleCounts.admin || users.length}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Akun pengelola sistem</div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 backdrop-blur-xl border border-indigo-200/50 dark:border-indigo-900/30 shadow-sm">
                <div className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Super Admin</div>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {users.filter(u => u.tipe_admin === 'superadmin').length}
                </div>
                <div className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80 mt-0.5">Hak akses tertinggi</div>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 backdrop-blur-xl border border-teal-200/50 dark:border-teal-900/30 shadow-sm">
                <div className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">Admin LPPM</div>
                <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
                  {users.filter(u => u.tipe_admin === 'lppm').length}
                </div>
                <div className="text-[11px] text-teal-600/80 dark:text-teal-400/80 mt-0.5">Pengelola Universitas</div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 backdrop-blur-xl border border-amber-200/50 dark:border-amber-900/30 shadow-sm">
                <div className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Admin Prodi / Fak</div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {users.filter(u => u.tipe_admin === 'prodi' || u.tipe_admin === 'fakultas' || !u.tipe_admin).length}
                </div>
                <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">Koordinator Akademik</div>
              </div>
            </>
          )}
        </div>

        {/* Header Action Bar */}
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 dark:border-slate-700 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Direktori {activeTab === 'mahasiswa' ? 'Mahasiswa' : activeTab === 'dpl' ? 'DPL' : 'Admin'}</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Kelola data hak akses, import mahasiswa SIAM, reset password, dan pantau status aktivasi akun.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5">
            <button 
              onClick={exportToCSV}
              className="bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:-translate-y-0.5 transition-all flex items-center gap-2"
              title="Download Data sebagai CSV"
            >
              <Upload className="w-4 h-4 text-slate-500 dark:text-slate-300" /> 
              <span>Export CSV</span>
            </button>

            {activeTab === 'mahasiswa' ? (
              <>
                <a 
                  href="/api/admin/pengguna/template"
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:-translate-y-0.5 transition-all flex items-center gap-2"
                  download
                  title="Unduh format template CSV"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Template SIAM</span>
                </a>
                <button 
                  onClick={() => setShowImportModal(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-teal-600/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Import CSV (SIAM)</span>
                </button>
              </>
            ) : (
              <button 
                onClick={() => {
                  setAddForm({ 
                    nim_nidn: "", 
                    nidn: "", 
                    nama_lengkap: "", 
                    nomor_hp: "", 
                    email: "", 
                    program_studi: "Manajemen (S1)", 
                    tipe_admin: "prodi" 
                  });
                  setShowAddModal(true);
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-teal-600/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah {activeTab === 'dpl' ? 'DPL' : 'Admin'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Table Card */}
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 dark:border-slate-700 overflow-hidden">
          
          {/* Search & Filter Toolbar */}
          <div className="p-5 border-b border-white/60 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder={`Cari nama, ${activeTab === 'mahasiswa' ? 'NIM, prodi, POKJA' : 'ID, email, NIDN'}...`} 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-white/60 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Status Akun */}
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="px-3.5 py-2 border border-white/60 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-700 dark:text-slate-200"
              >
                <option value="all">Semua Status Akun</option>
                <option value="aktif">🟢 Akun Aktif</option>
                <option value="belum_aktif">🟡 Belum Aktif (Belum Login)</option>
              </select>

              {/* Filter POKJA (Khusus Mahasiswa) */}
              {activeTab === 'mahasiswa' && (
                <select
                  value={filterPokjaStatus}
                  onChange={(e) => { setFilterPokjaStatus(e.target.value); setCurrentPage(1); }}
                  className="px-3.5 py-2 border border-white/60 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-700 dark:text-slate-200"
                >
                  <option value="all">Semua Kelompok</option>
                  <option value="berkelompok">👥 Sudah Ber-POKJA</option>
                  <option value="ketua">👑 Ketua POKJA</option>
                  <option value="anggota">👤 Anggota POKJA</option>
                  <option value="belum_berkelompok">⚠️ Belum Berkelompok</option>
                </select>
              )}
            </div>
          </div>

          {/* Table Area */}
          <div className="p-0">
            {loading ? (
              <div className="flex justify-center items-center h-48 animate-pulse text-slate-400 font-bold">
                Memuat data pengguna dari database...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="font-bold text-base text-slate-700 dark:text-slate-300">
                  {searchTerm ? 'Pencarian tidak menemukan hasil.' : 'Belum ada data untuk role ini.'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci atau filter status.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-white/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th scope="col" className="py-4 px-6 w-14 text-center">No</th>
                      <th 
                        scope="col" 
                        onClick={() => requestSort('nim_nidn')}
                        className="py-4 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                      >
                        {activeTab === 'mahasiswa' ? 'NIM' : 'ID / Username'} {renderSortIndicator('nim_nidn')}
                      </th>
                      {activeTab === 'dpl' && (
                        <th 
                          scope="col" 
                          onClick={() => requestSort('nidn')}
                          className="py-4 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                        >
                          NIDN {renderSortIndicator('nidn')}
                        </th>
                      )}
                      <th 
                        scope="col" 
                        onClick={() => requestSort('nama_lengkap')}
                        className="py-4 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                      >
                        {activeTab === 'mahasiswa' ? 'Nama Mahasiswa' : 'Nama Lengkap'} {renderSortIndicator('nama_lengkap')}
                      </th>
                      <th 
                        scope="col" 
                        onClick={() => requestSort(activeTab === 'mahasiswa' ? 'program_studi' : 'email')}
                        className="py-4 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                      >
                        {activeTab === 'mahasiswa' ? 'Program Studi' : 'Email'} {renderSortIndicator(activeTab === 'mahasiswa' ? 'program_studi' : 'email')}
                      </th>
                      {activeTab === 'mahasiswa' && (
                        <th 
                          scope="col" 
                          onClick={() => requestSort('nama_pokja')}
                          className="py-4 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                        >
                          Nama POKJA {renderSortIndicator('nama_pokja')}
                        </th>
                      )}
                      <th 
                        scope="col" 
                        onClick={() => requestSort(activeTab === 'admin' ? 'tipe_admin' : 'kegiatan')}
                        className="py-4 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                      >
                        {activeTab === 'dpl' ? 'POKJA Dibimbing' : activeTab === 'admin' ? 'Tipe Admin' : 'Jabatan'} {renderSortIndicator(activeTab === 'admin' ? 'tipe_admin' : 'kegiatan')}
                      </th>
                      <th 
                        scope="col" 
                        onClick={() => requestSort('nomor_hp')}
                        className="py-4 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                      >
                        Nomor HP {renderSortIndicator('nomor_hp')}
                      </th>
                      {activeTab !== 'admin' && (
                        <th 
                          scope="col" 
                          onClick={() => requestSort('isFirstLogin')}
                          className="py-4 px-6 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                        >
                          Status Akun {renderSortIndicator('isFirstLogin')}
                        </th>
                      )}
                      <th scope="col" className="py-4 px-6 text-center w-28">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                    {currentUsers.map((user, idx) => (
                      <tr key={user._id} className="hover:bg-slate-50 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-colors">
                        <td className="py-4 px-6 text-center text-slate-400 font-medium">{startIndex + idx + 1}</td>
                        <td className="py-4 px-6 font-mono font-semibold text-slate-700 dark:text-slate-300 text-xs">
                          {user.nim_nidn}
                        </td>
                        {activeTab === 'dpl' && (
                          <td className="py-4 px-6 font-mono text-slate-600 dark:text-slate-400 text-xs">
                            {user.nidn || '-'}
                          </td>
                        )}
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                            <span>{user.nama_lengkap}</span>
                          </div>
                          {user.email && user.email !== `${user.nim_nidn}@mantau.local` && (
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" /> {user.email}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300 text-xs">
                          {activeTab === 'dpl' ? (
                            user.email || '-'
                          ) : activeTab === 'mahasiswa' ? (
                            <div>
                              <div>{user.program_studi || 'Manajemen (S1)'}</div>
                              {user.konsentrasi && user.konsentrasi !== '-' ? (
                                <span className="inline-block mt-1 font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded text-[11px]">
                                  {user.konsentrasi}
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic block mt-0.5">Belum ada konsentrasi</span>
                              )}
                            </div>
                          ) : (
                            user.program_studi || '-'
                          )}
                        </td>
                        {activeTab === 'mahasiswa' && (
                          <td className="py-4 px-6">
                            {user.nama_pokja && user.nama_pokja !== '-' ? (
                              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                {user.nama_pokja}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Belum ada POKJA</span>
                            )}
                          </td>
                        )}
                        <td className="py-4 px-6">
                          {activeTab === 'dpl' ? (
                            <span className="text-xs text-slate-600 dark:text-slate-300">
                              {user.program_studi || user.kegiatan || '-'}
                            </span>
                          ) : activeTab === 'admin' ? (
                            <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${
                              user.tipe_admin === 'superadmin' 
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' 
                                : user.tipe_admin === 'lppm'
                                ? 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            }`}>
                              {user.tipe_admin === 'superadmin' ? 'Super Admin' : user.tipe_admin === 'lppm' ? 'Admin LPPM' : user.tipe_admin === 'fakultas' ? 'Admin Fakultas' : 'Admin Prodi'}
                            </span>
                          ) : (
                            user.kegiatan === 'Ketua' ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50">
                                👑 Ketua
                              </span>
                            ) : user.kegiatan === 'Anggota' ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200/50">
                                👤 Anggota
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-700">
                                Belum Ada
                              </span>
                            )
                          )}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-300">
                          {user.nomor_hp || '-'}
                        </td>
                        {activeTab !== 'admin' && (
                          <td className="py-4 px-6 text-center">
                            {user.isFirstLogin !== false ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-[11px] font-bold border border-amber-200 dark:border-amber-800" title="Belum pernah login ke aplikasi">
                                <Clock className="w-3 h-3" /> Belum Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
                                <Check className="w-3 h-3" /> Aktif
                              </span>
                            )}
                          </td>
                        )}
                        <td className="py-4 px-6">
                          <div className="flex justify-center items-center gap-1.5">
                            {(() => {
                              const isCurrentUserSuperadmin = session?.user?.tipe_admin === 'superadmin';
                              const isTargetSuperadmin = user.role === 'admin' && user.tipe_admin === 'superadmin';
                              const isSelf = session?.user?.id && (user._id === session?.user?.id || user.nim_nidn === session?.user?.nim_nidn);
                              const canDelete = !isSelf && (!isTargetSuperadmin || isCurrentUserSuperadmin);
                              const canEdit = !isTargetSuperadmin || isCurrentUserSuperadmin || isSelf;

                              return (
                                <>
                                  <button 
                                    onClick={() => handleEditClick(user)}
                                    disabled={!canEdit}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      canEdit
                                        ? 'text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40'
                                        : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                    }`}
                                    title={canEdit ? "Edit Pengguna" : "Hanya Superadmin yang dapat mengedit akun ini"}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>

                                  <button 
                                    onClick={() => handleResetPassword(user)}
                                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors" 
                                    title="Reset Password ke default"
                                  >
                                    <KeyRound className="w-4 h-4" />
                                  </button>

                                  {canDelete ? (
                                    <button 
                                      onClick={async () => {
                                        if(confirm(`Apakah Anda yakin ingin menghapus "${user.nama_lengkap}"?`)) {
                                          try {
                                            const res = await fetch(`/api/admin/pengguna?id=${user._id}`, { method: 'DELETE' });
                                            const data = await res.json();
                                            if(res.ok) {
                                              showToast("Pengguna berhasil dihapus!");
                                              fetchUsers(activeTab);
                                              fetchRoleCounts();
                                            } else {
                                              showToast(data.error || "Gagal menghapus pengguna");
                                            }
                                          } catch (e) {
                                            showToast("Terjadi kesalahan sistem");
                                          }
                                        }
                                      }}
                                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors" 
                                      title="Hapus Pengguna"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <button 
                                      disabled
                                      className="p-1.5 text-slate-300 dark:text-slate-600 cursor-not-allowed" 
                                      title={
                                        isSelf 
                                          ? "Tidak dapat menghapus akun Anda sendiri" 
                                          : "Akses Dibatasi: Hanya sesama Superadmin yang dapat menghapus akun Superadmin"
                                      }
                                    >
                                      {isTargetSuperadmin && !isCurrentUserSuperadmin ? (
                                        <Lock className="w-4 h-4 text-amber-500" />
                                      ) : (
                                        <Trash2 className="w-4 h-4 opacity-40" />
                                      )}
                                    </button>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-white/60 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Menampilkan {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} dari total {filteredUsers.length} pengguna
              </span>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 flex items-center justify-center font-bold text-xs rounded-lg shadow-sm transition-colors border ${
                      currentPage === page
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border-white/60 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* IMPORT MODAL */}
      {mounted && showImportModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 dark:border-slate-700 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-teal-600" />
                Import Data Mahasiswa (Format SIAM)
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300 p-5 rounded-2xl text-xs border border-teal-200/60 dark:border-teal-900/40">
                <p className="font-bold mb-2 flex items-center gap-1.5 text-sm">
                  <Info className="w-4 h-4" /> Petunjuk Format CSV:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Baris pertama WAJIB ada header kolom: <strong>nim, nama, prodi</strong></li>
                  <li>Pemisah kolom otomatis mendukung koma (,) maupun titik koma (;).</li>
                  <li>Password awal akun otomatis diset sama dengan NIM mahasiswa.</li>
                </ul>
                <div className="mt-3 p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-teal-200/50 dark:border-slate-700 font-mono text-[11px] overflow-x-auto">
                  nim,nama,prodi<br/>
                  246120101,Budi Santoso,Manajemen (S1)<br/>
                  246120102,Ayu Lestari,Manajemen (S1)
                </div>
              </div>

              {importResult && (
                <div className={`p-4 rounded-xl text-xs font-bold border ${importResult.error ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  {importResult.error ? (
                    <p className="flex items-center gap-1.5">⚠️ {importResult.error}</p>
                  ) : (
                    <div>
                      <p className="flex items-center gap-1.5 font-bold text-sm">
                        <Check className="w-4 h-4" /> {importResult.message}
                      </p>
                      <p className="font-normal mt-1">Berhasil memasukkan/memperbarui: <strong>{importResult.inserted}</strong> data.</p>
                      {importResult.errors?.length > 0 && (
                        <div className="mt-2 text-red-600 font-normal max-h-28 overflow-y-auto bg-white p-2 rounded-lg">
                          <p className="font-bold mb-1">Gagal diproses:</p>
                          <ul className="list-disc pl-4 text-[11px] space-y-0.5">
                            {importResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleImportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Pilih Berkas CSV (.csv)
                  </label>
                  <input 
                    type="file" 
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files[0])}
                    ref={fileInputRef}
                    className="block w-full text-xs text-slate-500 dark:text-slate-400
                      file:mr-4 file:py-2.5 file:px-5
                      file:rounded-xl file:border-0
                      file:text-xs file:font-bold
                      file:bg-teal-50 file:text-teal-700
                      dark:file:bg-teal-900/30 dark:file:text-teal-400
                      hover:file:bg-teal-100 dark:hover:file:bg-teal-900/50
                      transition-all cursor-pointer bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 p-2"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="px-5 py-2.5 font-bold text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-all"
                  >
                    Tutup
                  </button>
                  <button 
                    type="submit" 
                    disabled={importing || !file}
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/30 transition-all disabled:opacity-50"
                  >
                    {importing ? 'Memproses Data...' : 'Mulai Import'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ADD USER MODAL */}
      {mounted && showAddModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 dark:border-slate-700 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-600" />
                Tambah {activeTab === 'dpl' ? 'DPL Baru' : activeTab === 'admin' ? 'Admin Baru' : 'Mahasiswa Baru'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {activeTab === 'mahasiswa' ? 'NIM Mahasiswa' : 'ID / Username Login'}
                </label>
                <input 
                  type="text" 
                  required
                  value={addForm.nim_nidn}
                  onChange={(e) => setAddForm({...addForm, nim_nidn: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder={activeTab === 'mahasiswa' ? 'Contoh: 246120101' : 'Contoh: dosen_pembimbing'}
                />
              </div>

              {activeTab === 'dpl' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">NIDN (Nomor Induk Dosen)</label>
                  <input
                    type="text"
                    required
                    value={addForm.nidn}
                    onChange={(e) => setAddForm({ ...addForm, nidn: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    placeholder="Contoh: 09123456"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Lengkap
                </label>
                <input 
                  type="text" 
                  required
                  value={addForm.nama_lengkap}
                  onChange={(e) => setAddForm({...addForm, nama_lengkap: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="Masukkan nama lengkap beserta gelar"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nomor WhatsApp / HP
                  </label>
                  <input 
                    type="text" 
                    required
                    value={addForm.nomor_hp}
                    onChange={(e) => setAddForm({...addForm, nomor_hp: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    placeholder="0812xxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email (Opsional)
                  </label>
                  <input 
                    type="email" 
                    value={addForm.email}
                    onChange={(e) => setAddForm({...addForm, email: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    placeholder="nama@email.com"
                  />
                </div>
              </div>

              {activeTab === 'mahasiswa' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Program Studi</label>
                  <input 
                    type="text" 
                    value={addForm.program_studi}
                    onChange={(e) => setAddForm({...addForm, program_studi: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    placeholder="Manajemen (S1)"
                  />
                </div>
              )}
              
              {activeTab === 'admin' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tipe Admin
                  </label>
                  <select
                    value={addForm.tipe_admin}
                    onChange={(e) => setAddForm({...addForm, tipe_admin: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="prodi">Program Studi (Prodi)</option>
                    <option value="lppm">LPPM / Panitia Universitas</option>
                    <option value="fakultas">Fakultas</option>
                    {session?.user?.tipe_admin === 'superadmin' && (
                      <option value="superadmin">Super Admin</option>
                    )}
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
              )}
              
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 font-bold text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={addingUser}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/30 transition-all disabled:opacity-50"
                >
                  {addingUser ? 'Menyimpan...' : 'Simpan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* EDIT USER MODAL */}
      {mounted && showEditModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 dark:border-slate-700 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-teal-600" />
                Edit Data Pengguna
              </h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {activeTab === 'mahasiswa' ? 'NIM' : 'ID / Username'}
                </label>
                <input 
                  type="text" 
                  required
                  value={editForm.nim_nidn}
                  onChange={(e) => setEditForm({...editForm, nim_nidn: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {activeTab === 'dpl' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    NIDN
                  </label>
                  <input 
                    type="text" 
                    value={editForm.nidn}
                    onChange={(e) => setEditForm({...editForm, nidn: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Lengkap
                </label>
                <input 
                  type="text" 
                  required
                  value={editForm.nama_lengkap}
                  onChange={(e) => setEditForm({...editForm, nama_lengkap: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nomor WhatsApp / HP
                  </label>
                  <input 
                    type="text" 
                    value={editForm.nomor_hp}
                    onChange={(e) => setEditForm({...editForm, nomor_hp: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email
                  </label>
                  <input 
                    type="email" 
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
              
              {activeTab === 'mahasiswa' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Program Studi</label>
                    <input 
                      type="text" 
                      value={editForm.program_studi}
                      onChange={(e) => setEditForm({...editForm, program_studi: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Konsentrasi Studi</label>
                    <select 
                      value={editForm.konsentrasi}
                      onChange={(e) => setEditForm({...editForm, konsentrasi: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
                    >
                      <option value="">-- Belum Memilih Konsentrasi --</option>
                      <option value="Sumber Daya Manusia">Sumber Daya Manusia (SDM)</option>
                      <option value="Keuangan">Keuangan</option>
                      <option value="Pemasaran">Pemasaran</option>
                      <option value="Pengembangan Bisnis">Pengembangan Bisnis</option>
                    </select>
                  </div>
                </>
              )}
              
              {activeTab === 'admin' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tipe Admin
                  </label>
                  <select
                    value={editForm.tipe_admin}
                    disabled={editForm.tipe_admin === 'superadmin' && session?.user?.tipe_admin !== 'superadmin'}
                    onChange={(e) => setEditForm({...editForm, tipe_admin: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="prodi">Program Studi (Prodi)</option>
                    <option value="lppm">LPPM / Panitia Universitas</option>
                    <option value="fakultas">Fakultas</option>
                    {(session?.user?.tipe_admin === 'superadmin' || editForm.tipe_admin === 'superadmin') && (
                      <option value="superadmin">Super Admin</option>
                    )}
                    <option value="lainnya">Lainnya</option>
                  </select>
                  {editForm.tipe_admin === 'superadmin' && session?.user?.tipe_admin !== 'superadmin' && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                      * Hanya Superadmin yang dapat mengubah role akun Superadmin.
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 font-bold text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={editingUser}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/30 transition-all disabled:opacity-50"
                >
                  {editingUser ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      
    </DashboardLayout>
  );
}
