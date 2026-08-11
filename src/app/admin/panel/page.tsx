"use client";

import { useEffect, useState } from "react";

interface Koc {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function AdminPanelPage() {
  const [bekleyenler, setBekleyenler] = useState<Koc[]>([]);
  const [onaylananlar, setOnaylananlar] = useState<Koc[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [islemYapiliyor, setIslemYapiliyor] = useState<string | null>(null);
  const [mesaj, setMesaj] = useState<{ tip: "ok" | "hata"; metin: string } | null>(null);

  const veriGetir = async () => {
    setYukleniyor(true);
    const res = await fetch("/api/admin/kocler");
    if (res.ok) {
      const data = await res.json();
      setBekleyenler(data.bekleyenler || []);
      setOnaylananlar(data.onaylananlar || []);
    }
    setYukleniyor(false);
  };

  useEffect(() => { veriGetir(); }, []);

  const islemYap = async (kocId: string, islem: "onayla" | "reddet") => {
    setIslemYapiliyor(kocId + islem);
    setMesaj(null);

    const endpoint = islem === "onayla" ? "/api/admin/koc-onayla" : "/api/admin/koc-reddet";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kocId }),
    });

    const data = await res.json();
    setIslemYapiliyor(null);

    if (res.ok) {
      setMesaj({ tip: "ok", metin: data.message });
      veriGetir();
    } else {
      setMesaj({ tip: "hata", metin: data.error });
    }
  };

  const formatTarih = (tarih: string) =>
    new Date(tarih).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Başlık */}
      <div className="animate-fade-in-up" style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 0.25rem" }}>
          Koç Başvuruları
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
          Bekleyen koç başvurularını onaylayın veya reddedin.
        </p>
      </div>

      {/* Mesaj */}
      {mesaj && (
        <div
          className="animate-fade-in"
          style={{
            marginBottom: "1.25rem",
            padding: "0.875rem 1.25rem",
            borderRadius: 12,
            fontSize: "0.875rem",
            fontWeight: 500,
            background: mesaj.tip === "ok" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${mesaj.tip === "ok" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
            color: mesaj.tip === "ok" ? "#4ade80" : "#f87171",
          }}
        >
          {mesaj.tip === "ok" ? "✅" : "⚠"} {mesaj.metin}
        </div>
      )}

      {/* Bekleyen Başvurular */}
      <section style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
            ⏳ Bekleyen Başvurular
          </h2>
          {!yukleniyor && (
            <span
              style={{
                background: "rgba(245,158,11,0.15)",
                color: "#fbbf24",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: 99,
                padding: "0.15rem 0.6rem",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              {bekleyenler.length}
            </span>
          )}
        </div>

        {yukleniyor ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[1, 2].map((i) => (
              <div key={i} className="skeleton" style={{ height: 80 }} />
            ))}
          </div>
        ) : bekleyenler.length === 0 ? (
          <div className="glass empty-state" style={{ padding: "2.5rem" }}>
            <span style={{ fontSize: 40, marginBottom: "0.75rem" }}>🎉</span>
            <p style={{ margin: 0 }}>Bekleyen başvuru yok.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {bekleyenler.map((koc, i) => (
              <div
                key={koc.id}
                className="glass animate-fade-in-up"
                style={{
                  padding: "1.25rem 1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                <div className="avatar avatar-lg">
                  {koc.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{koc.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: 2 }}>
                    {koc.email} · {formatTarih(koc.createdAt)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  <button
                    className="btn-success"
                    onClick={() => islemYap(koc.id, "onayla")}
                    disabled={islemYapiliyor === koc.id + "onayla"}
                  >
                    {islemYapiliyor === koc.id + "onayla" ? <span className="spinner" /> : "✓"} Onayla
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => islemYap(koc.id, "reddet")}
                    disabled={islemYapiliyor === koc.id + "reddet"}
                  >
                    {islemYapiliyor === koc.id + "reddet" ? <span className="spinner" /> : "✕"} Reddet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Onaylanan Koçlar */}
      <section>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
            ✅ Aktif Koçlar
          </h2>
          {!yukleniyor && (
            <span
              style={{
                background: "rgba(34,197,94,0.12)",
                color: "#4ade80",
                border: "1px solid rgba(34,197,94,0.25)",
                borderRadius: 99,
                padding: "0.15rem 0.6rem",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              {onaylananlar.length}
            </span>
          )}
        </div>

        {yukleniyor ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 72 }} />
            ))}
          </div>
        ) : onaylananlar.length === 0 ? (
          <div className="glass empty-state" style={{ padding: "2rem" }}>
            <p style={{ margin: 0 }}>Henüz aktif koç yok.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {onaylananlar.map((koc, i) => (
              <div
                key={koc.id}
                className="glass animate-fade-in-up"
                style={{
                  padding: "1rem 1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                <div className="avatar">
                  {koc.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{koc.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: 1 }}>
                    {koc.email}
                  </div>
                </div>
                <span className="badge badge-active">✓ Aktif</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
