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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{
          position: "absolute",
          top: "5vh",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          pointerEvents: "none",
          zIndex: 20,
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.9rem",
            color: "#e8003a",
            letterSpacing: "0.5em",
            marginBottom: "0.5rem",
          }}
        >
          PROJECT //
        </div>

        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(4rem, 9vw, 8rem)",
            lineHeight: 0.9,
            letterSpacing: "0.08em",
            color: "#f0f0f0",
            margin: 0,
          }}
        >
          DARUKO
        </h1>
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
                padding: 0,
                textAlign: "left",
                width: "fit-content",
              }}
            >
              <div
                style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "0.8rem",
                  letterSpacing: "0.25em",
                  marginBottom: "0.25rem",
                  color: isHovered ? "#e8003a" : "#666",
                  transition: "color 0.15s ease",
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
                  color: isHovered ? "#fcfcfc" : "#aaa",
                  transform: isHovered ? "translateX(10px)" : "translateX(0px)",
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
                      color: "#e8003a",
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              left: "58%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            <div
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.8rem",
                color: "#e8003a",
                letterSpacing: "0.35em",
              }}
            >
              {menuItems[hoveredIndex].index}
            </div>

            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                color: "rgba(240,240,240,0.15)",
                letterSpacing: "0.2em",
                marginTop: "0.4rem",
              }}
            >
              {menuItems[hoveredIndex].label}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{
          position: "absolute",
          bottom: "1.5rem",
          right: "2rem",
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: "0.75rem",
          color: "#444",
          letterSpacing: "0.25em",
          pointerEvents: "none",
          zIndex: 20,
        }}
      >
        v0.1.0 // DARUKO.DEV
      </motion.div>
    </div>
  );
};

export default MainMenu;