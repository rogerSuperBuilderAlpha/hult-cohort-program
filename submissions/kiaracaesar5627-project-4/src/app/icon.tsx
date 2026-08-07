import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#14181f",
          color: "#f3f0ea",
          fontSize: 36,
          fontWeight: 700,
        }}
      >
        I
      </div>
    ),
    { ...size },
  );
}
