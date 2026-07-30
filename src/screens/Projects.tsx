import type { Screen } from "../App";

type Props = { setScreen: (s: Screen) => void };

const Projects = ({ setScreen }: Props) => (
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
    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--red)", letterSpacing: "0.3em", marginBottom: "0.5rem" }}>01 // MISSIONS</div>
    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 6vw, 5rem)", color: "var(--white)", letterSpacing: "0.05em" }}>MISSIONS</h2>
    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#555", letterSpacing: "0.15em", marginTop: "1rem" }}>CONTENT COMING SOON</p>
  </div>
);

export default Projects;