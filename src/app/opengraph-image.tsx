import { ImageResponse } from "next/og";
export const alt = "Tuần 8 — Next.js, NextAuth và SEO";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#112244",
        color: "white",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 64,
      }}
    >
      Next.js · NextAuth · SEO
    </div>,
    size,
  );
}
