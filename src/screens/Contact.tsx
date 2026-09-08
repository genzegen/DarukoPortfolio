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
const fieldStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.16)",
  padding: "0.85rem",
  color: "#aaa",
  fontFamily: "var(--font-mono)",
  fontSize: "0.65rem",
  letterSpacing: "0.08em",
} as const;

const Contact = ({ setScreen, viewMode, onShowDetail, onShowBrief }: Props) => (
  <SectionLayout
    eyebrow="04 // JOIN PARTY"
    title="CONTACT"
    intro={
      viewMode === "detail"
        ? "The expanded contact view can become your complete project enquiry flow."
        : "Start a conversation, collaborate, or follow the next project."
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
          maxWidth: "64rem",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
        }}
      >
        <div
          style={{
            padding: "clamp(1.5rem, 4vw, 3rem)",
            borderRight: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ ...monoStyle, color: "#29f1e0", fontSize: "0.6rem" }}>
            STATUS // ONLINE
          </div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              letterSpacing: "0.07em",
              marginTop: "0.8rem",
            }}
          >
            LET’S MAKE SOMETHING
          </h3>
          <p
            style={{
              ...monoStyle,
              color: "#aaa",
              fontSize: "0.7rem",
              lineHeight: 1.8,
              marginTop: "0.7rem",
            }}
          >
            Add your availability and the projects you are currently open to
            discussing.
          </p>
        </div>
        <div
          style={{
            padding: "clamp(1.5rem, 4vw, 3rem)",
            display: "grid",
            alignContent: "center",
            gap: "1rem",
          }}
        >
          {["YOUR@EMAIL.COM", "LINKEDIN / PROFILE", "GITHUB / PROFILE"].map(
            (item) => (
              <div
                key={item}
                style={{
                  ...monoStyle,
                  color: "#29f1e0",
                  fontSize: "0.65rem",
                  borderBottom: "1px solid rgba(41,241,224,0.25)",
                  paddingBottom: "0.7rem",
                }}
              >
                {item} →
              </div>
            ),
          )}
        </div>
      </div>
    ) : (
      <div
        style={{
          maxWidth: "58rem",
          ...panelStyle,
          padding: "clamp(1.5rem, 4vw, 3rem)",
        }}
      >
        <div style={{ ...monoStyle, color: "var(--red)", fontSize: "0.6rem" }}>
          PROJECT ENQUIRY // TEMPLATE
        </div>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            letterSpacing: "0.07em",
            margin: "0.6rem 0 1.5rem",
          }}
        >
          TELL ME ABOUT THE MISSION
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "0.75rem",
          }}
        >
          {["NAME", "EMAIL", "PROJECT TYPE", "TIMELINE"].map((field) => (
            <div key={field} style={fieldStyle}>
              {field}
            </div>
          ))}
        </div>
        <div style={{ ...fieldStyle, marginTop: "0.75rem", minHeight: "7rem" }}>
          PROJECT DETAILS / GOALS / BUDGET
        </div>
        <p
          style={{
            ...monoStyle,
            color: "#888",
            fontSize: "0.6rem",
            lineHeight: 1.7,
            marginTop: "1rem",
          }}
        >
          Replace this visual form scaffold with your preferred contact form
          provider or email link.
        </p>
      </div>
    )}
  </SectionLayout>
);
export default memo(Contact);
