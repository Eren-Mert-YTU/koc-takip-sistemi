import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/giris");
  }

  const role = (session.user as any).role;

  if (role === "ADMIN") redirect("/admin/panel");
  if (role === "COACH") redirect("/koc/panel");
  if (role === "STUDENT") redirect("/ogrenci/panel");

  redirect("/auth/giris");
}
