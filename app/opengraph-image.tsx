import { ImageResponse } from "next/og";

export const alt = "Quantum Group Co — Ultra-luxury residences in Antigua and Barbuda.";
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
          justifyContent: "space-between",
          background: "#071014",
          color: "#f4efe6",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", letterSpacing: 6, fontSize: 18, color: "#e6d2a8" }}>
          ANTIGUA AND BARBUDA
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 64, lineHeight: 0.95, fontFamily: "Georgia" }}>
            <div style={{ display: "flex" }}>Every detail, considered.</div>
            <div style={{ display: "flex", fontStyle: "italic", color: "#d9b878" }}>Every estate, a legacy.</div>
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 28, color: "#c9c2b4" }}>
            Quantum Group Co
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
