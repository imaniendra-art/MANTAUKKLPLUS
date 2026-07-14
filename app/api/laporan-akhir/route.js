import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pokja from '@/models/Pokja';
import LaporanAkhir from '@/models/LaporanAkhir';
import Logbook from '@/models/Logbook';
import Proker from '@/models/Proker';
import { generatePresignedUrl } from '@/lib/minio';

async function processLaporanUrls(laporanDoc) {
  if (!laporanDoc) return laporanDoc;
  const laporan = laporanDoc.toObject ? laporanDoc.toObject() : laporanDoc;
  
  const fileFields = ['file_laporan', 'file_pengantar', 'file_penerimaan', 'file_keterangan', 'file_struktur_organisasi'];
  
  for (const field of fileFields) {
    if (laporan[field]) {
      laporan[field] = await generatePresignedUrl(laporan[field]);
    }
  }
  
  return laporan;
}

async function processLaporanArray(laporans) {
  return await Promise.all(laporans.map(l => processLaporanUrls(l)));
}

async function processLogbookUrls(logbookDoc) {
  if (!logbookDoc) return logbookDoc;
  const logbook = logbookDoc.toObject ? logbookDoc.toObject() : logbookDoc;
  if (logbook.bukti_kegiatan) {
    logbook.bukti_kegiatan = await generatePresignedUrl(logbook.bukti_kegiatan);
  }
  return logbook;
}

async function processLogbookArray(logbooks) {
  return await Promise.all(logbooks.map(l => processLogbookUrls(l)));
}

