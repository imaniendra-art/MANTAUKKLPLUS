"use client";

import { useEffect, useState } from 'react';
import { useSession } from "@/components/AuthProvider";

export default function CetakKeterangan() {
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
          if (d.pengajuan) {
            setData({
              pengajuan: d.pengajuan,
              laporan: d.laporan || d.laporan_kelompok || d.laporan_individu || {}
            });
          }
        });
    } else if (mhsId) {
      fetch(`/api/laporan-akhir?mhsId=${mhsId}`)
        .then(res => res.json())
        .then(d => {
          if (d.pengajuan) {
            setData({
              pengajuan: d.pengajuan,
              laporan: d.laporan || d.laporan_kelompok || d.laporan_individu || {}
            });
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
        <button onClick={() => window.print()} className="px-6 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-lg hover:bg-teal-700">
          🖨️ Cetak PDF
        </button>
        <p className="mt-2 text-xs text-center text-slate-500 bg-white p-2 rounded shadow">Gunakan Kop Surat Perusahaan Jika Ada</p>
      </div>

      <div className="max-w-[21cm] mx-auto bg-white shadow-2xl print:shadow-none print:max-w-none">
        <div className="px-[3cm] pb-[3cm] pt-[1.5cm] min-h-[29.7cm] print:px-[2.5cm] print:pb-[2.5cm] print:pt-[1cm]">
          
          {/* KOP SURAT PERUSAHAAN (KOSONGAN/GENERIC) */}
          <div className="border-b-4 border-black pb-4 mb-8 text-center min-h-24 flex items-center justify-center">
            <h1 className="text-3xl font-black uppercase tracking-wider text-slate-300">KOP INSTANSI</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-xl font-bold underline uppercase">SURAT KETERANGAN SELESAI KKL PLUS</h2>
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
              Telah melaksanakan dan menyelesaikan program <strong>KKL Plus Berdampak</strong> pada instansi kami <strong>{mitra}</strong> sejak tanggal <strong>..........................</strong> sampai dengan tanggal <strong>..........................</strong>.
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
              <p className="font-bold mb-24">{mitra}</p>
              <p className="font-bold underline">(..................................................)</p>
              <p>Pimpinan / HRD</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
