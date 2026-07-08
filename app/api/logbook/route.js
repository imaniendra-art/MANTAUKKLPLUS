import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Logbook from '@/models/Logbook';
import Pokja from '@/models/Pokja';
import User from '@/models/User'; 
import { generatePresignedUrl } from '@/lib/minio';

async function processLogbookUrls(logbookDoc) {
  if (!logbookDoc) return logbookDoc;
  const logbook = logbookDoc.toObject ? logbookDoc.toObject() : logbookDoc;
  if (logbook.bukti_kegiatan) {
    logbook.bukti_kegiatan = await generatePresignedUrl(logbook.bukti_kegiatan);
  }
  return logbook;
}

async function processLogbookArray(logs) {
  return await Promise.all(logs.map(l => processLogbookUrls(l)));
}

export async function GET(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const mhsId = searchParams.get('mhsId');
    const pokjaId = searchParams.get('pokjaId');
    const tipe = searchParams.get('tipe'); // 'individu' | 'pokja'
    const role = searchParams.get('role');
    const userId = searchParams.get('userId'); 
    
    const pageStr = searchParams.get('page');
    const limitStr = searchParams.get('limit');
    
    if (mhsId) {
      const query = { mahasiswa_id: mhsId };
      if (tipe) query.tipe_logbook = tipe;
      
      let dbQuery = Logbook.find(query)
        .populate({ path: 'proker_id', select: 'judul_proker' })
        .sort({ tanggal: -1, createdAt: -1 });

      if (pageStr && limitStr) {
        const page = parseInt(pageStr) || 1;
        const limit = parseInt(limitStr) || 10;
        const total = await Logbook.countDocuments(query);
        const logs = await dbQuery.skip((page - 1) * limit).limit(limit);
        const processedLogs = await processLogbookArray(logs);
        return NextResponse.json({
          data: processedLogs,
          pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
      } else {
        const logs = await dbQuery;
        const processedLogs = await processLogbookArray(logs);
        return NextResponse.json(processedLogs);
      }
    }

    if (pokjaId && tipe === 'pokja') {
      const logs = await Logbook.find({ pokja_id: pokjaId, tipe_logbook: 'pokja' })
        .populate({ path: 'proker_id', select: 'judul_proker' })
        .sort({ tanggal: -1, createdAt: -1 });
      const processedLogs = await processLogbookArray(logs);
      return NextResponse.json(processedLogs);
    }

    // LPPM: Tarik seluruh logbook untuk monitoring
    if (role === 'lppm') {
      const logs = await Logbook.find({})
        .populate({ path: 'mahasiswa_id', select: 'nama_lengkap nim_nidn program_studi' })
        .populate({ path: 'pokja_id', select: 'nama_pokja', populate: { path: 'mitra_id' } })
        .sort({ tanggal: -1 });
      const processedLogs = await processLogbookArray(logs);
      return NextResponse.json(processedLogs);
    }

    // Mentor: Tarik semua logbook (individu & pokja) yang menunggu validasi mentor
    if (role === 'mentor' && userId) {
      const pokjas = await Pokja.find({ mentor_id: userId }).select('_id');
      const pokjaIds = pokjas.map(p => p._id);

      const logs = await Logbook.find({ 
        status_validasi: 'menunggu_mentor',
        pokja_id: { $in: pokjaIds }
      })
        .populate({ path: 'mahasiswa_id', select: 'nama_lengkap nim_nidn' })
        .populate({ path: 'pokja_id', select: 'nama_pokja' })
        .populate({ path: 'proker_id', select: 'judul_proker' })
        .sort({ tanggal: 1 });
      const processedLogs = await processLogbookArray(logs);
      return NextResponse.json(processedLogs);
    }

    // Mentor Histori
    if (role === 'mentor_histori' && userId) {
      const pokjas = await Pokja.find({ mentor_id: userId }).select('_id');
      const pokjaIds = pokjas.map(p => p._id);

      const logs = await Logbook.find({ 
        status_validasi: { $in: ['divalidasi_mentor', 'divalidasi_dpl', 'revisi'] },
        pokja_id: { $in: pokjaIds }
      })
        .populate({ path: 'mahasiswa_id', select: 'nama_lengkap nim_nidn' })
        .populate({ path: 'pokja_id', select: 'nama_pokja' })
        .populate({ path: 'proker_id', select: 'judul_proker' })
        .sort({ tanggal: -1 });
      const processedLogs = await processLogbookArray(logs);
      return NextResponse.json(processedLogs);
    }

    // DPL: Tarik logbook
    if (role === 'dpl' && userId) {
      const pokjas = await Pokja.find({ dpl_id: userId }).select('_id');
      const pokjaIds = pokjas.map(p => p._id);

      const logs = await Logbook.find({ 
        pokja_id: { $in: pokjaIds }
      })
      .populate({ path: 'mahasiswa_id', select: 'nama_lengkap nim_nidn' })
      .populate({ path: 'pokja_id', select: 'nama_pokja' })
      .populate({ path: 'proker_id', select: 'judul_proker' })
      .sort({ tanggal: 1 });

      const processedLogs = await processLogbookArray(logs);
      return NextResponse.json(processedLogs);
    }
    
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const data = await req.json();
    const newLog = await Logbook.create(data);
    return NextResponse.json(newLog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  await dbConnect();
  try {
    const data = await req.json();
    const { id, status_validasi, catatan_revisi, rencana_target, uraian_kegiatan, hasil_output, kendala_solusi, bukti_link, bukti_kegiatan, keterangan_bukti, ids } = data;
    
    // Bulk Update
    if (ids && Array.isArray(ids) && ids.length > 0) {
      if (!status_validasi) {
        return NextResponse.json({ error: "Missing status_validasi for bulk update" }, { status: 400 });
      }
      const updated = await Logbook.updateMany(
        { _id: { $in: ids } },
        { $set: { status_validasi } }
      );
      return NextResponse.json({ success: true, count: updated.modifiedCount });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing Logbook ID" }, { status: 400 });
    }
    
    let updateData = {};
    if (status_validasi) updateData.status_validasi = status_validasi;
    if (catatan_revisi !== undefined) updateData.catatan_revisi = catatan_revisi;
    if (rencana_target) updateData.rencana_target = rencana_target;
    if (uraian_kegiatan) updateData.uraian_kegiatan = uraian_kegiatan;
    if (hasil_output) updateData.hasil_output = hasil_output;
    if (kendala_solusi !== undefined) updateData.kendala_solusi = kendala_solusi;
    if (bukti_link !== undefined) updateData.bukti_link = bukti_link;
    if (bukti_kegiatan) updateData.bukti_kegiatan = bukti_kegiatan;
    if (keterangan_bukti !== undefined) updateData.keterangan_bukti = keterangan_bukti;
    
    const updated = await Logbook.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
