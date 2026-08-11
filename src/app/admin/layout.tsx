import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

const navItems = [
  { href: "/admin/panel", label: "Koç Başvuruları", icon: "👥" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/auth/giris");
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        kullaniciAdi={session.user?.name || "Yönetici"}
        kullaniciEmail={session.user?.email || ""}
        rol="ADMIN"
        navItems={navItems}
      />
      <main className="main-content">{children}</main>
    </div>
  );
}
