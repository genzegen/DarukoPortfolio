import { memo } from "react";
import SectionLayout from "../components/SectionLayout";
import { monoStyle, panelStyle } from "../components/sectionStyles";
import type { Screen } from "../App";
import type { ViewMode } from "../utils/CameraPresets";

type Props = {
  setScreen: (screen: Screen) => void;
  viewMode: ViewMode;
  onShowDetail: () => void;
  onShowBrief: () => void;
};
const groups = [
  ["FRONTEND", ["REACT", "TYPESCRIPT", "CSS"]],
  ["BACKEND", ["APIS", "DATABASES", "SERVICES"]],
  ["TOOLKIT", ["GIT", "TESTING", "DEPLOYMENT"]],
];

const Skills = ({ setScreen, viewMode, onShowDetail, onShowBrief }: Props) => (
  <SectionLayout
    eyebrow="02 // STATS"
    title="SKILLS"
    intro={
      viewMode === "detail"
        ? "An expanded inventory of tools, strengths, and current learning."
        : "The core tools and disciplines behind the work."
    }
    mode={viewMode}
    setScreen={setScreen}
    onShowDetail={onShowDetail}
    onShowBrief={onShowBrief}
  >
    {viewMode === "brief" ? (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))",
          gap: "1rem",
          maxWidth: "72rem",
        }}
      >
        {groups.map(([group, items], index) => (
          <article
            key={group as string}
            style={{
              ...panelStyle,
              padding: "1.5rem",
              borderTop: `2px solid ${index === 1 ? "#29f1e0" : "var(--red)"}`,
            }}
          >
            <div style={{ ...monoStyle, fontSize: "0.6rem", color: "#888" }}>
              0{index + 1} // DOMAIN
            </div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2rem",
                letterSpacing: "0.07em",
                margin: "0.8rem 0 1.2rem",
              }}
            >
              {group}
            </h3>
            <div style={{ display: "grid", gap: "0.55rem" }}>
              {(items as string[]).map((item) => (
                <div
                  key={item}
                  style={{
                    ...monoStyle,
                    fontSize: "0.65rem",
                    color: "#c5c5c5",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{item}</span>
                  <span style={{ color: "#29f1e0" }}>● ● ●</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    ) : (
      <div style={{ ...panelStyle, maxWidth: "72rem", overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(10rem, 0.8fr) repeat(3, 1fr)",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
            padding: "1rem 1.5rem",
            ...monoStyle,
            fontSize: "0.6rem",
            color: "#29f1e0",
          }}
        >
          <span>CAPABILITY</span>
          <span>EXPERIENCE</span>
          <span>CONFIDENCE</span>
          <span>NOTES</span>
        </div>
        {[
          "FRONTEND DEVELOPMENT",
          "BACKEND DEVELOPMENT",
          "DESIGN SYSTEMS",
          "COLLABORATION",
        ].map((skill, index) => (
          <div
            key={skill}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(10rem, 0.8fr) repeat(3, 1fr)",
              gap: "0.5rem",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              padding: "1.1rem 1.5rem",
              ...monoStyle,
              fontSize: "0.63rem",
              color: "#aaa",
            }}
          >
            <strong style={{ color: "var(--white)" }}>{skill}</strong>
            <span>ADD YEARS</span>
            <span style={{ color: "#29f1e0" }}>
              {"● ".repeat(3 + (index % 2))}
            </span>
            <span>ADD CONTEXT</span>
          </div>
        ))}
      </div>
    )}
  </SectionLayout>
);
export default memo(Skills);
