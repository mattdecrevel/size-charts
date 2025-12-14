import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Size Charts - Open Source Size Chart Management";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f0a1a",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
        }}
      >
        {/* Logo/Icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            backgroundColor: "rgba(139, 92, 246, 0.2)",
            borderRadius: 24,
            marginBottom: 40,
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a855f7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
            <path d="m14.5 12.5 2-2" />
            <path d="m11.5 9.5 2-2" />
            <path d="m8.5 6.5 2-2" />
            <path d="m17.5 15.5 2-2" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: 16,
            letterSpacing: "-0.02em",
          }}
        >
          Size Charts
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#a1a1aa",
            marginBottom: 48,
          }}
        >
          Open Source Size Chart Management
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: 32,
          }}
        >
          {["REST API", "Embeddable Widget", "Multi-Category", "Self-Hostable"].map(
            (feature) => (
              <div
                key={feature}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 24px",
                  backgroundColor: "rgba(139, 92, 246, 0.1)",
                  borderRadius: 9999,
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#a855f7",
                  }}
                />
                <span style={{ color: "#e4e4e7", fontSize: 18 }}>{feature}</span>
              </div>
            )
          )}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 48,
            display: "flex",
            fontSize: 20,
            color: "#71717a",
          }}
        >
          www.sizecharts.dev
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
