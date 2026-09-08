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
const tags = ["STACK", "ROLE", "YEAR"];

const Projects = ({
  setScreen,
  viewMode,
  onShowDetail,
  onShowBrief,
}: Props) => (
  <SectionLayout
    eyebrow="01 // MISSIONS"
    title="PROJECTS"
    intro={
      viewMode === "detail"
        ? "A case-study format for explaining the work behind each mission."
        : "A curated snapshot of selected work and experiments."
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
          gridTemplateColumns: "minmax(0, 1.45fr) minmax(14rem, 0.55fr)",
          gap: "1rem",
          maxWidth: "72rem",
        }}
      >
        <article
          style={{
            ...panelStyle,
            minHeight: "19rem",
            padding: "clamp(1.5rem, 4vw, 3rem)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            background:
              "linear-gradient(135deg, rgba(232,0,58,0.19), rgba(10,10,16,0.8) 60%)",
          }}
        >
          <div style={{ ...monoStyle, color: "#29f1e0", fontSize: "0.6rem" }}>
            FEATURED MISSION // 01
          </div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 4rem)",
              letterSpacing: "0.07em",
              marginTop: "0.7rem",
            }}
          >
            PROJECT NAME
          </h3>
          <p
            style={{
              ...monoStyle,
              color: "#c1c1c1",
              fontSize: "0.7rem",
              lineHeight: 1.7,
              maxWidth: "36rem",
              marginTop: "0.6rem",
            }}
          >
            The short project pitch: what it is, who it helps, and the outcome.
          </p>
        </article>
        <div style={{ display: "grid", gap: "1rem" }}>
          {["CURRENTLY BUILDING", "PROJECT ARCHIVE"].map((title, index) => (
            <article key={title} style={{ ...panelStyle, padding: "1.5rem" }}>
              <div
                style={{
                  ...monoStyle,
                  color: "var(--red)",
                  fontSize: "0.58rem",
                }}
              >
                0{index + 2} // {index ? "PAST" : "NOW"}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.5rem",
                  letterSpacing: "0.07em",
                  marginTop: "0.5rem",
                }}
              >
                {title}
              </h3>
            </article>
          ))}
        </div>
      </div>
    ) : (
      <div style={{ maxWidth: "72rem", display: "grid", gap: "1rem" }}>
        <article style={{ ...panelStyle, padding: "clamp(1.5rem, 4vw, 3rem)" }}>
          <div style={{ ...monoStyle, color: "#29f1e0", fontSize: "0.6rem" }}>
            CASE STUDY // PROJECT NAME
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(13rem, 1fr))",
              gap: "2rem",
              marginTop: "1.5rem",
            }}
          >
            {[
              [
                "THE CHALLENGE",
                "Define the problem, audience, and constraints.",
              ],
              ["THE APPROACH", "Explain the thinking, process, and execution."],
              ["THE OUTCOME", "Share the impact, learnings, and results."],
            ].map(([heading, text]) => (
              <div key={heading}>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.5rem",
                    letterSpacing: "0.07em",
                  }}
                >
                  {heading}
                </h3>
                <p
                  style={{
                    ...monoStyle,
                    color: "#aaa",
                    fontSize: "0.68rem",
                    lineHeight: 1.8,
                    marginTop: "0.6rem",
                  }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              marginTop: "2rem",
            }}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  ...monoStyle,
                  color: "#29f1e0",
                  border: "1px solid rgba(41,241,224,0.3)",
                  padding: "0.4rem",
                  fontSize: "0.58rem",
                }}
              >
                {tag}: ADD VALUE
              </span>
            ))}
          </div>
        </article>
      </div>
    )}
  </SectionLayout>
);
export default memo(Projects);
