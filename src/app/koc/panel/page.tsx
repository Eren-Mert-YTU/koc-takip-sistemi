"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Ogrenci {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function KocPanelPage() {
  const [ogrenciler, setOgrenciler] = useState<Ogrenci[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [modalAcik, setModalAcik] = useState(false);
  const [emailGirisi, setEmailGirisi] = useState("");
  const [eklemeYapiliyor, setEklemeYapiliyor] = useState(false);
  const [cikarmaYapiliyor, setCikarmaYapiliyor] = useState<string | null>(null);
  const [mesaj, setMesaj] = useState<{ tip: "ok" | "hata"; metin: string } | null>(null);

  const ogrencileriGetir = useCallback(async () => {
    setYukleniyor(true);
    const res = await fetch("/api/koc/ogrenciler");
    if (res.ok) {
      const data = await res.json();
      setOgrenciler(data.ogrenciler || []);
    }
    setYukleniyor(false);
  }, []);

  useEffect(() => { ogrencileriGetir(); }, [ogrencileriGetir]);

  const ogrenciEkle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailGirisi.trim()) return;
    setEklemeYapiliyor(true);
    setMesaj(null);

    const res = await fetch("/api/koc/ogrenci-ekle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailGirisi.trim() }),
    });
    const data = await res.json();
    setEklemeYapiliyor(false);

    if (res.ok) {
      setMesaj({ tip: "ok", metin: data.message });
      setEmailGirisi("");
      setModalAcik(false);
      ogrencileriGetir();
    } else {
      setMesaj({ tip: "hata", metin: data.error });
    }
  };

  const ogrenciCikar = async (ogrenciId: string, ogrenciAdi: string) => {
    if (!confirm(`"${ogrenciAdi}" adlı öğrenciyi listeden çıkarmak istediğinize emin misiniz?`)) return;
    setCikarmaYapiliyor(ogrenciId);
    setMesaj(null);

    const res = await fetch("/api/koc/ogrenci-cikar", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ogrenciId }),
    });
    const data = await res.json();
    setCikarmaYapiliyor(null);

    if (res.ok) {
      setMesaj({ tip: "ok", metin: data.message });
      setOgrenciler((prev) => prev.filter((o) => o.id !== ogrenciId));
    } else {
      setMesaj({ tip: "hata", metin: data.error });
    }
  };

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        {/* Başlık */}
        <div
          className="animate-fade-in-up"
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.75rem", flexWrap: "wrap" }}
        >
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 0.25rem" }}>
              Öğrenci Listem
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
              Öğrencilerinizi yönetin ve görevleri takip edin.
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={() => { setModalAcik(true); setMesaj(null); }}
            style={{ flexShrink: 0 }}
          >
            + Öğrenci Ekle
          </button>
        </div>

        {/* Stat Kartı */}
        <div className="stat-card animate-fade-in-up stagger-1" style={{ marginBottom: "1.75rem" }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "rgba(99,102,241,0.2)", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0,
          }}>👥</div>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1 }}>
              {yukleniyor ? "—" : ogrenciler.length}
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: 2 }}>
              Toplam Öğrenci
            </div>
          </div>
        </div>

        {/* Mesaj */}
        {mesaj && (
          <div className="animate-fade-in" style={{
            marginBottom: "1.25rem", padding: "0.875rem 1.25rem", borderRadius: 12,
            fontSize: "0.875rem", fontWeight: 500,
            background: mesaj.tip === "ok" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${mesaj.tip === "ok" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
            color: mesaj.tip === "ok" ? "#4ade80" : "#f87171",
          }}>
            {mesaj.tip === "ok" ? "✅" : "⚠"} {mesaj.metin}
          </div>
        )}

        {/* Öğrenci Listesi */}
        {yukleniyor ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}
          </div>
        ) : ogrenciler.length === 0 ? (
          <div className="glass empty-state">
            <span style={{ fontSize: 48, marginBottom: "1rem" }}>📭</span>
            <h3 style={{ margin: "0 0 0.5rem", fontWeight: 700 }}>Henüz öğrenci yok</h3>
            <p style={{ margin: "0 0 1.5rem", fontSize: "0.875rem" }}>Öğrenci eklemek için yukarıdaki butona tıklayın.</p>
            <button className="btn-primary" onClick={() => setModalAcik(true)}>+ Öğrenci Ekle</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {ogrenciler.map((ogrenci, i) => (
              <div
                key={ogrenci.id}
                className="glass glass-hover animate-fade-in-up"
                style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", animationDelay: `${i * 0.04}s` }}
              >
                {/* Sıra */}
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.75rem", fontWeight: 700, color: "#818cf8", flexShrink: 0,
                }}>
                  {i + 1}
                </div>

                {/* Avatar */}
                <div className="avatar" style={{ flexShrink: 0 }}>{initials(ogrenci.name)}</div>

                {/* İsim */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{ogrenci.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: 1 }}>{ogrenci.email}</div>
                </div>

                {/* Aksiyonlar */}
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  <Link
                    href={`/koc/ogrenci/${ogrenci.id}`}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "0.4rem 0.875rem", borderRadius: 8, textDecoration: "none",
                      background: "rgba(99,102,241,0.12)", color: "#818cf8",
                      border: "1px solid rgba(99,102,241,0.25)", fontSize: "0.8rem", fontWeight: 600,
                      transition: "all 0.15s ease",
                    }}
                  >
                    📋 Görevler
                  </Link>
                  <button
                    className="btn-danger"
                    onClick={() => ogrenciCikar(ogrenci.id, ogrenci.name)}
                    disabled={cikarmaYapiliyor === ogrenci.id}
                    style={{ flexShrink: 0 }}
                  >
                    {cikarmaYapiliyor === ogrenci.id ? <span className="spinner" /> : "✕"} Çıkar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Öğrenci Ekle Modal */}
      {modalAcik && (
        <div
          className="modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) setModalAcik(false); }}
        >
          <div
            className="glass animate-fade-in-up"
            style={{ width: "100%", maxWidth: 420, padding: "2rem" }}
            role="dialog" aria-modal="true" aria-labelledby="modal-baslik"
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 id="modal-baslik" style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>Öğrenci Ekle</h2>
              <button onClick={() => { setModalAcik(false); setEmailGirisi(""); setMesaj(null); }}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 4 }} aria-label="Kapat">✕</button>
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
              Öğrencinin kayıtlı e-posta adresini girerek listenize ekleyin.
            </p>

            {mesaj && (
              <div style={{
                marginBottom: "1rem", padding: "0.75rem 1rem", borderRadius: 10, fontSize: "0.85rem", fontWeight: 500,
                background: mesaj.tip === "ok" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${mesaj.tip === "ok" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
                color: mesaj.tip === "ok" ? "#4ade80" : "#f87171",
              }}>
                {mesaj.tip === "ok" ? "✅" : "⚠"} {mesaj.metin}
              </div>
            )}

            <form onSubmit={ogrenciEkle} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label htmlFor="ogrenci-email" style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)" }}>
                  Öğrenci E-posta Adresi
                </label>
                <input
                  id="ogrenci-email" type="email" placeholder="ogrenci@email.com"
                  value={emailGirisi} onChange={(e) => setEmailGirisi(e.target.value)}
                  className="input-field" autoFocus required
                />
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button type="button" className="btn-ghost"
                  onClick={() => { setModalAcik(false); setEmailGirisi(""); setMesaj(null); }}
                  style={{ flex: 1, justifyContent: "center", padding: "0.7rem" }}>
                  İptal
                </button>
                <button type="submit" className="btn-primary" disabled={eklemeYapiliyor}
                  style={{ flex: 1, justifyContent: "center" }}>
                  {eklemeYapiliyor ? <><span className="spinner" />Ekleniyor…</> : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
