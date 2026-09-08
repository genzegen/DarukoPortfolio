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

const About = ({ setScreen, viewMode, onShowDetail, onShowBrief }: Props) => (
  <SectionLayout
    eyebrow="03 // PROFILE"
    title="ABOUT ME"
    intro={
      viewMode === "detail"
        ? "The expanded profile view gives visitors the full picture."
        : "A quick introduction to who you are and the work you care about."
    }
    mode={viewMode}
    setScreen={setScreen}
    onShowDetail={onShowDetail}
    onShowBrief={onShowBrief}
  >
    {viewMode === "brief" ? (
      <div
        style={{
          ...panelStyle,
          maxWidth: "58rem",
          display: "grid",
          gridTemplateColumns: "minmax(8rem, 0.55fr) 1.45fr",
          gap: "clamp(1.5rem, 4vw, 4rem)",
          padding: "clamp(1.5rem, 4vw, 3rem)",
          alignItems: "center",
        }}
      >
        <div
          style={{
            aspectRatio: "1",
            border: "1px solid rgba(41, 241, 224, 0.42)",
            display: "grid",
            placeItems: "center",
            color: "#29f1e0",
            ...monoStyle,
            fontSize: "0.6rem",
            letterSpacing: "0.18em",
          }}
        >
          PHOTO
          <br />
          PLACEHOLDER
        </div>
        <div>
          <div
            style={{
              ...monoStyle,
              fontSize: "0.62rem",
              color: "var(--red)",
              marginBottom: "0.75rem",
            }}
          >
            IDENTITY // 01
          </div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              letterSpacing: "0.07em",
            }}
          >
            YOUR ONE-LINER
          </h3>
          <p
            style={{
              ...monoStyle,
              color: "#a4a4a4",
              fontSize: "0.7rem",
              lineHeight: 1.8,
              marginTop: "0.75rem",
            }}
          >
            A place for the short bio that tells people what you do, where you
            are based, and why they should keep exploring.
          </p>
          <div
            style={{
              display: "flex",
              gap: "1.3rem",
              marginTop: "1.2rem",
              ...monoStyle,
              color: "#29f1e0",
              fontSize: "0.58rem",
            }}
          >
            <span>ROLE</span>
            <span>LOCATION</span>
            <span>STATUS</span>
          </div>
        </div>
      </div>
    ) : (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(15rem, 0.6fr)",
          gap: "1rem",
          maxWidth: "72rem",
        }}
      >
        <article style={{ ...panelStyle, padding: "clamp(1.5rem, 4vw, 3rem)" }}>
          <div
            style={{ ...monoStyle, fontSize: "0.62rem", color: "var(--red)" }}
          >
            FULL STORY // 01
          </div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              marginTop: "0.75rem",
              letterSpacing: "0.07em",
            }}
          >
            THE LONGER INTRODUCTION
          </h3>
          <p
            style={{
              ...monoStyle,
              color: "#aaa",
              fontSize: "0.72rem",
              lineHeight: 2,
              marginTop: "1rem",
            }}
          >
            Use this space for the story behind your work: where you started,
            the values that guide you, and what you want to build next. Add a
            second paragraph here when your biography needs more room.
          </p>
        </article>
        <aside style={{ ...panelStyle, padding: "1.5rem" }}>
          <div style={{ ...monoStyle, fontSize: "0.62rem", color: "#29f1e0" }}>
            AT A GLANCE
          </div>
          {["CURRENT ROLE", "BASED IN", "OPEN TO"].map((item) => (
            <div
              key={item}
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                padding: "1rem 0",
                ...monoStyle,
                fontSize: "0.63rem",
                color: "#aaa",
              }}
            >
              {item}
              <strong
                style={{
                  display: "block",
                  color: "var(--white)",
                  marginTop: "0.4rem",
                }}
              >
                ADD DETAIL HERE
              </strong>
            </div>
          ))}
        </aside>
      </div>
    )}
  </SectionLayout>
);

export default memo(About);
