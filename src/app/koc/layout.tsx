import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

const navItems = [
  { href: "/koc/panel", label: "Öğrenci Paneli", icon: "👥" },
];

export default async function KocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "COACH") {
    redirect("/auth/giris");
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        kullaniciAdi={session.user?.name || "Koç"}
        kullaniciEmail={session.user?.email || ""}
        rol="COACH"
        navItems={navItems}
      />
      <main className="main-content">{children}</main>
    </div>
  );
}
