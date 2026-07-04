import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

import Pokja from '@/models/Pokja';

export async function GET(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
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
      users = await Promise.all(users.map(async (mhs) => {
        let pokja = await Pokja.findOne({ ketua_id: mhs._id }).lean();
        let jabatan = mhs.kegiatan || '-';
        let namaPokja = mhs.konsentrasi || '-';
        
        if (pokja) {
          jabatan = 'Ketua';
          namaPokja = pokja.nama_pokja || '-';
        } else {
          // Cari sebagai anggota
          pokja = await Pokja.findOne({ "anggota.mhs_id": mhs._id, "anggota.status_undangan": "bergabung" }).lean();
          if (pokja) {
            jabatan = 'Anggota';
            namaPokja = pokja.nama_pokja || '-';
          }
        }
        
        return { ...mhs, konsentrasi: namaPokja, kegiatan: jabatan };
      }));
    } else if (role === 'dpl') {
      users = await Promise.all(users.map(async (dpl) => {
        const pokjas = await Pokja.find({ 
          dpl_id: dpl._id, 
          status_pokja: { $in: ['disetujui_lppm', 'berjalan', 'selesai'] }
        }).populate('ketua_id', 'program_studi kegiatan').lean();
        
        const prodis = [...new Set(pokjas.map(p => p.ketua_id?.program_studi).filter(Boolean))].join(', ');
        const kegiatans = [...new Set(pokjas.map(p => p.ketua_id?.kegiatan).filter(Boolean))].join(', ');
        
        return { ...dpl, program_studi: prodis, kegiatan: kegiatans };
      }));
    } else if (role === 'mentor') {
      users = await Promise.all(users.map(async (mentor) => {
        const pokjas = await Pokja.find({ 
          mentor_id: mentor._id 
        }).populate('mitra_id').lean();
        
        const lokasis = [...new Set(pokjas.map(p => p.mitra_id?.nama_instansi).filter(Boolean))].join(', ');
        
        return { ...mentor, lokasi: lokasis, devisi: "KKL Plus" };
      }));
    }
    
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const data = await req.json();
    const { nim_nidn, nidn, nama_lengkap, nomor_hp, role } = data;

    if (!nim_nidn || !nama_lengkap || !nomor_hp) {
      return NextResponse.json({ error: "NIM/ID, Nama Lengkap, dan Nomor HP wajib diisi" }, { status: 400 });
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
    const data = await req.json();
    const { id, action, ...updateData } = data;

    if (!id) return NextResponse.json({ error: "ID pengguna diperlukan" }, { status: 400 });

    if (action === 'reset_password') {
      const user = await User.findById(id);
      if (!user) return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
      
      const salt = await bcrypt.genSalt(10);
      const defaultPassword = user.role === 'mentor' ? user.nomor_hp : user.nim_nidn;
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);
      
      user.password = hashedPassword;
      user.isFirstLogin = true; 
      await user.save();
      
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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "ID pengguna diperlukan" }, { status: 400 });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ message: "Pengguna berhasil dihapus" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
