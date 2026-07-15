import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";

export default async function DplLayout({ children }) {
  const session = await getServerSession();

  if (!session || !session.user || (session.user.role !== "dpl" && session.user.role !== "admin")) {
    redirect("/login");
  }

  return <>{children}</>;
}
