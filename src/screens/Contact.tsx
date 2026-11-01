import { memo } from "react";
import type { Screen } from "../App";
import DetailToggleButton from "../components/DetailToggleButton";
import type { ViewMode } from "../utils/CameraPresets";

type Props = {
  setScreen: (s: Screen) => void;
  viewMode?: ViewMode;
  onViewDetails?: () => void;
  onExitDetails?: () => void;
};

const Contact = ({
  setScreen,
  viewMode = "brief",
  onViewDetails,
  onExitDetails,
}: Props) => (
  <div
    style={{
      position: "relative",
      zIndex: 50,
      width: "100%",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      padding: "2rem clamp(2rem, 8vw, 6rem)",
    }}
  >
    <div style={{ height: "3rem" }}>
      <button
        onClick={() => setScreen("menu")}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#888",
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          letterSpacing: "0.2em",
          marginBottom: "2rem",
          textAlign: "left",
          width: "fit-content",
          transition: "color 0.2s ease, transform 0.2s ease",
          transformOrigin: "left center",
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.color = "#FFCABF";
          event.currentTarget.style.transform = "scale(1.07";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.color = "#888";
          event.currentTarget.style.transform = "scale(1)";
        }}
      >
        ← BACK
      </button>
    </div>
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.65rem",
        color: "var(--red)",
        letterSpacing: "0.3em",
        marginBottom: "0.5rem",
      }}
    >
      04 // JOIN PARTY
    </div>
    <h2
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(2.5rem, 6vw, 5rem)",
        color: "var(--white)",
        letterSpacing: "0.05em",
      }}
    >
      CONTACT
    </h2>
    <p
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.7rem",
        color: "#555",
        letterSpacing: "0.15em",
        marginTop: "1rem",
      }}
    >
      CONTENT COMING SOON
    </p>
    <DetailToggleButton
      viewMode={viewMode}
      onEnter={onViewDetails}
      onExit={onExitDetails}
    />
  </div>
);

export default memo(Contact);
