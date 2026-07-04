"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, MapPin, Users, Briefcase, Building } from 'lucide-react';

export default function ModalDetailLowongan({ isOpen, onClose, mitra }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !mitra) return null;

  const getBadgeColor = (skema) => {
    switch(skema?.toLowerCase()) {
      case 'corporate': return 'bg-blue-100 text-blue-700';
      case 'pemerintahan': return 'bg-amber-100 text-amber-700';
      case 'wirausaha': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getKonsentrasiColor = (konsentrasi) => {
    switch(konsentrasi?.toLowerCase()) {
      case 'sdm': return 'bg-purple-100 text-purple-700';
      case 'keuangan': return 'bg-emerald-100 text-emerald-700';
      case 'pemasaran': return 'bg-orange-100 text-orange-700';
      case 'pengembangan bisnis': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-fade-in" 
        onClick={onClose}
      ></div>

      {/* Slide-over panel */}
      <div className="relative w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl transform transition-transform animate-slide-left overflow-hidden">
        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-100 bg-slate-50/80 flex justify-between items-start sticky top-0 z-10 backdrop-blur-md">
          <div className="flex gap-5 items-start pr-8">
            <div className="w-16 h-16 shrink-0 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-[0_10px_20px_-10px_rgba(79,70,229,0.5)] border border-indigo-500/20">
              {mitra.nama_instansi.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2 leading-tight tracking-tight">{mitra.nama_instansi}</h2>
              <div className="flex flex-wrap gap-2 items-center text-sm">
                <span className={`px-2.5 py-1 rounded-md font-bold text-[11px] uppercase tracking-wider ${getBadgeColor(mitra.jenis_skema)}`}>
                  {mitra.jenis_skema || 'Mitra'}
                </span>
                <span className="flex items-center gap-1 text-slate-500 font-medium text-[13px]">
                  <MapPin size={14} className="text-slate-400" /> {mitra.alamat}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content scrollable */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-10 custom-scrollbar bg-white">
          
          {/* Section 1: Profil */}
          <section>
            <h3 className="text-[17px] font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <Building size={20} className="text-indigo-600" />
              Tentang Instansi / Perusahaan
            </h3>
            <div className="text-slate-600 text-[15px] leading-relaxed bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              {mitra.deskripsi_mitra ? (
                <p className="whitespace-pre-line">{mitra.deskripsi_mitra}</p>
              ) : (
                <p className="italic text-slate-400">Profil perusahaan belum ditambahkan.</p>
              )}
            </div>
          </section>

          {/* Section 2: Posisi */}
          <section>
            <h3 className="text-[17px] font-extrabold text-slate-900 mb-5 flex items-center gap-2">
              <Briefcase size={20} className="text-indigo-600" />
              Posisi & Lowongan Tersedia
            </h3>
            
            {mitra.posisi_list?.length > 0 ? (
              <div className="space-y-5">
                {mitra.posisi_list.map((pos) => (
                  <div key={pos._id} className="border border-slate-200 rounded-3xl p-6 hover:border-indigo-300 hover:shadow-[0_10px_30px_-15px_rgba(79,70,229,0.2)] transition-all duration-300 group bg-white">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-5">
                      <div>
                        <h4 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{pos.nama_posisi}</h4>
                        <div className="flex flex-wrap gap-2 mt-2.5">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${getKonsentrasiColor(pos.konsentrasi)}`}>
                            {pos.konsentrasi || 'Umum'}
                          </span>
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[11px] font-bold uppercase tracking-wider">
                            {pos.sistem_kerja || 'WFO'}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 font-extrabold text-sm shadow-sm">
                        <Users size={16} className="text-indigo-500" />
                        {pos.kuota || 0} Slot Tersedia
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div>
                        <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Deskripsi Pekerjaan</h5>
                        <p className="text-[14px] text-slate-600 leading-relaxed">
                          {pos.deskripsi_pekerjaan || <span className="italic text-slate-400">Deskripsi belum tersedia.</span>}
                        </p>
                      </div>
                      <div>
                        <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Kriteria Kandidat</h5>
                        <div className="text-[14px] text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
                          {pos.kriteria_kandidat ? (
                            <div className="whitespace-pre-line pl-2 border-l-2 border-indigo-200">{pos.kriteria_kandidat}</div>
                          ) : (
                            <span className="italic text-slate-400">Kriteria belum tersedia.</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="pt-3 flex justify-end">
                        <button 
                          onClick={() => {
                            // Simpan memori pendaftaran ke localStorage
                            localStorage.setItem('target_kkl', JSON.stringify({
                              mitra_id: mitra._id,
                              posisi_id: pos._id
                            }));
                            // Redirect ke halaman login / pengajuan
                            window.location.href = '/login';
                          }}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 flex items-center gap-2"
                        >
                          Daftar Posisi Ini
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
                <div className="text-3xl mb-3 opacity-50">📭</div>
                <p className="text-slate-500 font-medium">Belum ada posisi yang dibuka untuk mitra ini.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-slide-left {
          animation: slideLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
