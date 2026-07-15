import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";

export default async function MahasiswaLayout({ children }) {
  const session = await getServerSession();

  if (!session || !session.user || (session.user.role !== "mahasiswa" && session.user.role !== "admin")) {
    redirect("/login");
  }

  return <>{children}</>;
}
