"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import KopSurat from "@/components/KopSurat";

function CetakSkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pokjaId = searchParams.get("pokjaId");
  const isCollective = searchParams.get("collective") === "true";
  const paramPeriode = searchParams.get("periode") || "Ganjil 2026/2027";
  const nomorSk = searchParams.get("nomorSk") || "000.4/496/STIMI-YAPMI/MKS/IX/2026";
  const tglSk = searchParams.get("tglSk") || "14 September 2026";
  const tglRapat = searchParams.get("tglRapat") || "28 Mei 2026";
  const semester = (searchParams.get("semester") || "Ganjil").toUpperCase();
  const tahunAkademik = searchParams.get("tahun") || "2026/2027";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({
    ketua_lppm_nama: "Andi Arwinda Wildam, S.E.,M.M",
    ketua_lppm_nidn: "0153770671230313",
    ketua_lppm_ttd: "/ttd-lppm.png",
  });
  const [dataGroups, setDataGroups] = useState([]); // Array of groups { pokjaName, dplName, lokasi, members: [{ no, nama, nim }] }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch settings
        const resSettings = await fetch("/api/admin/settings");
        if (resSettings.ok) {
          const sData = await resSettings.json();
          if (sData && !sData.error) {
            setSettings(prev => ({
              ...prev,
              ...sData,
            }));
          }
        }

        // 2. Fetch Pokja data
        if (isCollective) {
          const resArsip = await fetch("/api/admin/arsip");
          if (!resArsip.ok) throw new Error("Gagal memuat data arsip pokja");
          const arsipJson = await resArsip.json();
          let rawPokjas = arsipJson.pokjas || [];

          // Filter by active periode if given
          if (paramPeriode) {
            const filtered = rawPokjas.filter(p => !p.periode || p.periode === paramPeriode);
            if (filtered.length > 0) rawPokjas = filtered;
          }

          let counter = 1;
          const groups = rawPokjas.map((pokja, pIdx) => {
            const dplNama = pokja.dpl_id?.nama_lengkap || "Belum Ditentukan";
            const lokasi = pokja.mitra_id?.desa_kelurahan 
              ? `Kelurahan ${pokja.mitra_id.desa_kelurahan}`
              : pokja.mitra_id?.nama_instansi || "Makassar";
            const kelompokStr = pokja.nama_pokja?.replace(/[^0-9]/g, "") || String(pIdx + 1);

            const members = [];
            // Ketua
            if (pokja.ketua_id) {
              members.push({
                globalNo: counter++,
                nama: pokja.ketua_id.nama_lengkap,
                nim: pokja.ketua_id.nim_nidn || "-",
                lokasi,
                kelompok: kelompokStr,
                dpl: dplNama,
              });
            }
            // Anggota
            if (Array.isArray(pokja.anggota)) {
              pokja.anggota.forEach(a => {
                if (a.user_id && String(a.user_id._id || a.user_id) !== String(pokja.ketua_id?._id || pokja.ketua_id)) {
                  members.push({
                    globalNo: counter++,
                    nama: a.user_id.nama_lengkap,
                    nim: a.user_id.nim_nidn || "-",
                    lokasi,
                    kelompok: kelompokStr,
                    dpl: dplNama,
                  });
                }
              });
            }

            return {
              pokjaId: pokja._id,
              kelompokStr,
              dplNama,
              lokasi,
              members,
            };
          });

          setDataGroups(groups);
        } else if (pokjaId) {
          const resPokja = await fetch(`/api/pokja?pokjaId=${pokjaId}`);
          if (!resPokja.ok) throw new Error("Gagal memuat data kelompok");
          const pokja = await resPokja.json();
          if (!pokja || pokja.error) throw new Error("Data kelompok tidak ditemukan");

          const dplNama = pokja.dpl_id?.nama_lengkap || "Belum Ditentukan";
          const lokasi = pokja.mitra_id?.desa_kelurahan 
            ? `Kelurahan ${pokja.mitra_id.desa_kelurahan}`
            : pokja.mitra_id?.nama_instansi || "Makassar";
          const kelompokStr = pokja.nama_pokja?.replace(/[^0-9]/g, "") || "1";

          const members = [];
          let counter = 1;
          // Ketua
          if (pokja.ketua_id) {
            members.push({
              globalNo: counter++,
              nama: pokja.ketua_id.nama_lengkap,
              nim: pokja.ketua_id.nim_nidn || "-",
              lokasi,
              kelompok: kelompokStr,
              dpl: dplNama,
            });
          }
          // Anggota
          if (Array.isArray(pokja.anggota)) {
            pokja.anggota.forEach(a => {
              if (a.user_id && String(a.user_id._id || a.user_id) !== String(pokja.ketua_id?._id || pokja.ketua_id)) {
                members.push({
                  globalNo: counter++,
                  nama: a.user_id.nama_lengkap,
                  nim: a.user_id.nim_nidn || "-",
                  lokasi,
                  kelompok: kelompokStr,
                  dpl: dplNama,
                });
              }
            });
          }

          setDataGroups([{
            pokjaId: pokja._id,
            kelompokStr,
            dplNama,
            lokasi,
            members,
          }]);
        } else {
          throw new Error("Parameter pokjaId atau collective tidak ditemukan.");
        }
      } catch (err) {
        console.error("Error loading SK data:", err);
        setError(err.message || "Terjadi kesalahan saat memuat data SK");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pokjaId, isCollective, paramPeriode, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-700 dark:text-slate-200">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-semibold text-sm">Menyiapkan Dokumen Surat Keputusan (SK)...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-700 dark:text-slate-200">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-rose-200 dark:border-rose-900/50">
          <p className="text-4xl mb-3">⚠️</p>
          <h2 className="text-lg font-bold text-rose-600 mb-2">Gagal Menampilkan SK</h2>
          <p className="text-sm text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm transition-colors"
          >
            Kembali ke Menu Arsip
          </button>
        </div>
      </div>
    );
  }

  const tahunUtama = tahunAkademik.split("/")[0] || new Date().getFullYear();

  return (
    <div className="bg-slate-200 min-h-screen py-8 print:py-0 print:bg-white flex flex-col items-center font-serif text-black">
      
      {/* Tombol Cetak / Navigasi Floating (Hidden saat dicetak) */}
      <div className="fixed top-6 right-6 print:hidden z-50 flex flex-col gap-2.5">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-sans font-bold rounded-xl shadow-xl hover:shadow-2xl flex items-center gap-2 transition-all cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Cetak / Simpan PDF (A4)
        </button>
        <button
          onClick={() => window.close() || router.back()}
          className="px-6 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-sans font-semibold rounded-xl shadow border border-slate-200 dark:border-slate-700 text-center transition-all cursor-pointer"
        >
          Tutup
        </button>
      </div>

      {/* Style cetak halaman agar page break rapi dan ukuran pas A4 */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm 20mm 15mm 20mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .page-break {
            page-break-before: always;
            break-before: page;
          }
          .avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}} />

      {/* ======================================================== */}
      {/* HALAMAN 1: LEMBAR UTAMA SURAT KEPUTUSAN (SK)             */}
      {/* ======================================================== */}
      <div className="bg-white w-[210mm] min-h-[297mm] px-[20mm] py-[15mm] shadow-2xl print:shadow-none print:m-0 print:w-full print:min-h-0 text-[11pt] leading-[1.35] relative flex flex-col justify-between mb-8 print:mb-0">
        
        <div>
          {/* KOP LPPM */}
          <KopSurat />

          {/* JUDUL SK */}
          <div className="text-center mb-4">
            <h1 className="font-bold text-[12pt] tracking-wide">SURAT KEPUTUSAN</h1>
            <h2 className="font-bold text-[11pt] uppercase">KETUA SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA</h2>
            <h2 className="font-bold text-[11pt] uppercase">STIMI YAPMI MAKASSAR</h2>
            <p className="font-bold text-[11pt] mt-1">Nomor : {nomorSk}</p>
            <p className="font-bold tracking-[0.3em] my-1 text-[11pt]">T E N T A N G</p>
            <h3 className="font-bold text-[11pt] uppercase leading-snug max-w-[170mm] mx-auto">
              PENETAPAN DOSEN PEMBIMBING KULIAH KERJA LAPANGAN (KKLP) MAHASISWA<br />
              SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA<br />
              YAYASAN PEMBANGUNAN MANAJEMEN INDONESIA<br />
              (STIMI-YAPMI) MAKASSAR<br />
              SEMESTER {semester} TAHUN AKADEMIK {tahunAkademik}
            </h3>
          </div>

          {/* BISMILLAH */}
          <p className="text-center italic font-serif mb-2">Bismillahi Rahmanirrahim</p>
          <p className="text-justify mb-2">
            Ketua Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar, setelah :
          </p>

          {/* KONSIDERANS: MENIMBANG, MENGINGAT, BERDASARKAN */}
          <table className="w-full text-justify text-[10.5pt] border-collapse leading-snug">
            <tbody>
              {/* MENIMBANG */}
              <tr className="align-top">
                <td className="w-28 font-medium py-0.5">Menimbang</td>
                <td className="w-4 py-0.5">:</td>
                <td className="w-6 py-0.5">1.</td>
                <td className="py-0.5">
                  Bahwa untuk suksesnya pelaksanaan Kuliah Kerja Lapangan (KKLP) Mahasiswa Manajemen STIMI-YAPMI Makassar maka dipandang perlu menetapkan Dosen Pembimbing Kuliah Kerja Lapangan (KKLP)
                </td>
              </tr>
              <tr className="align-top">
                <td></td>
                <td></td>
                <td className="py-0.5">2.</td>
                <td className="py-0.5">
                  Untuk maksud tersebut di atas, maka perlu diatur dalam surat keputusan;
                </td>
              </tr>

              {/* MENGINGAT */}
              <tr className="align-top">
                <td className="font-medium pt-1.5 pb-0.5">Mengingat</td>
                <td className="pt-1.5 pb-0.5">:</td>
                <td className="pt-1.5 pb-0.5">1.</td>
                <td className="pt-1.5 pb-0.5">Undang-undang No. 20 Tahun 2003 tentang Sistem Pendidikan Nasional.</td>
              </tr>
              <tr className="align-top">
                <td></td>
                <td></td>
                <td className="py-0.5">2.</td>
                <td className="py-0.5">Undang-Undang Republik Indonesia Nomor 12 Tahun 2012 tentang Pendidikan Tinggi;</td>
              </tr>
              <tr className="align-top">
                <td></td>
                <td></td>
                <td className="py-0.5">3.</td>
                <td className="py-0.5">Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor 3 Tahun 2020 tentang Standar Nasional Pendidikan Tinggi;</td>
              </tr>
              <tr className="align-top">
                <td></td>
                <td></td>
                <td className="py-0.5">4.</td>
                <td className="py-0.5">Keputusan Menteri Riset Teknologi dan Pendidikan Tinggi Republik Indonesia No 123/M/KPT/2019 tentang Magang Industri dan Pengakuan Satuan Kredit Semester, Magang Industri untuk Program Sarjana dan Sarjana Terapan;</td>
              </tr>
              <tr className="align-top">
                <td></td>
                <td></td>
                <td className="py-0.5">5.</td>
                <td className="py-0.5">Keputusan Menteri Pendidikan dan Kebudayaan Republik Indonesia Nomor 74/P/2021 Tentang Pengakuan Satuan Kredit Semester Pembelajaran Program Kampus Merdeka;</td>
              </tr>
              <tr className="align-top">
                <td></td>
                <td></td>
                <td className="py-0.5">6.</td>
                <td className="py-0.5">Peraturan akademik STIMI-YAPMI Makassar.</td>
              </tr>

              {/* BERDASARKAN */}
              <tr className="align-top">
                <td className="font-medium pt-1.5 pb-0.5">Berdasarkan</td>
                <td className="pt-1.5 pb-0.5">:</td>
                <td colSpan="2" className="pt-1.5 pb-0.5">
                  Hasil Keputusan Rapat Pimpinan STIMI YAPMI Makassar pada tanggal {tglRapat} dan Pengusulan dari Lembaga Pengabdian Kepada Masyarakat (LPPM).
                </td>
              </tr>
            </tbody>
          </table>

          {/* MEMUTUSKAN */}
          <div className="text-center font-bold tracking-[0.3em] my-2 text-[11pt]">
            M E M U T U S K A N
          </div>

          <table className="w-full text-justify text-[10.5pt] border-collapse leading-snug">
            <tbody>
              <tr className="align-top">
                <td className="w-28 font-medium py-0.5">Menetapkan</td>
                <td className="w-4 py-0.5">:</td>
                <td colSpan="2"></td>
              </tr>
              <tr className="align-top">
                <td className="font-medium py-0.5">Pertama</td>
                <td className="py-0.5">:</td>
                <td colSpan="2" className="py-0.5">
                  Mengangkat bapak/ibu yang tercantum namanya pada lampiran Surat Keputusan ini sebagai Dosen Pembimbing KKLP pada Program Studi Manajemen STIMI-YAPMI Makassar Tahun Akademik {tahunAkademik}.
                </td>
              </tr>
              <tr className="align-top">
                <td className="font-medium py-0.5">Kedua</td>
                <td className="py-0.5">:</td>
                <td colSpan="2" className="py-0.5">
                  Surat Keputusan ini disampaikan kepada masing masing yang bersangkutan untuk dilaksanakan sebagai amanah.
                </td>
              </tr>
              <tr className="align-top">
                <td className="font-medium py-0.5">Ketiga</td>
                <td className="py-0.5">:</td>
                <td colSpan="2" className="py-0.5">
                  Tugas Pokok Pembimbing adalah melaksanakan Pembimbingan, Pengarahan dan Pengawasan terhadap mahasiswa bimbingannya dalam melaksanakan KKLP Tahun Akademik {tahunAkademik}.
                </td>
              </tr>
              <tr className="align-top">
                <td className="font-medium py-0.5">Keempat</td>
                <td className="py-0.5">:</td>
                <td colSpan="2" className="py-0.5">
                  Surat Keputusan ini berlaku sejak ditetapkan sampai selesainya pelaksanaan KKLP Mahasiswa Program Studi Manajemen STIMI-YAPMI Makassar Tahun Akademik {tahunAkademik} dan jika terjadi kekeliruan dalam Surat Keputusan ini akan diperbaiki sebagaimana mestinya.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BAGIAN TANDA TANGAN & TEMBUSAN */}
        <div className="mt-4">
          <div className="flex justify-end">
            <div className="w-72 text-left text-[11pt]">
              <p>Ditetapkan di : Makassar</p>
              <p>Pada Tanggal : {tglSk}</p>
              <p className="font-bold mt-1">Ketua LPPM STIMI YAPMI Makassar</p>
              
              {/* Scan TTD & Cap LPPM */}
              <div className="h-20 flex items-center my-0.5">
                {settings?.ketua_lppm_ttd ? (
                  <img
                    src={settings.ketua_lppm_ttd}
                    alt="TTD & Cap LPPM"
                    className="h-20 w-auto object-contain mix-blend-multiply"
                  />
                ) : (
                  <div className="h-20"></div>
                )}
              </div>

              <p className="font-bold underline leading-none">{settings?.ketua_lppm_nama || "Andi Arwinda Wildam, S.E.,M.M"}</p>
              <p className="leading-tight mt-0.5">NUPTK. {settings?.ketua_lppm_nidn || "0153770671230313"}</p>
            </div>
          </div>

          {/* TEMBUSAN */}
          <div className="text-[10pt] text-left mt-2">
            <p className="font-bold underline mb-0.5">Tembusan Kepada Yth. :</p>
            <ol className="list-decimal list-inside leading-tight text-slate-800">
              <li>Ketua STIMI YAPMI Makassar</li>
              <li>Masing-masing yang bersangkutan di Tempat</li>
              <li>Arsip</li>
            </ol>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* PAGE BREAK ANTARA SK DAN LAMPIRAN                        */}
      {/* ======================================================== */}
      <div className="page-break"></div>

      {/* ======================================================== */}
      {/* HALAMAN 2: LAMPIRAN SURAT KEPUTUSAN                      */}
      {/* ======================================================== */}
      <div className="bg-white w-[210mm] min-h-[297mm] px-[20mm] py-[15mm] shadow-2xl print:shadow-none print:m-0 print:w-full print:min-h-0 text-[11pt] leading-normal relative flex flex-col justify-between">
        
        <div>
          {/* KOP LPPM */}
          <KopSurat />

          {/* KETERANGAN LAMPIRAN */}
          <div className="text-[10.5pt] mb-3 leading-snug">
            <p>Lampiran Surat Keputusan Ketua STIMI-YAPMI Makassar</p>
            <p>Nomor : {nomorSk}</p>
            <p>Perihal : Daftar Nama Peserta</p>
          </div>

          {/* JUDUL TABEL */}
          <div className="text-center font-bold text-[12pt] mb-4">
            Daftar Nama Dosen Pembimbing Dan Peserta KKLP {tahunUtama}
          </div>

          {/* TABEL PESERTA */}
          <table className="w-full border-collapse border border-black text-[10pt] text-left">
            <thead>
              <tr className="text-center font-bold bg-slate-50 print:bg-transparent">
                <th className="border border-black py-2 px-2 w-10 text-center">No.</th>
                <th className="border border-black py-2 px-3">Nama Peserta</th>
                <th className="border border-black py-2 px-2 text-center w-28">NIM</th>
                <th className="border border-black py-2 px-3 text-center">Lokasi</th>
                <th className="border border-black py-2 px-2 text-center w-20">Kelompok</th>
                <th className="border border-black py-2 px-3">DPL</th>
              </tr>
            </thead>
            <tbody>
              {dataGroups.length === 0 ? (
                <tr>
                  <td colSpan="6" className="border border-black text-center py-6 italic text-slate-500">
                    Tidak ada data peserta untuk kelompok ini.
                  </td>
                </tr>
              ) : (
                dataGroups.map((group, gIdx) => {
                  const totalInGroup = group.members.length;
                  if (totalInGroup === 0) return null;

                  return group.members.map((m, mIdx) => {
                    const isFirstInGroup = mIdx === 0;

                    return (
                      <tr key={`${gIdx}-${mIdx}`} className="avoid-break">
                        <td className="border border-black py-1.5 px-2 text-center">{m.globalNo}</td>
                        <td className="border border-black py-1.5 px-3 font-medium">{m.nama}</td>
                        <td className="border border-black py-1.5 px-2 text-center font-mono">{m.nim}</td>
                        <td className="border border-black py-1.5 px-3 text-center">{m.lokasi}</td>
                        <td className="border border-black py-1.5 px-2 text-center">{m.kelompok}</td>
                        {/* DPL: Ditampilkan pada baris pertama kelompok dengan cell gabungan (rowSpan) atau cell tunggal sesuai format manual */}
                        {isFirstInGroup ? (
                          <td 
                            rowSpan={totalInGroup} 
                            className="border border-black py-1.5 px-3 align-top font-medium bg-white"
                          >
                            {group.dplNama}
                          </td>
                        ) : null}
                      </tr>
                    );
                  });
                })
              )}
            </tbody>
          </table>
        </div>

        {/* TANDA TANGAN LAMPIRAN DI KANAN BAWAH */}
        <div className="mt-8 flex justify-end avoid-break">
          <div className="w-72 text-left text-[11pt]">
            <p>Ditetapkan di : Makassar</p>
            <p>Pada Tanggal : {tglSk}</p>
            <p className="font-bold mt-1">Ketua LPPM STIMI YAPMI Makassar</p>
            
            {/* Scan TTD & Cap LPPM */}
            <div className="h-20 flex items-center my-0.5">
              {settings?.ketua_lppm_ttd ? (
                <img
                  src={settings.ketua_lppm_ttd}
                  alt="TTD & Cap LPPM"
                  className="h-20 w-auto object-contain mix-blend-multiply"
                />
              ) : (
                <div className="h-20"></div>
              )}
            </div>

            <p className="font-bold underline leading-none">{settings?.ketua_lppm_nama || "Andi Arwinda Wildam, S.E.,M.M"}</p>
            <p className="leading-tight mt-0.5">NUPTK. {settings?.ketua_lppm_nidn || "0153770671230313"}</p>
          </div>
        </div>

      </div>

    </div>
  );
}

export default function CetakSkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-700 dark:text-slate-200">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-semibold text-sm">Memuat Dokumen SK...</p>
      </div>
    }>
      <CetakSkContent />
    </Suspense>
  );
}
