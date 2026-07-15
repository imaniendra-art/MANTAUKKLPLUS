import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "mantau_kkl_plus_fallback_secret_key_123!";

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Retrieves the current user session from the JWT token in cookies.
 * @returns {Promise<Object|null>} The session object containing `user`, or null if not authenticated.
 */
export async function getServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  // Session structure
  return {
    user: {
      id: decoded.id,
      email: decoded.email,
      nama_lengkap: decoded.nama_lengkap,
      nim_nidn: decoded.nim_nidn,
      nidn: decoded.nidn,
      role: decoded.role,
      isFirstLogin: decoded.isFirstLogin,
      konsentrasi: decoded.konsentrasi,
      program_studi: decoded.program_studi,
    },
  };
}
