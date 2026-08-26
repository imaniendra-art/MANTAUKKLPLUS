import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";

export default async function MahasiswaLayout({ children }) {
  const session = await getServerSession();

  if (!session || !session.user || !["mahasiswa", "admin", "dpl", "mentor"].includes(session.user.role)) {
    redirect("/login");
  }

  return <>{children}</>;
}
