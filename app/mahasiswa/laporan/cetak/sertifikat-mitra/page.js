"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function CetakSertifikatMitra() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const mhsId = params.get('mhsId') || session?.user?.id;

    if (id) {
      fetch(`/api/laporan-akhir?id=${id}`)
        .then(res => res.json())
        .then(d => {
          if (d.laporan && d.pengajuan) {
            setData(d);
          }
        });
    } else if (mhsId) {
      fetch(`/api/laporan-akhir?mhsId=${mhsId}`)
        .then(res => res.json())
        .then(d => {
          if (d.laporan && d.pengajuan) {
            setData(d);
          }
        });
    }
  }, [session]);

  if (!data) return <div className="p-10 text-center">Memuat Sertifikat...</div>;

  const { laporan, pengajuan } = data;
  const mitra = pengajuan.mitra_id?.nama_perusahaan || pengajuan.detail_tempat?.nama;

  return (
    <div className="bg-slate-200 min-h-screen font-sans text-slate-800 flex items-center justify-center p-8 print:p-0 print:bg-white">
      
      <div className="fixed top-5 right-5 print:hidden z-50">
        <button onClick={() => window.print()} className="px-6 py-3 bg-slate-800 text-white font-bold rounded-lg shadow-lg hover:bg-slate-900">
          🖨️ Cetak Sertifikat Mitra (Landscape)
        </button>
        <p className="text-xs text-center mt-2 text-slate-500">Pastikan Layout = Landscape di pengaturan print</p>
      </div>

      {/* Kontainer Kertas A4 Landscape: 29.7cm x 21cm */}
      <div className="w-[29.7cm] h-[21cm] bg-white relative overflow-hidden shadow-2xl print:shadow-none border-[1rem] border-solid border-slate-800 flex flex-col justify-center text-center p-[2cm]">
        
        {/* Latar Belakang Elegan */}
        <div className="absolute inset-0 bg-slate-50 opacity-50 pointer-events-none"></div>
        <div className="absolute -top-[10cm] -right-[10cm] w-[20cm] h-[20cm] bg-amber-50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-[10cm] -left-[10cm] w-[20cm] h-[20cm] bg-slate-100 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col h-full justify-between items-center">
          
          <div className="w-full flex justify-center items-start mb-4">
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Sertifikat Penghargaan</h2>
              <p className="text-sm font-bold text-amber-600 uppercase tracking-widest mt-1">Kemitraan STIMI YAPMI Makassar</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center w-full my-8">
            <p className="text-lg text-slate-600 mb-6">Penghargaan tertinggi diberikan kepada:</p>
            <h1 className="text-5xl font-black text-slate-900 uppercase tracking-wider mb-8" style={{ fontFamily: 'Georgia, serif' }}>
              {mitra}
            </h1>

            <p className="text-lg text-slate-600 max-w-3xl leading-relaxed">
              Atas dukungan, dedikasi, dan kerja samanya sebagai instansi Mitra dalam menyukseskan program 
              <span className="font-bold text-slate-800"> KKL Plus Berdampak</span>. Kontribusi yang diberikan 
              sangat berarti dalam membimbing dan meningkatkan kompetensi mahasiswa kami di dunia industri nyata.
            </p>
          </div>

          <div className="w-full flex justify-center items-end">
            <div className="text-center w-64">
              <p className="text-sm text-slate-600 mb-16">Makassar, {new Date(pengajuan.tanggal_selesai).toLocaleDateString('id-ID')}</p>
              <div className="border-b border-slate-800 w-full mb-2"></div>
              <p className="font-bold text-slate-800 uppercase">Ketua STIMI YAPMI</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
