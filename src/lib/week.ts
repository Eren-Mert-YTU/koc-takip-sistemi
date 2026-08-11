/** Mevcut veya verilen tarihin ISO haftasının Pazartesi–Pazar sınırlarını döndürür */
export function getWeekBounds(dateParam?: Date | string) {
  const now = dateParam ? new Date(dateParam) : new Date();
  const day = now.getDay(); // 0=Pazar, 1=Pzt …
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
}

/** Verilen haftanın başlangıcına göre 7 günlük diziyi döndürür */
export function getDaysOfWeek(weekStart: Date) {
  const days = [];
  const dayNames = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + i);
    days.push({
      date: currentDate,
      dayName: dayNames[i],
      dateString: currentDate.toISOString().split("T")[0], // YYYY-MM-DD
      dateNumber: currentDate.getDate(),
    });
  }
  return days;
}

/** Tarih farkına göre Türkçe kalan süre metni */
export function formatDeadline(deadline: string | Date): {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
  isSoon: boolean;
} {
  const date = new Date(deadline);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const diffDays = Math.round((d.getTime() - now.getTime()) / 86_400_000);

  if (diffDays < 0)
    return { label: `${Math.abs(diffDays)} gün gecikti`, isOverdue: true, isToday: false, isSoon: false };
  if (diffDays === 0)
    return { label: "Bugün son!", isOverdue: false, isToday: true, isSoon: true };
  if (diffDays === 1)
    return { label: "Yarın son!", isOverdue: false, isToday: false, isSoon: true };
  if (diffDays <= 3)
    return { label: `${diffDays} gün kaldı`, isOverdue: false, isToday: false, isSoon: true };

  const formatted = date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: diffDays > 365 ? "numeric" : undefined,
  });
  return { label: formatted, isOverdue: false, isToday: false, isSoon: false };
}

/** Ders adından tutarlı renk üret */
const LESSON_PALETTE = [
  { bg: "rgba(99,102,241,0.18)",  color: "#818cf8", border: "rgba(99,102,241,0.35)"  }, // indigo
  { bg: "rgba(139,92,246,0.18)",  color: "#a78bfa", border: "rgba(139,92,246,0.35)"  }, // violet
  { bg: "rgba(236,72,153,0.18)",  color: "#f472b6", border: "rgba(236,72,153,0.35)"  }, // pink
  { bg: "rgba(34,197,94,0.18)",   color: "#4ade80", border: "rgba(34,197,94,0.35)"   }, // green
  { bg: "rgba(245,158,11,0.18)",  color: "#fbbf24", border: "rgba(245,158,11,0.35)"  }, // amber
  { bg: "rgba(14,165,233,0.18)",  color: "#38bdf8", border: "rgba(14,165,233,0.35)"  }, // sky
  { bg: "rgba(239,68,68,0.18)",   color: "#f87171", border: "rgba(239,68,68,0.35)"   }, // red
  { bg: "rgba(20,184,166,0.18)",  color: "#2dd4bf", border: "rgba(20,184,166,0.35)"  }, // teal
];

export function getLessonColor(name: string) {
  const hash = [...name.toLowerCase()].reduce((a, c) => a + c.charCodeAt(0), 0);
  return LESSON_PALETTE[hash % LESSON_PALETTE.length];
}
