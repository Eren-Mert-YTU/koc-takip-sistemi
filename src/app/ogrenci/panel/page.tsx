"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ProgressBar } from "@/components/progress-bar";
import { getWeekBounds, getDaysOfWeek, getLessonColor } from "@/lib/week";

interface Gorev {
  id: string;
  lessonName: string;
  sourceName: string;
  description: string;
  deadline: string;
  isCompleted: boolean;
  completedAt: string | null;
  coach: { id: string; name: string };
}

interface Istatistik {
  buHafta: number;
  buHaftaTamamlanan: number;
  toplam: number;
  tamamlanan: number;
}

export default function OgrenciPanelPage() {
  const { data: session } = useSession();
  const ad = session?.user?.name || "Öğrenci";
  const initials = ad.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  const [gorevler, setGorevler] = useState<Gorev[]>([]);
  const [istatistik, setIstatistik] = useState<Istatistik>({
    buHafta: 0, buHaftaTamamlanan: 0, toplam: 0, tamamlanan: 0,
  });
  const [yukleniyor, setYukleniyor] = useState(true);
  const [guncellenenId, setGuncellenenId] = useState<string | null>(null);

  // Haftalık Takvim Durumu
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getWeekBounds().monday);

  const veriGetir = useCallback(async () => {
    setYukleniyor(true);
    const res = await fetch(`/api/ogrenci/gorevler?filtre=tumu`); // Fetch all tasks so we can paginate locally easily, or we can fetch per week. Fetching all is fine for now.
    if (res.ok) {
      const data = await res.json();
      setGorevler(data.gorevler || []);
      setIstatistik(data.istatistik);
    }
    setYukleniyor(false);
  }, []);

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

  const gorevToggle = async (gorevId: string, mevcutDurum: boolean) => {
    setGuncellenenId(gorevId);
    // Optimistic update
    setGorevler((prev) =>
      prev.map((g) =>
        g.id === gorevId ? { ...g, isCompleted: !mevcutDurum } : g
      )
    );

    const res = await fetch("/api/ogrenci/gorev-tamamla", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gorevId, tamamlandi: !mevcutDurum }),
    });

    setGuncellenenId(null);

    if (res.ok) {
      // İstatistiği de güncelle
      setIstatistik((prev) => ({
        ...prev,
        tamamlanan: mevcutDurum ? prev.tamamlanan - 1 : prev.tamamlanan + 1,
        buHaftaTamamlanan: mevcutDurum ? prev.buHaftaTamamlanan - 1 : prev.buHaftaTamamlanan + 1,
      }));
    } else {
      // Geri al
      setGorevler((prev) =>
        prev.map((g) =>
          g.id === gorevId ? { ...g, isCompleted: mevcutDurum } : g
        )
      );
    }
  };

  const currentWeekDays = getDaysOfWeek(currentWeekStart);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 1rem" }}>
      {/* Hoşgeldin Kartı */}
      <div
        className="glass animate-fade-in-up"
        style={{
          padding: "1.75rem 2rem",
          marginBottom: "1.5rem",
          background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))",
          border: "1px solid rgba(99,102,241,0.2)",
          display: "flex",
          alignItems: "center",
          gap: "1.25rem",
          flexWrap: "wrap",
        }}
      >
        <div className="avatar avatar-xl">{initials}</div>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 0.25rem" }}>
            Hoş Geldiniz, {ad.split(" ")[0]}! 👋
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: 0 }}>
            {session?.user?.email}
          </p>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div
        className="animate-fade-in-up stagger-1"
        style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.75rem", marginBottom: "1.25rem" }}
      >
        {[
          { icon: "📅", label: "Bu Hafta", value: istatistik.buHafta, color: "#fbbf24" },
          { icon: "✅", label: "Bu Hafta Tamam", value: istatistik.buHaftaTamamlanan, color: "#4ade80" },
          { icon: "📋", label: "Toplam", value: istatistik.toplam, color: "#818cf8" },
          { icon: "🏆", label: "Toplam Tamam", value: istatistik.tamamlanan, color: "#38bdf8" },
        ].map((s, i) => (
          <div key={i} className={`glass animate-fade-in-up stagger-${i+1}`} style={{ padding: "0.875rem", textAlign: "center" }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>{yukleniyor ? "—" : s.value}</div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: 3, lineHeight: 1.3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar — Bu Hafta */}
      {!yukleniyor && istatistik.buHafta > 0 && (
        <div className="glass animate-fade-in-up stagger-2" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
          <ProgressBar
            completed={istatistik.buHaftaTamamlanan}
            total={istatistik.buHafta}
            label="📅 Genel Haftalık İlerleme"
            size="lg"
          />
        </div>
      )}

      {/* Haftalık Grid (Kanban) */}
      <div className="animate-fade-in-up stagger-3" style={{ marginBottom: "2rem" }}>
        
        {/* Hafta Seçici */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "1rem" }}>
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
        </div>

        {/* Grid Container */}
        {yukleniyor ? (
          <div style={{ display: "flex", gap: "1rem", overflow: "hidden" }}>
            {[1,2,3,4,5,6,7].map(i => <div key={i} className="skeleton" style={{ flex: 1, minWidth: 250, height: 400 }} />)}
          </div>
        ) : (
          <div style={{ overflowX: "auto", paddingBottom: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(250px, 1fr))", gap: "1rem", minWidth: 1000 }}>
              {currentWeekDays.map((dayObj) => {
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
                      <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{dayObj.dateNumber}</div>
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
                          const isUpdating = guncellenenId === gorev.id;
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
                                    disabled={isUpdating}
                                    style={{ width: 16, height: 16 }}
                                  />
                                  {gorev.isCompleted ? "Tamamlandı" : "Yapılacak"}
                                </label>
                                {isUpdating && <span className="spinner" style={{ width: 14, height: 14, borderColor: "rgba(99,102,241,0.3)", borderTopColor: "#818cf8" }} />}
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
        )}
      </div>
    </div>
  );
}
