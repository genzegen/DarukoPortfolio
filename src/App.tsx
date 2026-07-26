import { useState } from "react";
import MainMenu from "./screens/MainMenu";
import Projects from "./screens/Projects";
import Skills from "./screens/Skills";
import About from "./screens/About";
import Contact from "./screens/Contact";
import ParticleBackground from "./components/ParticleBackground";

export type Screen = "menu" | "projects" | "skills" | "about" | "contact";

function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
        return <Projects setScreen={setScreen} />;
      case "skills":
        return <Skills setScreen={setScreen} />;
      case "about":
        return <About setScreen={setScreen} />;
      case "contact":
        return <Contact setScreen={setScreen} />;
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
        <ParticleBackground hoveredIndex={hoveredIndex} />
      </div>

      <div className="relative z-10 w-full h-full">
        {renderScreen()}
      </div>
    </div>
  );
}

export default App;