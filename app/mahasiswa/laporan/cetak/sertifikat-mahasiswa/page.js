"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function CetakSertifikatMahasiswa() {
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
  const mhs = session.user;
  const mitra = pengajuan.mitra_id?.nama_perusahaan || pengajuan.detail_tempat?.nama;

  // URL validasi untuk QR Code
  const verifyUrl = `http://localhost:3020/verify/${laporan._id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;

  return (
    <div className="bg-slate-200 min-h-screen font-sans text-slate-800 flex items-center justify-center p-8 print:p-0 print:bg-white">
      
      <div className="fixed top-5 right-5 print:hidden z-50">
        <button onClick={() => window.print()} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg shadow-lg hover:bg-emerald-700">
          🖨️ Cetak Sertifikat (Landscape)
        </button>
        <p className="text-xs text-center mt-2 text-slate-500">Pastikan Layout = Landscape di pengaturan print</p>
      </div>

      {/* Kontainer Kertas A4 Landscape: 29.7cm x 21cm */}
      <div className="w-[29.7cm] h-[21cm] bg-white relative overflow-hidden shadow-2xl print:shadow-none border-[1rem] border-double border-slate-100 flex flex-col justify-center text-center p-[2cm]">
        
        {/* Latar Belakang Elegan */}
        <div className="absolute inset-0 bg-slate-50 opacity-50 pointer-events-none"></div>
        <div className="absolute -top-[10cm] -right-[10cm] w-[20cm] h-[20cm] bg-blue-50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-[10cm] -left-[10cm] w-[20cm] h-[20cm] bg-emerald-50 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col h-full justify-between items-center">
          
          <div className="w-full flex justify-between items-start">
            <img src="/mk.png" alt="Logo" className="h-16" />
            <div className="text-right">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Sertifikat</h2>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Penyelesaian KKL Plus Berdampak</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center w-full my-8">
            <p className="text-lg text-slate-600 mb-6">Diberikan kepada:</p>
            <h1 className="text-5xl font-black text-slate-900 uppercase tracking-wider mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              {mhs.nama_lengkap}
            </h1>
            <p className="text-xl text-slate-600 font-bold mb-8">NIM: {mhs.nim_nidn}</p>

            <p className="text-lg text-slate-600 max-w-3xl leading-relaxed">
              Telah menyelesaikan program KKL Plus Berdampak dengan predikat <span className="font-bold text-emerald-600">SANGAT BAIK</span> 
              di <span className="font-bold text-slate-800">{mitra}</span>. Sertifikat ini diberikan sebagai bentuk apresiasi atas 
              dedikasi, kontribusi, dan pencapaian kompetensi profesional selama masa KKL Plus.
            </p>
          </div>

          <div className="w-full flex justify-between items-end">
            <div className="flex gap-4 items-end">
              <img src={qrCodeUrl} alt="QR Code SKPI" className="w-24 h-24 border border-slate-200 p-1 bg-white" />
              <div className="text-left text-xs text-slate-500 mb-1">
                <p className="font-bold">Verifikasi Digital (SKPI)</p>
                <p>Scan kode QR untuk memvalidasi</p>
                <p>keaslian dokumen ini di sistem</p>
                <p>STIMI YAPMI Makassar.</p>
              </div>
            </div>

            <div className="text-center w-64">
              <p className="text-sm text-slate-600 mb-16">Pimpinan / Mentor Industri</p>
              <div className="border-b border-slate-400 w-full mb-2"></div>
              <p className="font-bold text-slate-800">{mitra}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
