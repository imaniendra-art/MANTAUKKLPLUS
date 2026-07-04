import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email / NIM / Username", type: "text", placeholder: "Email, NIM, atau Username" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email/NIM dan password wajib diisi');
        }

        await connectToDatabase();
        
        const identifier = credentials.email.trim();
        const query = {
          $or: [
            { nim_nidn: identifier },
            { email: identifier },
            { nidn: identifier },
            { nomor_hp: identifier }
          ]
        };
        
        const user = await User.findOne(query);
        if (!user) {
          throw new Error('Akun tidak terdaftar');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Password salah');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          nama_lengkap: user.nama_lengkap,
          nim_nidn: user.nim_nidn,
          nidn: user.nidn,
          role: user.role,
          isFirstLogin: user.isFirstLogin,
          konsentrasi: user.konsentrasi || "Manajemen SDM (Default)", // Fallback SIAM
          program_studi: user.program_studi || "Manajemen (S1)",
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.nama_lengkap = user.nama_lengkap;
        token.nim_nidn = user.nim_nidn;
        token.nidn = user.nidn;
        token.isFirstLogin = user.isFirstLogin;
        token.konsentrasi = user.konsentrasi;
        token.program_studi = user.program_studi;
      }

      // Validasi real-time: Cek apakah user masih ada di database
      if (token?.id) {
        try {
          await connectToDatabase();
          const existingUser = await User.findById(token.id).lean();
          
          if (!existingUser) {
            // User sudah dihapus, tandai token tidak valid
            token.error = "UserDeleted";
            return token;
          }

          // Opsional: Perbarui data token dengan data terbaru di database
          token.role = existingUser.role;
          token.nama_lengkap = existingUser.nama_lengkap;
          token.nim_nidn = existingUser.nim_nidn;
          token.nidn = existingUser.nidn;
          token.isFirstLogin = existingUser.isFirstLogin;
          token.konsentrasi = existingUser.konsentrasi || token.konsentrasi;
          token.program_studi = existingUser.program_studi || token.program_studi;
        } catch (error) {
          console.error("Error validasi session:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Jika token ditandai sudah dihapus, kita set session error
      if (token?.error === "UserDeleted") {
        session.error = "UserDeleted";
        session.user = null;
        return session;
      }

      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.nama_lengkap = token.nama_lengkap;
        session.user.nim_nidn = token.nim_nidn;
        session.user.nidn = token.nidn;
        session.user.isFirstLogin = token.isFirstLogin;
        session.user.konsentrasi = token.konsentrasi;
        session.user.program_studi = token.program_studi;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
