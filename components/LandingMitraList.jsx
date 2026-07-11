"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import ModalDetailLowongan from './ModalDetailLowongan';

export default function LandingMitraList() {
  const [mitra, setMitra] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedMitra, setSelectedMitra] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (m) => {
    setSelectedMitra(m);
    setIsModalOpen(true);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/mitra?public=true');
        const data = await res.json();
        setMitra(data);
      } catch (error) {
        console.error("Error fetching mitra:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getBadgeColor = (skema) => {
    switch(skema?.toLowerCase()) {
      case 'corporate': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'pemerintahan': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'wirausaha': return 'bg-teal-50 text-teal-700 border-teal-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const filteredMitra = (Array.isArray(mitra) ? mitra : []).filter((m) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    
    // Check instansi name
    if (m.nama_instansi?.toLowerCase().includes(lowerQuery)) return true;
    // Check location
    if (m.alamat?.toLowerCase().includes(lowerQuery)) return true;
    // Check positions
    if (m.posisi_list?.some(pos => pos.nama_posisi?.toLowerCase().includes(lowerQuery))) return true;
    
    return false;
  });

  const displayMitra = filteredMitra.slice(0, visibleCount);

  return (
    <>
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12 relative z-10">
        <div className="relative flex items-center w-full h-14 rounded-2xl shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-200 bg-white/90 backdrop-blur-md overflow-hidden focus-within:ring-2 focus-within:ring-teal-500/50 focus-within:border-teal-500 transition-all hover:shadow-md">
          <div className="grid place-items-center h-full w-16 text-slate-400">
            <Search size={22} />
          </div>
          <input
            className="peer h-full w-full outline-none text-slate-700 pr-6 bg-transparent font-medium placeholder-slate-400"
            type="text"
            id="search"
            placeholder="Cari nama mitra, lokasi, atau posisi KKL Plus..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(12); // reset visible count on new search
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm animate-pulse flex flex-col min-h-[260px]">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-200 rounded-2xl"></div>
                <div className="w-20 h-6 bg-slate-200 rounded-full"></div>
              </div>
              <div className="h-5 bg-slate-200 rounded-md w-3/4 mb-3"></div>
              <div className="h-4 bg-slate-200 rounded-md w-1/2 mb-5"></div>
              <div className="flex gap-2 mb-5 flex-wrap">
                <div className="h-6 bg-slate-200 rounded-md w-16"></div>
                <div className="h-6 bg-slate-200 rounded-md w-24"></div>
              </div>
              <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center">
                <div className="w-16 h-8 bg-slate-200 rounded-md"></div>
                <div className="w-20 h-8 bg-slate-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : displayMitra.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {displayMitra.map((m) => {
            const totalKuota = m.posisi_list?.reduce((sum, pos) => sum + (pos.kuota || 0), 0) || 0;
            return (
              <div key={m._id} className="bg-white p-5 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 hover:border-teal-300 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)] hover:-translate-y-2 transition-all duration-300 flex flex-col group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-teal-100"></div>
                
                <div className="relative z-10 flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 rounded-2xl flex items-center justify-center font-extrabold text-lg shadow-inner border border-slate-200 group-hover:from-teal-600 group-hover:to-teal-700 group-hover:text-white transition-all duration-300">
                    {m.nama_instansi.substring(0, 2).toUpperCase()}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getBadgeColor(m.jenis_skema)} shadow-sm`}>
                    {m.jenis_skema || 'Mitra'}
                  </span>
                </div>
                
                <div className="relative z-10">
                  <h4 className="font-extrabold text-[15px] text-slate-900 mb-1 line-clamp-2 leading-tight group-hover:text-teal-700 transition-colors">{m.nama_instansi}</h4>
                  <p className="text-[11px] text-slate-500 mb-4 flex items-start gap-1.5 line-clamp-2 leading-relaxed">
                    <span className="shrink-0 mt-0.5 opacity-70">📍</span> 
                    {m.alamat}
                  </p>
                </div>
                
                <div className="mb-4 flex-grow relative z-10">
                  <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Posisi / Divisi Tersedia:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.posisi_list?.length > 0 ? (
                      <>
                        {m.posisi_list.slice(0, 3).map(pos => (
                          <span key={pos._id} className="inline-flex items-center px-2 py-1 bg-slate-50/80 border border-slate-200 text-slate-600 text-[11px] font-semibold rounded-lg hover:border-slate-300 transition-colors">
                            {pos.nama_posisi}
                          </span>
                        ))}
                        {m.posisi_list.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 bg-slate-100/80 text-slate-500 text-[11px] font-bold rounded-lg border border-transparent">
                            +{m.posisi_list.length - 3} lainnya
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Belum ada posisi</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Total Kuota</span>
                    <span className="text-base font-extrabold text-slate-800 group-hover:text-teal-600 transition-colors">{totalKuota} <span className="text-[10px] font-semibold text-slate-500">Orang</span></span>
                  </div>
                  <button 
                    onClick={() => handleOpenModal(m)}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold transition-all shadow-md hover:shadow-teal-500/30 hover:-translate-y-0.5"
                  >
                    Detail Lowongan
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white/50 rounded-3xl border border-slate-200 border-dashed backdrop-blur-sm max-w-2xl mx-auto">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Tidak ditemukan</h3>
          <p className="text-slate-500 mb-6">Kami tidak menemukan mitra atau posisi KKL Plus yang cocok dengan pencarian "<span className="font-semibold text-slate-700">{searchQuery}</span>"</p>
          <button 
            onClick={() => setSearchQuery("")}
            className="px-6 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-600 font-bold rounded-xl transition-colors border border-teal-200 shadow-sm"
          >
            Hapus Pencarian
          </button>
        </div>
      )}
      
      {!loading && filteredMitra.length > visibleCount && (
        <div className="text-center mt-14 relative z-10">
          <button 
            onClick={() => setVisibleCount(prev => prev + 12)}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm transition-all border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 gap-2 group"
          >
            Muat Lebih Banyak <span className="text-slate-400 group-hover:text-teal-600 transition-colors">({filteredMitra.length - visibleCount} lagi)</span> <span className="text-lg leading-none group-hover:translate-y-0.5 transition-transform">&darr;</span>
          </button>
        </div>
      )}

      <ModalDetailLowongan 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        mitra={selectedMitra} 
      />
    </>
  );
}
