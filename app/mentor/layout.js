import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";

export default async function MentorLayout({ children }) {
  const session = await getServerSession();

  if (!session || !session.user || session.user.role !== "mentor") {
    redirect("/login");
  }

  return <>{children}</>;
}
