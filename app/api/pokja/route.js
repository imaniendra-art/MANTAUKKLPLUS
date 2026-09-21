import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pokja from '@/models/Pokja';
import User from '@/models/User';
import MitraKKL from '@/models/MitraKKL';
import { generatePresignedUrl } from '@/lib/minio';
import { getServerSession } from '@/lib/auth';

async function processPokjaUrls(pokjaDoc) {
  if (!pokjaDoc) return pokjaDoc;
  
  // Konversi ke plain object
  const pokja = pokjaDoc.toObject ? pokjaDoc.toObject() : pokjaDoc;
  
  // Proses URL Pokja
  if (pokja.file_surat_pengantar) pokja.file_surat_pengantar = await generatePresignedUrl(pokja.file_surat_pengantar);
  if (pokja.file_surat_balasan) pokja.file_surat_balasan = await generatePresignedUrl(pokja.file_surat_balasan);
  if (pokja.file_surat_tugas) pokja.file_surat_tugas = await generatePresignedUrl(pokja.file_surat_tugas);
  if (pokja.file_surat_selesai) pokja.file_surat_selesai = await generatePresignedUrl(pokja.file_surat_selesai);
  
  // Proses URL Mitra
  if (pokja.mitra_id && typeof pokja.mitra_id === 'object') {
    if (pokja.mitra_id.foto_kantor_desa) pokja.mitra_id.foto_kantor_desa = await generatePresignedUrl(pokja.mitra_id.foto_kantor_desa);
    if (pokja.mitra_id.foto_kantor_bumdes) pokja.mitra_id.foto_kantor_bumdes = await generatePresignedUrl(pokja.mitra_id.foto_kantor_bumdes);
    if (pokja.mitra_id.logo_mitra) pokja.mitra_id.logo_mitra = await generatePresignedUrl(pokja.mitra_id.logo_mitra);
    if (pokja.mitra_id.file_mou) pokja.mitra_id.file_mou = await generatePresignedUrl(pokja.mitra_id.file_mou);
    if (pokja.mitra_id.file_moa) pokja.mitra_id.file_moa = await generatePresignedUrl(pokja.mitra_id.file_moa);
    if (pokja.mitra_id.file_ia) pokja.mitra_id.file_ia = await generatePresignedUrl(pokja.mitra_id.file_ia);
  }
  
  return pokja;
}

