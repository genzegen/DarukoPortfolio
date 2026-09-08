import type { ReactNode } from "react";
import type { Screen } from "../App";
import type { ViewMode } from "../utils/CameraPresets";
import { monoStyle } from "./sectionStyles";

type Props = {
  eyebrow: string;
  title: string;
  intro: string;
  mode: ViewMode;
  setScreen: (screen: Screen) => void;
  onShowDetail: () => void;
  onShowBrief: () => void;
  children: ReactNode;
};

export default function SectionLayout({
  eyebrow,
  title,
  intro,
  mode,
  setScreen,
  onShowDetail,
  onShowBrief,
  children,
}: Props) {
  const isDetail = mode === "detail";

  return (
    <div
      style={{
        position: "relative",
        zIndex: 50,
        width: "100%",
        minHeight: "100vh",
        padding: "clamp(5rem, 10vh, 7rem) clamp(2rem, 8vw, 6rem)",
        pointerEvents: "auto",
      }}
    >
      <button
        type="button"
        onClick={() => setScreen("menu")}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#888",
          ...monoStyle,
          fontSize: "0.7rem",
          letterSpacing: "0.2em",
          marginBottom: "2rem",
        }}
      >
        ← BACK
      </button>

      <header
        style={{
          maxWidth: "52rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            ...monoStyle,
            fontSize: "0.65rem",
            color: "var(--red)",
            letterSpacing: "0.3em",
            marginBottom: "0.5rem",
          }}
        >
          {eyebrow}
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            color: "var(--white)",
            letterSpacing: "0.05em",
            lineHeight: 0.9,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            ...monoStyle,
            color: "#aaa",
            fontSize: "0.73rem",
            lineHeight: 1.8,
            marginTop: "1rem",
          }}
        >
          {intro}
        </p>
      </header>
      {children}
      <button
        type="button"
        onClick={isDetail ? onShowBrief : onShowDetail}
        style={{
          marginTop: "2rem",
          width: "fit-content",
          padding: "0.9rem 1.5rem",
          background: "rgba(255, 35, 85, 0.08)",
          border: "1px solid rgba(255, 55, 100, 0.5)",
          color: "var(--white)",
          cursor: "pointer",
          ...monoStyle,
          fontSize: "0.65rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
        }}
      >
        {isDetail ? "← RETURN TO BRIEF VIEW" : "ENTER DETAIL VIEW →"}
      </button>
    </div>
  );
}
