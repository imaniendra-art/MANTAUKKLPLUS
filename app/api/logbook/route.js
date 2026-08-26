import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Logbook from '@/models/Logbook';
import Pokja from '@/models/Pokja';
import User from '@/models/User';
import Proker from '@/models/Proker';
import { generatePresignedUrl } from '@/lib/minio';
import { getServerSession } from "@/lib/auth";

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
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const mhsId = searchParams.get('mhsId');
    const pokjaId = searchParams.get('pokjaId');
    const tipe = searchParams.get('tipe'); // 'individu' | 'pokja'
    const role = searchParams.get('role');
    const userId = searchParams.get('userId'); 

    // Mencegah Spoofing Identitas (IDOR)
    if (session.user.role === 'mahasiswa' && mhsId && mhsId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (role === 'admin' && session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (userId && session.user.id !== userId && session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
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

    // Admin: Tarik seluruh logbook untuk monitoring
    if (role === 'admin') {
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
        .populate({ path: 'pokja_id', select: 'nama_pokja tanggal_mulai' })
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
        .populate({ path: 'pokja_id', select: 'nama_pokja tanggal_mulai' })
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
      .populate({ path: 'pokja_id', select: 'nama_pokja tanggal_mulai' })
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
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();

    // IDOR Prevention: Mahasiswa hanya boleh submit logbook atas namanya sendiri
    if (session.user.role === 'mahasiswa') {
        if (data.tipe_logbook === 'individu' && data.mahasiswa_id !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    // PERBAIKAN 3: Validasi Tanggal (Tidak boleh masa depan)
    const inputDate = new Date(data.tanggal);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (inputDate > today) {
      return NextResponse.json({ error: "Tanggal logbook tidak boleh melebihi hari ini." }, { status: 400 });
    }

    // PERBAIKAN 2: Cegah Double Submit (1 logbook per hari per tipe)
    const startOfDay = new Date(inputDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(inputDate);
    endOfDay.setHours(23, 59, 59, 999);

    const queryDuplicate = {
      tanggal: { $gte: startOfDay, $lte: endOfDay },
      tipe_logbook: data.tipe_logbook
    };

    if (data.tipe_logbook === 'individu') {
      queryDuplicate.mahasiswa_id = data.mahasiswa_id;
      const exists = await Logbook.findOne(queryDuplicate);
      if (exists) {
        return NextResponse.json({ error: "Logbook individu pada tanggal tersebut sudah ada." }, { status: 400 });
      }
    } else if (data.tipe_logbook === 'pokja') {
      // Validasi Logbook Pokja (wajib proker, proker sesuai, proker disetujui)
      if (!data.proker_id) {
        return NextResponse.json({ error: "Program kerja wajib dipilih." }, { status: 400 });
      }

      const proker = await Proker.findById(data.proker_id);
      if (!proker || proker.pokja_id.toString() !== data.pokja_id.toString()) {
        return NextResponse.json({ error: "Program kerja tidak sesuai dengan Pokja." }, { status: 400 });
      }

      if (proker.status !== 'disetujui_dpl' && proker.status !== 'selesai') {
        return NextResponse.json({ error: "Program kerja belum disetujui DPL." }, { status: 400 });
      }

      // Cegah duplicate submit untuk proker yang sama oleh mahasiswa/PIC yang sama di hari yang sama
      queryDuplicate.pokja_id = data.pokja_id;
      queryDuplicate.proker_id = data.proker_id;
      queryDuplicate.mahasiswa_id = data.mahasiswa_id;
      const exists = await Logbook.findOne(queryDuplicate);
      if (exists) {
        return NextResponse.json({ error: "Logbook untuk Program Kerja ini pada tanggal tersebut sudah Anda buat." }, { status: 400 });
      }
    }

    const newLog = await Logbook.create(data);
    return NextResponse.json(newLog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  await dbConnect();
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const { id, status_validasi, catatan_revisi, rencana_target, uraian_kegiatan, hasil_output, kendala_solusi, bukti_link, bukti_kegiatan, keterangan_bukti, ids } = data;
    
    // Bulk Update
    if (ids && Array.isArray(ids) && ids.length > 0) {
      if (session.user.role === 'mahasiswa') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
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
    
    const logbook = await Logbook.findById(id);
    if (!logbook) {
      return NextResponse.json({ error: "Logbook tidak ditemukan." }, { status: 404 });
    }

    // PERBAIKAN 4: Logbook Approved Tidak Bisa Diubah (kontennya)
    const isEditingContent = rencana_target !== undefined || uraian_kegiatan !== undefined || 
                             hasil_output !== undefined || kendala_solusi !== undefined || 
                             bukti_link !== undefined || bukti_kegiatan !== undefined || 
                             keterangan_bukti !== undefined;

    const isApproved = ['divalidasi_mentor', 'divalidasi_dpl', 'selesai'].includes(logbook.status_validasi);

    if (isApproved && isEditingContent) {
      return NextResponse.json({ error: "Logbook yang telah divalidasi tidak dapat diubah." }, { status: 400 });
    }

    // Cegah mahasiswa validasi logbook sendiri atau edit logbook orang lain
    if (session.user.role === 'mahasiswa') {
        if (logbook.mahasiswa_id?.toString() !== session.user.id && logbook.tipe_logbook === 'individu') {
             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    let updateData = {};
    if (status_validasi && session.user.role !== 'mahasiswa') updateData.status_validasi = status_validasi;
    if (catatan_revisi !== undefined && session.user.role !== 'mahasiswa') updateData.catatan_revisi = catatan_revisi;
    if (rencana_target !== undefined) updateData.rencana_target = rencana_target;
    if (uraian_kegiatan !== undefined) updateData.uraian_kegiatan = uraian_kegiatan;
    if (hasil_output !== undefined) updateData.hasil_output = hasil_output;
    if (kendala_solusi !== undefined) updateData.kendala_solusi = kendala_solusi;
    if (bukti_link !== undefined) updateData.bukti_link = bukti_link;
    if (bukti_kegiatan !== undefined) updateData.bukti_kegiatan = bukti_kegiatan;
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

export async function DELETE(req) {
  await dbConnect();
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID Logbook wajib diisi." }, { status: 400 });
    }

    const logbook = await Logbook.findById(id);
    if (!logbook) {
      return NextResponse.json({ error: "Logbook tidak ditemukan." }, { status: 404 });
    }

    // PERBAIKAN 1: Logbook Approved Tidak Bisa Dihapus
    const isApproved = ['divalidasi_mentor', 'divalidasi_dpl', 'selesai'].includes(logbook.status_validasi);
    if (isApproved) {
      return NextResponse.json({ error: "Logbook yang telah divalidasi tidak dapat dihapus." }, { status: 400 });
    }

    // IDOR Prevention: Cegah mahasiswa menghapus logbook orang lain, cegah DPL menghapus logbook
    if (session.user.role === 'mahasiswa') {
        if (logbook.mahasiswa_id?.toString() !== session.user.id && logbook.tipe_logbook === 'individu') {
             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    } else if (session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized: Hanya admin atau mahasiswa pemilik yang dapat menghapus" }, { status: 401 });
    }

    await Logbook.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Logbook berhasil dihapus." });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
