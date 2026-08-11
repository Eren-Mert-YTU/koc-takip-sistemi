"use client";

interface ProgressBarProps {
  completed: number;
  total: number;
  label?: string;
  showFraction?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({
  completed,
  total,
  label,
  showFraction = true,
  size = "md",
}: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const done = pct === 100;

  const heights: Record<string, number> = { sm: 6, md: 10, lg: 14 };
  const h = heights[size];

  const fillColor = done
    ? "linear-gradient(90deg, #22c55e, #4ade80)"
    : pct >= 60
    ? "linear-gradient(90deg, #6366f1, #22c55e)"
    : "linear-gradient(90deg, #6366f1, #8b5cf6)";

  return (
    <div>
      {(label || showFraction) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          {label && (
            <span
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
              }}
            >
              {label}
            </span>
          )}
          {showFraction && (
            <span
              style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: done ? "#4ade80" : "var(--text-primary)",
              }}
            >
              {completed}/{total}{" "}
              <span
                style={{
                  color: "var(--text-muted)",
                  fontWeight: 400,
                }}
              >
                (%{pct})
              </span>
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        style={{
          height: h,
          background: "rgba(15,23,42,0.8)",
          borderRadius: 99,
          overflow: "hidden",
          border: "1px solid rgba(148,163,184,0.08)",
        }}
      >
        {/* Fill */}
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: fillColor,
            borderRadius: 99,
            transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: done
              ? "0 0 8px rgba(34,197,94,0.5)"
              : "0 0 8px rgba(99,102,241,0.4)",
          }}
        />
      </div>

      {done && (
        <p
          style={{
            textAlign: "center",
            marginTop: 6,
            fontSize: "0.78rem",
            color: "#4ade80",
            fontWeight: 600,
          }}
        >
          🎉 Tüm görevler tamamlandı!
        </p>
      )}
    </div>
  );
}
