// Shared visual for opengraph-image.tsx and twitter-image.tsx so both social
// preview images stay in sync from one place.
export const socialImageSize = { width: 1200, height: 630 };
export const socialImageContentType = "image/png";

const TOOLS = ["Concrete", "Tile", "Roofing", "Mulch & Gravel", "Flooring"];

export function SocialImage() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "linear-gradient(135deg, #065f46 0%, #047857 55%, #059669 100%)",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 6, height: 30, background: "#047857", borderRadius: 3 }} />
            <div style={{ width: 6, height: 22, background: "#047857", borderRadius: 3 }} />
            <div style={{ width: 6, height: 34, background: "#047857", borderRadius: 3 }} />
          </div>
        </div>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#d1fae5", letterSpacing: -0.5 }}>
          Tally My Project
        </div>
      </div>

      <div
        style={{
          marginTop: 46,
          fontSize: 66,
          fontWeight: 800,
          color: "#ffffff",
          lineHeight: 1.08,
          letterSpacing: -1.5,
          maxWidth: 950,
        }}
      >
        Free calculators for every home improvement project
      </div>

      <div style={{ display: "flex", gap: 14, marginTop: 46, flexWrap: "wrap" }}>
        {TOOLS.map((tool) => (
          <div
            key={tool}
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.35)",
              color: "#ffffff",
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            {tool}
          </div>
        ))}
      </div>
    </div>
  );
}
