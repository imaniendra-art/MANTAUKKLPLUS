import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import Pokja from '@/models/Pokja';
import { getServerSession } from '@/lib/auth';

export async function GET(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    
    if (searchParams.get('counts') === 'true') {
      const [mhsCount, dplCount, adminCount, mentorCount] = await Promise.all([
        User.countDocuments({ role: 'mahasiswa' }),
        User.countDocuments({ role: 'dpl' }),
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({ role: 'mentor' })
      ]);
      return NextResponse.json({
        mahasiswa: mhsCount,
        dpl: dplCount,
        admin: adminCount,
        mentor: mentorCount
      });
    }

    const role = searchParams.get('role') || 'mahasiswa';
    
    // Auto-sync: Fix old data missing isFirstLogin
    if (role === 'mahasiswa') {
      await User.updateMany(
        { role: 'mahasiswa', isFirstLogin: { $exists: false } },
        { $set: { isFirstLogin: true } }
      );
    }
    
    let users = await User.find({ role }).sort({ createdAt: -1 }).lean();
    
    if (role === 'mahasiswa') {
      const pokjas = await Pokja.find({}).lean();
      const ketuaMap = new Map();
      const anggotaMap = new Map();

      for (const p of pokjas) {
        if (p.ketua_id) {
          ketuaMap.set(p.ketua_id.toString(), p.nama_pokja || '-');
        }
        if (Array.isArray(p.anggota)) {
          for (const a of p.anggota) {
            if (a.user_id && a.status_undangan === 'bergabung') {
              anggotaMap.set(a.user_id.toString(), p.nama_pokja || '-');
            }
          }
        }
      }

      users = users.map((mhs) => {
        const mhsIdStr = mhs._id.toString();
        let jabatan = mhs.kegiatan || '-';
        let namaPokja = '-';

        if (ketuaMap.has(mhsIdStr)) {
          jabatan = 'Ketua';
          namaPokja = ketuaMap.get(mhsIdStr);
        } else if (anggotaMap.has(mhsIdStr)) {
          jabatan = 'Anggota';
          namaPokja = anggotaMap.get(mhsIdStr);
        }

        return { ...mhs, nama_pokja: namaPokja, kegiatan: jabatan };
      });
    } else if (role === 'dpl') {
      const pokjas = await Pokja.find({ 
        status_pokja: { $in: ['disetujui_admin', 'berjalan', 'selesai'] }
      }).populate('ketua_id', 'program_studi kegiatan').lean();

      const dplPokjaMap = new Map();
      for (const p of pokjas) {
        if (p.dpl_id) {
          const dplIdStr = p.dpl_id.toString();
          if (!dplPokjaMap.has(dplIdStr)) {
            dplPokjaMap.set(dplIdStr, []);
          }
          dplPokjaMap.get(dplIdStr).push(p);
        }
      }

      users = users.map((dpl) => {
        const dplPokjas = dplPokjaMap.get(dpl._id.toString()) || [];
        const prodis = [...new Set(dplPokjas.map(p => p.ketua_id?.program_studi).filter(Boolean))].join(', ');
        const kegiatans = [...new Set(dplPokjas.map(p => p.ketua_id?.kegiatan).filter(Boolean))].join(', ');

        return { ...dpl, program_studi: prodis, kegiatan: kegiatans };
      });
    } else if (role === 'mentor') {
      const pokjas = await Pokja.find({}).populate('mitra_id').lean();
      const mentorPokjaMap = new Map();
      for (const p of pokjas) {
        if (p.mentor_id) {
          const mentorIdStr = p.mentor_id.toString();
          if (!mentorPokjaMap.has(mentorIdStr)) {
            mentorPokjaMap.set(mentorIdStr, []);
          }
          mentorPokjaMap.get(mentorIdStr).push(p);
        }
      }

      users = users.map((mentor) => {
        const mentorPokjas = mentorPokjaMap.get(mentor._id.toString()) || [];
        const lokasis = [...new Set(mentorPokjas.map(p => p.mitra_id?.nama_instansi).filter(Boolean))].join(', ');

        return { ...mentor, lokasi: lokasis, devisi: "KKL Plus" };
      });
    }
    
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const session = await getServerSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return NextResponse.json({ error: "Akun admin Anda tidak ditemukan" }, { status: 401 });
    }

    const data = await req.json();
    const { nim_nidn, nidn, nama_lengkap, nomor_hp, role } = data;

    if (!nim_nidn || !nama_lengkap || !nomor_hp) {
      return NextResponse.json({ error: "NIM/ID, Nama Lengkap, dan Nomor HP wajib diisi" }, { status: 400 });
    }

    if (data.tipe_admin === 'superadmin' && currentUser.tipe_admin !== 'superadmin') {
      return NextResponse.json({ error: "Akses ditolak. Hanya Superadmin yang dapat membuat akun Superadmin baru." }, { status: 403 });
    }

    const existingUser = await User.findOne({ nim_nidn });

    if (existingUser) {
      return NextResponse.json({ error: "NIM/ID sudah terdaftar" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = role === 'mentor' ? nomor_hp : nim_nidn;
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const newUser = await User.create({
      nama_lengkap,
      nim_nidn,
      nidn,
      nomor_hp,
      email: data.email || `${nim_nidn}@mantau.local`, // Use provided email or fallback
      password: hashedPassword,
      role: role || 'dpl',
      tipe_admin: data.tipe_admin || undefined,
      isFirstLogin: true,
    });

    return NextResponse.json({ message: "Pengguna berhasil ditambahkan", user: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  await dbConnect();
  try {
    const session = await getServerSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return NextResponse.json({ error: "Akun admin Anda tidak ditemukan" }, { status: 401 });
    }

    const data = await req.json();
    const { id, action, ...updateData } = data;

    if (!id) return NextResponse.json({ error: "ID pengguna diperlukan" }, { status: 400 });

    const targetUser = await User.findById(id);
    if (!targetUser) return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });

    // Proteksi Superadmin
    if (targetUser.role === 'admin' && targetUser.tipe_admin === 'superadmin' && currentUser.tipe_admin !== 'superadmin') {
      return NextResponse.json({ error: "Akses ditolak. Hanya Superadmin yang dapat mengubah data akun Superadmin." }, { status: 403 });
    }

    if (updateData.tipe_admin === 'superadmin' && currentUser.tipe_admin !== 'superadmin') {
      return NextResponse.json({ error: "Akses ditolak. Anda tidak memiliki izin untuk menetapkan hak akses Superadmin." }, { status: 403 });
    }

    if (action === 'reset_password') {
      const salt = await bcrypt.genSalt(10);
      const defaultPassword = targetUser.role === 'mentor' ? targetUser.nomor_hp : targetUser.nim_nidn;
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);
      
      targetUser.password = hashedPassword;
      targetUser.isFirstLogin = true; 
      await targetUser.save();
      
      return NextResponse.json({ message: "Password berhasil direset ke Nomor HP/ID" });
    } else {
      const updatedUser = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true });
      if (!updatedUser) return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
      return NextResponse.json({ message: "Data berhasil diperbarui", user: updatedUser });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  await dbConnect();
  try {
    const session = await getServerSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "ID pengguna diperlukan" }, { status: 400 });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return NextResponse.json({ error: "Akun admin Anda tidak ditemukan" }, { status: 401 });
    }

    // Tidak boleh menghapus akun sendiri
    if (targetUser._id.toString() === currentUser._id.toString()) {
      return NextResponse.json({ error: "Anda tidak dapat menghapus akun Anda sendiri" }, { status: 400 });
    }

    // HANYA SESAMA SUPERADMIN YANG BISA MENGHAPUS SUPERADMIN
    if (targetUser.role === 'admin' && targetUser.tipe_admin === 'superadmin') {
      if (currentUser.tipe_admin !== 'superadmin') {
        return NextResponse.json({ 
          error: "Akses ditolak. Admin LPPM/Prodi tidak memiliki izin untuk menghapus akun Superadmin. Hanya sesama Superadmin yang dapat menghapusnya." 
        }, { status: 403 });
      }
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: "Pengguna berhasil dihapus" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
