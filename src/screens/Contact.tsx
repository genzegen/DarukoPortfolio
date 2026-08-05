import type { Screen } from "../App";

type Props = { 
  setScreen: (s: Screen) => void;
  onViewDetails?: () => void;
};

const Contact = ({ setScreen, onViewDetails }: Props) => (
  <div 
    style={{
      position: "relative",
      zIndex: 50,
      width: "100%",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "0 clamp(2rem, 8vw, 6rem)",
    }}
  >
    <button onClick={() => setScreen("menu")} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.2em", marginBottom: "2rem", textAlign: "left", width: "fit-content" }}>
      ← BACK
    </button>
    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--red)", letterSpacing: "0.3em", marginBottom: "0.5rem" }}>04 // JOIN PARTY</div>
    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 6vw, 5rem)", color: "var(--white)", letterSpacing: "0.05em" }}>CONTACT</h2>
    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#555", letterSpacing: "0.15em", marginTop: "1rem" }}>CONTENT COMING SOON</p>
    <button
      type="button"
      onClick={onViewDetails}
      style={{
        marginTop: "2.5rem",
        width: "fit-content",
        padding: "0.9rem 1.5rem",
        background:
          "rgba(255, 35, 85, 0.08)",
        border:
          "1px solid rgba(255, 55, 100, 0.5)",
        color: "var(--white)",
        cursor: "pointer",
        fontFamily: "var(--font-mono)",
        fontSize: "0.65rem",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        transition:
          "all 0.25s ease",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background =
          "rgba(255, 35, 85, 0.18)";

        event.currentTarget.style.borderColor =
          "var(--red)";

        event.currentTarget.style.boxShadow =
          "0 0 24px rgba(255, 35, 85, 0.2)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background =
          "rgba(255, 35, 85, 0.08)";

        event.currentTarget.style.borderColor =
          "rgba(255, 55, 100, 0.5)";

        event.currentTarget.style.boxShadow =
          "none";
      }}
    >
      ENTER DETAIL VIEW →
    </button>
  </div>
);

export default Contact;