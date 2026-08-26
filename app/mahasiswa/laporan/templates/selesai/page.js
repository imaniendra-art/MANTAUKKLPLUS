"use client";

import { useEffect, useState } from 'react';
import { useSession } from "@/components/AuthProvider";

export default function CetakSelesai() {
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
  const mitra = pengajuan.mitra_id?.nama_perusahaan || pengajuan.detail_tempat?.nama || ".......................................................";
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
        <div className="p-[3cm] min-h-[29.7cm] print:p-[2.5cm]">
          
          {/* KOP SURAT PERUSAHAAN (KOSONGAN/GENERIC) */}
          <div className="border-b-4 border-black pb-4 mb-8 text-center">
            <h1 className="text-2xl font-black uppercase tracking-wider">{mitra}</h1>
            <p className="text-sm mt-1">{alamatMitra}</p>
            <p className="text-sm">Telepon: ........................ | Email: ........................</p>
          </div>

          <div className="flex justify-between mb-8">
            <div>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="w-24">Nomor</td>
                    <td className="w-4">:</td>
                    <td>......../............/............/20....</td>
                  </tr>
                  <tr>
                    <td>Lampiran</td>
                    <td>:</td>
                    <td>-</td>
                  </tr>
                  <tr>
                    <td>Perihal</td>
                    <td>:</td>
                    <td className="font-bold underline">Surat Keterangan Telah Menyelesaikan KKL Plus</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <p>................., ............................</p>
            </div>
          </div>

          <div className="mb-8">
            <p>Kepada Yth,</p>
            <p className="font-bold">Ketua STIMI YAPMI Makassar</p>
            <p>di - Tempat</p>
          </div>

          <div className="text-justify leading-relaxed space-y-4 mb-8">
            <p>Dengan hormat,</p>
            <p>
              Dengan ini kami selaku pimpinan instansi / perusahaan menerangkan bahwa mahasiswa tersebut di bawah ini:
            </p>
            
            <table className="w-full ml-4 mb-2">
              <tbody>
                <tr>
                  <td className="w-48 align-top">Nama</td>
                  <td className="w-4 align-top">:</td>
                  <td className="font-bold uppercase">{mhs?.nama_lengkap || "......................................................."}</td>
                </tr>
                <tr>
                  <td className="align-top">NIM</td>
                  <td className="align-top">:</td>
                  <td>{mhs?.nim_nidn || "......................................................."}</td>
                </tr>
                <tr>
                  <td className="align-top">Program Studi</td>
                  <td className="align-top">:</td>
                  <td>Manajemen</td>
                </tr>
              </tbody>
            </table>

            <p>
              Telah <strong>menyelesaikan</strong> kegiatan Kuliah Kerja Lapangan (KKL) Plus dengan baik pada instansi / perusahaan kami, terhitung mulai tanggal <strong>{pengajuan.tanggal_mulai ? new Date(pengajuan.tanggal_mulai).toLocaleDateString('id-ID') : '.....'}</strong> sampai dengan <strong>{pengajuan.tanggal_mulai ? new Date(new Date(pengajuan.tanggal_mulai).setMonth(new Date(pengajuan.tanggal_mulai).getMonth() + 2)).toLocaleDateString('id-ID') : '.....'}</strong>.
            </p>
            <p>
              Demikian surat keterangan ini dibuat dengan sesungguhnya untuk dapat dipergunakan sebagaimana mestinya. Atas perhatian dan kerja samanya, kami ucapkan terima kasih.
            </p>
          </div>

          <div className="flex justify-end mt-16 text-center">
            <div className="w-1/2">
              <p className="mb-24">Hormat Kami,</p>
              <p className="font-bold underline">(..................................................)</p>
              <p>Pimpinan / HRD</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
