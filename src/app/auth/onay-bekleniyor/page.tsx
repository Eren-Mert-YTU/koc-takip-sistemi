import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onay Bekleniyor",
};

export default function OnayBekleniyorPage() {
  return (
    <main className="auth-bg">
      <div
        className="glass animate-fade-in-up"
        style={{ width: "100%", maxWidth: 440, padding: "3rem 2.5rem", textAlign: "center" }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(245,158,11,0.12)",
            border: "2px solid rgba(245,158,11,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            fontSize: 32,
          }}
        >
          ⏳
        </div>

        <h1
          style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 0.75rem" }}
        >
          Onay Bekleniyor
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            marginBottom: "2rem",
            fontSize: "0.925rem",
          }}
        >
          Koç başvurunuz başarıyla alındı. Yönetici inceleme yaptıktan sonra
          hesabınız aktifleştirilecek ve e-posta ile bilgilendirileceksiniz.
        </p>

        <div
          style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 12,
            padding: "1rem",
            marginBottom: "2rem",
          }}
        >
          <p style={{ fontSize: "0.8rem", color: "#fbbf24", margin: 0 }}>
            Onay süreci genellikle 24 saat içinde tamamlanır.
          </p>
        </div>

        <Link
          href="/auth/giris"
          className="btn-primary"
          style={{ display: "inline-flex", textDecoration: "none", justifyContent: "center", padding: "0.75rem 2rem" }}
        >
          Giriş Sayfasına Dön
        </Link>
      </div>
    </main>
  );
}
