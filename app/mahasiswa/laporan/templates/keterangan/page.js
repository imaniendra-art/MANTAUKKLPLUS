"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function CetakKeterangan() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/laporan-akhir?mhsId=${session.user.id}`)
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
  const alamatMitra = pengajuan.detail_tempat?.alamat || ".......................................................";

  return (
    <div className="bg-slate-200 min-h-screen font-serif text-black">
      <div className="fixed top-5 right-5 print:hidden">
        <button onClick={() => window.print()} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700">
          🖨️ Cetak PDF
        </button>
        <p className="mt-2 text-xs text-center text-slate-500 bg-white p-2 rounded shadow">Gunakan Kop Surat Perusahaan Jika Ada</p>
      </div>

      <div className="max-w-[21cm] mx-auto bg-white shadow-2xl print:shadow-none print:max-w-none">
        <div className="p-[3cm] min-h-[29.7cm] print:p-[2.5cm]">
          
          {/* KOP SURAT PERUSAHAAN (KOSONGAN/GENERIC) */}
          <div className="border-b-4 border-black pb-4 mb-8 text-center">
            <h1 className="text-2xl font-black uppercase tracking-wider">{mitra}</h1>
            <p className="text-sm mt-1">{alamatMitra}</p>
            <p className="text-sm">Telepon: ........................ | Email: ........................</p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-xl font-bold underline uppercase">SURAT KETERANGAN SELESAI MAGANG</h2>
            <p>Nomor: ......../............/............/20....</p>
          </div>

          <div className="text-justify leading-relaxed space-y-4 mb-8">
            <p>Yang bertanda tangan di bawah ini:</p>
            <table className="w-full ml-4 mb-4">
              <tbody>
                <tr>
                  <td className="w-48 align-top">Nama</td>
                  <td className="w-4 align-top">:</td>
                  <td>.......................................................</td>
                </tr>
                <tr>
                  <td className="align-top">Jabatan</td>
                  <td className="align-top">:</td>
                  <td>.......................................................</td>
                </tr>
                <tr>
                  <td className="align-top">Instansi/Perusahaan</td>
                  <td className="align-top">:</td>
                  <td className="font-bold">{mitra}</td>
                </tr>
              </tbody>
            </table>

            <p>Menerangkan dengan sesungguhnya bahwa:</p>
            <table className="w-full ml-4 mb-4">
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
                  <td>Manajemen</td>
                </tr>
                <tr>
                  <td className="align-top">Perguruan Tinggi</td>
                  <td className="align-top">:</td>
                  <td>STIMI YAPMI MAKASSAR</td>
                </tr>
              </tbody>
            </table>

            <p>
              Telah melaksanakan dan menyelesaikan program <strong>KKL Plus Berdampak</strong> di <strong>{mitra}</strong> pada bagian/divisi ..................................................... sejak tanggal <strong>{new Date(pengajuan.tanggal_mulai).toLocaleDateString('id-ID')}</strong> sampai dengan tanggal <strong>{new Date(pengajuan.tanggal_selesai).toLocaleDateString('id-ID')}</strong>.
            </p>
            <p>
              Selama mengikuti program KKL Plus, yang bersangkutan telah menunjukkan kedisiplinan, tanggung jawab, dan kinerja yang baik serta tidak pernah melakukan tindakan pelanggaran tata tertib perusahaan.
            </p>
            <p>
              Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
            </p>
          </div>

          <div className="flex justify-end mt-16 text-center">
            <div className="w-1/2">
              <p>................., ............................</p>
              <p className="font-bold">{mitra}</p>
              <p className="mb-24 mt-2">(Stempel & Tanda Tangan)</p>
              <p className="font-bold underline">(..................................................)</p>
              <p>Pimpinan / HRD</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
