"use client";

import { useEffect, useState } from 'react';
import { useSession } from "@/components/AuthProvider";
import { CheckCircle } from 'lucide-react';

export default function CetakPengesahan() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    // Fetch settings for Kaprodi name & NIP
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(d => setSettings(d))
      .catch(err => console.error(err));

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

  if (!data || !settings) return <div className="p-10 text-center text-slate-500 font-bold">Memuat dokumen pengesahan otomatis...</div>;

  const { pengajuan, laporan } = data;
  const mhs = session.user;
  const mitra = pengajuan.mitra_id?.nama_perusahaan || pengajuan.detail_tempat?.nama;
  const dpl = pengajuan.dpl_id;
  
  const tipe = laporan?.tipe_laporan === 'pokja' ? 'KKL KELOMPOK (POKJA)' : 'KKL INDIVIDU';
  
  // Format Tanggal
  const formatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const tglMulai = formatter.format(new Date(pengajuan.tanggal_mulai));
  const tglSelesai = formatter.format(new Date(pengajuan.tanggal_selesai));
  const tglSekarang = formatter.format(new Date());

  return (
    <div className="bg-slate-200 min-h-screen font-serif text-black">
      <div className="fixed top-5 right-5 print:hidden flex flex-col gap-3">
        <div className="bg-white p-4 rounded-xl shadow-lg w-72 text-sm border-l-4 border-teal-500">
          <div className="flex items-center gap-2 font-bold text-teal-700 mb-2">
            <CheckCircle className="w-5 h-5" /> Otomatisasi
          </div>
          Data DPL, Mentor, dan Kaprodi sudah terisi otomatis dari sistem. Anda bisa langsung mencetak halaman ini.
        </div>
        <button onClick={() => window.print()} className="px-6 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-lg hover:bg-teal-700">
          🖨️ Cetak PDF
        </button>
      </div>

      <div className="max-w-[21cm] mx-auto bg-white shadow-2xl print:shadow-none print:max-w-none">
        <div className="p-[3cm] min-h-[29.7cm] print:p-[2.5cm]">
          <h2 className="text-center font-bold text-xl uppercase mb-12">
            LEMBAR PENGESAHAN LAPORAN {tipe}<br/>KEGIATAN KKL PLUS BERDAMPAK
          </h2>
          
          <div className="text-justify leading-relaxed space-y-4 mb-12">
            <p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p>
            <table className="w-full ml-4 my-6">
              <tbody>
                <tr>
                  <td className="w-48 align-top py-1">Nama Mahasiswa</td>
                  <td className="w-4 align-top py-1">:</td>
                  <td className="font-bold uppercase py-1">{mhs.nama_lengkap}</td>
                </tr>
                <tr>
                  <td className="align-top py-1">NIM</td>
                  <td className="align-top py-1">:</td>
                  <td className="py-1">{mhs.nim_nidn}</td>
                </tr>
                <tr>
                  <td className="align-top py-1">Program Studi</td>
                  <td className="align-top py-1">:</td>
                  <td className="py-1">Manajemen</td>
                </tr>
                <tr>
                  <td className="align-top py-1">Perguruan Tinggi</td>
                  <td className="align-top py-1">:</td>
                  <td className="py-1">STIMI YAPMI MAKASSAR</td>
                </tr>
              </tbody>
            </table>
            
            <p className="mt-4">
              Telah melaksanakan kegiatan KKL Plus Berdampak di <strong>{mitra}</strong> mulai tanggal {tglMulai} sampai dengan {tglSelesai}. 
            </p>
            <p>
              Laporan akhir KKL Plus Berdampak ini disusun sebagai salah satu syarat penyelesaian dan pertanggungjawaban program pada semester ini, dan telah diperiksa serta disetujui oleh Dosen Pembimbing Lapangan dan Mentor Perusahaan.
            </p>
          </div>

          <div className="flex justify-between mt-16 text-center">
            <div className="w-1/2 flex flex-col items-center">
              <p>Menyetujui,</p>
              <p className="mb-24">Dosen Pembimbing Lapangan</p>
              <p className="font-bold underline">{dpl?.nama_lengkap || '..................................................'}</p>
              <p>NIDN. {dpl?.nim_nidn || '...................'}</p>
            </div>
            <div className="w-1/2 flex flex-col items-center">
              <p>Makassar, {tglSekarang}</p>
              <p className="mb-24">Mentor Perusahaan</p>
              <p className="font-bold underline">{pengajuan.mentor_nama || '..................................................'}</p>
              <p>Mentor / {pengajuan.mentor_jabatan || 'Instruktur'}</p>
            </div>
          </div>
          
          <div className="mt-20 flex flex-col items-center text-center">
            <p>Mengetahui,</p>
            <p className="mb-24">Ketua Program Studi Manajemen</p>
            <p className="font-bold underline">{settings.kaprodi_nama}</p>
            <p>NIP/NIDN. {settings.kaprodi_nip}</p>
          </div>

        </div>
      </div>
    </div>
  );
}
