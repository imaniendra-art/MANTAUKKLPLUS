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

        {/* Nomor Sertifikat (Pojok Kanan Atas, menyesuaikan margin 1 inch) */}
        <div className="absolute top-[2.54cm] right-[2.54cm] z-20 text-right">
          <p className="text-sm text-slate-500 font-bold tracking-widest uppercase">
            Nomor: {laporan._id?.substring(0, 10).toUpperCase() || '123 4567 8901'}
          </p>
        </div>

        {/* Padding diset ke 2.54cm (1 inch) */}
        <div className="flex-1 flex flex-col w-full h-full relative z-10 p-[2.54cm] text-center items-center">
          
          {/* Header & Logo */}
          <div className="w-full flex flex-col items-center mb-6">
            <div className="flex gap-8 justify-center items-center mb-4">
              <img src="/logo_stimi.png" alt="Logo STIMI" className="h-28 object-contain" />
              <img src="/mk_terang.png" alt="Logo KKL Plus" className="h-24 object-contain" />
            </div>
            <div className="flex flex-col items-center relative top-[1cm]">
              <h1 className="text-9xl text-[#6B21A8] mb-4 mt-[2cm] font-normal" style={{ fontFamily: "'Great Vibes', cursive" }}>
                Sertifikat
              </h1>
              <h2 className="text-3xl font-black tracking-[0.2em] text-slate-800 mb-2 font-serif">
                KKL PLUS BERDAMPAK
              </h2>
              <p className="text-[#6B21A8] font-bold text-center text-xl leading-tight tracking-widest mt-1">
                STIMI YAPMI MAKASSAR
              </p>
            </div>
          </div>

          {/* Konten Utama */}
          <div className="w-full flex flex-col items-center flex-1 justify-center gap-6 my-auto relative -top-[1cm]">
            
            {/* Bagian Nama */}
            <div className="flex flex-col items-center mt-2">
              <p className="text-2xl text-slate-600 mb-4 font-medium italic">Diberikan dengan bangga kepada:</p>
              <h3 className="text-7xl font-black text-[#7e22ce] mb-3 italic" style={{ fontFamily: 'Georgia, serif' }}>
                {mhs.nama_lengkap}
              </h3>
              
              <p className="text-xl text-slate-700 font-bold tracking-widest">
                NIM: {mhs.nim_nidn}
              </p>
              <p className="text-xl text-slate-700 mt-1">
                Program Studi: {mhs.program_studi || pengajuan?.mahasiswa_id?.program_studi || 'Manajemen (S1)'}
              </p>
            </div>

            {/* Bagian Deskripsi */}
            <div className="flex flex-col items-center w-full mt-2">
              <div className="flex items-center w-4/5 mx-auto mb-4">
                <div className="h-[2px] bg-[#6B21A8] w-full relative">
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-2 border-[#6B21A8] bg-white transform rotate-45"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-2 border-[#6B21A8] bg-white transform rotate-45"></div>
                </div>
              </div>

              <p className="text-2xl text-slate-700 max-w-[18.5cm] mx-auto leading-relaxed font-medium text-center">
                Telah berhasil melaksanakan dan menyelesaikan program Kuliah Kerja Lapangan Plus (KKLP) Berdampak Sekolah Tinggi Ilmu Manajemen Indonesia YAPMI Makassar, selama 2 Bulan (setara 4 SKS / 512 Jam Kerja), yang berlokasi di:
                <br />
                <span className="font-bold text-[#6B21A8] block mt-2">{mitra}{lokasiMitra}</span>
              </p>

              {/* Predikat Badge */}
              <div className="mt-6 border-2 border-[#6B21A8] bg-[#fdfaf6] px-8 py-3 rounded shadow-sm">
                <p className="text-2xl font-bold text-slate-800 tracking-wide">
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
          <div className="w-full relative mt-6 h-40">
              {/* QR di posisi bawah kiri */}
              <div className="absolute left-0 bottom-0 flex flex-col items-center">
                <img src={qrCodeUrl} alt="QR Code" className="w-28 h-28 border-2 border-slate-200 p-1 bg-white rounded-lg shadow-sm mb-2" />
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Verifikasi SKPI</p>
              </div>

              {/* Tanda tangan persis di tengah horizontal */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[2cm] text-center w-[350px]">
                <div className="h-20 flex items-center justify-center">
                  <span className="text-6xl text-slate-800" style={{fontFamily: "'Great Vibes', cursive"}}>Ibrahim</span>
                </div>
                <h4 className="text-2xl font-bold text-[#6B21A8] mt-2">Dr. Ibrahim Syah, S.E.,M.M.</h4>
                <p className="text-lg text-slate-600 font-medium">Ketua STIMI YAPMI Makassar</p>
              </div>
            </div>

          </div>

        </div>

      {/* PAGE BREAK UNTUK HALAMAN 2 */}
      <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>

      {/* HALAMAN 2: TRANSKRIP NILAI (Portrait A4: 21cm x 29.7cm) */}
      <div className="w-[21cm] h-[29.7cm] mx-auto bg-white relative overflow-hidden shadow-2xl print:shadow-none border border-slate-200 print:border-none flex flex-col print:h-[29.6cm]">
        
        <div className="flex-1 flex flex-col p-[2.54cm] w-full h-full relative z-10">
          
          {/* Header Transkrip */}
          <div className="flex flex-col items-center border-b-2 border-slate-800 pb-2 mb-3 text-center">
            <div className="flex gap-6 items-center mb-2">
              <img src="/logo_stimi.png" alt="Logo STIMI" className="h-24" />
              <img src="/mk_terang.png" alt="Logo KKL Plus" className="h-20" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-slate-900 uppercase tracking-widest leading-none mt-1">Transkrip Penilaian</h2>
            <p className="text-base font-bold text-slate-500 uppercase tracking-widest mt-2 leading-tight">Program Kuliah Kerja Lapangan Plus Berdampak</p>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1 leading-tight">Sekolah Tinggi Ilmu Manajemen Indonesia YAPMI Makassar</p>
          </div>

          {/* Biodata */}
          <div className="mb-3 bg-slate-50 p-3 rounded border border-slate-200">
            <table className="text-left text-xl text-slate-800 w-full leading-snug">
              <tbody>
                <tr><td className="py-1 w-48 font-bold text-slate-500">Nama</td><td className="font-bold text-2xl">: {mhs.nama_lengkap}</td></tr>
                <tr><td className="py-1 w-48 font-bold text-slate-500">NIM</td><td className="font-bold text-2xl">: {mhs.nim_nidn}</td></tr>
                <tr><td className="py-1 w-48 font-bold text-slate-500">Lokasi KKL Plus</td><td className="font-bold text-2xl">: {mitra}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Konten Nilai */}
          <div className="flex flex-col gap-3">
            {data.penilaian ? (
              <>
                {/* Bagian Penilaian */}
                <div>
                  <h3 className="font-bold text-slate-800 text-xl mb-1 bg-slate-100 px-2 py-1 rounded">Komponen Penilaian Kelompok</h3>
                  
                  <div className="flex flex-col gap-2 px-2 mb-3">
                    {/* Nilai Total Proker Pokja */}
                    <div>
                      <p className="text-xl font-bold text-slate-700 border-b border-slate-300 pb-1 mb-1 flex justify-between items-end">
                        <span>Nilai Total Proker Pokja</span>
                        <span className="text-2xl leading-none">{Number(data.penilaian.nilai_dpl_kelompok || 0).toFixed(1)}</span>
                      </p>
                      <table className="w-full text-lg text-slate-700 leading-tight">
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
                      <p className="text-xl font-bold text-slate-700 border-b border-slate-300 pb-1 mb-1 flex justify-between items-end">
                        <span>Nilai Proker</span>
                        <span className="text-2xl leading-none">{Number(data.penilaian.nilai_mentor_kelompok || 0).toFixed(1)}</span>
                      </p>
                      <table className="w-full text-lg text-slate-700 leading-tight">
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
                  <h3 className="font-bold text-slate-800 text-xl mb-1 bg-slate-100 px-2 py-1 rounded">Komponen Penilaian Individu</h3>
                  <div className="px-2">
                    <table className="w-full text-lg text-slate-700 leading-tight">
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
                <div className="border-2 border-teal-500 rounded p-3 flex justify-between items-center bg-teal-50 leading-none mt-2">
                  <div>
                    <p className="text-xs font-black tracking-widest uppercase text-teal-800 mb-1">Total Nilai Akhir KKL Plus</p>
                    <h1 className="text-4xl font-black text-teal-600">{data.penilaian?.nilai_akhir_angka?.toFixed(2) || '0.00'}</h1>
                  </div>
                  <div className="text-right border-l-2 border-teal-200 pl-4">
                    <p className="text-xs font-black tracking-widest uppercase text-teal-800 mb-1">Predikat Huruf</p>
                    <h1 className="text-5xl font-black text-teal-600">{data.penilaian?.nilai_akhir_huruf || '-'}</h1>
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
        <div className="flex justify-between items-end px-4 mt-4">
            <div className="text-center w-64">
              <p className="text-sm text-slate-600 mb-12">Ketua Program Studi</p>
              <div className="border-b border-slate-800 w-full mb-1"></div>
              <p className="font-bold text-slate-900 text-sm">Ketua Program Studi</p>
            </div>
            <div className="text-center w-72">
              <p className="text-sm text-slate-600 mb-12">Dosen Pembimbing Lapangan</p>
              <div className="border-b border-slate-800 w-full mb-1"></div>
              <p className="font-bold text-slate-900 text-sm">{pengajuan.dpl_id?.nama_lengkap || 'DPL'}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
