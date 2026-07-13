"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";
import { Check, X, Calendar, User, Briefcase, FileSignature, Loader2, Clock, History, ChevronDown, ClipboardList, CheckCircle2, Copy } from "lucide-react";

export default function DplValidasi() {
  const { data: session } = useSession();
  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  const [activeTab, setActiveTab] = useState('antrean'); // 'antrean' or 'histori'
  const [viewMode, setViewMode] = useState('individu');
  const [expandedPokja, setExpandedPokja] = useState(null);
  const [expandedSubGroup, setExpandedSubGroup] = useState(null);
  const [lastGeneratedLink, setLastGeneratedLink] = useState(null);

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/logbook?role=dpl&userId=${session.user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) setLogbooks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset selection when tab or view mode changes
  useEffect(() => {
    setSelectedLogs([]);
  }, [activeTab, viewMode]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleBulkValidasi = async () => {
    if (selectedLogs.length === 0) return;
    setSubmitting(true);
    try {
      // Ambil salah satu logbook untuk pokja_id
      const firstLog = logbooks.find(l => l._id === selectedLogs[0]);
      
      const payload = { 
        ids: selectedLogs, 
        dpl_id: session.user.id,
        pokja_id: firstLog?.pokja_id?._id,
        logbook_ids: selectedLogs
      };
      
      const res = await fetch('/api/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok && data.token) {
        showToast(`Tautan berhasil dibuat!`);
        setSelectedLogs([]);
        fetchData();
        
        // Modal salin link
        const baseUrl = window.location.origin;
        const magicUrl = `${baseUrl}/v/${data.token}`;
        setLastGeneratedLink(magicUrl);

        
      } else {
        alert("Gagal membuat tautan validasi");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setSubmitting(false);
    }
  };

  
  const handleCopyLinkMentor = async (logs) => {
    const targetLogs = logs.filter(l => l.status_validasi === 'menunggu_mentor');
    const targetIds = targetLogs.map(l => l._id);
    if (targetIds.length === 0) return;
    
    setSubmitting(true);
    try {
      const firstLog = targetLogs[0];
      const payload = { 
        ids: targetIds, 
        dpl_id: session.user.id,
        pokja_id: firstLog?.pokja_id?._id || firstLog?.pokja_id,
        logbook_ids: targetIds
      };
      
      const res = await fetch('/api/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok && data.token) {
        const baseUrl = window.location.origin;
        const magicUrl = `${baseUrl}/v/${data.token}`;
        navigator.clipboard.writeText(magicUrl);
        showToast('Tautan disalin ke clipboard!');
      } else {
        alert("Gagal membuat tautan validasi");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForceValidate = async (logs) => {
    const targetLogs = logs.filter(l => l.status_validasi === 'menunggu_mentor').map(l => l._id);
    if (targetLogs.length === 0) return;

    if (!confirm(`Anda yakin ingin memvalidasi ${targetLogs.length} logbook secara langsung (menggantikan Mentor)?`)) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/logbook', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: targetLogs,
          status_validasi: 'selesai'
        })
      });
      
      if (res.ok) {
        showToast(`${targetLogs.length} Logbook berhasil divalidasi!`);
        fetchData();
      } else {
        alert("Gagal memvalidasi logbook");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setSubmitting(false);
    }
  };

const toggleSelectLog = (id) => {
    setSelectedLogs(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const handleSelectSubGroup = (logs) => {
    logs = logs.filter(l => l.status_validasi === 'menunggu_dpl' || l.status_validasi === 'menunggu_mentor');
    if (logs.length === 0) return;
    const groupLogIds = logs.map(l => l._id);
    const allSelected = groupLogIds.every(id => selectedLogs.includes(id));
    if (allSelected) {
      setSelectedLogs(prev => prev.filter(id => !groupLogIds.includes(id)));
    } else {
      setSelectedLogs(prev => {
        const newSet = new Set([...prev, ...groupLogIds]);
        return Array.from(newSet);
      });
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

  // -------------------------------------------------------------
  // Data Grouping Logic
  // -------------------------------------------------------------
  const filteredLogs = useMemo(() => {
    return logbooks.filter(log => {
      // Filter tipe (individu vs pokja)
      const typeMatches = log.tipe_logbook === viewMode;
      
      // Filter status
      const statusMatches = activeTab === 'antrean' 
        ? log.status_validasi === 'menunggu_dpl' 
        : log.status_validasi !== 'menunggu_dpl';

      return typeMatches && statusMatches;
    });
  }, [logbooks, activeTab, viewMode]);

  const groupedByPokja = useMemo(() => {
    const pokjaGroups = {};
    filteredLogs.forEach(log => {
      const pokjaId = log.pokja_id?._id || 'unknown';
      const pokjaName = log.pokja_id?.nama_pokja || 'Lainnya';
      
      if (!pokjaGroups[pokjaId]) {
        pokjaGroups[pokjaId] = {
          name: pokjaName,
          subGroups: {}
        };
      }
      
      let subGroupKey = 'Lainnya';
      if (viewMode === 'individu') {
        subGroupKey = log.mahasiswa_id?.nama_lengkap || 'Anonim';
      } else {
        subGroupKey = log.proker_id?.judul_proker || 'Proker Umum';
      }

      if (!pokjaGroups[pokjaId].subGroups[subGroupKey]) {
        pokjaGroups[pokjaId].subGroups[subGroupKey] = [];
      }
      pokjaGroups[pokjaId].subGroups[subGroupKey].push(log);
    });
    
    return Object.entries(pokjaGroups).map(([pokjaId, data]) => ({
      pokjaId,
      pokjaName: data.name,
      subGroups: Object.entries(data.subGroups).map(([name, logs]) => ({
        name,
        logs
      }))
    }));
  }, [filteredLogs, viewMode]);


  return (
    <DashboardLayout title="Pantau Kegiatan Mahasiswa (DPL)">
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-teal-600 text-white px-8 py-3.5 rounded-full shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-300 font-bold flex items-center gap-2.5 border border-teal-500">
          <span><Check className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /></span> {toastMessage}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400 font-bold">
          <Loader2 className="w-6 h-6 animate-spin" /> Memuat data...
        </div>
      ) : (
        <div className="space-y-6 pb-28">
          
          {/* Top Control Bar */}
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-sm rounded-2xl border border-white/60 dark:border-slate-700 p-4 md:p-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            
            <div className="flex flex-col gap-1 w-full xl:w-auto">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Kurasi Logbook
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Pilih aktivitas Individu atau POKJA untuk Anda *review*.</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
              {/* Type Switcher */}
              <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700/50">
                <button
                  className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
                    viewMode === 'individu' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                  onClick={() => setViewMode('individu')}
                >
                  <User className="w-4 h-4" /> Per Mahasiswa
                </button>
                <button
                  className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
                    viewMode === 'pokja' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                  onClick={() => setViewMode('pokja')}
                >
                  <Briefcase className="w-4 h-4" /> Per Proker
                </button>
              </div>

              <div className="w-px h-8 bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>

              {/* Status Switcher */}
              <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700/50">
                <button
                  className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
                    activeTab === 'antrean' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                  onClick={() => setActiveTab('antrean')}
                >
                  <Clock className="w-4 h-4" /> Perlu Perhatian
                </button>
                <button
                  className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
                    activeTab === 'histori' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                  onClick={() => setActiveTab('histori')}
                >
                  <History className="w-4 h-4" /> Riwayat
                </button>
              </div>
            </div>
          </div>

          {/* Kanban / Grid Board */}
          {groupedByPokja.length === 0 ? (
            <div className="py-20 text-center text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-slate-700">
              <div className="text-5xl mb-4 opacity-50">📂</div>
              <p className="font-bold text-lg">Tidak ada logbook di mode ini.</p>
              <p className="text-sm mt-1">Semua aktivitas sudah tervalidasi atau belum ada yang disubmit.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedByPokja.map(pokja => (
                <div key={pokja.pokjaId} className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
                  
                  {/* POKJA HEADER */}
                  <div 
                    className="px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-white dark:hover:bg-slate-800/80 transition-colors"
                    onClick={() => setExpandedPokja(expandedPokja === pokja.pokjaId ? null : pokja.pokjaId)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 dark:text-white text-lg lg:text-xl">{pokja.pokjaName}</h3>
                        <p className="text-sm text-slate-500 font-medium mt-0.5">
                          {pokja.subGroups.length} {viewMode === 'individu' ? 'Mahasiswa' : 'Proker'} aktif
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${expandedPokja === pokja.pokjaId ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* POKJA CONTENT */}
                  {expandedPokja === pokja.pokjaId && (
                    <div className="border-t border-slate-200 dark:border-slate-700 p-4 md:p-6 bg-slate-50/50 dark:bg-slate-900/20 space-y-4">
                      {pokja.subGroups.map(subGroup => {
                        const subGroupId = `${pokja.pokjaId}-${subGroup.name}`;
                        const isSubExpanded = expandedSubGroup === subGroupId;
                        const unvalidatedCount = subGroup.logs.filter(l => l.status_validasi === 'menunggu_dpl').length;
                        
                        return (
                          <div key={subGroup.name} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all hover:shadow-md">
                            
                            {/* SUBGROUP HEADER */}
                            <div 
                              className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                              onClick={() => setExpandedSubGroup(isSubExpanded ? null : subGroupId)}
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                                  {viewMode === 'individu' ? <User className="w-5 h-5" /> : <ClipboardList className="w-5 h-5" />}
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-700 dark:text-slate-100 text-base">{subGroup.name}</h4>
                                  {unvalidatedCount > 0 && activeTab === 'antrean' && (
                                    <span className="inline-block mt-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/50">
                                      {unvalidatedCount} menunggu validasi
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isSubExpanded ? 'rotate-180' : ''}`} />
                            </div>

                            {/* LOGS GRID */}
                            {isSubExpanded && (
                              <div className="p-4 md:p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                
                                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <FileSignature className="w-4 h-4 text-teal-500" />
                                    Total {subGroup.logs.length} Logbook
                                  </span>
                                  {activeTab === 'antrean' && subGroup.logs.some(l => l.status_validasi === 'menunggu_dpl') && (
                                    <button 
                                      onClick={() => handleSelectSubGroup(subGroup.logs)}
                                      className="text-xs font-bold px-4 py-2 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 rounded-lg border border-teal-200 dark:border-teal-800/50 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors flex items-center justify-center gap-2"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Pilih Semua di Grup Ini
                                    </button>
                                  )}
                                  
                                  {activeTab === 'histori' && subGroup.logs.some(l => l.status_validasi === 'menunggu_mentor') && (
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={() => handleCopyLinkMentor(subGroup.logs)}
                                        disabled={submitting}
                                        className="text-xs font-bold px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                                      >
                                        <Copy className="w-3.5 h-3.5" /> Copy Link
                                      </button>
                                      <button 
                                        onClick={() => handleForceValidate(subGroup.logs)}
                                        disabled={submitting}
                                        className="text-xs font-bold px-4 py-2 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 rounded-lg border border-teal-200 dark:border-teal-800/50 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors flex items-center justify-center gap-2"
                                      >
                                        <Check className="w-3.5 h-3.5" /> Bantu Validasi
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                                  {subGroup.logs.map(log => {
                                    const isSelected = selectedLogs.includes(log._id);
                                    return (
                                      <div 
                                        key={log._id} 
                                        className={`bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border transition-all ${
                                          isSelected ? 'border-teal-400 dark:border-teal-500 ring-2 ring-teal-400/20 dark:ring-teal-500/20 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600'
                                        }`}
                                      >
                                        <div className="flex justify-between items-start mb-4 gap-3">
                                          <div className="flex items-start gap-3">
                                            {activeTab === 'antrean' && log.status_validasi === 'menunggu_dpl' && (
                                              <input 
                                                type="checkbox" 
                                                className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-600 mt-0.5 cursor-pointer"
                                                checked={isSelected}
                                                onChange={() => toggleSelectLog(log._id)}
                                              />
                                            )}
                                            <div>
                                              <p className="text-sm font-black text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-teal-500" /> 
                                                {new Date(log.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                              </p>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-center gap-2 shrink-0">
                                            {log.bukti_kegiatan && (
                                              <button 
                                                onClick={(e) => { e.stopPropagation(); handleViewFile(log.bukti_kegiatan); }} 
                                                className="text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400 px-2 py-1 rounded-md hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors border border-teal-200 dark:border-teal-800/50 flex items-center gap-1"
                                                title="Lihat Bukti Kegiatan"
                                              >
                                                🖼️ Bukti
                                              </button>
                                            )}
                                            {log.status_validasi === 'menunggu_dpl' && <span className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold rounded-md border border-amber-200 dark:border-amber-800/50">Menunggu DPL</span>}
                                            {log.status_validasi === 'menunggu_mentor' && <span className="px-2 py-1 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 text-[10px] font-bold rounded-md border border-teal-200 dark:border-teal-800/50 animate-pulse">Di Mentor</span>}
                                            {log.status_validasi === 'selesai' && <span className="px-2 py-1 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 text-[10px] font-bold rounded-md border border-teal-200 dark:border-teal-800/50">Selesai</span>}
                                          </div>
                                        </div>

                                        <div className="space-y-2 mb-2 bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                          <p className="text-sm text-slate-700 dark:text-slate-300">
                                            <span className="font-bold text-teal-600 dark:text-teal-400 mr-2">Rencana Target:</span> 
                                            {log.rencana_target}
                                          </p>
                                          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                            <span className="font-bold text-teal-600 dark:text-teal-400 mr-2">Uraian Kegiatan:</span> 
                                            {log.uraian_kegiatan}
                                          </p>
                                          <p className="text-sm text-teal-700 dark:text-teal-400 font-medium">
                                            <span className="font-bold text-teal-600 dark:text-teal-500 mr-2">Hasil / Output:</span> 
                                            {log.hasil_output}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sticky Action Bar */}
      {selectedLogs.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-4 sm:p-5 transform transition-transform duration-300 animate-in slide-in-from-bottom-full">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black">
                {selectedLogs.length}
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">Kegiatan Terpilih</p>
                <p className="text-xs text-slate-500 font-medium">Langkah selanjutnya adalah meminta validasi Kepala Desa.</p>
              </div>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setSelectedLogs([])}
                className="px-5 py-3 font-bold text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleBulkValidasi}
                disabled={submitting}
                className="flex-1 sm:flex-none px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Validasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for custom scrollbar hidden globally if not configured in tailwind */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(75, 85, 99, 0.4);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.5);
        }
      `}</style>
    
      {lastGeneratedLink && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-5 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white text-center mb-2">Tautan Berhasil Dibuat!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">Silakan salin tautan (link) di bawah ini lalu kirimkan ke WhatsApp Mentor untuk divalidasi atau disetujui.</p>
            
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
              <input 
                type="text" 
                readOnly 
                value={lastGeneratedLink} 
                className="bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 dark:text-slate-300 w-full outline-none"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(lastGeneratedLink);
                  showToast('Tautan disalin ke clipboard!');
                }}
                className="shrink-0 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400"
                title="Salin Tautan"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            
            <button 
              onClick={() => setLastGeneratedLink(null)}
              className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
