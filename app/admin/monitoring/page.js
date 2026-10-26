"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Check, X, Search, CheckCircle2, Clock, Users, UserCheck, AlertTriangle, MessageSquare, Zap, ExternalLink, Camera, MapPin, Eye, FileText, ChevronDown, ChevronUp, User, Award, ShieldAlert, Sparkles, Filter } from "lucide-react";

// Sub-komponen untuk mengambil dan mengelompokkan logbook pokja per Mahasiswa untuk Admin
function PokjaLogbookList({ pokjaId, pokja }) {
  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null); // student._id | 'pokja' | null
  const [studentLogFilter, setStudentLogFilter] = useState("semua"); // 'semua' | 'tertunda' | 'selesai'
  const [searchStudent, setSearchStudent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const fetchLogbooks = useCallback(() => {
    let isMounted = true;
    setLoading(true);
    fetch(`/api/logbook?pokjaId=${pokjaId}`)
      .then(r => r.json())
      .then(data => {
        if (isMounted) {
          setLogbooks(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(e => {
        console.error(e);
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [pokjaId]);

  useEffect(() => {
    fetchLogbooks();
  }, [fetchLogbooks]);

  // Ekstrak daftar seluruh mahasiswa yang terdaftar di pokja ini (Ketua + Anggota + siapapun yang punya logbook)
  const students = useMemo(() => {
    const list = [];
    const seen = new Set();

    // 1. Ketua Pokja
    if (pokja?.ketua_id && pokja.ketua_id._id) {
      const ketuaIdStr = pokja.ketua_id._id.toString();
      seen.add(ketuaIdStr);
      list.push({
        _id: ketuaIdStr,
        nama_lengkap: pokja.ketua_id.nama_lengkap || 'Ketua Pokja',
        nim_nidn: pokja.ketua_id.nim_nidn || '-',
        program_studi: pokja.ketua_id.program_studi || '',
        isKetua: true,
      });
    }

    // 2. Anggota Pokja
    if (Array.isArray(pokja?.anggota)) {
      pokja.anggota.forEach(item => {
        const u = item.user_id;
        if (u && u._id) {
          const uIdStr = u._id.toString();
          if (!seen.has(uIdStr)) {
            seen.add(uIdStr);
            list.push({
              _id: uIdStr,
              nama_lengkap: u.nama_lengkap || 'Anggota',
              nim_nidn: u.nim_nidn || '-',
              program_studi: u.program_studi || '',
              isKetua: false,
            });
          }
        }
      });
    }

    // 3. Fallback jika ada mahasiswa di data logbook yang belum terdaftar di array pokja
    logbooks.forEach(l => {
      const m = l.mahasiswa_id;
      if (m && m._id) {
        const mIdStr = m._id.toString();
        if (!seen.has(mIdStr)) {
          seen.add(mIdStr);
          list.push({
            _id: mIdStr,
            nama_lengkap: m.nama_lengkap || 'Mahasiswa',
            nim_nidn: m.nim_nidn || '-',
            program_studi: m.program_studi || '',
            isKetua: false,
          });
        }
      }
    });

    return list;
  }, [pokja, logbooks]);

  // Petakan logbook berdasarkan mahasiswa_id._id atau 'pokja' (kelompok)
  const studentLogsMap = useMemo(() => {
    const map = {};
    logbooks.forEach(log => {
      if (log.tipe_logbook === 'pokja') {
        if (!map['pokja']) map['pokja'] = [];
        map['pokja'].push(log);
      } else {
        const mId = log.mahasiswa_id?._id?.toString() || log.mahasiswa_id?.toString() || 'unknown';
        if (!map[mId]) map[mId] = [];
        map[mId].push(log);
      }
    });
    return map;
  }, [logbooks]);

  const pokjaLogs = studentLogsMap['pokja'] || [];
  const pendingCountTotal = logbooks.filter(l => l.status_validasi !== 'selesai').length;

  // Filter daftar mahasiswa berdasarkan input pencarian
  const filteredStudents = useMemo(() => {
    if (!searchStudent.trim()) return students;
    const q = searchStudent.toLowerCase();
    return students.filter(s =>
      s.nama_lengkap.toLowerCase().includes(q) ||
      s.nim_nidn.toLowerCase().includes(q) ||
      s.program_studi.toLowerCase().includes(q)
    );
  }, [students, searchStudent]);

  // Logbook dari entitas yang sedang dipilih (Mahasiswa tertentu atau Kelompok Pokja)
  const activeLogs = useMemo(() => {
    if (!selectedStudentId) return [];
    const raw = studentLogsMap[selectedStudentId] || [];
    return raw.filter(l => {
      if (studentLogFilter === 'tertunda') return l.status_validasi !== 'selesai';
      if (studentLogFilter === 'selesai') return l.status_validasi === 'selesai';
      return true;
    });
  }, [selectedStudentId, studentLogsMap, studentLogFilter]);

  const selectedEntityInfo = useMemo(() => {
    if (!selectedStudentId) return null;
    if (selectedStudentId === 'pokja') {
      return {
        nama_lengkap: 'Logbook Kelompok (Pokja)',
        nim_nidn: 'Kegiatan Bersama Kelompok',
        program_studi: '',
        isKetua: false,
        isPokja: true,
      };
    }
    return students.find(s => s._id === selectedStudentId) || {
      nama_lengkap: 'Mahasiswa',
      nim_nidn: '-',
      program_studi: '',
      isKetua: false,
    };
  }, [selectedStudentId, students]);

  const activeRawLogs = selectedStudentId ? (studentLogsMap[selectedStudentId] || []) : [];
  const activePendingCount = activeRawLogs.filter(l => l.status_validasi !== 'selesai').length;

  const handleViewFile = (dataUrl) => {
    try {
      const arr = dataUrl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch) {
        window.open(dataUrl, '_blank');
        return;
      }
      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      console.error("Gagal membuka file:", e);
      window.open(dataUrl, '_blank');
    }
  };

  const handleAdminApproveSingle = async (logId) => {
    if (!confirm("Validasi dan setujui (ACC) logbook ini sebagai Admin?")) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/logbook', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: logId, status_validasi: 'selesai' })
      });
      if (res.ok) {
        setToastMsg("Logbook berhasil disetujui (ACC Admin)!");
        setTimeout(() => setToastMsg(""), 3000);
        fetchLogbooks();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal memvalidasi logbook");
      }
    } catch (e) {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setIsProcessing(false);
    }
  };

  // Bulk ACC untuk satu mahasiswa atau entitas yang sedang aktif
  const handleAdminApproveEntity = async () => {
    const pendingLogs = activeRawLogs.filter(l => l.status_validasi !== 'selesai');
    if (pendingLogs.length === 0) return;
    if (!confirm(`Validasi dan setujui seluruh ${pendingLogs.length} logbook tertunda milik "${selectedEntityInfo?.nama_lengkap}" sebagai Admin?`)) return;

    setIsProcessing(true);
    try {
      const ids = pendingLogs.map(l => l._id);
      const res = await fetch('/api/logbook', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status_validasi: 'selesai' })
      });
      if (res.ok) {
        setToastMsg(`Berhasil menyetujui ${pendingLogs.length} logbook milik ${selectedEntityInfo?.nama_lengkap}!`);
        setTimeout(() => setToastMsg(""), 3000);
        fetchLogbooks();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal memvalidasi logbook");
      }
    } catch (e) {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setIsProcessing(false);
    }
  };

  // Bulk ACC seluruh Pokja (global)
  const handleAdminApproveBulk = async () => {
    const pendingLogs = logbooks.filter(l => l.status_validasi !== 'selesai');
    if (pendingLogs.length === 0) return;
    if (!confirm(`Validasi dan setujui seluruh ${pendingLogs.length} logbook yang tertunda di Pokja ini sebagai Admin?`)) return;

    setIsProcessing(true);
    try {
      const ids = pendingLogs.map(l => l._id);
      const res = await fetch('/api/logbook', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status_validasi: 'selesai' })
      });
      if (res.ok) {
        setToastMsg(`Berhasil menyetujui ${pendingLogs.length} logbook sekaligus!`);
        setTimeout(() => setToastMsg(""), 3000);
        fetchLogbooks();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal memvalidasi logbook");
      }
    } catch (e) {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'menunggu_mentor': return <span className="px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[10px] font-bold rounded">⏳ Menunggu Mentor</span>;
      case 'divalidasi_mentor': return <span className="px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-bold rounded">🔹 Divalidasi Mentor</span>;
      case 'menunggu_dpl': return <span className="px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[10px] font-bold rounded">⏳ Menunggu DPL</span>;
      case 'divalidasi_dpl': return <span className="px-2 py-0.5 bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200 dark:border-teal-800 text-[10px] font-bold rounded">✓ Divalidasi DPL</span>;
      case 'selesai': return <span className="px-2 py-0.5 bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200 dark:border-teal-800 text-[10px] font-bold rounded">✅ Selesai (ACC)</span>;
      case 'revisi': return <span className="px-2 py-0.5 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800 text-[10px] font-bold rounded">❌ Direvisi</span>;
      default: return <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-bold rounded">{status}</span>;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold animate-pulse text-sm">Mengambil seluruh logbook mahasiswa (Individu & Kelompok)...</div>;
  }

  // Hitung jumlah mahasiswa yang sudah isi vs belum isi
  const studentsWithLogsCount = students.filter(s => (studentLogsMap[s._id]?.length || 0) > 0).length;
  const studentsZeroLogsCount = students.length - studentsWithLogsCount;

  return (
    <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-900/40 space-y-4">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3 bg-teal-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4" /> {toastMsg}
        </div>
      )}

      {/* Header Bar: Ringkasan Pokja & Tombol Aksi Global */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              Monitoring Logbook Anggota Pokja ({students.length} Mahasiswa)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pilih mahasiswa di bawah untuk membuka riwayat logbook harian mereka secara spesifik.
            </p>
          </div>

          {/* Quick Global Action */}
          {pendingCountTotal > 0 && (
            <button
              onClick={handleAdminApproveBulk}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 shrink-0"
              title="Setujui seluruh logbook tertunda di pokja ini sekaligus"
            >
              <Zap className="w-3.5 h-3.5" /> ACC Semua Tertunda Pokja ({pendingCountTotal})
            </button>
          )}
        </div>

        {/* Ringkasan Bar Statistik */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-xs">
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 rounded-lg font-bold">
            Total Logbook: <strong>{logbooks.length}</strong>
          </span>
          <span className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 rounded-lg font-bold">
            ✓ Selesai: <strong>{logbooks.length - pendingCountTotal}</strong>
          </span>
          <span className={`px-2.5 py-1 rounded-lg font-bold border ${
            pendingCountTotal > 0 
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' 
              : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
          }`}>
            ⏳ Tertunda: <strong>{pendingCountTotal}</strong>
          </span>
          <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg font-bold">
            👥 Sudah Mengisi: <strong>{studentsWithLogsCount}/{students.length}</strong>
          </span>
          {studentsZeroLogsCount > 0 && (
            <span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg font-bold">
              ⚠️ Belum Mengisi: <strong>{studentsZeroLogsCount}</strong>
            </span>
          )}
        </div>

        {/* Pencarian Mahasiswa */}
        {students.length > 4 && (
          <div className="relative pt-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Cari nama atau NIM mahasiswa di pokja ini..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>
        )}
      </div>

      {/* Grid Kartu Mahasiswa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {/* Kartu Khusus Logbook Kelompok (Pokja) jika ada */}
        {pokjaLogs.length > 0 && (
          <div
            onClick={() => {
              setSelectedStudentId(selectedStudentId === 'pokja' ? null : 'pokja');
              setStudentLogFilter('semua');
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedStudentId === 'pokja'
                ? 'bg-teal-500/10 border-teal-500 ring-2 ring-teal-500 dark:bg-teal-950/40 shadow-sm'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 shadow-2xs'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center shrink-0">
                🏢
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                    KELOMPOK
                  </span>
                </div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">
                  Logbook Kegiatan Pokja
                </h5>
                <p className="text-[10px] text-slate-500 truncate">Kegiatan Bersama</p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {pokjaLogs.length} Logbook
              </span>
              <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-0.5">
                {selectedStudentId === 'pokja' ? 'Tutup ▲' : 'Buka ▼'}
              </span>
            </div>
          </div>
        )}

        {/* Kartu Mahasiswa Individu */}
        {filteredStudents.map(student => {
          const studentLogs = studentLogsMap[student._id] || [];
          const logCount = studentLogs.length;
          const pendingCount = studentLogs.filter(l => l.status_validasi !== 'selesai').length;
          const isSelected = selectedStudentId === student._id;

          return (
            <div
              key={student._id}
              onClick={() => {
                setSelectedStudentId(isSelected ? null : student._id);
                setStudentLogFilter('semua');
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-teal-500/10 border-teal-500 ring-2 ring-teal-500 dark:bg-teal-950/40 shadow-sm'
                  : logCount === 0
                  ? 'bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar / Inisial */}
                <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center shrink-0 text-xs ${
                  student.isKetua
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 ring-1 ring-amber-300'
                    : logCount > 0
                    ? 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                }`}>
                  {student.isKetua ? '👑' : student.nama_lengkap.substring(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {student.isKetua && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        KETUA
                      </span>
                    )}
                    {logCount === 0 ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                        Belum Mengisi
                      </span>
                    ) : pendingCount > 0 ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        {pendingCount} Tertunda
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                        ✓ Tuntas
                      </span>
                    )}
                  </div>

                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate mt-1" title={student.nama_lengkap}>
                    {student.nama_lengkap}
                  </h5>
                  <p className="text-[10px] text-slate-500 truncate">
                    NIM: {student.nim_nidn}
                  </p>
                </div>
              </div>

              {/* Footer Kartu Mahasiswa */}
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                <span className={`font-bold ${logCount > 0 ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                  {logCount} Logbook
                </span>
                <span className="font-bold text-teal-600 dark:text-teal-400 flex items-center gap-0.5">
                  {logCount === 0 ? (
                    <span className="text-[10px] text-slate-400">Kosong</span>
                  ) : isSelected ? (
                    'Tutup ▲'
                  ) : (
                    'Buka ▼'
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Accordion Detail Logbook untuk Mahasiswa / Kelompok yang Dipilih */}
      {selectedStudentId && (
        <div className="mt-4 p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-2xl border-2 border-teal-500/40 shadow-sm space-y-4 animate-in slide-in-from-top-2 duration-300">
          {/* Header Mahasiswa Aktif */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center text-sm">
                👤
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {selectedEntityInfo?.nama_lengkap}
                  </h4>
                  {selectedEntityInfo?.isKetua && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      KETUA
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  NIM: {selectedEntityInfo?.nim_nidn} {selectedEntityInfo?.program_studi ? `• ${selectedEntityInfo.program_studi}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              {/* Tombol ACC Semua Milik Mahasiswa ini jika ada yang pending */}
              {activePendingCount > 0 && (
                <button
                  onClick={handleAdminApproveEntity}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                  title="ACC semua logbook tertunda milik mahasiswa ini"
                >
                  <Zap className="w-3.5 h-3.5" /> ACC Semua Tertunda Mahasiswa Ini ({activePendingCount})
                </button>
              )}

              <button
                onClick={() => setSelectedStudentId(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors"
              >
                ✕ Tutup
              </button>
            </div>
          </div>

          {/* Sub Filter Status Logbook Mahasiswa ini */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500">Filter Status:</span>
              <button
                onClick={() => setStudentLogFilter('semua')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  studentLogFilter === 'semua'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                Semua ({activeRawLogs.length})
              </button>
              <button
                onClick={() => setStudentLogFilter('tertunda')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  studentLogFilter === 'tertunda'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                Tertunda ({activePendingCount})
              </button>
              <button
                onClick={() => setStudentLogFilter('selesai')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  studentLogFilter === 'selesai'
                    ? 'bg-teal-600 text-white'
                    : 'bg-teal-50 text-teal-700 border border-teal-200'
                }`}
              >
                Selesai ({activeRawLogs.length - activePendingCount})
              </button>
            </div>

            <span className="text-xs font-medium text-slate-500">
              Menampilkan {activeLogs.length} dari {activeRawLogs.length} logbook
            </span>
          </div>

          {/* Daftar Kartu Logbook Mahasiswa */}
          {activeLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              {activeRawLogs.length === 0
                ? "Mahasiswa ini belum mengisi logbook sama sekali."
                : "Tidak ada logbook dengan filter status ini."}
            </div>
          ) : (
            <div className="space-y-3">
              {activeLogs.map(log => (
                <div
                  key={log._id}
                  className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col md:flex-row gap-4 items-start"
                >
                  {/* Kolom Kiri: Tanggal & Status */}
                  <div className="shrink-0 w-full md:w-52 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700/60 pb-3 md:pb-0 md:pr-4 space-y-1.5">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      📅 {new Date(log.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {log.tipe_logbook === 'pokja' ? 'POKJA' : 'Individu'}
                      </span>
                      {getStatusBadge(log.status_validasi)}
                    </div>
                  </div>

                  {/* Kolom Tengah: Konten Logbook */}
                  <div className="flex-1 space-y-1.5">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                      📌 {log.proker_id?.judul_proker || "Kegiatan Umum / Personal"}
                    </p>
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed space-y-1">
                      <p><strong>Rencana Target:</strong> {log.rencana_target || '-'}</p>
                      <p><strong>Uraian Kegiatan:</strong> {log.uraian_kegiatan || '-'}</p>
                      <p><strong>Hasil Output:</strong> {log.hasil_output || '-'}</p>
                      {log.kendala_solusi && <p><strong>Kendala & Solusi:</strong> {log.kendala_solusi}</p>}
                    </div>
                  </div>

                  {/* Kolom Kanan: Tombol Bukti & ACC Admin */}
                  <div className="shrink-0 flex md:flex-col gap-2 w-full md:w-auto justify-end pt-2 md:pt-0">
                    {log.bukti_kegiatan && (
                      <button
                        onClick={() => handleViewFile(log.bukti_kegiatan)}
                        className="text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors border border-teal-200 inline-flex items-center gap-1 shrink-0"
                      >
                        <Camera className="w-3.5 h-3.5" /> Bukti Foto
                      </button>
                    )}

                    {log.status_validasi !== 'selesai' && (
                      <button
                        onClick={() => handleAdminApproveSingle(log._id)}
                        disabled={isProcessing}
                        className="text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-lg transition-colors shadow-2xs inline-flex items-center gap-1 disabled:opacity-50 shrink-0"
                        title="Setujui logbook ini sebagai Admin"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> ACC Admin
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MonitoringPokjaPage() {
  const [pokjas, setPokjas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState("dpl"); // 'dpl' | 'logbook' | 'monev'
  const [processingId, setProcessingId] = useState(null);

  // Filter khusus Tab Monev
  const [monevFilter, setMonevFilter] = useState("semua"); // 'semua' | 'belum_lengkap' | 'belum_pengantaran' | 'belum_pertengahan' | 'belum_penarikan' | 'tuntas'

  // Modal Detail & Eksekusi Proker untuk Admin
  const [selectedPokjaForProker, setSelectedPokjaForProker] = useState(null);
  const [prokerModalList, setProkerModalList] = useState([]);
  const [isProkerModalLoading, setIsProkerModalLoading] = useState(false);
  const [adminProkerRevisiNotes, setAdminProkerRevisiNotes] = useState({});
  const [adminProkerSubmitting, setAdminProkerSubmitting] = useState(false);

  const handleOpenProkerModal = async (pokja) => {
    setSelectedPokjaForProker(pokja);
    setIsProkerModalLoading(true);
    try {
      const res = await fetch(`/api/proker?pokjaId=${pokja._id}`);
      const data = await res.json();
      setProkerModalList(Array.isArray(data) ? data : []);
      setAdminProkerRevisiNotes({});
    } catch (err) {
      console.error(err);
      alert('Gagal mengambil data program kerja');
    } finally {
      setIsProkerModalLoading(false);
    }
  };

  const handleAdminReviewProker = async (prokerId, action) => {
    setAdminProkerSubmitting(true);
    try {
      const body = { id: prokerId, status: action };
      if (action === 'revisi') {
        body.catatan_revisi = adminProkerRevisiNotes[prokerId] || 'Silakan perbaiki proker ini (Catatan Admin)';
      } else {
        body.catatan_revisi = '';
      }

      const res = await fetch('/api/proker', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        alert(action === 'disetujui_dpl' ? 'Program kerja berhasil disetujui (ACC) oleh Admin!' : 'Catatan revisi Admin berhasil dikirim!');
        const resProker = await fetch(`/api/proker?pokjaId=${selectedPokjaForProker._id}`);
        const dataProker = await resProker.json();
        setProkerModalList(Array.isArray(dataProker) ? dataProker : []);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal memproses proker');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi');
    } finally {
      setAdminProkerSubmitting(false);
    }
  };

  // Modal Detail Kunjungan Monev
  const [selectedMonevDetail, setSelectedMonevDetail] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Ambil seluruh pokja yang aktif di periode ini (disetujui_admin, berjalan, selesai)
      const res = await fetch('/api/pokja?admin=true&status=disetujui_admin,berjalan,selesai');
      const data = await res.json();
      setPokjas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal mengambil data monitoring pokja:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredPokjas = pokjas.filter(p => {
    const searchLower = searchQuery.toLowerCase();
    const namaPokja = p.nama_pokja?.toLowerCase() || "";
    const namaKetua = p.ketua_id?.nama_lengkap?.toLowerCase() || "";
    const namaDpl = p.dpl_id?.nama_lengkap?.toLowerCase() || "";
    const namaMitra = p.mitra_id?.nama_instansi?.toLowerCase() || "";
    const matchSearch = namaPokja.includes(searchLower) || namaKetua.includes(searchLower) || namaDpl.includes(searchLower) || namaMitra.includes(searchLower);

    if (!matchSearch) return false;

    // Filter tambahan khusus tab Monev
    if (activeTab === 'monev') {
      const summary = p.monev_summary || { total: 0, is_complete: false, has_pengantaran: false, has_pertengahan: false, has_penarikan: false };
      if (monevFilter === 'belum_lengkap') return summary.total < 3;
      if (monevFilter === 'belum_pengantaran') return !summary.has_pengantaran;
      if (monevFilter === 'belum_pertengahan') return !summary.has_pertengahan;
      if (monevFilter === 'belum_penarikan') return !summary.has_penarikan;
      if (monevFilter === 'tuntas') return summary.is_complete;
    }

    return true;
  });

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  // Handler bypass aktivasi penyerahan oleh Admin
  const handleKonfirmasiPenyerahan = async (pokja) => {
    const confirmMsg = `Konfirmasi penyerahan kelompok "${pokja.nama_pokja}"?\n\nTindakan ini akan mengaktifkan status POKJA menjadi "Berjalan" sehingga mahasiswa dapat langsung mengisi logbook kegiatan harian.`;
    if (!window.confirm(confirmMsg)) return;

    setProcessingId(pokja._id);
    try {
      const res = await fetch('/api/pokja', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pokja._id,
          status_pokja: 'berjalan'
        })
      });

      if (res.ok) {
        alert(`Berhasil! Kelompok "${pokja.nama_pokja}" kini resmi berstatus Berjalan. Akses logbook mahasiswa telah terbuka.`);
        fetchData();
      } else {
        const err = await res.json();
        alert(`Gagal mengonfirmasi penyerahan: ${err.error || 'Terjadi kesalahan'}`);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan saat memperbarui status pokja.");
    } finally {
      setProcessingId(null);
    }
  };

  // Helper WhatsApp Link
  const formatWaLink = (phone, dplName, pokjaName) => {
    if (!phone) return null;
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    if (!clean.startsWith('62')) clean = '62' + clean;

    const text = encodeURIComponent(
      `Assalamu'alaikum Wr. Wb. Bapak/Ibu ${dplName || 'DPL KKL Plus'},\n\n` +
      `Pemberitahuan dari LPPM STIMI YAPMIM terkait pendampingan kelompok *${pokjaName || 'KKL Plus'}*.\n` +
      `Mohon kesediaannya login ke portal https://kklplus.stimiapps.my.id untuk meninjau penyerahan kelompok dan memasukkan data Mentor Instansi agar logbook kegiatan mahasiswa dapat berjalan lancar.\n\n` +
      `Terima kasih.`
    );
    return `https://wa.me/${clean}?text=${text}`;
  };

  // Helper WhatsApp Link untuk Pengingat Kunjungan Monev
  const formatWaMonevLink = (phone, dplName, pokjaName, summary) => {
    if (!phone) return null;
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    if (!clean.startsWith('62')) clean = '62' + clean;

    const missingVisits = [];
    if (!summary?.has_pengantaran) missingVisits.push("1. Kunjungan Pengantaran");
    if (!summary?.has_pertengahan) missingVisits.push("2. Kunjungan Pertengahan (Monev)");
    if (!summary?.has_penarikan) missingVisits.push("3. Kunjungan Penarikan");

    const text = encodeURIComponent(
      `Assalamu'alaikum Wr. Wb. Bapak/Ibu ${dplName || 'DPL KKL Plus'},\n\n` +
      `Pemberitahuan dari LPPM STIMI YAPMIM terkait dokumentasi kunjungan lapangan kelompok *${pokjaName || 'KKL Plus'}*.\n` +
      `Tercatat progres saat ini: *${summary?.total || 0}/3 Kunjungan*.\n` +
      (missingVisits.length > 0 ? `Dokumentasi kunjungan yang belum terunggah:\n${missingVisits.join('\n')}\n\n` : '') +
      `Mohon kesediaannya untuk melengkapi dokumentasi foto & catatan kunjungan di portal resmi:\nhttps://kklplus.stimiapps.my.id/dpl/monev\n\n` +
      `Terima kasih.`
    );
    return `https://wa.me/${clean}?text=${text}`;
  };

  // Helper cerdas cek keaktifan DPL
  const isDplActive = (dpl, pokja) => {
    if (!dpl) return false;
    if (dpl.last_login) return true;
    if (dpl.isFirstLogin === false) return true;
    if (pokja?.mentor_id) return true;
    return false;
  };

  // Perhitungan Ringkasan Masalah DPL & Proker
  const dplBelumLoginCount = pokjas.filter(p => p.dpl_id && !isDplActive(p.dpl_id, p)).length;
  const pokjaBelumMentorCount = pokjas.filter(p => !p.mentor_id).length;
  const pokjaPendingPenyerahanCount = pokjas.filter(p => p.status_pokja === 'disetujui_admin').length;
  const pokjaBelumAdaProkerCount = pokjas.filter(p => ['berjalan', 'disetujui_admin'].includes(p.status_pokja) && (p.proker_stats?.total || 0) === 0).length;
  const prokerMenungguApprovalCount = pokjas.filter(p => (p.proker_stats?.usulan || 0) > 0).length;

  // Perhitungan KPI Kunjungan Monev DPL
  const monevTuntasCount = pokjas.filter(p => p.monev_summary?.is_complete).length;
  const monevBelumPengantaranCount = pokjas.filter(p => !p.monev_summary?.has_pengantaran).length;
  const monevBelumPertengahanCount = pokjas.filter(p => !p.monev_summary?.has_pertengahan).length;
  const monevBelumPenarikanCount = pokjas.filter(p => !p.monev_summary?.has_penarikan).length;
  const monevBelumLengkapCount = pokjas.filter(p => (p.monev_summary?.total || 0) < 3).length;

  return (
    <DashboardLayout title="Monitoring KKL Plus">
      <div className="space-y-6">
        
        {/* Header & Search */}
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 lg:p-8 rounded-[2rem] border border-white/60 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              Monitoring KKL Plus
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Pantau kesiapan DPL, serah terima mentor instansi, kunjungan lapangan 3 kali kegiatan, dan logbook mahasiswa.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-auto flex shrink-0 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Cari Pokja, DPL, Ketua, Mitra..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80 pl-10 pr-4 py-3 rounded-xl border border-white/60 dark:border-slate-700 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white/20 dark:bg-slate-900/20 font-medium text-sm text-slate-900 dark:text-white transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-100 dark:bg-slate-900/70 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full sm:w-fit gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("dpl")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'dpl'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Kesiapan & Serah Terima DPL
            {pokjaPendingPenyerahanCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full font-black">
                {pokjaPendingPenyerahanCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("monev")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'monev'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            Monitoring Kunjungan DPL (Monev)
            {monevBelumLengkapCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full font-black">
                {monevBelumLengkapCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("logbook")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'logbook'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Monitoring Logbook Mahasiswa
          </button>
        </div>

        {/* TAB 1: Kesiapan & Serah Terima DPL */}
        {activeTab === 'dpl' && (
          <div className="space-y-6">
            
            {/* Quick KPI Cards (5 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${dplBelumLoginCount > 0 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-teal-50 text-teal-600'}`}>
                  {dplBelumLoginCount > 0 ? '⚠️' : '✅'}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">DPL Belum Login</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{dplBelumLoginCount} Dosen</p>
                </div>
              </div>

              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-black text-lg shrink-0">
                  ⏳
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Penyerahan</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{pokjaPendingPenyerahanCount} Kelompok</p>
                </div>
              </div>

              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-black text-lg shrink-0">
                  🏢
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Belum Ada Mentor</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{pokjaBelumMentorCount} Lokasi</p>
                </div>
              </div>

              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${pokjaBelumAdaProkerCount > 0 ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-teal-50 text-teal-600'}`}>
                  📂
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Belum Buat Proker</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{pokjaBelumAdaProkerCount} Kelompok</p>
                </div>
              </div>

              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${prokerMenungguApprovalCount > 0 ? 'bg-amber-50 text-amber-600 border border-amber-200 animate-pulse' : 'bg-teal-50 text-teal-600'}`}>
                  📝
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Proker Menunggu DPL</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{prokerMenungguApprovalCount} Kelompok</p>
                </div>
              </div>
            </div>

            {/* Tabel Monitoring DPL */}
            {loading ? (
              <div className="text-center py-20 text-slate-500 font-bold animate-pulse">Memuat data kesiapan DPL...</div>
            ) : (
              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm rounded-2xl border border-white/60 dark:border-slate-700 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 shadow-sm border-b border-white/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="py-4 px-6 whitespace-nowrap">POKJA & Mitra</th>
                        <th className="py-4 px-6">Dosen Pembimbing (DPL)</th>
                        <th className="py-4 px-6">Mentor Instansi</th>
                        <th className="py-4 px-6">Status Program Kerja</th>
                        <th className="py-4 px-6 text-center">Status Kelompok</th>
                        <th className="py-4 px-6 text-center">Aksi Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {filteredPokjas.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-12 text-center text-slate-500 font-medium">
                            <div className="text-4xl mb-3">📭</div>
                            Tidak ada kelompok KKL Plus yang cocok dengan pencarian.
                          </td>
                        </tr>
                      ) : (
                        filteredPokjas.map((p) => {
                          const isDplLoggedIn = isDplActive(p.dpl_id, p);
                          const dplPhone = p.dpl_id?.nomor_hp;
                          const waLink = formatWaLink(dplPhone, p.dpl_id?.nama_lengkap, p.nama_pokja);

                          return (
                            <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                              {/* Pokja & Mitra */}
                              <td className="py-4 px-6 align-top">
                                <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{p.nama_pokja}</p>
                                <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
                                  🏢 {p.mitra_id?.nama_instansi || 'Belum pilih mitra'}
                                </p>
                                <p className="text-[11px] text-slate-500 mt-1">
                                  Ketua: {p.ketua_id?.nama_lengkap || '-'} ({p.ketua_id?.nim_nidn || '-'})
                                </p>
                              </td>

                              {/* DPL */}
                              <td className="py-4 px-6 align-top">
                                {p.dpl_id ? (
                                  <div className="space-y-1.5">
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                                      {p.dpl_id.nama_lengkap}
                                    </p>
                                    <p className="text-xs text-slate-500 font-medium">
                                      NIDN: {p.dpl_id.nim_nidn || p.dpl_id.nidn || '-'}
                                    </p>
                                    
                                    {/* Status Login DPL */}
                                    <div className="flex items-center gap-2">
                                      {!isDplLoggedIn ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg text-[10px] font-bold">
                                          🔴 Belum Pernah Login
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200 dark:border-teal-900/50 rounded-lg text-[10px] font-bold">
                                          🟢 Sudah Aktif Login
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                                    ⚠️ Belum Diplot DPL
                                  </span>
                                )}
                              </td>

                              {/* Mentor Instansi */}
                              <td className="py-4 px-6 align-top">
                                {p.mentor_id ? (
                                  <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                      👤 {p.mentor_id.nama_lengkap}
                                    </p>
                                    {p.mentor_id.nomor_hp && (
                                      <p className="text-xs text-slate-500 font-medium">
                                        📱 {p.mentor_id.nomor_hp}
                                      </p>
                                    )}
                                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-md text-[10px] font-bold">
                                      {p.mentor_id.isFirstLogin ? 'Mentor Terdaftar (Belum Login)' : 'Mentor Aktif'}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <span className="text-xs text-slate-400 italic">Belum Ada Mentor</span>
                                    <p className="text-[10px] text-slate-400">Didaftarkan saat DPL serah terima</p>
                                  </div>
                                )}
                              </td>

                              {/* Status Program Kerja */}
                              <td className="py-4 px-6 align-top">
                                {['berjalan', 'disetujui_admin'].includes(p.status_pokja) ? (
                                  <div className="space-y-2">
                                    {(p.proker_stats?.total === 0 || !p.proker_stats) ? (
                                      <div className="space-y-1">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-bold rounded-lg border border-rose-200 dark:border-rose-800">
                                          <AlertTriangle className="w-3.5 h-3.5" /> Belum Ada Proker
                                        </span>
                                        {p.ketua_id?.nomor_hp && (
                                          <div>
                                            <a 
                                              href={`https://wa.me/${p.ketua_id.nomor_hp.replace(/^0/, '62').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${p.ketua_id.nama_lengkap || 'Ketua Pokja'}, kelompok KKL Plus Anda (${p.nama_pokja}) saat ini sudah aktif/berjalan. Mohon segera merancang dan mengajukan Program Kerja ke DPL melalui portal resmi MANTAU KKL Plus:\nhttps://kklplus.stimiapps.my.id\n\nTerima kasih.`)}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                                            >
                                              <MessageSquare className="w-3 h-3" /> Chat WA Ketua POKJA
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    ) : (p.proker_stats?.revisi > 0) ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 text-xs font-bold rounded-lg border border-orange-200 dark:border-orange-800">
                                        <AlertTriangle className="w-3.5 h-3.5" /> {p.proker_stats.revisi} Perlu Revisi
                                      </span>
                                    ) : (p.proker_stats?.usulan > 0) ? (
                                      <div className="space-y-1">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-xs font-bold rounded-lg border border-amber-200 dark:border-amber-800 animate-pulse">
                                          <Clock className="w-3.5 h-3.5" /> {p.proker_stats.usulan} Menunggu DPL
                                        </span>
                                        {p.dpl_id?.nomor_hp && (
                                          <div>
                                            <a 
                                              href={`https://wa.me/${p.dpl_id.nomor_hp.replace(/^0/, '62').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Yth. Bapak/Ibu ${p.dpl_id.nama_lengkap}, kelompok bimbingan Anda (${p.nama_pokja}) telah mengajukan usulan Program Kerja. Mohon kesediaannya untuk meninjau dan memberikan persetujuan melalui portal MANTAU KKL Plus:\nhttps://kklplus.stimiapps.my.id\n\nTerima kasih.`)}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                                            >
                                              <MessageSquare className="w-3 h-3" /> Chat WA DPL
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 text-xs font-bold rounded-lg border border-teal-200 dark:border-teal-800">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> {p.proker_stats?.disetujui || 0} Proker Disetujui
                                      </span>
                                    )}

                                    {/* Tombol Lihat & Kelola Proker untuk Admin */}
                                    {p.proker_stats?.total > 0 && (
                                      <button
                                        onClick={() => handleOpenProkerModal(p)}
                                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors shadow-2xs"
                                      >
                                        <Eye className="w-3.5 h-3.5" /> Lihat & Kelola Proker ({p.proker_stats.total})
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">Menunggu Aktivasi</span>
                                )}
                              </td>

                              {/* Status Kelompok */}
                              <td className="py-4 px-6 align-top text-center">
                                {p.status_pokja === 'berjalan' ? (
                                  <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border border-teal-200 dark:border-teal-800 rounded-lg text-xs font-bold">
                                    🚀 Berjalan
                                  </span>
                                ) : p.status_pokja === 'disetujui_admin' ? (
                                  <div className="space-y-1">
                                    <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs font-bold">
                                      ⏳ Belum Serah Terima
                                    </span>
                                    <p className="text-[10px] text-slate-400">DPL belum klik konfirmasi penyerahan</p>
                                  </div>
                                ) : (
                                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg text-xs font-bold">
                                    {p.status_pokja}
                                  </span>
                                )}
                              </td>

                              {/* Aksi Admin */}
                              <td className="py-4 px-6 align-top text-center">
                                <div className="flex flex-col gap-2 items-center">
                                  {p.status_pokja === 'disetujui_admin' && (
                                    <button
                                      disabled={processingId === p._id}
                                      onClick={() => handleKonfirmasiPenyerahan(p)}
                                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 whitespace-nowrap"
                                    >
                                      <Zap className="w-3.5 h-3.5" /> Konfirmasi Penyerahan
                                    </button>
                                  )}

                                  {/* Tombol Hubungi WhatsApp DPL */}
                                  {waLink ? (
                                    <a
                                      href={waLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-xs rounded-xl transition-all whitespace-nowrap"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" /> Chat WA DPL
                                    </a>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic">No HP DPL belum ada</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Monitoring Kunjungan DPL (Monev) */}
        {activeTab === 'monev' && (
          <div className="space-y-6">
            
            {/* Quick KPI Cards (4 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200 dark:border-teal-800 flex items-center justify-center font-black text-lg shrink-0">
                  🏆
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kunjungan Tuntas (3/3)</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{monevTuntasCount} Pokja</p>
                </div>
              </div>

              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${monevBelumPengantaranCount > 0 ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200' : 'bg-slate-50 text-slate-400'}`}>
                  🚗
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Belum Pengantaran</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{monevBelumPengantaranCount} Pokja</p>
                </div>
              </div>

              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${monevBelumPertengahanCount > 0 ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200' : 'bg-slate-50 text-slate-400'}`}>
                  📍
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Belum Pertengahan</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{monevBelumPertengahanCount} Pokja</p>
                </div>
              </div>

              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${monevBelumPenarikanCount > 0 ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200' : 'bg-slate-50 text-slate-400'}`}>
                  🏁
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Belum Penarikan</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{monevBelumPenarikanCount} Pokja</p>
                </div>
              </div>
            </div>

            {/* Filter Bar Kepatuhan Monev */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter Status:</span>
                <select
                  value={monevFilter}
                  onChange={(e) => setMonevFilter(e.target.value)}
                  className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="semua">Semua Kelompok ({pokjas.length})</option>
                  <option value="belum_lengkap">Belum Lengkap &lt; 3 Kunjungan ({monevBelumLengkapCount})</option>
                  <option value="belum_pengantaran">Belum Pengantaran ({monevBelumPengantaranCount})</option>
                  <option value="belum_pertengahan">Belum Pertengahan ({monevBelumPertengahanCount})</option>
                  <option value="belum_penarikan">Belum Penarikan ({monevBelumPenarikanCount})</option>
                  <option value="tuntas">Kunjungan Tuntas 3/3 ({monevTuntasCount})</option>
                </select>
              </div>

              <div className="text-xs text-slate-500 font-semibold">
                Menampilkan <strong className="text-slate-800 dark:text-white">{filteredPokjas.length}</strong> dari {pokjas.length} kelompok
              </div>
            </div>

            {/* Tabel Monitoring Kunjungan Monev DPL */}
            {loading ? (
              <div className="text-center py-20 text-slate-500 font-bold animate-pulse">Memuat data monitoring kunjungan DPL...</div>
            ) : (
              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm rounded-2xl border border-white/60 dark:border-slate-700 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 shadow-sm border-b border-white/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="py-4 px-6 whitespace-nowrap">POKJA & Mitra</th>
                        <th className="py-4 px-6">Dosen Pembimbing (DPL)</th>
                        <th className="py-4 px-6 text-center">1. Pengantaran</th>
                        <th className="py-4 px-6 text-center">2. Pertengahan</th>
                        <th className="py-4 px-6 text-center">3. Penarikan</th>
                        <th className="py-4 px-6 text-center">Total Progres</th>
                        <th className="py-4 px-6 text-center">Pengingat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {filteredPokjas.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-500 font-medium">
                            <div className="text-4xl mb-3">📭</div>
                            Tidak ada data kelompok yang sesuai dengan filter monev.
                          </td>
                        </tr>
                      ) : (
                        filteredPokjas.map((p) => {
                          const monevDetail = p.monev_detail || {};
                          const summary = p.monev_summary || { total: 0, is_complete: false };
                          const waMonevLink = formatWaMonevLink(p.dpl_id?.nomor_hp, p.dpl_id?.nama_lengkap, p.nama_pokja, summary);

                          const renderVisitBadge = (record, jenisName) => {
                            if (!record) {
                              return (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-500 dark:bg-slate-800/80 dark:text-slate-400 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700">
                                  ⚪ Belum Ada
                                </span>
                              );
                            }
                            return (
                              <button
                                type="button"
                                onClick={() => setSelectedMonevDetail({ pokja: p, monev: record, jenis: jenisName })}
                                className="inline-flex flex-col items-center gap-0.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/40 text-teal-700 dark:text-teal-300 rounded-xl text-xs font-bold border border-teal-200 dark:border-teal-800 transition shadow-2xs group"
                              >
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                                  <span>Sudah Upload</span>
                                  <Eye className="w-3 h-3 text-teal-500 group-hover:scale-110 transition-transform" />
                                </span>
                                <span className="text-[10px] text-teal-600/80 dark:text-teal-400/80 font-medium">
                                  {new Date(record.tanggal_kunjungan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </span>
                              </button>
                            );
                          };

                          return (
                            <tr key={`monev-${p._id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                              {/* POKJA & Mitra */}
                              <td className="py-4 px-6 align-middle">
                                <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{p.nama_pokja}</p>
                                <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
                                  🏢 {p.mitra_id?.nama_instansi || 'Belum pilih mitra'}
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {p.mitra_id?.wilayah || p.mitra_id?.kecamatan || '-'}
                                </p>
                              </td>

                              {/* DPL */}
                              <td className="py-4 px-6 align-middle">
                                {p.dpl_id ? (
                                  <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                                      {p.dpl_id.nama_lengkap}
                                    </p>
                                    <p className="text-xs text-slate-500 font-medium">
                                      {p.dpl_id.nomor_hp || `NIDN: ${p.dpl_id.nim_nidn || p.dpl_id.nidn || '-'}`}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-xs text-amber-600 font-medium">Belum Diplot DPL</span>
                                )}
                              </td>

                              {/* 1. Pengantaran */}
                              <td className="py-4 px-6 align-middle text-center">
                                {renderVisitBadge(monevDetail.pengantaran, "Pengantaran")}
                              </td>

                              {/* 2. Pertengahan */}
                              <td className="py-4 px-6 align-middle text-center">
                                {renderVisitBadge(monevDetail.pertengahan, "Pertengahan")}
                              </td>

                              {/* 3. Penarikan */}
                              <td className="py-4 px-6 align-middle text-center">
                                {renderVisitBadge(monevDetail.penarikan, "Penarikan")}
                              </td>

                              {/* Total Progres */}
                              <td className="py-4 px-6 align-middle text-center">
                                <div className="flex flex-col items-center gap-1.5">
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                                    summary.total === 3 
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                                      : summary.total > 0 
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' 
                                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                  }`}>
                                    {summary.total} / 3 Selesai
                                  </span>
                                  <div className="w-20 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full transition-all duration-300 ${summary.total === 3 ? 'bg-emerald-500' : 'bg-teal-500'}`} 
                                      style={{ width: `${(summary.total / 3) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>

                              {/* Pengingat WA */}
                              <td className="py-4 px-6 align-middle text-center">
                                {summary.total === 3 ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    <Check className="w-4 h-4" /> Lengkap
                                  </span>
                                ) : waMonevLink ? (
                                  <a
                                    href={waMonevLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-xs rounded-xl transition-all whitespace-nowrap"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" /> Ingatkan DPL
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">No HP belum ada</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Monitoring Logbook Mahasiswa */}
        {activeTab === 'logbook' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-20 text-slate-500 font-bold animate-pulse">Memuat data kelompok...</div>
            ) : (
              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm rounded-2xl border border-white/60 dark:border-slate-700 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 shadow-sm border-b border-white/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="py-4 px-6 whitespace-nowrap">POKJA</th>
                        <th className="py-4 px-6">Mitra KKL Plus</th>
                        <th className="py-4 px-6">DPL</th>
                        <th className="py-4 px-6 text-center">Status</th>
                        <th className="py-4 px-6 text-center">Riwayat Logbook</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {filteredPokjas.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-12 text-center text-slate-500 font-medium">
                            <div className="text-4xl mb-3">📭</div>
                            Tidak ada kelompok KKL Plus aktif ditemukan.
                          </td>
                        </tr>
                      ) : (
                        filteredPokjas.map((p) => (
                          <React.Fragment key={p._id}>
                            <tr className={`transition-colors ${expandedId === p._id ? 'bg-teal-50/30 dark:bg-teal-900/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-700/20'}`}>
                              <td className="py-4 px-6 align-middle">
                                <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{p.nama_pokja}</p>
                                <p className="text-xs text-slate-500 font-medium">Ketua: {p.ketua_id?.nama_lengkap || '-'}</p>
                              </td>
                              <td className="py-4 px-6 align-middle">
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                  {p.mitra_id?.nama_instansi || '-'}
                                </p>
                              </td>
                              <td className="py-4 px-6 align-middle">
                                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                                  {p.dpl_id?.nama_lengkap || <span className="text-slate-400 italic">Belum diset</span>}
                                </p>
                              </td>
                              <td className="py-4 px-6 align-middle text-center">
                                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                                  p.status_pokja === 'berjalan'
                                    ? 'bg-teal-100 text-teal-800 border border-teal-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}>
                                  {p.status_pokja === 'berjalan' ? 'Berjalan' : 'Persiapan (Disetujui)'}
                                </span>
                              </td>
                              <td className="py-4 px-6 align-middle text-center">
                                <button 
                                  onClick={() => toggleExpand(p._id)}
                                  className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-4 py-2 rounded-lg hover:bg-teal-100 transition-colors whitespace-nowrap shadow-sm dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800/50 dark:hover:bg-teal-900/50"
                                >
                                  <span>📋</span> {expandedId === p._id ? 'Tutup Logbook' : 'Lihat Logbook'}
                                </button>
                              </td>
                            </tr>
                            {/* Expandable Row Content */}
                            {expandedId === p._id && (
                              <tr>
                                <td colSpan="5" className="p-0 border-b-2 border-teal-200 dark:border-teal-800/50">
                                  <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                                    <PokjaLogbookList pokjaId={p._id} pokja={p} />
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
          </div>
        )}

      </div>

      {/* MODAL DETAIL & KELOLA PROGRAM KERJA POKJA OLEH ADMIN */}
      {selectedPokjaForProker && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-lg text-xs font-bold uppercase">
                    Monitoring Program Kerja
                  </span>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    {selectedPokjaForProker.nama_pokja}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Mitra: <strong>{selectedPokjaForProker.mitra_id?.nama_instansi || '-'}</strong> • DPL: <strong>{selectedPokjaForProker.dpl_id?.nama_lengkap || '-'}</strong> • Ketua: <strong>{selectedPokjaForProker.ketua_id?.nama_lengkap || '-'}</strong>
                </p>
              </div>
              <button 
                onClick={() => setSelectedPokjaForProker(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {isProkerModalLoading ? (
                <div className="text-center py-16 text-slate-500 font-bold animate-pulse">
                  Mengambil data program kerja...
                </div>
              ) : prokerModalList.length === 0 ? (
                <div className="text-center py-16 text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <p className="text-base font-bold">Belum ada usulan program kerja</p>
                  <p className="text-xs text-slate-400 mt-1">Kelompok ini belum mengajukan kegiatan proker.</p>
                </div>
              ) : (
                prokerModalList.map((p, idx) => (
                  <div key={p._id} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col lg:flex-row gap-5">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center font-black text-sm shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-base text-slate-800 dark:text-white leading-tight">
                            {p.judul_proker}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                              p.jenis_proker === 'Utama' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            }`}>
                              {p.jenis_proker}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                              PIC: {p.pic_id?.nama_lengkap || '-'}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                              Jadwal: {new Date(p.tanggal_mulai).toLocaleDateString('id-ID')} s/d {new Date(p.tanggal_selesai).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed ml-11">
                        {p.deskripsi}
                      </p>

                      <div className="ml-11 bg-teal-50 dark:bg-teal-900/20 p-3 rounded-xl border border-teal-100 dark:border-teal-800/30">
                        <p className="text-[10px] font-bold text-teal-800 dark:text-teal-400 uppercase tracking-wider mb-0.5">Target Capaian</p>
                        <p className="text-xs text-teal-700 dark:text-teal-300">{p.target_dampak}</p>
                      </div>

                      {p.catatan_revisi && (
                        <div className="ml-11 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800/30">
                          <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-0.5">Catatan Terakhir DPL/Admin</p>
                          <p className="text-xs text-amber-700 dark:text-amber-300">{p.catatan_revisi}</p>
                        </div>
                      )}
                    </div>

                    {/* Admin Action Column */}
                    <div className="w-full lg:w-64 shrink-0 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-700 pt-4 lg:pt-0 lg:pl-5 space-y-2">
                      <div className="text-center mb-1">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                          p.status === 'disetujui_dpl'
                            ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:border-teal-800'
                            : p.status === 'revisi'
                            ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:border-orange-800'
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800'
                        }`}>
                          {p.status === 'disetujui_dpl' ? '✓ Disetujui DPL' : p.status === 'revisi' ? '⚠️ Perlu Revisi' : '⏳ Menunggu Persetujuan'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAdminReviewProker(p._id, 'disetujui_dpl')}
                        disabled={adminProkerSubmitting}
                        className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {p.status === 'disetujui_dpl' ? 'Update Persetujuan Admin' : 'Setujui Proker (ACC Admin)'}
                      </button>

                      <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <textarea
                          placeholder="Beri catatan revisi admin..."
                          value={adminProkerRevisiNotes[p._id] || ''}
                          onChange={(e) => setAdminProkerRevisiNotes({...adminProkerRevisiNotes, [p._id]: e.target.value})}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg p-2 text-xs mb-1.5 resize-none h-14 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        ></textarea>
                        <button
                          onClick={() => handleAdminReviewProker(p._id, 'revisi')}
                          disabled={adminProkerSubmitting || !adminProkerRevisiNotes[p._id]}
                          className="w-full py-1.5 bg-amber-100 text-amber-800 hover:bg-amber-200 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                          Minta Revisi (Admin)
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end">
              <button 
                onClick={() => setSelectedPokjaForProker(null)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW DETAIL DOKUMENTASI MONEV */}
      {selectedMonevDetail && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 uppercase tracking-wider">
                  Kunjungan {selectedMonevDetail.jenis}
                </span>
                <h3 className="text-lg font-black text-slate-800 dark:text-white mt-1">
                  {selectedMonevDetail.pokja.nama_pokja}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  DPL: {selectedMonevDetail.pokja.dpl_id?.nama_lengkap || '-'} • Mitra: {selectedMonevDetail.pokja.mitra_id?.nama_instansi || '-'}
                </p>
              </div>
              <button
                onClick={() => setSelectedMonevDetail(null)}
                className="w-9 h-9 rounded-full bg-slate-200/60 dark:bg-slate-700/60 hover:bg-slate-300 flex items-center justify-center text-slate-600 dark:text-slate-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Info Tanggal */}
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-semibold bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Tanggal Pelaksanaan: <strong>{new Date(selectedMonevDetail.monev.tanggal_kunjungan).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
              </div>

              {/* Bukti Foto */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Foto Dokumentasi Kegiatan:</p>
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 flex items-center justify-center group max-h-[360px]">
                  <img
                    src={selectedMonevDetail.monev.foto_url}
                    alt={`Dokumentasi ${selectedMonevDetail.jenis}`}
                    className="w-full h-auto max-h-[360px] object-contain"
                  />
                  <a
                    href={selectedMonevDetail.monev.foto_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-xs transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Buka Ukuran Penuh
                  </a>
                </div>
              </div>

              {/* Catatan Kunjungan */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Catatan / Temuan Lapangan DPL:
                </p>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {selectedMonevDetail.monev.catatan || (
                    <span className="italic text-slate-400">Tidak ada catatan tertulis yang disertakan.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedMonevDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white font-semibold text-sm transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