export async function GET(request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const mhsId = searchParams.get('mhsId');
    const role = searchParams.get('role');
    const dplId = searchParams.get('dplId');
    const pokjaId = searchParams.get('pokjaId');
    const tipe = searchParams.get('tipe'); // 'individu' or 'pokja'
    const laporanId = searchParams.get('id');

    // Jika dipanggil langsung menggunakan ID Laporan Akhir (misal untuk cetak PDF)
    if (laporanId) {
      let laporan = await LaporanAkhir.findById(laporanId)
        .populate({ path: 'mahasiswa_id', select: 'nama_lengkap nim_nidn program_studi' })
        .populate({ path: 'pokja_id', select: 'nama_pokja mitra_id dpl_id ketua_id anggota mentor_nama mentor_jabatan tanggal_mulai tanggal_selesai detail_tempat', populate: { path: 'mitra_id' } });
      
      if (!laporan) {
        return NextResponse.json({ error: "Laporan not found" }, { status: 404 });
      }

      // Populate DPL and Ketua from Pokja if needed by print template
      await Pokja.populate(laporan.pokja_id, [
        { path: 'dpl_id', select: 'nama_lengkap nim_nidn' },
        { path: 'ketua_id', select: 'nama_lengkap nim_nidn program_studi' },
        { path: 'anggota.user_id', select: 'nama_lengkap nim_nidn program_studi' }
      ]);

      const processed = await processLaporanUrls(laporan);
      
      // Ambil logbooks jika ini laporan individu
      let rawLogbooks = [];
      if (laporan.tipe_laporan === 'individu' && laporan.mahasiswa_id) {
        rawLogbooks = await Logbook.find({ mahasiswa_id: laporan.mahasiswa_id._id, status_validasi: 'selesai' }).populate('proker_id').sort({ tanggal: 1 });
      } else if (laporan.tipe_laporan === 'pokja' && laporan.pokja_id) {
        let pokjaData = laporan.pokja_id;
        if (!pokjaData.anggota) {
          pokjaData = await Pokja.findById(laporan.pokja_id._id || laporan.pokja_id).select('ketua_id anggota');
        }
        const userIds = [pokjaData.ketua_id];
        if (pokjaData.anggota) {
           pokjaData.anggota.forEach(a => userIds.push(a.user_id));
        }
        rawLogbooks = await Logbook.find({ mahasiswa_id: { $in: userIds }, status_validasi: 'selesai' }).populate('proker_id').sort({ tanggal: 1 });
      }
      const logbooks = await processLogbookArray(rawLogbooks);

      // Ambil dokumentasi DPL (Monev) untuk dilampirkan
      const Monev = require('@/models/Monev').default || require('@/models/Monev');
      let monevList = [];
      if (laporan.pokja_id) {
        const rawMonev = await Monev.find({ pokja_id: laporan.pokja_id._id }).sort({ tanggal_kunjungan: 1 }).lean();
        for (let i = 0; i < rawMonev.length; i++) {
          if (rawMonev[i].foto_url) {
            rawMonev[i].foto_url = await generatePresignedUrl(rawMonev[i].foto_url);
          }
          monevList.push(rawMonev[i]);
        }
      }

      return NextResponse.json({ laporan: processed, pengajuan: laporan.pokja_id, logbooks, monev: monevList });
    }

    // Jika dipanggil oleh DPL
    if (role === 'dpl' && dplId) {
      const pokjas = await Pokja.find({ dpl_id: dplId }).select('_id');
      const pokjaIds = pokjas.map(p => p._id);

      const laporans = await LaporanAkhir.find({ 
        pokja_id: { $in: pokjaIds },
        status: { $in: ['submitted', 'revisi', 'disetujui'] }
      })
      .populate({ path: 'mahasiswa_id', select: 'nama_lengkap nim_nidn program_studi' })
      .populate({ path: 'pokja_id', select: 'nama_pokja mitra_id', populate: { path: 'mitra_id' } })
      .sort({ updatedAt: -1 });

      const processed = await processLaporanArray(laporans);
      return NextResponse.json(processed);
    }

    // Ambil laporan by pokjaId & tipe
    if (pokjaId && tipe) {
      let query = { pokja_id: pokjaId, tipe_laporan: tipe };
      if (tipe === 'individu' && mhsId) {
        query.mahasiswa_id = mhsId;
      }
      let laporan = await LaporanAkhir.findOne(query)
        .populate({ path: 'pokja_id', select: 'nama_pokja mitra_id', populate: { path: 'mitra_id' } });
      
      // Jika belum ada draft, kita return null saja, UI yang handle
      if (laporan) {
        const processed = await processLaporanUrls(laporan);
        return NextResponse.json(processed);
      }
      return NextResponse.json(null);
    }

    // Fallback: Jika dipanggil oleh mahasiswa (hanya mengirimkan mhsId)
    if (mhsId && !pokjaId) {
      // 1. Ambil pokja tempat mahasiswa tergabung sebagai 'pengajuan'
      const pokja = await Pokja.findOne({ $or: [{ 'anggota.user_id': mhsId }, { ketua_id: mhsId }] })
        .populate('mitra_id')
        .populate({ path: 'anggota.user_id', select: 'nama_lengkap nim_nidn program_studi' })
        .populate({ path: 'dpl_id', select: 'nama_lengkap nim_nidn' })
        .populate({ path: 'ketua_id', select: 'nama_lengkap nim_nidn program_studi' });

      if (!pokja) {
        return NextResponse.json({ error: "Mahasiswa belum tergabung dalam Pokja / Pengajuan tidak ditemukan" }, { status: 404 });
      }

      // Supaya backward compatible dengan komponen frontend lama yang menggunakan `pengajuan.is_laporan_unlocked`
      const pengajuan = pokja.toObject ? pokja.toObject() : pokja;
      
      // Inject mahasiswa_id untuk frontend
      const mhsAnggota = pengajuan.anggota.find(m => m.user_id && m.user_id._id.toString() === mhsId);
      if (mhsAnggota) {
        pengajuan.mahasiswa_id = mhsAnggota.user_id;
      } else if (pengajuan.ketua_id && pengajuan.ketua_id._id.toString() === mhsId) {
        pengajuan.mahasiswa_id = pengajuan.ketua_id;
      }

      // 3. Ambil laporan individu
      let laporan_individu = await LaporanAkhir.findOne({ 
        pokja_id: pokja._id, 
        tipe_laporan: 'individu', 
        mahasiswa_id: mhsId 
      }).populate({ path: 'pokja_id', select: 'nama_pokja mitra_id', populate: { path: 'mitra_id' } });

      // 4. Ambil laporan kelompok
      let laporan_kelompok = await LaporanAkhir.findOne({ 
        pokja_id: pokja._id, 
        tipe_laporan: 'pokja'
      }).populate({ path: 'pokja_id', select: 'nama_pokja mitra_id', populate: { path: 'mitra_id' } });

      const processed_individu = await processLaporanUrls(laporan_individu);
      const processed_kelompok = await processLaporanUrls(laporan_kelompok);

      // 5. Ambil logbook yang sudah disetujui (untuk mahasiswa ybs)
      const rawLogbooks = await Logbook.find({ mahasiswa_id: mhsId, status_validasi: 'selesai' }).populate('proker_id').sort({ tanggal: 1 });
      const logbooks = await processLogbookArray(rawLogbooks);

      return NextResponse.json({
        laporan: processed_individu, // Keep backward compatibility
        laporan_individu: processed_individu,
        laporan_kelompok: processed_kelompok,
        pengajuan,
        logbooks
      });
    }

    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const data = await request.json();
    const { 
      pokja_id,
      tipe_laporan,
      mahasiswa_id, 
      kata_pengantar,
      bab1_pendahuluan, 
      bab2_metode, 
      bab3_profil, 
      bab4_hasil, 
      bab5_penutup, 
      file_pengantar,
      file_penerimaan,
      file_keterangan,
      file_struktur_organisasi,
      file_laporan,
      status
    } = data;

    let final_pokja_id = pokja_id;
    let final_tipe = tipe_laporan;
    let final_mhs_id = mahasiswa_id;

    if (!final_pokja_id && data.mhsId) {
      const pokja = await Pokja.findOne({ $or: [{ 'anggota.user_id': data.mhsId }, { ketua_id: data.mhsId }] });
      if (!pokja) {
        return NextResponse.json({ error: "Mahasiswa belum tergabung dalam Pokja" }, { status: 404 });
      }
      final_pokja_id = pokja._id;
      final_tipe = data.tipe_laporan || 'individu';
      final_mhs_id = data.mhsId;
    }

    if (!final_pokja_id || !final_tipe) {
      return NextResponse.json({ error: "Missing pokja_id or tipe_laporan" }, { status: 400 });
    }

    let query = { pokja_id: final_pokja_id, tipe_laporan: final_tipe };
    if (final_tipe === 'individu') {
      query.mahasiswa_id = final_mhs_id;
    }

    let laporan = await LaporanAkhir.findOne(query);
    
    if (laporan) {
      // Update
      laporan.kata_pengantar = kata_pengantar ?? laporan.kata_pengantar;
      laporan.bab1_pendahuluan = bab1_pendahuluan ?? laporan.bab1_pendahuluan;
      laporan.bab2_metode = bab2_metode ?? laporan.bab2_metode;
      laporan.bab3_profil = bab3_profil ?? laporan.bab3_profil;
      laporan.bab4_hasil = bab4_hasil ?? laporan.bab4_hasil;
      laporan.bab5_penutup = bab5_penutup ?? laporan.bab5_penutup;
      laporan.file_pengantar = file_pengantar ?? laporan.file_pengantar;
      laporan.file_penerimaan = file_penerimaan ?? laporan.file_penerimaan;
      laporan.file_keterangan = file_keterangan ?? laporan.file_keterangan;
      laporan.file_struktur_organisasi = file_struktur_organisasi ?? laporan.file_struktur_organisasi;
      laporan.file_laporan = file_laporan ?? laporan.file_laporan;
      laporan.status = status ?? laporan.status;
      await laporan.save();
    } else {
      // Create
      laporan = await LaporanAkhir.create({
        pokja_id: final_pokja_id,
        tipe_laporan: final_tipe,
        mahasiswa_id: final_tipe === 'individu' ? final_mhs_id : undefined,
        kata_pengantar,
        bab1_pendahuluan,
        bab2_metode,
        bab3_profil,
        bab4_hasil,
        bab5_penutup,
        file_pengantar,
        file_penerimaan,
        file_keterangan,
        file_struktur_organisasi,
        file_laporan,
        status: status || 'draft'
      });
    }

    return NextResponse.json(laporan);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  await dbConnect();
  try {
    const data = await request.json();
    const { id, status, catatan_dpl } = data;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const laporan = await LaporanAkhir.findById(id);
    if (!laporan) {
      return NextResponse.json({ error: "Laporan not found" }, { status: 404 });
    }

    laporan.status = status;
    if (catatan_dpl !== undefined) {
      laporan.catatan_dpl = catatan_dpl;
    }

    await laporan.save();
    return NextResponse.json(laporan);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
