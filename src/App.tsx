import { useState } from "react";
import MainMenu from "./screens/MainMenu";
import Projects from "./screens/Projects";
import Skills from "./screens/Skills";
import About from "./screens/About";
import Contact from "./screens/Contact";
import ParticleBackground from "./components/ParticleBackground";
import { setUIHovered } from "./utils/SceneIntegration";

export type Screen = "menu" | "projects" | "skills" | "about" | "contact";

function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const changeScreen = (newScreen: Screen) => {
    setUIHovered(false);
    setHoveredIndex(null);
    setScreen(newScreen);
  };

  const renderScreen = () => {
    switch (screen) {
      case "menu":
        return (
          <MainMenu
            setScreen={setScreen}
            hoveredIndex={hoveredIndex}
            setHoveredIndex={setHoveredIndex}
          />
        );
      case "projects":
        return <Projects setScreen={changeScreen} />;
      case "skills":
        return <Skills setScreen={changeScreen} />;
      case "about":
        return <About setScreen={changeScreen} />;
      case "contact":
        return <Contact setScreen={changeScreen} />;
      default:
        return <MainMenu
                  setScreen={setScreen}
                  hoveredIndex={hoveredIndex}
                  setHoveredIndex={setHoveredIndex}
                />;
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ParticleBackground
          hoveredIndex={hoveredIndex}
          activeScreen={screen === "menu" ? "home" : screen}
        />
      </div>

      <div className="relative z-10 w-full h-full">
        {renderScreen()}
      </div>
    </div>
  );
}

export default App;