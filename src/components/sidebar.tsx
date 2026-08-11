"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  kullaniciAdi: string;
  kullaniciEmail: string;
  rol: "ADMIN" | "COACH" | "STUDENT";
  navItems: NavItem[];
}

const rolBilgi = {
  ADMIN: { etiket: "Yönetici", renk: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "⚙️" },
  COACH: { etiket: "Koç", renk: "#818cf8", bg: "rgba(99,102,241,0.12)", icon: "🏫" },
  STUDENT: { etiket: "Öğrenci", renk: "#4ade80", bg: "rgba(34,197,94,0.12)", icon: "📚" },
};

export function Sidebar({ kullaniciAdi, kullaniciEmail, rol, navItems }: SidebarProps) {
  const pathname = usePathname();
  const info = rolBilgi[rol];

  const initials = kullaniciAdi
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div
        style={{
          padding: "1.75rem 1.5rem 1.25rem",
          borderBottom: "1px solid var(--border-dim)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            🎓
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-primary)" }}>
              Koç Takip
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              Takip & Yönetim
            </div>
          </div>
        </div>
      </div>

      {/* Kullanıcı bilgisi */}
      <div
        style={{
          padding: "1rem 1.5rem",
          borderBottom: "1px solid var(--border-dim)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div className="avatar" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: "0.85rem",
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {kullaniciAdi}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginTop: 2,
              }}
            >
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  padding: "0.1rem 0.4rem",
                  borderRadius: 99,
                  background: info.bg,
                  color: info.renk,
                  border: `1px solid ${info.renk}30`,
                }}
              >
                {info.icon} {info.etiket}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigasyon */}
      <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map((item) => {
          const aktif = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.625rem 0.875rem",
                borderRadius: 10,
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: aktif ? 600 : 500,
                color: aktif ? "#818cf8" : "var(--text-secondary)",
                background: aktif ? "rgba(99,102,241,0.12)" : "transparent",
                border: aktif ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Çıkış */}
      <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid var(--border-dim)" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/giris" })}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.625rem 0.875rem",
            borderRadius: 10,
            border: "none",
            background: "transparent",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 500,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)";
            (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
          }}
        >
          <span style={{ fontSize: 16 }}>🚪</span>
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
