"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function CetakLaporan() {
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

  if (!data) return <div className="p-10 text-center">Memuat dokumen cetak...</div>;

  const { laporan, pengajuan, logbooks = [], monev = [] } = data;
  const mhs = laporan.mahasiswa_id || pengajuan.mahasiswa_id || session.user;
  const mitraObj = pengajuan.pokja_id?.mitra_id || pengajuan.mitra_id;
  let mitra = mitraObj?.nama_instansi || pengajuan.detail_tempat?.nama || '';
  if (mitraObj) {
    const locs = [];
    if (mitraObj.desa_kelurahan) {
      const val = mitraObj.desa_kelurahan.toUpperCase();
      locs.push(val.includes('DESA') || val.includes('KEL') ? val : `DESA/KEL. ${val}`);
    }
    if (mitraObj.kecamatan) {
      const val = mitraObj.kecamatan.toUpperCase();
      locs.push(val.includes('KEC') ? val : `KEC. ${val}`);
    }
    if (mitraObj.kabupaten_kota) {
      const val = mitraObj.kabupaten_kota.toUpperCase();
      locs.push(val.includes('KAB') || val.includes('KOTA') ? val : `KAB./KOTA ${val}`);
    }
    if (locs.length > 0) {
      mitra += `, ${locs.join(', ')}`;
    }
  }

  const safeParse = (str) => {
    if (!str) return [];
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch (e) {
      return [{ id: 'fallback', title: 'Isi Laporan', content: str }];
    }
  };

  const titleBab2 = laporan.tipe_laporan === 'pokja' ? 'PROFIL INSTITUSI MITRA' : 'METODE PELAKSANAAN';
  const titleBab3 = laporan.tipe_laporan === 'pokja' ? 'PELAKSANAAN PROGRAM KERJA' : 'HASIL DAN PEMBAHASAN';

  const groupedLogbooks = logbooks.reduce((acc, log) => {
    const groupName = log.proker_id?.judul_proker || 'Kegiatan Harian / Lainnya';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(log);
    return acc;
  }, {});

  return (
    <div className="bg-slate-200 min-h-screen font-serif text-black">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 4cm 3cm 3cm 4cm; /* Atas 4cm, Kanan 3cm, Bawah 3cm, Kiri 4cm */
          }
          body {
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
      
      {/* Tombol Print (Sembunyi saat diprint) */}
      <div className="fixed top-5 right-5 print:hidden">
        <button onClick={() => window.print()} className="px-6 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-lg hover:bg-teal-700">
          🖨️ Cetak PDF
        </button>
      </div>

      {/* Kontainer Kertas A4 */}
      <div className="max-w-[21cm] mx-auto bg-white shadow-2xl print:shadow-none print:max-w-none">
        
        {/* HALAMAN COVER */}
        <div className="px-8 py-16 md:px-16 md:py-20 flex flex-col items-center justify-between text-center print:p-0 box-border print:h-[23.5cm] min-h-[29.7cm] print:min-h-0 relative">
          
          {/* HEADER (Top) */}
          <div className="space-y-2 w-full pt-4">
            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide leading-relaxed break-words px-2">
              LAPORAN AKHIR {laporan.tipe_laporan === 'pokja' ? 'KELOMPOK' : 'INDIVIDU'}<br />
              KEGIATAN KKL PLUS BERDAMPAK<br />
              DI<br/>
              {mitra?.toUpperCase() || ''}
            </h1>
          </div>

          {/* LOGO (Middle) */}
          <div className="flex items-center justify-center w-full my-8">
            <img src="/logo_stimi.png" alt="Logo STIMI" className="h-40 md:h-48 object-contain" />
          </div>

          {/* DISUSUN OLEH (Lower Middle) */}
          <div className="space-y-1 w-full mb-8">
            <p className="text-lg mb-4">Disusun oleh:</p>
            {laporan.tipe_laporan === 'pokja' ? (
              <>
                <p className="text-xl font-bold uppercase">{pengajuan.nama_pokja}</p>
                <div className="mt-4 flex flex-col items-center gap-1">
                  {pengajuan.ketua_id && (
                     <p className="text-lg font-bold">{pengajuan.ketua_id.nama_lengkap} ({pengajuan.ketua_id.nim_nidn}) - Ketua</p>
                  )}
                  {pengajuan.anggota?.map(a => (
                     <p key={a.user_id?._id} className="text-lg font-bold">{a.user_id?.nama_lengkap} ({a.user_id?.nim_nidn})</p>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-xl font-bold uppercase">{mhs.nama_lengkap}</p>
                <p className="text-lg font-bold">{mhs.nim_nidn}</p>
                {mhs.program_studi && <p className="text-lg font-bold uppercase">{mhs.program_studi}</p>}
              </>
            )}
          </div>

          {/* FOOTER (Bottom) */}
          <div className="space-y-1 font-bold uppercase text-lg w-full pb-4">
            <p>PROGRAM STUDI MANAJEMEN</p>
            <p>STIMI YAPMI MAKASSAR</p>
            <p>{new Date(pengajuan.tanggal_selesai).getFullYear()}</p>
          </div>
        </div>

        {/* LEMBAR PENGESAHAN */}
        <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
        <div className="p-[3cm] min-h-[29.7cm] print:min-h-0 text-justify leading-relaxed print:p-0 flex flex-col justify-center">
          <h2 className="text-center font-bold text-xl mb-8">LEMBAR PENGESAHAN</h2>
          <p className="mb-4">Laporan Akhir {laporan.tipe_laporan === 'pokja' ? 'Kelompok' : 'Individu'} Kegiatan KKL Plus Berdampak (KKL Plus) ini disusun oleh:</p>
          {laporan.tipe_laporan === 'pokja' ? (
            <div className="mb-8">
              <p className="font-bold uppercase text-lg mb-2 text-center">{pengajuan.nama_pokja}</p>
              <table className="w-full">
                <tbody>
                  <tr><td className="w-48 font-bold">Program Studi</td><td className="w-4">:</td><td className="uppercase">Manajemen</td></tr>
                  <tr><td className="font-bold">Tempat KKL Plus</td><td>:</td><td className="uppercase">{mitra}</td></tr>
                  <tr><td className="font-bold">Waktu Pelaksanaan</td><td>:</td><td>{new Date(pengajuan.tanggal_mulai).toLocaleDateString('id-ID')} s.d. {new Date(pengajuan.tanggal_selesai).toLocaleDateString('id-ID')}</td></tr>
                  <tr>
                    <td className="font-bold align-top pt-2">Anggota Kelompok</td>
                    <td className="align-top pt-2">:</td>
                    <td className="pt-2">
                      <ul className="list-decimal pl-4">
                        {pengajuan.ketua_id && (
                          <li><span className="uppercase">{pengajuan.ketua_id.nama_lengkap}</span> ({pengajuan.ketua_id.nim_nidn}) - Ketua</li>
                        )}
                        {pengajuan.anggota?.map(a => (
                          <li key={a.user_id?._id}><span className="uppercase">{a.user_id?.nama_lengkap}</span> ({a.user_id?.nim_nidn})</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <table className="w-full mb-8">
              <tbody>
                <tr><td className="w-48 font-bold">Nama</td><td className="w-4">:</td><td className="uppercase">{mhs.nama_lengkap}</td></tr>
                <tr><td className="font-bold">NIM/NIDN</td><td>:</td><td>{mhs.nim_nidn}</td></tr>
                <tr><td className="font-bold">Program Studi</td><td>:</td><td className="uppercase">{mhs.program_studi || 'Manajemen'}</td></tr>
                <tr><td className="font-bold">Tempat KKL Plus</td><td>:</td><td className="uppercase">{mitra}</td></tr>
                <tr><td className="font-bold">Waktu Pelaksanaan</td><td>:</td><td>{new Date(pengajuan.tanggal_mulai).toLocaleDateString('id-ID')} s.d. {new Date(pengajuan.tanggal_selesai).toLocaleDateString('id-ID')}</td></tr>
              </tbody>
            </table>
          )}
          <p className="mb-12">Telah diperiksa dan disahkan sebagai syarat kelulusan mata kuliah KKL Plus pada Program Studi Manajemen STIMI YAPMI Makassar.</p>
          
          <div className="flex justify-between items-end mt-16 text-center">
            <div className="flex flex-col items-center">
              <p className="mb-24">Menyetujui,<br/>Mentor (Pembimbing Lapangan)</p>
              <p className="font-bold underline uppercase">{pengajuan.mentor_nama || '_________________________'}</p>
              <p>{pengajuan.mentor_jabatan || 'Instansi/Perusahaan'}</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="mb-24">Mengesahkan,<br/>Dosen Pembimbing Lapangan (DPL)</p>
              <p className="font-bold underline uppercase">{pengajuan.dpl_id?.nama_lengkap || '_________________________'}</p>
              <p>NIDN: {pengajuan.dpl_id?.nim_nidn || '__________________'}</p>
            </div>
          </div>
        </div>

        {/* PAGE BREAK */}
        <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>

        {/* KATA PENGANTAR */}
        {laporan.kata_pengantar && (
          <>
            <div className="p-[3cm] min-h-[29.7cm] print:min-h-0 text-justify leading-relaxed print:p-0 flex flex-col pt-12">
              <h2 className="text-center font-bold text-xl mb-8">KATA PENGANTAR</h2>
              <div className="whitespace-pre-wrap">{laporan.kata_pengantar}</div>
              <div className="flex justify-end mt-16 text-center">
                <div className="flex flex-col items-center">
                  <p className="mb-24">Makassar, ............................<br/>Penulis,</p>
                  {laporan.tipe_laporan === 'pokja' ? (
                     <p className="font-bold underline uppercase">{pengajuan.nama_pokja}</p>
                  ) : (
                     <p className="font-bold underline uppercase">{mhs.nama_lengkap}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
          </>
        )}

        {/* DAFTAR ISI */}
        <div className="p-[3cm] min-h-[29.7cm] print:min-h-0 text-justify leading-relaxed print:p-0">
          <h2 className="text-center font-bold text-xl mb-8">DAFTAR ISI</h2>
          
          <div className="space-y-1 text-lg">
            <div className="font-bold">HALAMAN JUDUL</div>
            <div className="font-bold">LEMBAR PENGESAHAN</div>
            {laporan.kata_pengantar && <div className="font-bold">KATA PENGANTAR</div>}
            <div className="font-bold">DAFTAR ISI</div>
            
            <div className="font-bold pt-4">BAB I PENDAHULUAN</div>
            {safeParse(laporan.bab1_pendahuluan).map(sec => (
              <div key={sec.id} className="pl-6">{sec.title}</div>
            ))}

            <div className="font-bold pt-4">BAB II {titleBab2}</div>
            {safeParse(laporan.bab2_metode).map(sec => (
              <div key={sec.id} className="pl-6">{sec.title}</div>
            ))}

            <div className="font-bold pt-4">BAB III {titleBab3}</div>
            {safeParse(laporan.bab3_profil).map(sec => (
              <div key={sec.id} className="pl-6">{sec.title}</div>
            ))}

            <div className="font-bold pt-4">BAB IV PENUTUP</div>
            {safeParse(laporan.bab4_hasil).map(sec => (
              <div key={sec.id} className="pl-6">{sec.title}</div>
            ))}

            {(laporan.file_pengantar || laporan.file_penerimaan || laporan.file_keterangan || logbooks.length > 0 || monev.length > 0) && (
              <>
                <div className="font-bold pt-4">LAMPIRAN</div>
                {laporan.file_pengantar && <div className="pl-6">- Surat Pengantar KKL Plus</div>}
                {laporan.file_penerimaan && <div className="pl-6">- Surat Penerimaan KKL Plus</div>}
                {laporan.file_keterangan && <div className="pl-6">- Surat Keterangan Selesai KKL Plus</div>}
                {logbooks.length > 0 && (
                  <>
                    <div className="pl-6">- Logbook Harian Mahasiswa</div>
                    <div className="pl-6">- Dokumentasi Kegiatan</div>
                  </>
                )}
                {monev.length > 0 && <div className="pl-6">- Dokumentasi DPL (Kunjungan Monev)</div>}
              </>
            )}
          </div>
        </div>

        {/* PAGE BREAK */}
        <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>

        {/* KONTEN BAB */}
        <div className="p-[3cm] min-h-[29.7cm] print:min-h-0 text-justify leading-relaxed space-y-8 print:p-0">
          
          <section>
            <h2 className="text-center font-bold text-xl mb-6">BAB I<br/>PENDAHULUAN</h2>
            <div className="space-y-4">
              {safeParse(laporan.bab1_pendahuluan).map(sec => (
                <div key={sec.id}>
                  <h3 className="font-bold text-lg mb-2">{sec.title}</h3>
                  <div className="whitespace-pre-wrap pl-6">{sec.content}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="pt-8">
            <h2 className="text-center font-bold text-xl mb-6">BAB II<br/>{titleBab2}</h2>
            <div className="space-y-4">
              {safeParse(laporan.bab2_metode).map(sec => (
                <div key={sec.id}>
                  <h3 className="font-bold text-lg mb-2">{sec.title}</h3>
                  {sec.id === '2_2' && laporan.file_struktur_organisasi && (
                    <div className="mt-4 mb-6 pl-6 flex flex-col items-center">
                      <img src={laporan.file_struktur_organisasi} alt="Struktur Organisasi" className="max-w-full h-auto border border-slate-200 p-2 mb-2" />
                      <p className="text-sm italic font-medium">Gambar Struktur Organisasi {mitra}</p>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap pl-6">{sec.content}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="pt-8">
            <h2 className="text-center font-bold text-xl mb-6">BAB III<br/>{titleBab3}</h2>
            <div className="space-y-4">
              {safeParse(laporan.bab3_profil).map(sec => (
                <div key={sec.id}>
                  <h3 className="font-bold text-lg mb-2">{sec.title}</h3>
                  <div className="whitespace-pre-wrap pl-6">{sec.content}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="pt-8">
            <h2 className="text-center font-bold text-xl mb-6">BAB IV<br/>PENUTUP</h2>
            <div className="space-y-4">
              {safeParse(laporan.bab4_hasil).map(sec => (
                <div key={sec.id}>
                  <h3 className="font-bold text-lg mb-2">{sec.title}</h3>
                  <div className="whitespace-pre-wrap pl-6">{sec.content}</div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* LAMPIRAN SURAT */}
        {(laporan.file_pengantar || laporan.file_penerimaan || laporan.file_keterangan) && (
          <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
        )}

        <div className="p-[3cm] print:p-0">
          {laporan.file_pengantar && (
            <div className="mb-8" style={{ pageBreakInside: 'avoid' }}>
              <h3 className="font-bold mb-4">Lampiran: Surat Pengantar KKL Plus</h3>
              <div className="print:hidden mb-2">
                <a href={laporan.file_pengantar} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  Buka Dokumen
                </a>
              </div>
              <p><i>(Dokumen dilampirkan terpisah)</i></p>
            </div>
          )}
          {laporan.file_penerimaan && (
            <div className="mb-8" style={{ pageBreakInside: 'avoid' }}>
              <h3 className="font-bold mb-4">Lampiran: Surat Penerimaan KKL Plus</h3>
              <div className="print:hidden mb-2">
                <a href={laporan.file_penerimaan} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  Buka Dokumen
                </a>
              </div>
              <p><i>(Dokumen dilampirkan terpisah)</i></p>
            </div>
          )}
          {laporan.file_keterangan && (
            <div className="mb-8" style={{ pageBreakInside: 'avoid' }}>
              <h3 className="font-bold mb-4">Lampiran: Surat Keterangan Selesai KKL Plus</h3>
              <div className="print:hidden mb-2">
                <a href={laporan.file_keterangan} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  Buka Dokumen
                </a>
              </div>
              <p><i>(Dokumen dilampirkan terpisah)</i></p>
            </div>
          )}
        </div>

        {/* LAMPIRAN: FOTO INSTANSI MITRA */}
        {mitraObj && (mitraObj.foto_kantor_desa || mitraObj.foto_kantor_bumdes || mitraObj.logo_mitra) && (
          <>
            <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
            <div className="p-[3cm] min-h-[29.7cm] print:min-h-0 print:p-0">
              <h2 className="text-center font-bold text-xl mb-6">LAMPIRAN: PROFIL INSTANSI MITRA</h2>
              <div className="grid grid-cols-2 gap-8">
                {mitraObj.logo_mitra && (
                  <div className="border border-slate-300 p-4 rounded-xl break-inside-avoid text-center">
                    <img src={mitraObj.logo_mitra} className="w-full h-48 object-contain mb-3" alt="Logo Instansi" />
                    <div className="font-bold text-sm text-slate-800">Logo Instansi</div>
                  </div>
                )}
                {mitraObj.foto_kantor_desa && (
                  <div className="border border-slate-300 p-4 rounded-xl break-inside-avoid text-center">
                    <img src={mitraObj.foto_kantor_desa} className="w-full h-48 object-cover mb-3 shadow-sm rounded-lg" alt="Luar Bangunan" />
                    <div className="font-bold text-sm text-slate-800">Foto Luar Bangunan / Gedung</div>
                  </div>
                )}
                {mitraObj.foto_kantor_bumdes && (
                  <div className="border border-slate-300 p-4 rounded-xl break-inside-avoid text-center">
                    <img src={mitraObj.foto_kantor_bumdes} className="w-full h-48 object-cover mb-3 shadow-sm rounded-lg" alt="Dalam Ruangan" />
                    <div className="font-bold text-sm text-slate-800">Foto Dalam Kantor / Ruangan</div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {logbooks.length > 0 && (
          <>
            {/* PAGE BREAK FOR LOGBOOK */}
            <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
            <div className="p-[3cm] min-h-[29.7cm] print:min-h-0 print:p-0">
              <h2 className="text-center font-bold text-xl mb-6">LAMPIRAN: LOGBOOK HARIAN</h2>
              
              {Object.entries(groupedLogbooks).map(([groupName, logs], gIdx) => (
                <div key={gIdx} className="mb-8">
                  <h3 className="font-bold text-lg mb-4 bg-teal-100 p-2 rounded">{groupName}</h3>
                  <table className="w-full text-sm border-collapse border border-slate-800">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-800 p-2 text-center w-10">No</th>
                        <th className="border border-slate-800 p-2 text-center w-40">Hari/Tanggal</th>
                        <th className="border border-slate-800 p-2 text-left">Deskripsi Kegiatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log, idx) => (
                        <tr key={log._id}>
                          <td className="border border-slate-800 p-2 text-center align-top">{idx + 1}</td>
                          <td className="border border-slate-800 p-2 text-center align-top">
                            {new Date(log.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </td>
                          <td className="border border-slate-800 p-2 text-left whitespace-pre-wrap text-xs">
                            <strong>Rencana:</strong> {log.rencana_target}<br/>
                            <strong>Uraian:</strong> {log.uraian_kegiatan}<br/>
                            <strong>Hasil:</strong> {log.hasil_output}<br/>
                            {log.kendala_solusi && <><strong>Kendala:</strong> {log.kendala_solusi}</>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {/* PAGE BREAK FOR FOTO */}
            <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
            <div className="p-[3cm] min-h-[29.7cm] print:min-h-0 print:p-0">
              <h2 className="text-center font-bold text-xl mb-6">LAMPIRAN: DOKUMENTASI KEGIATAN</h2>
              {Object.entries(groupedLogbooks).map(([groupName, logs], gIdx) => {
                const logsWithPhotos = logs.filter(log => log.bukti_kegiatan);
                if (logsWithPhotos.length === 0) return null;
                return (
                  <div key={gIdx} className="mb-8">
                    <h3 className="font-bold text-lg mb-4 bg-teal-100 p-2 rounded">{groupName}</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {logsWithPhotos.map((log, idx) => (
                        <div key={log._id} className="border border-slate-300 p-2 rounded break-inside-avoid">
                          <img src={log.bukti_kegiatan} className="w-full h-auto aspect-square object-cover" alt={`Dokumentasi ${idx+1}`} />
                          <div className="text-center text-xs mt-2 text-slate-800 font-medium">
                            {log.keterangan_bukti || 'Dokumentasi Kegiatan'}
                          </div>
                          <div className="text-center text-[10px] mt-1 text-slate-500">
                            {new Date(log.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* DOKUMENTASI DPL (MONEV) */}
        {monev.length > 0 && (
          <>
            <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>
            <div className="p-[3cm] min-h-[29.7cm] print:min-h-0 print:p-0">
              <h2 className="text-center font-bold text-xl mb-6">LAMPIRAN: DOKUMENTASI DPL</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {monev.map((item) => (
                  <div key={item._id} className="border border-slate-300 p-2 rounded break-inside-avoid text-center flex flex-col items-center">
                    <img src={item.foto_url} className="w-full h-48 object-cover rounded shadow-sm" alt={`Monev ${item.jenis_kunjungan}`} />
                    <div className="text-center text-sm mt-3 text-slate-800 font-bold uppercase">
                      Kunjungan {item.jenis_kunjungan}
                    </div>
                    <div className="text-center text-xs mt-1 text-slate-600">
                      {new Date(item.tanggal_kunjungan).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
