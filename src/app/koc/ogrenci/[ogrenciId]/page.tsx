"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressBar } from "@/components/progress-bar";
import { getWeekBounds, getDaysOfWeek, getLessonColor } from "@/lib/week";

interface Ogrenci {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Gorev {
  id: string;
  lessonName: string;
  sourceName: string;
  description: string;
  deadline: string;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
}

interface Istatistik {
  toplam: number;
  tamamlanan: number;
  buHafta: number;
  buHaftaTamamlanan: number;
}

const BOSH_FORM = {
  lessonName: "",
  sourceName: "",
  description: "",
  deadline: "",
};

export default function OgrenciDetayPage() {
  const { ogrenciId } = useParams<{ ogrenciId: string }>();
  const router = useRouter();

  const [ogrenci, setOgrenci] = useState<Ogrenci | null>(null);
  const [gorevler, setGorevler] = useState<Gorev[]>([]);
  const [istatistik, setIstatistik] = useState<Istatistik>({
    toplam: 0, tamamlanan: 0, buHafta: 0, buHaftaTamamlanan: 0,
  });
  const [yukleniyor, setYukleniyor] = useState(true);

  // Haftalık Takvim Durumu
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getWeekBounds().monday);
  
  // Modal
  const [modalAcik, setModalAcik] = useState(false);
  const [form, setForm] = useState(BOSH_FORM);
  const [eklemeYapiliyor, setEklemeYapiliyor] = useState(false);
  const [silmeYapiliyor, setSilmeYapiliyor] = useState<string | null>(null);
  const [temizlemeYapiliyor, setTemizlemeYapiliyor] = useState(false);
  const [mesaj, setMesaj] = useState<{ tip: "ok" | "hata"; metin: string } | null>(null);

  const veriGetir = useCallback(async () => {
    setYukleniyor(true);
    const res = await fetch(`/api/koc/ogrenci-detay?ogrenciId=${ogrenciId}`);
    if (res.ok) {
      const data = await res.json();
      setOgrenci(data.ogrenci);
      setGorevler(data.gorevler);
      setIstatistik(data.istatistik);
    } else {
      router.push("/koc/panel");
    }
    setYukleniyor(false);
  }, [ogrenciId, router]);

  useEffect(() => { veriGetir(); }, [veriGetir]);

