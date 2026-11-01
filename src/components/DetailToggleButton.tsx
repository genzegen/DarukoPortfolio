import type { ViewMode } from "../utils/CameraPresets";

type Props = {
  viewMode: ViewMode;
  onEnter?: () => void;
  onExit?: () => void;
};

const IDLE_BG_BRIEF = "rgba(255, 35, 85, 0.08)";
const IDLE_BG_DETAIL = "rgba(255, 35, 85, 0.18)";
const IDLE_BORDER_BRIEF = "rgba(255, 55, 100, 0.5)";
const IDLE_BORDER_DETAIL = "var(--red)";

// Shared toggle that drives the camera detail view in both directions.
const DetailToggleButton = ({ viewMode, onEnter, onExit }: Props) => {
  const inDetail = viewMode === "detail";

  return (
    <button
      type="button"
      onClick={inDetail ? onExit : onEnter}
      aria-pressed={inDetail}
      style={{
        marginTop: "2.5rem",
        width: "fit-content",
        padding: "0.9rem 1.5rem",
        background: inDetail ? IDLE_BG_DETAIL : IDLE_BG_BRIEF,
        border: `1px solid ${inDetail ? IDLE_BORDER_DETAIL : IDLE_BORDER_BRIEF}`,
        color: "var(--white)",
        cursor: "pointer",
        fontFamily: "var(--font-mono)",
        fontSize: "0.65rem",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        transition: "all 0.25s ease",
        boxShadow: inDetail ? "0 0 18px rgba(255, 35, 85, 0.18)" : "none",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = "rgba(255, 35, 85, 0.28)";

        event.currentTarget.style.borderColor = "var(--red)";

        event.currentTarget.style.boxShadow = "0 0 24px rgba(255, 35, 85, 0.2)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = inDetail
          ? IDLE_BG_DETAIL
          : IDLE_BG_BRIEF;

        event.currentTarget.style.borderColor = inDetail
          ? IDLE_BORDER_DETAIL
          : IDLE_BORDER_BRIEF;

        event.currentTarget.style.boxShadow = inDetail
          ? "0 0 18px rgba(255, 35, 85, 0.18)"
          : "none";
      }}
    >
      {inDetail ? "← BACK TO BRIEF" : "ENTER DETAIL VIEW →"}
    </button>
  );
};

export default DetailToggleButton;
