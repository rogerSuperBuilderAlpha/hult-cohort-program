import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site-metadata";

export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #eef4fb 0%, #f7fafd 45%, #eef4fb 100%)",
          color: "#1e3a5f",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "18px",
              background: "#1e3a5f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid rgba(201, 168, 76, 0.55)",
            }}
          >
            <div
              style={{
                width: "34px",
                height: "42px",
                borderRadius: "6px",
                background: "#f7fafd",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.1 }}>
              {siteConfig.name}
            </span>
            <span style={{ fontSize: 24, opacity: 0.75, marginTop: 6 }}>
              {siteConfig.tagline}
            </span>
          </div>
        </div>
        <p
          style={{
            fontSize: 34,
            lineHeight: 1.35,
            maxWidth: "880px",
            margin: 0,
            fontFamily: "Georgia, serif",
          }}
        >
          Beginner-friendly UK law lessons, quizzes, and everyday legal topics
        </p>
        <p
          style={{
            fontSize: 20,
            marginTop: 28,
            color: "#c9a84c",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontFamily: "Arial, sans-serif",
          }}
        >
          England &amp; Wales · Civil · Criminal · Everyday Law
        </p>
      </div>
    ),
    { ...size }
  );
}
