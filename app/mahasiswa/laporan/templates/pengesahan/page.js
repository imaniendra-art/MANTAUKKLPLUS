"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function CetakPengesahan() {
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

  if (!data) return <div className="p-10 text-center">Memuat dokumen...</div>;

  const { pengajuan } = data;
  const mhs = session.user;
  const mitra = pengajuan.mitra_id?.nama_perusahaan || pengajuan.detail_tempat?.nama;

  return (
    <div className="bg-slate-200 min-h-screen font-serif text-black">
      <div className="fixed top-5 right-5 print:hidden">
        <button onClick={() => window.print()} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700">
          🖨️ Cetak PDF
        </button>
      </div>

      <div className="max-w-[21cm] mx-auto bg-white shadow-2xl print:shadow-none print:max-w-none">
        <div className="p-[3cm] min-h-[29.7cm] print:p-[2.5cm]">
          <h2 className="text-center font-bold text-xl uppercase mb-12">
            PENGESAHAN LAPORAN {data.laporan?.tipe_laporan === 'pokja' ? 'KELOMPOK' : 'INDIVIDU'}<br/>KEGIATAN KKL PLUS BERDAMPAK
          </h2>
          
          <div className="text-justify leading-relaxed space-y-4 mb-12">
            <p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p>
            <table className="w-full ml-4">
              <tbody>
                <tr>
                  <td className="w-48 align-top">Nama</td>
                  <td className="w-4 align-top">:</td>
                  <td className="font-bold uppercase">{mhs.nama_lengkap}</td>
                </tr>
                <tr>
                  <td className="align-top">NIM</td>
                  <td className="align-top">:</td>
                  <td>{mhs.nim_nidn}</td>
                </tr>
                <tr>
                  <td className="align-top">Program Studi</td>
                  <td className="align-top">:</td>
                  <td>MANAJEMEN</td>
                </tr>
                <tr>
                  <td className="align-top">Perguruan Tinggi</td>
                  <td className="align-top">:</td>
                  <td>STIMI YAPMI MAKASSAR</td>
                </tr>
              </tbody>
            </table>
            
            <p className="mt-4">
              Telah melaksanakan kegiatan KKL Plus Berdampak di <strong>{mitra}</strong> mulai tanggal {new Date(pengajuan.tanggal_mulai).toLocaleDateString('id-ID')} sampai dengan {new Date(pengajuan.tanggal_selesai).toLocaleDateString('id-ID')}. 
            </p>
            <p>
              Laporan ini disusun sebagai salah satu syarat penyelesaian dan pertanggungjawaban program KKL Plus Berdampak pada semester ini.
            </p>
          </div>

          <div className="flex justify-between mt-20 text-center">
            <div className="w-1/2">
              <p>Menyetujui,</p>
              <p className="mb-24">Dosen Pembimbing Lapangan</p>
              <p className="font-bold underline">(..................................................)</p>
              <p>NIDN. </p>
            </div>
            <div className="w-1/2">
              <p>Makassar, ............................</p>
              <p className="mb-24">Mentor Perusahaan</p>
              <p className="font-bold underline">(..................................................)</p>
              <p>NIP/NIK. </p>
            </div>
          </div>
          
          <div className="mt-20 text-center">
            <p>Mengetahui,</p>
            <p className="mb-24">Ketua Program Studi Manajemen</p>
            <p className="font-bold underline">(..................................................)</p>
            <p>NIDN. </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
