"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Rol = "COACH" | "STUDENT";

export default function KayitPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    rol: "STUDENT" as Rol,
  });
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata("");

    if (form.password.length < 6) {
      setHata("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setYukleniyor(true);

    const res = await fetch("/api/kayit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.rol,
      }),
    });

    const data = await res.json();
    setYukleniyor(false);

    if (!res.ok) {
      setHata(data.error || "Bir hata oluştu.");
      return;
    }

    if (form.rol === "COACH") {
      router.push("/auth/onay-bekleniyor");
    } else {
      router.push("/auth/giris?kayit=basarili");
    }
  };

  return (
    <main className="auth-bg">
      <div
        className="glass animate-fade-in-up"
        style={{ width: "100%", maxWidth: 440, padding: "2.5rem" }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              fontSize: 24,
            }}
          >
            🎓
          </div>
          <h1
            className="gradient-text"
            style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0 }}
          >
            Hesap Oluştur
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: 4 }}>
            Platforma katılın
          </p>
        </div>

        {/* Rol Seçici */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
            marginBottom: "1.25rem",
          }}
        >
          {(["STUDENT", "COACH"] as Rol[]).map((rol) => (
            <button
              key={rol}
              type="button"
              onClick={() => setForm({ ...form, rol })}
              style={{
                padding: "0.875rem",
                borderRadius: 12,
                border: `2px solid ${form.rol === rol ? "var(--accent)" : "var(--border-dim)"}`,
                background:
                  form.rol === rol
                    ? "rgba(99,102,241,0.12)"
                    : "rgba(15,23,42,0.4)",
                color: form.rol === rol ? "#818cf8" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ fontSize: 22 }}>{rol === "STUDENT" ? "📚" : "🏫"}</span>
              <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>
                {rol === "STUDENT" ? "Öğrenci" : "Koç"}
              </span>
              <span style={{ fontSize: "0.7rem", opacity: 0.75 }}>
                {rol === "STUDENT" ? "Hemen aktif" : "Onay gerektirir"}
              </span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div>
            <label
              htmlFor="name"
              style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)" }}
            >
              Ad Soyad
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Adınız Soyadınız"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              required
              minLength={2}
            />
          </div>

          <div>
            <label
              htmlFor="reg-email"
              style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)" }}
            >
              E-posta Adresi
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="ornek@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label
              htmlFor="reg-password"
              style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)" }}
            >
              Şifre
            </label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              placeholder="En az 6 karakter"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field"
              required
              minLength={6}
            />
          </div>

          {form.rol === "COACH" && (
            <div
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.25)",
                borderRadius: 10,
                padding: "0.75rem 1rem",
                fontSize: "0.8rem",
                color: "#fbbf24",
              }}
            >
              ⏳ Koç başvuruları yönetici onayı gerektirir. Başvurunuz incelendikten sonra bilgilendirileceksiniz.
            </div>
          )}

          {hata && (
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 10,
                padding: "0.75rem 1rem",
                color: "#f87171",
                fontSize: "0.85rem",
              }}
            >
              ⚠ {hata}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={yukleniyor}
            style={{ width: "100%", justifyContent: "center", padding: "0.75rem", marginTop: 4 }}
          >
            {yukleniyor ? (
              <>
                <span className="spinner" />
                Kaydediliyor…
              </>
            ) : (
              form.rol === "COACH" ? "Koç Başvurusu Gönder" : "Kayıt Ol"
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            fontSize: "0.875rem",
            color: "var(--text-muted)",
          }}
        >
          Zaten hesabınız var mı?{" "}
          <Link
            href="/auth/giris"
            style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}
          >
            Giriş Yap
          </Link>
        </p>
      </div>
    </main>
  );
}