export async function POST(req) {
  await dbConnect();
  try {
    const payload = await req.json();
    const { ketua_id, nama_pokja, anggota_ids, mitra_id } = payload;

    if (!ketua_id) {
      return NextResponse.json({ error: "Ketua ID wajib diisi" }, { status: 400 });
    }

    // Susun anggota
    let anggota = [];
    if (anggota_ids && Array.isArray(anggota_ids)) {
      anggota = anggota_ids.map(id => ({ user_id: id, status_undangan: 'menunggu' }));
    }
    
    // Ketua sudah ada di ketua_id, tidak perlu dimasukkan ke dalam array anggota

    // Get active periode
    const SystemSettings = (await import('@/models/SystemSettings')).default;
    const settings = await SystemSettings.findOne({});
    const activePeriode = settings?.periode_aktif || "Ganjil 2026/2027";

    const existingPokja = await Pokja.findOne({
      periode: activePeriode,
      $or: [
        { ketua_id },
        { anggota: { $elemMatch: { user_id: ketua_id, status_undangan: 'bergabung' } } }
      ]
    });

    if (existingPokja) {
      return NextResponse.json({ error: "Anda sudah memiliki Pokja atau tergabung dalam Pokja lain pada periode ini" }, { status: 400 });
    }

    const pokja = await Pokja.create({
      nama_pokja: nama_pokja || 'Pokja Baru',
      ketua_id,
      anggota,
      mitra_id: mitra_id || null,
      status_pokja: 'menunggu_persetujuan_admin',
      periode: activePeriode
    });
    
    return NextResponse.json(pokja, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const mhsId = searchParams.get('mhsId');
    const isAdmin = searchParams.get('admin');
    const pokjaId = searchParams.get('pokjaId');
    const dplId = searchParams.get('dplId');
    
    if (pokjaId) {
      let pokja = await Pokja.findById(pokjaId)
        .populate({ path: 'ketua_id', select: 'nama_lengkap nim_nidn program_studi konsentrasi' })
        .populate({ path: 'anggota.user_id', select: 'nama_lengkap nim_nidn program_studi konsentrasi' })
        .populate({ path: 'dpl_id', select: 'nama_lengkap nomor_hp nim_nidn nidn' })
        .populate({ path: 'mentor_id', select: 'nama_lengkap nomor_hp jabatan instansi' })
        .populate('mitra_id');
        
      if (!pokja) {
        pokja = await Pokja.findOne({
          $or: [
            { ketua_id: pokjaId },
            { 'anggota.user_id': pokjaId }
          ]
        })
        .populate({ path: 'ketua_id', select: 'nama_lengkap nim_nidn program_studi konsentrasi' })
        .populate({ path: 'anggota.user_id', select: 'nama_lengkap nim_nidn program_studi konsentrasi' })
        .populate({ path: 'dpl_id', select: 'nama_lengkap nomor_hp nim_nidn nidn' })
        .populate({ path: 'mentor_id', select: 'nama_lengkap nomor_hp jabatan instansi' })
        .populate('mitra_id');
      }

      if (pokja) {
        const processed = await processPokjaUrls(pokja);
        return NextResponse.json(processed);
      }
      return NextResponse.json(null);
    }
    
    if (isAdmin === 'true') {
      const status = searchParams.get('status');
      
      const SystemSettings = (await import('@/models/SystemSettings')).default;
      const settings = await SystemSettings.findOne({});
      const activePeriode = settings?.periode_aktif || "Ganjil 2026/2027";

      const query = { periode: activePeriode };
      if (status && status !== 'all') {
        const statusArray = status.includes(',') ? status.split(',') : [status];
        query.status_pokja = { $in: statusArray };
      }

      const pokjas = await Pokja.find(query)
        .populate({ path: 'ketua_id', select: 'nama_lengkap nim_nidn program_studi konsentrasi nomor_hp email' })
        .populate({ path: 'anggota.user_id', select: 'nama_lengkap nim_nidn program_studi konsentrasi nomor_hp email' })
        .populate({ path: 'dpl_id', select: 'nama_lengkap nomor_hp email nidn' })
        .populate({ path: 'mentor_id', select: 'nama_lengkap nomor_hp email nidn lokasi devisi' })
        .populate({ path: 'mitra_id', select: 'nama_instansi alamat_lengkap kecamatan kabupaten_kota kategori kuota_maksimal' })
        .sort({ createdAt: -1 });
        
      const processed = await Promise.all(pokjas.map(p => processPokjaUrls(p)));
      return NextResponse.json(processed);
    }
    
    if (mhsId) {
      // Cari pokja dimana mahasiswa ini menjadi ketua atau anggota aktif/menunggu
      const pokja = await Pokja.findOne({
        $or: [
          { ketua_id: mhsId },
          { anggota: { $elemMatch: { user_id: mhsId, status_undangan: { $in: ['menunggu', 'bergabung'] } } } }
        ]
      })
      .populate({ path: 'ketua_id', select: 'nama_lengkap nim_nidn program_studi konsentrasi' })
      .populate({ path: 'anggota.user_id', select: 'nama_lengkap nim_nidn program_studi konsentrasi' })
      .populate({ path: 'dpl_id', select: 'nama_lengkap nomor_hp nim_nidn nidn' })
      .populate({ path: 'mentor_id', select: 'nama_lengkap nomor_hp jabatan instansi' })
      .populate('mitra_id')
      .sort({ updatedAt: -1, createdAt: -1 });
      
      if (pokja) {
        const processed = await processPokjaUrls(pokja);
        return NextResponse.json(processed);
      }
      return NextResponse.json(null);
    }
    
    if (dplId) {
      const SystemSettings = (await import('@/models/SystemSettings')).default;
      const settings = await SystemSettings.findOne({});
      const activePeriode = settings?.periode_aktif || "Ganjil 2026/2027";

      const pokjas = await Pokja.find({ 
        dpl_id: dplId,
        periode: activePeriode 
      })
        .populate({ path: 'ketua_id', select: 'nama_lengkap nim_nidn' })
        .populate('mitra_id')
        .populate({ path: 'mentor_id', select: 'nama_lengkap nomor_hp' })
        .sort({ createdAt: -1 });
        
      const processed = await Promise.all(pokjas.map(p => processPokjaUrls(p)));
      return NextResponse.json(processed);
    }
    
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  await dbConnect();
  try {
    const session = await getServerSession();
    const data = await req.json();
    const { id, dpl_id, mentor_id, status_pokja, catatan_admin, action, mhs_id, mitra_id } = data;
    
    if (!id) return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });

    // Handle remove member (Keluar mandiri / Kick oleh Ketua / Hapus oleh Admin)
    if (action === 'remove_member' && data.member_id) {
      const targetPokja = await Pokja.findById(id);
      if (!targetPokja) return NextResponse.json({ error: "Kelompok tidak ditemukan" }, { status: 404 });

      const isAdmin = session?.user?.role === 'admin';
      const isKetua = targetPokja.ketua_id?.toString() === session?.user?.id?.toString();
      const isSelf = data.member_id.toString() === session?.user?.id?.toString();

      if (!isAdmin && !isKetua && !isSelf) {
        return NextResponse.json({ error: "Anda tidak memiliki wewenang untuk aksi ini" }, { status: 403 });
      }

      if (targetPokja.ketua_id?.toString() === data.member_id.toString()) {
        return NextResponse.json({ 
          error: "Ketua kelompok tidak dapat dikeluarkan melalui aksi ini. Silakan alihkan jabatan ketua terlebih dahulu atau batalkan kelompok." 
        }, { status: 400 });
      }

      if (!isAdmin) {
        const allowedStatuses = ['draft', 'menunggu_persetujuan_admin'];
        if (!allowedStatuses.includes(targetPokja.status_pokja)) {
          return NextResponse.json({ 
            error: "Anggota hanya dapat dikeluarkan saat kelompok berstatus Draft atau Menunggu Persetujuan. Silakan hubungi Admin." 
          }, { status: 400 });
        }
      }

      const updated = await Pokja.findByIdAndUpdate(
        id,
        { $pull: { anggota: { user_id: data.member_id } } },
        { new: true }
      )
        .populate({ path: 'ketua_id', select: 'nama_lengkap nim_nidn program_studi konsentrasi' })
        .populate({ path: 'anggota.user_id', select: 'nama_lengkap nim_nidn program_studi konsentrasi' });

      return NextResponse.json({ success: true, message: "Anggota berhasil dikeluarkan", pokja: updated });
    }

    // Handle transfer ketua (Ganti Ketua Pokja)
    if (action === 'transfer_ketua' && data.new_ketua_id) {
      const targetPokja = await Pokja.findById(id);
      if (!targetPokja) return NextResponse.json({ error: "Kelompok tidak ditemukan" }, { status: 404 });

      const isAdmin = session?.user?.role === 'admin';
      const isKetua = targetPokja.ketua_id?.toString() === session?.user?.id?.toString();

      if (!isAdmin && !isKetua) {
        return NextResponse.json({ error: "Hanya Ketua saat ini atau Admin yang berhak mengalihkan jabatan ketua" }, { status: 403 });
      }

      if (!isAdmin) {
        const allowedStatuses = ['draft', 'menunggu_persetujuan_admin'];
        if (!allowedStatuses.includes(targetPokja.status_pokja)) {
          return NextResponse.json({ 
            error: "Alih jabatan ketua oleh mahasiswa hanya dapat dilakukan saat kelompok berstatus Draft atau Menunggu Persetujuan. Silakan hubungi Admin." 
          }, { status: 400 });
        }
      }

      const newKetuaIdStr = data.new_ketua_id.toString();
      const oldKetuaId = targetPokja.ketua_id;

      if (newKetuaIdStr === oldKetuaId?.toString()) {
        return NextResponse.json({ error: "Mahasiswa tersebut sudah menjadi ketua kelompok" }, { status: 400 });
      }

      const memberIndex = targetPokja.anggota.findIndex(a => a.user_id?.toString() === newKetuaIdStr);
      if (memberIndex === -1) {
        return NextResponse.json({ error: "Calon ketua baru harus merupakan anggota kelompok ini" }, { status: 400 });
      }

      // Ambil objek anggota ketua baru sebelum dihapus dari array
      const existingMemberData = targetPokja.anggota[memberIndex];
      targetPokja.anggota.splice(memberIndex, 1);

      // Tambahkan ketua lama ke dalam array anggota jika belum ada
      const isOldKetuaInAnggota = targetPokja.anggota.some(a => a.user_id?.toString() === oldKetuaId?.toString());
      if (!isOldKetuaInAnggota && oldKetuaId) {
        targetPokja.anggota.unshift({
          user_id: oldKetuaId,
          status_undangan: 'bergabung',
          nilai_rekomendasi_sistem: 0,
          nilai_akhir_mutlak: 0,
          catatan_evaluasi: ''
        });
      }

      targetPokja.ketua_id = data.new_ketua_id;
      await targetPokja.save();

      const updated = await Pokja.findById(id)
        .populate({ path: 'ketua_id', select: 'nama_lengkap nim_nidn program_studi konsentrasi' })
        .populate({ path: 'anggota.user_id', select: 'nama_lengkap nim_nidn program_studi konsentrasi' });

      return NextResponse.json({ success: true, message: "Jabatan ketua berhasil dialihkan", pokja: updated });
    }

    // Handle rename
    if (action === 'rename' && data.nama_pokja) {
      const updated = await Pokja.findByIdAndUpdate(
        id,
        { $set: { nama_pokja: data.nama_pokja } },
        { new: true }
      );
      return NextResponse.json(updated);
    }

    // Handle invite response (anggota accept/reject)
    if (action === 'respond_invite' && mhs_id && status_pokja) {
      const updated = await Pokja.findOneAndUpdate(
        { _id: id, 'anggota.user_id': mhs_id },
        { $set: { 'anggota.$.status_undangan': status_pokja } },
        { new: true }
      );
      return NextResponse.json(updated);
    }
    
    // Handle link join
    if (action === 'join_by_link' && mhs_id) {
      const targetPokja = await Pokja.findById(id).populate('mitra_id');
      if (!targetPokja) return NextResponse.json({ error: "Kelompok tidak ditemukan" }, { status: 404 });

      if (!targetPokja.mitra_id) {
        return NextResponse.json({ error: "Ketua Pokja belum memilih instansi/mitra. Pendaftaran anggota belum bisa dilakukan." }, { status: 400 });
      }
      
      if (targetPokja.ketua_id.toString() === mhs_id.toString()) {
        return NextResponse.json({ error: "Ketua tidak dapat menjadi anggota di Pokjanya sendiri" }, { status: 400 });
      }

      const existingPokja = await Pokja.findOne({
        periode: targetPokja.periode,
        $or: [
          { ketua_id: mhs_id },
          { anggota: { $elemMatch: { user_id: mhs_id, status_undangan: 'bergabung' } } }
        ]
      });

      if (existingPokja) {
        return NextResponse.json({ error: "Anda sudah memiliki Pokja atau tergabung dalam Pokja lain" }, { status: 400 });
      }

      const kuotaMaksimal = targetPokja.mitra_id.kuota_maksimal || 5;
      if (targetPokja.anggota.length + 1 >= kuotaMaksimal) {
        return NextResponse.json({ error: `Kelompok sudah penuh (maksimal ${kuotaMaksimal} orang termasuk ketua untuk instansi ini)` }, { status: 400 });
      }
      
      const isAlreadyMember = targetPokja.anggota.find(a => a.user_id.toString() === mhs_id.toString());
      if (!isAlreadyMember) {
        targetPokja.anggota.push({
          user_id: mhs_id,
          status_undangan: 'bergabung',
        });
        await targetPokja.save();
      }
      
      return NextResponse.json({ success: true, pokja: targetPokja });
    }

    // Handle Admin actions / Location Application
    if (mitra_id && status_pokja === 'menunggu_persetujuan_admin') {
      // Validasi minimal anggota dihapus untuk mendukung alur pilih instansi dulu
    }

    const updatePayload = {};
    if (status_pokja) updatePayload.status_pokja = status_pokja;
    if (dpl_id) updatePayload.dpl_id = dpl_id;
    if (catatan_admin) updatePayload.catatan_admin = catatan_admin;
    if (mitra_id) updatePayload.mitra_id = mitra_id;
    if (mentor_id !== undefined) updatePayload.mentor_id = mentor_id;

    const updated = await Pokja.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true, strict: false }
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
    if (!session?.user) {
      return NextResponse.json({ error: "Sesi tidak valid atau telah berakhir" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });

    const targetPokja = await Pokja.findById(id);
    if (!targetPokja) {
      return NextResponse.json({ error: "POKJA tidak ditemukan" }, { status: 404 });
    }

    const isAdmin = session.user.role === 'admin';
    const isKetua = targetPokja.ketua_id?.toString() === session.user.id?.toString();

    if (!isAdmin && !isKetua) {
      return NextResponse.json({ error: "Hanya Ketua Pokja atau Admin yang dapat membatalkan/menghapus kelompok ini" }, { status: 403 });
    }

    // Jika yang menghapus adalah Ketua Mahasiswa (bukan Admin), batasi hanya pada status awal
    if (isKetua && !isAdmin) {
      const allowedStatuses = ['draft', 'menunggu_persetujuan_admin'];
      if (!allowedStatuses.includes(targetPokja.status_pokja)) {
        return NextResponse.json({ 
          error: "Kelompok yang telah disetujui atau sedang berjalan tidak dapat dibubarkan secara mandiri. Silakan hubungi Admin." 
        }, { status: 400 });
      }
    }

    const deleted = await Pokja.findByIdAndDelete(id);

    // Hapus data terkait agar tidak menjadi sampah (orphaned data)
    try {
      const Proker = (await import('@/models/Proker')).default;
      const LaporanAkhir = (await import('@/models/LaporanAkhir')).default;
      const Penilaian = (await import('@/models/Penilaian')).default;
      const Logbook = (await import('@/models/Logbook')).default;
      
      await Promise.all([
        Proker.deleteMany({ pokja_id: id }),
        LaporanAkhir.deleteMany({ pokja_id: id }),
        Penilaian.deleteMany({ pokja_id: id }),
        Logbook.deleteMany({ pokja_id: id })
      ]);
    } catch (cleanupError) {
      console.warn("Gagal membersihkan sebagian data terkait pokja:", cleanupError);
      // Tetap lanjutkan karena pokja utamanya sudah terhapus
    }

    return NextResponse.json({ message: "POKJA & Data Terkait berhasil dihapus" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