  // Hafta gezinme
  const oncekiHafta = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };
  const sonrakiHafta = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const gorevEkle = async (e: React.FormEvent) => {
    e.preventDefault();
    setEklemeYapiliyor(true);
    setMesaj(null);

    const res = await fetch("/api/koc/gorev-ekle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: ogrenciId, ...form }),
    });
    const data = await res.json();
    setEklemeYapiliyor(false);

    if (res.ok) {
      setMesaj({ tip: "ok", metin: data.message });
      setForm(BOSH_FORM);
      setModalAcik(false);
      veriGetir();
    } else {
      setMesaj({ tip: "hata", metin: data.error });
    }
  };

  const gorevSil = async (gorevId: string) => {
    if (!confirm("Bu görevi silmek istediğinize emin misiniz?")) return;
    setSilmeYapiliyor(gorevId);
    setMesaj(null);
    const res = await fetch("/api/koc/gorev-sil", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gorevId }),
    });
    const data = await res.json();
    setSilmeYapiliyor(null);
    if (res.ok) {
      setMesaj({ tip: "ok", metin: data.message });
      setGorevler((prev) => prev.filter((g) => g.id !== gorevId));
      veriGetir();
    } else {
      setMesaj({ tip: "hata", metin: data.error });
    }
  };

  const gorevToggle = async (gorevId: string, mevcutDurum: boolean) => {
    // Optimistic update
    setGorevler((prev) =>
      prev.map((g) =>
        g.id === gorevId ? { ...g, isCompleted: !mevcutDurum } : g
      )
    );

    const res = await fetch("/api/koc/gorev-guncelle", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gorevId, isCompleted: !mevcutDurum }),
    });

    if (res.ok) {
      veriGetir(); // İstatistikleri de güncellemek için
    } else {
      // Geri al
      setGorevler((prev) =>
        prev.map((g) =>
          g.id === gorevId ? { ...g, isCompleted: mevcutDurum } : g
        )
      );
    }
  };

  const haftayiTemizle = async () => {
    if (!confirm("Bu haftadaki TÜM görevleri silmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) return;
    setTemizlemeYapiliyor(true);
    
    const res = await fetch("/api/koc/hafta-temizle", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        studentId: ogrenciId,
        weekStart: currentWeekStart.toISOString()
      }),
    });
    const data = await res.json();
    setTemizlemeYapiliyor(false);

    if (res.ok) {
      setMesaj({ tip: "ok", metin: data.message });
      veriGetir();
    } else {
      setMesaj({ tip: "hata", metin: data.error });
    }
  };

  const acGorevModal = (tarih?: string) => {
    if (tarih) {
      setForm({ ...BOSH_FORM, deadline: tarih });
    } else {
      setForm(BOSH_FORM);
    }
    setMesaj(null);
    setModalAcik(true);
  };

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  if (yukleniyor) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1rem" }}>
        <div className="skeleton" style={{ height: 120, marginBottom: "1.5rem" }} />
        <div className="skeleton" style={{ height: 80, marginBottom: "1rem" }} />
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 72, marginBottom: "0.75rem" }} />)}
      </div>
    );
  }

  if (!ogrenci) return null;

  const currentWeekDays = getDaysOfWeek(currentWeekStart);

  return (
    <>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 1rem" }}>
        {/* Geri + Başlık */}
        <div className="animate-fade-in-up" style={{ marginBottom: "1.5rem" }}>
          <Link
            href="/koc/panel"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem",
              fontWeight: 500, marginBottom: "1rem", transition: "color 0.15s",
            }}
          >
            ← Öğrenci Listesine Dön
          </Link>

          {/* Öğrenci Kartı */}
          <div
            className="glass"
            style={{
              padding: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <div className="avatar avatar-xl">{initials(ogrenci.name)}</div>
              <div>
                <h1 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "0 0 0.25rem" }}>
                  {ogrenci.name}
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
                  {ogrenci.email}
                </p>
              </div>
            </div>
            {/* Üstteki Genel Görev Ekle Butonu */}
            <button
              className="btn-primary"
              onClick={() => acGorevModal()}
            >
              + Genel Görev Ekle
            </button>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div
          className="animate-fade-in-up stagger-1"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.875rem", marginBottom: "1.5rem" }}
        >
          {[
            { icon: "📋", label: "Toplam Görev", value: istatistik.toplam, color: "#818cf8" },
            { icon: "✅", label: "Tamamlanan", value: istatistik.tamamlanan, color: "#4ade80" },
            { icon: "📅", label: "Bu Hafta", value: istatistik.buHafta, color: "#fbbf24" },
            { icon: "⚡", label: "Bu Hafta Tamam", value: istatistik.buHaftaTamamlanan, color: "#38bdf8" },
          ].map((s, i) => (
            <div key={i} className={`glass animate-fade-in-up stagger-${i+1}`} style={{ padding: "1rem" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress Bar — Bu Hafta */}
        {istatistik.buHafta > 0 && (
          <div className="glass animate-fade-in-up stagger-2" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
            <ProgressBar
              completed={istatistik.buHaftaTamamlanan}
              total={istatistik.buHafta}
              label="📅 Genel Haftalık İlerleme"
              size="md"
            />
          </div>
        )}

        {/* Mesaj */}
        {mesaj && (
          <div
            className="animate-fade-in"
            style={{
              marginBottom: "1rem", padding: "0.875rem 1.25rem", borderRadius: 12,
              fontSize: "0.875rem", fontWeight: 500,
              background: mesaj.tip === "ok" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${mesaj.tip === "ok" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
              color: mesaj.tip === "ok" ? "#4ade80" : "#f87171",
            }}
          >
            {mesaj.tip === "ok" ? "✅" : "⚠"} {mesaj.metin}
          </div>
        )}

        {/* Haftalık Grid (Kanban) */}
        <div className="animate-fade-in-up stagger-3" style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button className="btn-ghost" style={{ padding: "0.5rem" }} onClick={oncekiHafta}>
                ◀
              </button>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, minWidth: 200, textAlign: "center" }}>
                {currentWeekDays[0].date.toLocaleDateString("tr-TR", { day: 'numeric', month: 'short' })} - {currentWeekDays[6].date.toLocaleDateString("tr-TR", { day: 'numeric', month: 'short' })}
              </h2>
              <button className="btn-ghost" style={{ padding: "0.5rem" }} onClick={sonrakiHafta}>
                ▶
              </button>
            </div>
            
            <button
              className="btn-danger"
              onClick={haftayiTemizle}
              disabled={temizlemeYapiliyor}
            >
              {temizlemeYapiliyor ? <span className="spinner" /> : "🧹 Haftayı Temizle"}
            </button>
          </div>

          <div style={{ overflowX: "auto", paddingBottom: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(250px, 1fr))", gap: "1rem", minWidth: 1000 }}>
              {currentWeekDays.map((dayObj, i) => {
                const gununGorevleri = gorevler.filter((g) => {
                  const gDate = new Date(g.deadline).toISOString().split("T")[0];
                  return gDate === dayObj.dateString;
                });

                const isToday = new Date().toISOString().split("T")[0] === dayObj.dateString;

                return (
                  <div key={dayObj.dateString} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {/* Kolon Başlığı */}
                    <div className="glass" style={{ 
                      padding: "1rem", 
                      textAlign: "center", 
                      borderTop: isToday ? "3px solid #6366f1" : undefined,
                      position: "sticky", top: 0, zIndex: 10
                    }}>
                      <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>{dayObj.dayName}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.75rem" }}>{dayObj.dateNumber}</div>
                      <button 
                        className="btn-ghost" 
                        style={{ width: "100%", justifyContent: "center", padding: "0.4rem", fontSize: "0.85rem" }}
                        onClick={() => acGorevModal(dayObj.dateString)}
                      >
                        + Görev Ekle
                      </button>
                    </div>

                    {/* Kolon İçeriği */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem", minHeight: 150 }}>
                      {gununGorevleri.length === 0 ? (
                        <div style={{ 
                          padding: "1rem", textAlign: "center", color: "var(--text-muted)", 
                          fontSize: "0.85rem", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 12 
                        }}>
                          Görev yok
                        </div>
                      ) : (
                        gununGorevleri.map((gorev) => {
                          const color = getLessonColor(gorev.lessonName);
                          return (
                            <div
                              key={gorev.id}
                              className={`task-card animate-fade-in-up`}
                              style={{ 
                                padding: "1rem", 
                                background: gorev.isCompleted ? "#bbf7d0" : undefined, // bg-green-200 if completed
                                color: gorev.isCompleted ? "#166534" : undefined,
                                border: gorev.isCompleted ? "1px solid #86efac" : undefined,
                                transition: "all 0.2s ease"
                              }}
                            >
                              {/* Ders Rozeti */}
                              <div
                                style={{
                                  display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: 6,
                                  background: gorev.isCompleted ? "rgba(255,255,255,0.5)" : color.bg, 
                                  color: gorev.isCompleted ? "#166534" : color.color, 
                                  border: `1px solid ${gorev.isCompleted ? "rgba(0,0,0,0.1)" : color.border}`,
                                  fontSize: "0.7rem", fontWeight: 700, marginBottom: "0.5rem"
                                }}
                              >
                                {gorev.lessonName}
                              </div>

                              <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.25rem", 
                                textDecoration: gorev.isCompleted ? "line-through" : "none" }}>
                                {gorev.sourceName}
                              </div>
                              <p style={{ 
                                fontSize: "0.8rem", margin: "0 0 0.75rem 0", lineHeight: 1.4,
                                color: gorev.isCompleted ? "#14532d" : "var(--text-secondary)",
                                textDecoration: gorev.isCompleted ? "line-through" : "none"
                              }}>
                                {gorev.description}
                              </p>

                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                                  <input 
                                    type="checkbox" 
                                    className="task-checkbox" 
                                    checked={gorev.isCompleted}
                                    onChange={() => gorevToggle(gorev.id, gorev.isCompleted)}
                                    style={{ width: 16, height: 16 }}
                                  />
                                  {gorev.isCompleted ? "Tamamlandı" : "Yapılacak"}
                                </label>
                                <button
                                  onClick={() => gorevSil(gorev.id)}
                                  disabled={silmeYapiliyor === gorev.id}
                                  style={{ 
                                    background: "none", border: "none", 
                                    color: gorev.isCompleted ? "#15803d" : "#ef4444", 
                                    cursor: "pointer", fontSize: "0.8rem", padding: "0.25rem" 
                                  }}
                                  title="Sil"
                                >
                                  {silmeYapiliyor === gorev.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : "🗑️"}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Görev Ata Modal */}
      {modalAcik && (
        <div
          className="modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) setModalAcik(false); }}
        >
          <div
            className="glass animate-fade-in-up"
            style={{ width: "100%", maxWidth: 480, padding: "2rem" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="gorev-modal-baslik"
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h2 id="gorev-modal-baslik" style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>
                  Görev Ata
                </h2>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {ogrenci.name} için yeni görev
                </p>
              </div>
              <button
                onClick={() => { setModalAcik(false); setForm(BOSH_FORM); setMesaj(null); }}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20, padding: 4 }}
              >✕</button>
            </div>

            {mesaj?.tip === "hata" && (
              <div style={{
                marginBottom: "1rem", padding: "0.75rem 1rem", borderRadius: 10,
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                color: "#f87171", fontSize: "0.85rem",
              }}>
                ⚠ {mesaj.metin}
              </div>
            )}

            <form onSubmit={gorevEkle} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Ders Adı */}
              <div>
                <label htmlFor="lessonName" style={{ display: "block", marginBottom: 6, fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Ders Adı <span style={{ color: "#f87171" }}>*</span>
                </label>
                <input
                  id="lessonName"
                  type="text"
                  className="input-field"
                  placeholder="Örn: Matematik, Fizik, Türkçe"
                  value={form.lessonName}
                  onChange={(e) => setForm({ ...form, lessonName: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              {/* Kaynak Adı */}
              <div>
                <label htmlFor="sourceName" style={{ display: "block", marginBottom: 6, fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Kaynak Adı <span style={{ color: "#f87171" }}>*</span>
                </label>
                <input
                  id="sourceName"
                  type="text"
                  className="input-field"
                  placeholder="Örn: 345, Bilgisarmal, 3D"
                  value={form.sourceName}
                  onChange={(e) => setForm({ ...form, sourceName: e.target.value })}
                  required
                />
              </div>

              {/* Hedef/Açıklama */}
              <div>
                <label htmlFor="description" style={{ display: "block", marginBottom: 6, fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Hedef / Açıklama <span style={{ color: "#f87171" }}>*</span>
                </label>
                <textarea
                  id="description"
                  className="input-field"
                  placeholder="Örn: 50 Soru Çözümü, 2 Test Tamamla"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={2}
                />
              </div>

              {/* Son Teslim Tarihi */}
              <div>
                <label htmlFor="deadline" style={{ display: "block", marginBottom: 6, fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Son Teslim Tarihi <span style={{ color: "#f87171" }}>*</span>
                </label>
                <input
                  id="deadline"
                  type="date"
                  className="input-field"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  required
                  style={{ colorScheme: "dark" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: 4 }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => { setModalAcik(false); setForm(BOSH_FORM); setMesaj(null); }}
                  style={{ flex: 1, justifyContent: "center", padding: "0.7rem" }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={eklemeYapiliyor}
                  style={{ flex: 2, justifyContent: "center", padding: "0.7rem" }}
                >
                  {eklemeYapiliyor ? <><span className="spinner" /> Ekleniyor…</> : "Görevi Ata"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
