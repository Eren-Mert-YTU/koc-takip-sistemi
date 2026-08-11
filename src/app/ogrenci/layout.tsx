import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

const navItems = [
  { href: "/ogrenci/panel", label: "Panelim", icon: "🏠" },
];

export default async function OgrenciLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "STUDENT") {
    redirect("/auth/giris");
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        kullaniciAdi={session.user?.name || "Öğrenci"}
        kullaniciEmail={session.user?.email || ""}
        rol="STUDENT"
        navItems={navItems}
      />
      <main className="main-content">{children}</main>
    </div>
  );
}
