"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { CloudSync, HardHat, Cog, Server, Wrench } from 'lucide-react';

export default function SinkronisasiPage() {
  const [dots, setDots] = useState('');

  // Animasi titik-titik (Loading)
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 animate-in fade-in zoom-in duration-700">
        
        {/* Kontainer Utama */}
        <div className="bg-white border border-teal-100 rounded-3xl p-10 md:p-16 max-w-2xl w-full text-center shadow-xl shadow-teal-900/5 relative overflow-hidden group">
          
          {/* Latar Belakang Dekoratif Animasi */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute top-[20%] right-[-10%] w-72 h-72 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-80 h-80 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Animasi Ikon */}
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-teal-50 rounded-full flex items-center justify-center border-4 border-teal-100 relative shadow-inner">
                <CloudSync className="w-16 h-16 text-teal-500 animate-pulse" />
                
                {/* Gear yang berputar */}
                <div className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 shadow-md">
                  <Cog className="w-8 h-8 text-amber-500 animate-[spin_3s_linear_infinite]" />
                </div>
                
                {/* Kunci pas yang mengayun */}
                <div className="absolute -bottom-2 -left-2 bg-white rounded-full p-1.5 shadow-md origin-bottom-right animate-[wiggle_1s_ease-in-out_infinite]">
                  <Wrench className="w-7 h-7 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Teks Konten */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500 mb-4 tracking-tight">
              Under Construction
            </h1>
            
            <h2 className="text-xl md:text-2xl font-semibold text-slate-700 mb-4 flex items-center gap-2 justify-center">
              <HardHat className="w-6 h-6 text-amber-500" />
              Menu Sinkronisasi PDDikti
            </h2>
            
            <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed mb-8">
              Kami sedang merakit mesin sinkronisasi canggih agar pelaporan nilai dan SKS KKL Plus ke PDDikti bisa dilakukan hanya dengan satu klik! 🚀
            </p>

            {/* Loading Indicator Bawah */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-teal-50 text-teal-700 font-medium rounded-full border border-teal-100 shadow-sm">
              <Server className="w-5 h-5 animate-pulse" />
              <span>Menyiapkan Modul API Kemdikbud{dots}</span>
            </div>
          </div>
          
        </div>
        
        <p className="mt-8 text-sm text-slate-400 font-medium tracking-wide">
          Tim IT sedang bekerja keras di belakang layar.
        </p>
      </div>

      {/* Tambahkan CSS kustom khusus untuk animasi tambahan di halaman ini */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(15deg); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}} />
    </DashboardLayout>
  );
}
