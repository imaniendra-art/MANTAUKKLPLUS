"use client";

import { useEffect, useState } from 'react';
import { useSession } from "@/components/AuthProvider";

export default function CetakSertifikatMahasiswa() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const mhsId = params.get('mhsId') || session?.user?.id;

    const load = async () => {
      try {
        let fetchUrl = '';
        if (id) fetchUrl = `/api/laporan-akhir?id=${id}`;
        else if (mhsId) fetchUrl = `/api/laporan-akhir?mhsId=${mhsId}`;
        
        if (!fetchUrl) return;

        const res = await fetch(fetchUrl);
        const d = await res.json();
        
        if (d.laporan && d.pengajuan) {
          // Fetch penilaian
          const resP = await fetch(`/api/penilaian?pokjaId=${d.pengajuan._id}`);
          const dataP = await resP.json();
          const myId = mhsId || session?.user?.id;
          const myGrade = dataP.penilaians?.find(p => p.mahasiswa_id?._id === myId || p.mahasiswa_id === myId);
          
          setData({ ...d, penilaian: myGrade, prokers: dataP.prokers });
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (session) {
      load();
    }
  }, [session]);

  if (!data) return <div className="p-10 text-center">Memuat Sertifikat...</div>;

  const { laporan, pengajuan } = data;
  const mhs = session.user;
  const mitra = pengajuan.mitra_id?.nama_instansi || pengajuan.mitra_id?.nama_perusahaan || pengajuan.detail_tempat?.nama || '-';
  const lokasiMitra = pengajuan.mitra_id?.kabupaten_kota ? ` - ${pengajuan.mitra_id.kabupaten_kota}` : '';

  // URL validasi untuk QR Code
  const verifyUrl = `http://localhost:3020/verify/${laporan._id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;

  return (
    <div className="bg-slate-200 min-h-screen font-sans text-slate-800 flex flex-col items-center p-8 print:p-0 print:block print:bg-white gap-8 print:gap-0">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        @media print {
          @page { margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-landscape { @page { size: A4 landscape; } }
          .print-portrait { @page { size: A4 portrait; } }
        }
      `}} />

      <div className="fixed top-5 right-5 print:hidden z-50 flex flex-col gap-2">
        <button onClick={() => window.print()} className="px-6 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-lg hover:bg-teal-700">
          🖨️ Cetak Dokumen
        </button>
        <p className="text-xs text-center text-slate-500 bg-white/80 p-1 rounded">Gunakan pengaturan Scale: Default / Fit to Page</p>
      </div>

      {/* HALAMAN 1: SERTIFIKAT (Portrait A4: 21cm x 29.7cm) */}
      <div className="w-[21cm] h-[29.7cm] mx-auto bg-white relative overflow-hidden shadow-2xl print:shadow-none print:border-none flex flex-col print:h-[29.7cm] print:w-[21cm]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', pageBreakAfter: 'always' }}>
        
        {/* Latar Belakang Image */}
        <div className="absolute inset-0 z-0">
          <img src="/template-sertifikat.png" alt="Background" className="w-full h-full object-cover" />
        </div>

        {/* Nomor Sertifikat */}
        <div className="absolute top-11 right-16 text-right text-slate-500 font-bold tracking-widest text-sm z-20 uppercase">
          Nomor: {pengajuan?.id ? pengajuan.id.substring(0, 10) : '6A55CCE8E2'}
        </div>

        {/* Padding diset ke 2.54cm (1 inch) */}
        <div className="flex-1 flex flex-col w-full h-full relative z-10 p-[2.54cm] text-center items-center">
          
          {/* Header & Logo */}
          <div className="w-full flex flex-col items-center mt-2">
            <div className="flex gap-6 justify-center items-center mb-3">
              <img src="/logo_stimi.png" alt="Logo STIMI" className="h-20 object-contain" />
              <img src="/mk_terang.png" alt="Logo KKL Plus" className="h-16 object-contain" />
              <img src="/berdampak_logo.png" alt="Logo Berdampak" className="h-[72px] object-contain" />
            </div>
            <div className="flex flex-col items-center translate-y-[1.5cm]">
              <h1 className="text-7xl text-[#6B21A8] mb-2 font-normal leading-none" style={{ fontFamily: "'Great Vibes', cursive" }}>
                Sertifikat
              </h1>
              <h2 className="text-xl font-black tracking-[0.2em] text-slate-800 mb-1 font-serif uppercase">
                KKL PLUS BERDAMPAK
              </h2>
              <p className="text-[#6B21A8] font-bold text-center text-base leading-tight tracking-widest">
                STIMI YAPMI MAKASSAR
              </p>
            </div>
          </div>

          {/* Konten Utama */}
          <div className="w-full flex flex-col items-center flex-1 justify-center gap-5 my-2">
            
            {/* Bagian Nama */}
            <div className="flex flex-col items-center text-center">
              <p className="text-lg text-slate-600 mb-2 font-medium italic">Diberikan dengan bangga kepada:</p>
              <h3 className="text-4xl md:text-5xl font-black text-[#7e22ce] mb-2 italic leading-tight px-4" style={{ fontFamily: 'Georgia, serif' }}>
                {mhs.nama_lengkap}
              </h3>
              
              <p className="text-base text-slate-700 font-bold tracking-widest uppercase">
                NIM: {mhs.nim_nidn}
              </p>
              <p className="text-sm text-slate-700 mt-1">
                Program Studi: {mhs.program_studi || pengajuan?.mahasiswa_id?.program_studi || 'Manajemen (S1)'}
              </p>
            </div>

            {/* Bagian Deskripsi */}
            <div className="flex flex-col items-center w-full">
              <div className="flex items-center w-3/4 mx-auto mb-4">
                <div className="h-[2px] bg-[#6B21A8] w-full relative">
                  <div className="absolute -top-1 -left-1 w-2 h-2 border-2 border-[#6B21A8] bg-white transform rotate-45"></div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 border-2 border-[#6B21A8] bg-white transform rotate-45"></div>
                </div>
              </div>

              <p className="text-base md:text-lg text-slate-700 max-w-[17cm] mx-auto leading-relaxed font-medium text-center px-4">
                Telah berhasil melaksanakan dan menyelesaikan program Kuliah Kerja Lapangan Plus (KKLP) Berdampak Sekolah Tinggi Ilmu Manajemen Indonesia YAPMI Makassar, selama 2 Bulan (setara 4 SKS / 512 Jam Kerja), yang berlokasi di:
                <br />
                <span className="font-bold text-[#6B21A8] block mt-1 text-lg md:text-xl">{mitra}{lokasiMitra}</span>
              </p>

              {/* Predikat Badge */}
              <div className="mt-5 border-2 border-[#6B21A8] bg-[#fdfaf6] px-5 py-2 rounded shadow-sm">
                <p className="text-base md:text-lg font-bold text-slate-800 tracking-wide">
                  LULUS dengan Predikat: <span className="text-[#6B21A8]">
                    {(() => {
                      const huruf = data?.penilaian?.nilai_akhir_huruf || '-';
                      let teks = 'MEMUASKAN';
                      if (huruf.startsWith('A')) teks = 'SANGAT BAIK';
                      else if (huruf.startsWith('B')) teks = 'BAIK';
                      else if (huruf.startsWith('C')) teks = 'CUKUP';
                      else if (huruf === 'D') teks = 'KURANG';
                      else if (huruf === 'E') teks = 'SANGAT KURANG';
                      return `${teks} ( ${huruf} )`;
                    })()}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer QR & Tanda Tangan */}
          <div className="w-full flex justify-between items-end mt-auto pt-2 pb-2 px-8">
              {/* QR di posisi bawah kiri */}
              <div className="flex flex-col items-center">
                <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20 border-2 border-slate-200 p-1 bg-white rounded-lg shadow-sm mb-1" />
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Verifikasi SKPI</p>
              </div>

              {/* Tanda tangan di kanan */}
              <div className="text-center w-64">
                <div className="h-14 flex items-center justify-center">
                  <span className="text-4xl text-slate-800" style={{fontFamily: "'Great Vibes', cursive"}}>Ibrahim</span>
                </div>
                <h4 className="text-base font-bold text-[#6B21A8] mt-1 border-b-2 border-slate-300 inline-block px-4 pb-1">Dr. Ibrahim Syah, S.E.,M.M.</h4>
                <p className="text-xs text-slate-600 font-medium mt-1">Ketua STIMI YAPMI Makassar</p>
              </div>
          </div>

          </div>

        </div>

      {/* PAGE BREAK UNTUK HALAMAN 2 */}
      <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>

      {/* HALAMAN 2: TRANSKRIP NILAI (Portrait A4: 21cm x 29.7cm) */}
      <div className="w-[21cm] h-[29.7cm] mx-auto bg-white relative overflow-hidden shadow-2xl print:shadow-none border border-slate-200 print:border-none flex flex-col print:h-[29.6cm]">
        
        {/* Background Sertifikat */}
        <div className="absolute inset-0 z-0">
          <img src="/template-sertifikat.png" alt="Background" className="w-full h-full object-cover opacity-90" />
        </div>

        <div className="flex-1 flex flex-col p-[2.54cm] w-full h-full relative z-10">
          
          {/* Header Transkrip */}
          <div className="flex flex-col items-center border-b-2 border-slate-800 pb-1 mb-2 text-center">
            <div className="flex gap-4 items-center mb-1">
              <img src="/logo_stimi.png" alt="Logo STIMI" className="h-14" />
              <img src="/mk_terang.png" alt="Logo KKL Plus" className="h-12" />
              <img src="/berdampak_logo.png" alt="Logo Berdampak" className="h-[50px]" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 uppercase tracking-widest leading-none mt-1">Transkrip Penilaian</h2>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1 leading-tight">Program Kuliah Kerja Lapangan Plus Berdampak</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5 leading-tight">Sekolah Tinggi Ilmu Manajemen Indonesia YAPMI Makassar</p>
          </div>

          {/* Biodata */}
          <div className="mb-2 bg-slate-50 p-1.5 px-3 rounded border border-slate-200">
            <table className="text-left text-xs text-slate-800 w-full leading-snug">
              <tbody>
                <tr><td className="py-0.5 w-32 font-bold text-slate-500">Nama</td><td className="font-bold text-sm">: {mhs.nama_lengkap}</td></tr>
                <tr><td className="py-0.5 w-32 font-bold text-slate-500">NIM</td><td className="font-bold text-sm">: {mhs.nim_nidn}</td></tr>
                <tr><td className="py-0.5 w-32 font-bold text-slate-500">Lokasi KKL Plus</td><td className="font-bold text-sm">: {mitra}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Konten Nilai */}
          <div className="flex flex-col gap-2">
            {data.penilaian ? (
              <>
                {/* Bagian Penilaian */}
                <div>
                  <h3 className="font-bold text-slate-800 text-xs mb-1 bg-slate-100 px-2 py-1 rounded">Komponen Penilaian Kelompok</h3>
                  
                  <div className="flex flex-col gap-1.5 px-2 mb-2">
                    {/* Nilai Total Proker Pokja */}
                    <div>
                      <p className="text-xs font-bold text-slate-700 border-b border-slate-300 pb-0.5 mb-0.5 flex justify-between items-end">
                        <span>Nilai Total Proker Pokja</span>
                        <span className="text-sm font-black leading-none">{Number(data.penilaian.nilai_dpl_kelompok || 0).toFixed(1)}</span>
                      </p>
                      <table className="w-full text-xs text-slate-700 leading-tight">
                        <tbody>
                          {data.prokers && data.prokers.length > 0 ? (
                             data.prokers.map((proker, idx) => {
                               const detail = data.penilaian.detail_dpl_kelompok?.[proker._id];
                               let avg = '-';
                               if (detail) {
                                 const k = Number(detail.ketercapaian) || 0;
                                 const s = Number(detail.kesesuaian) || 0;
                                 const m = Number(detail.manfaat) || 0;
                                 avg = ((k + s + m) / 3).toFixed(1);
                               }
                               return (
                                 <tr key={proker._id} className="border-b border-dashed border-slate-200">
                                   <td className="py-1">{idx + 1}. {proker.judul_proker}</td>
                                   <td className="py-1 text-right font-mono">{avg}</td>
                                 </tr>
                               );
                             })
                          ) : (
                            <tr><td className="py-1 italic text-slate-400">Belum ada rincian</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Nilai Proker */}
                    <div>
                      <p className="text-xs font-bold text-slate-700 border-b border-slate-300 pb-0.5 mb-0.5 flex justify-between items-end">
                        <span>Nilai Proker</span>
                        <span className="text-sm font-black leading-none">{Number(data.penilaian.nilai_mentor_kelompok || 0).toFixed(1)}</span>
                      </p>
                      <table className="w-full text-xs text-slate-700 leading-tight">
                        <tbody>
                          <tr className="border-b border-dashed border-slate-200">
                            <td className="py-1">Keberhasilan & Kualitas pelaksanaan</td>
                            <td className="py-1 text-right">{Number(data.penilaian.detail_mentor_kelompok?.keberhasilan || 0).toFixed(1)}</td>
                          </tr>
                          <tr className="border-b border-dashed border-slate-200">
                            <td className="py-1">Besar manfaat bagi instansi</td>
                            <td className="py-1 text-right">{Number(data.penilaian.detail_mentor_kelompok?.manfaat || 0).toFixed(1)}</td>
                          </tr>
                          <tr className="border-b border-dashed border-slate-200">
                            <td className="py-1">Kerjasama Tim Lapangan</td>
                            <td className="py-1 text-right">{Number(data.penilaian.detail_mentor_kelompok?.kerjasama || 0).toFixed(1)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-800 text-xs mb-1 bg-slate-100 px-2 py-1 rounded">Komponen Penilaian Individu</h3>
                  <div className="px-2">
                    <table className="w-full text-xs text-slate-700 leading-tight">
                      <tbody>
                        <tr className="border-b border-dashed border-slate-200">
                          <td className="py-1">Kualitas Laporan Akhir</td>
                          <td className="py-1 text-right">{Number(data.penilaian.detail_dpl_individu?.laporan || 0).toFixed(1)}</td>
                        </tr>
                        <tr className="border-b border-dashed border-slate-200">
                          <td className="py-1">Kelengkapan Logbook</td>
                          <td className="py-1 text-right">{Number(data.penilaian.detail_dpl_individu?.logbook || 0).toFixed(1)}</td>
                        </tr>
                        <tr className="border-b border-dashed border-slate-200">
                          <td className="py-1">Etika & Keaktifan Diskusi</td>
                          <td className="py-1 text-right">{Number(data.penilaian.detail_dpl_individu?.etika || 0).toFixed(1)}</td>
                        </tr>
                        <tr className="border-b border-dashed border-slate-200">
                          <td className="py-1">Kedisiplinan Kehadiran</td>
                          <td className="py-1 text-right">{Number(data.penilaian.detail_mentor_individu?.kedisiplinan || 0).toFixed(1)}</td>
                        </tr>
                        <tr className="border-b border-dashed border-slate-200">
                          <td className="py-1">Tanggungjawab penyelesaian tugas</td>
                          <td className="py-1 text-right">{Number(data.penilaian.detail_mentor_individu?.tanggungjawab || 0).toFixed(1)}</td>
                        </tr>
                        <tr className="border-b border-dashed border-slate-200">
                          <td className="py-1">Keterampilan Kerja</td>
                          <td className="py-1 text-right">{Number(data.penilaian.detail_mentor_individu?.keterampilan || 0).toFixed(1)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Nilai Akhir KKL Plus */}
                <div className="border-2 border-teal-500 rounded p-2 flex justify-between items-center bg-teal-50 leading-none mt-1">
                  <div>
                    <p className="text-[10px] font-black tracking-widest uppercase text-teal-800 mb-0.5">Total Nilai Akhir KKL Plus</p>
                    <h1 className="text-2xl font-black text-teal-600">{data.penilaian?.nilai_akhir_angka?.toFixed(2) || '0.00'}</h1>
                  </div>
                  <div className="text-right border-l-2 border-teal-200 pl-4">
                    <p className="text-[10px] font-black tracking-widest uppercase text-teal-800 mb-0.5">Predikat Huruf</p>
                    <h1 className="text-3xl font-black text-teal-600">{data.penilaian?.nilai_akhir_huruf || '-'}</h1>
                  </div>
                </div>

                {/* Keterangan Skala Nilai */}
                <div className="mt-2 text-[9px] text-slate-500 bg-slate-50 border border-slate-200 rounded flex justify-between items-center px-3 py-1.5 w-full print:border-none print:bg-transparent print:p-0">
                  <span className="font-bold mr-2 uppercase tracking-wider">Skala Penilaian:</span>
                  <span><strong className="text-teal-700">A:</strong> 90-100</span>
                  <span><strong className="text-teal-700">A-:</strong> 80-89.9</span>
                  <span><strong className="text-teal-700">B+:</strong> 75-79.9</span>
                  <span><strong className="text-teal-700">B:</strong> 70-74.9</span>
                  <span><strong className="text-amber-600">B-:</strong> 66-69.9</span>
                  <span><strong className="text-amber-600">C+:</strong> 61-65.9</span>
                  <span><strong className="text-amber-600">C:</strong> 56-60.9</span>
                  <span><strong className="text-rose-600">D:</strong> 46-55.9</span>
                  <span><strong className="text-rose-600">E:</strong> &lt; 46</span>
                </div>
            </>
          ) : (
             <div className="flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-10 mt-10">
               <p className="text-slate-500 font-bold text-lg">⚠️ Data penilaian belum lengkap.</p>
             </div>
          )}
        </div>

        {/* Spacer to push signatures to bottom */}
        <div className="flex-1"></div>

        {/* TTD Transkrip */}
        <div className="flex justify-between px-8 mt-2 mb-[0.5cm]">
            <div className="flex flex-col justify-between items-center w-56 h-[3cm]">
              <p className="text-xs text-slate-600">Ketua Program Studi</p>
              
              {/* Barcode sebagai TTD Elektronik */}
              <div className="flex-1 flex items-center justify-center">
                {mhs.nomor_sertifikat && (
                  <img src={qrCodeUrl} alt="TTD QR" className="h-[1.8cm] w-[1.8cm] opacity-80 mix-blend-multiply" />
                )}
              </div>

              <div className="w-full text-center">
                <div className="border-b border-slate-800 w-full mb-1"></div>
                <p className="font-bold text-slate-900 text-xs">Ketua Program Studi</p>
              </div>
            </div>

            <div className="flex flex-col justify-between items-center w-64 h-[3cm]">
              <p className="text-xs text-slate-600">Dosen Pembimbing Lapangan</p>
              
              {/* Barcode sebagai TTD Elektronik */}
              <div className="flex-1 flex items-center justify-center">
                {mhs.nomor_sertifikat && (
                  <img src={qrCodeUrl} alt="TTD QR" className="h-[1.8cm] w-[1.8cm] opacity-80 mix-blend-multiply" />
                )}
              </div>

              <div className="w-full text-center">
                <div className="border-b border-slate-800 w-full mb-1"></div>
                <p className="font-bold text-slate-900 text-xs">{pengajuan.dpl_id?.nama_lengkap || 'DPL'}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
