"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function GirisPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata("");
    setYukleniyor(true);

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setYukleniyor(false);

    if (result?.error) {
      if (result.error === "PENDING") {
        router.push("/auth/onay-bekleniyor");
        return;
      }
      setHata(
        result.error === "CredentialsSignin"
          ? "E-posta veya şifre hatalı."
          : result.error
      );
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <main className="auth-bg">
      <div
        className="glass animate-fade-in-up"
        style={{ width: "100%", maxWidth: 420, padding: "2.5rem" }}
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
            Koç Takip
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: 4 }}>
            Hesabınıza giriş yapın
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label
              htmlFor="email"
              style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)" }}
            >
              E-posta Adresi
            </label>
            <input
              id="email"
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
              htmlFor="password"
              style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)" }}
            >
              Şifre
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field"
              required
            />
          </div>

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
            style={{ width: "100%", justifyContent: "center", marginTop: 4, padding: "0.75rem" }}
          >
            {yukleniyor ? (
              <>
                <span className="spinner" />
                Giriş yapılıyor…
              </>
            ) : (
              "Giriş Yap"
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
          Hesabınız yok mu?{" "}
          <Link
            href="/auth/kayit"
            style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}
          >
            Kayıt Ol
          </Link>
        </p>
      </div>
    </main>
  );
}
