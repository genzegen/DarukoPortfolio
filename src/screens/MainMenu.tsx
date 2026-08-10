import { motion, AnimatePresence } from "framer-motion";
import { setUIHovered } from "../utils/SceneIntegration.ts";
import type { Screen } from "../App";

type Props = {
  setScreen: (screen: Screen) => void;
  hoveredIndex: number | null;
  setHoveredIndex: (value: number | null) => void;
};

const menuItems = [
  { id: "about" as Screen, label: "PROFILE", sub: "About", index: "01" },
  { id: "projects" as Screen, label: "MISSIONS", sub: "Projects", index: "02" },
  { id: "skills" as Screen, label: "STATS", sub: "Skills", index: "03" },
  { id: "contact" as Screen, label: "JOIN PARTY", sub: "Contact", index: "04" },
];

const ACCENT_RED = "#e8003a";
const ACCENT_CYAN = "#29f1e0";
const WHITE = "#ffffff";

// Reusable glow shadows so every white text stays legible over any 3D background
const glow = (color: string, size = "10px") =>
  `0 0 ${size} ${color}, 0 0 2px rgba(255,255,255,0.6)`;

const MainMenu = ({ setScreen, hoveredIndex, setHoveredIndex }: Props) => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
      }}
    >
      <style>{`
        @keyframes duk-blink { 0%, 45% { opacity: 1; } 50%, 95% { opacity: 0.15; } 100% { opacity: 1; } }
        @keyframes duk-scan { 0% { background-position: 0 0; } 100% { background-position: 0 40px; } }

        .duk-scanlines {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 15;
          background-image: repeating-linear-gradient(
            0deg,
            rgba(255, 255, 255, 0.025) 0px,
            rgba(255, 255, 255, 0.025) 1px,
            transparent 1px,
            transparent 3px
          );
          animation: duk-scan 6s linear infinite;
          mix-blend-mode: overlay;
        }

        .duk-status-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${ACCENT_CYAN};
          box-shadow: 0 0 6px ${ACCENT_CYAN}, 0 0 12px ${ACCENT_CYAN};
          margin-right: 0.6em;
          animation: duk-blink 2.4s ease-in-out infinite;
          flex-shrink: 0;
        }

        .duk-eyebrow-row {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .duk-readout {
          position: absolute;
          bottom: 1.5rem;
          right: 8vw;
          z-index: 20;
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          color: ${WHITE};
          text-shadow: ${glow(ACCENT_RED, "6px")};
          display: flex;
          gap: 2rem;
          pointer-events: none;
        }
        .duk-readout span.val { color: ${ACCENT_CYAN}; text-shadow: ${glow(ACCENT_CYAN, "6px")}; }

        .duk-ghost {
          position: absolute;
          left: 58%;
          top: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          pointer-events: none;
          z-index: 5;
        }

        @media (max-width: 760px) {
          .duk-ghost, .duk-readout { display: none; }
        }
      `}</style>

      <div className="duk-scanlines" />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{
          position: "absolute",
          top: "8vh",
          right: "8vw",
          transform: "translateX(-50%)",
          textAlign: "center",
          pointerEvents: "none",
          zIndex: 20,
          whiteSpace: "nowrap",
        }}
      >
        <div
          className="duk-eyebrow-row"
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.9rem",
            color: ACCENT_RED,
            letterSpacing: "0.5em",
            marginBottom: "0.5rem",
          }}
        >
          <span className="duk-status-dot" />
          PROJECT //
        </div>

        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(4rem, 9vw, 8rem)",
            lineHeight: 0.9,
            letterSpacing: "0.08em",
            color: WHITE,
            margin: 0,
          }}
        >
          DARUKO
        </h1>

        <div
          style={{
            width: "min(60%, 220px)",
            height: "1px",
            background: `linear-gradient(90deg, transparent, ${ACCENT_CYAN}88, transparent)`,
            margin: "0.75rem auto 0",
          }}
        />
      </motion.div>

      <div
        style={{
          position: "absolute",
          left: "8vw",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          zIndex: 20,
        }}
      >
        {menuItems.map((item, i) => {
          const isHovered = hoveredIndex === i;

          return (
            <motion.button
              key={item.id}
              onClick={() => setScreen(item.id)}
              onHoverStart={() => {
                setHoveredIndex(i);
                setUIHovered(true);
              }}
              onHoverEnd={() => {
                setHoveredIndex(null);
                setUIHovered(false);
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.3 + i * 0.08,
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                position: "relative",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.4rem 0 0.4rem 1rem",
                textAlign: "left",
                width: "fit-content",
              }}
            >
              {/* Shared-layout reticle: slides between items, filled bar instead of a border */}
              {isHovered && (
                <motion.div
                  layoutId="nav-reticle"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "0px",
                    bottom: "-4px",
                    width: "4px",
                    background: ACCENT_RED,
                    boxShadow: `0 0 8px ${ACCENT_RED}, 0 0 15px ${ACCENT_RED}`,
                  }}
                />
              )}

              <div
                style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "0.8rem",
                  letterSpacing: "0.25em",
                  marginBottom: "0.25rem",
                  color: ACCENT_CYAN,
                  textShadow: glow(ACCENT_CYAN, "8px"),
                }}
              >
                {item.index}
              </div>

              <div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "clamp(2rem, 3vw, 3.5rem)",
                  letterSpacing: "0.08em",
                  lineHeight: 0.9,
                  color: WHITE,
                  textShadow: isHovered ? glow(ACCENT_RED, "8px") : glow("rgba(255,255,255,0.35)", "6px"),
                  transform: isHovered ? "translateX(16px)" : "translateX(0px)",
                  transition: "all 0.18s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </div>

              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: -3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: "0.95rem",
                      color: ACCENT_CYAN,
                      textShadow: glow(ACCENT_CYAN, "8px"),
                      letterSpacing: "0.13em",
                      marginTop: "0.25rem",
                    }}
                  >
                    {item.sub} →
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {hoveredIndex !== null && (
          <motion.div
            key={hoveredIndex}
            className="duk-ghost"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.8rem",
                color: ACCENT_CYAN,
                textShadow: glow(ACCENT_CYAN, "8px"),
                letterSpacing: "0.35em",
              }}
            >
              {menuItems[hoveredIndex].index}
            </div>

            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                color: "rgba(255,255,255,0.15)",
                letterSpacing: "0.2em",
                marginTop: "0.4rem",
              }}
            >
              {menuItems[hoveredIndex].label}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="duk-readout">
        <span>SYS<span className="val">::ONLINE</span></span>
        <span>SIGNAL<span className="val">::STABLE</span></span>
        <span>BUILD<span className="val">::v0.1.0</span></span>
      </div>
    </div>
  );
};

export default MainMenu;