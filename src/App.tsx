import { useEffect, useRef, useState } from "react";
import MainMenu from "./screens/MainMenu";
import Projects from "./screens/Projects";
import Skills from "./screens/Skills";
import About from "./screens/About";
import Contact from "./screens/Contact";
import ParticleBackground from "./components/ParticleBackground";
import { setUIHovered } from "./utils/SceneIntegration";
import type { ViewMode } from "./utils/CameraPresets";

export type Screen =
  | "menu"
  | "about"
  | "projects"
  | "skills"
  | "contact";

const sections: Screen[] = [
  "menu",
  "about",
  "projects",
  "skills",
  "contact",
];

function App() {
  const [activeScreen, setActiveScreen] =
    useState<Screen>("menu");

  const [viewMode, setViewMode] =
    useState<ViewMode>("brief");

  const [hoveredIndex, setHoveredIndex] =
    useState<number | null>(null);

  const sectionRefs = useRef<
    Record<Screen, HTMLElement | null>
  >({
    menu: null,
    about: null,
    projects: null,
    skills: null,
    contact: null,
  });

  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const currentSectionIndexRef = useRef(0);
  const isScrollingRef = useRef(false);

  const scrollToSection = (screen: Screen) => {
    setUIHovered(false);
    setHoveredIndex(null);
    setViewMode("brief");

    const targetIndex =
      sections.indexOf(screen);

    if (targetIndex !== -1) {
      currentSectionIndexRef.current = targetIndex;
    }

    const targetSection =
      sectionRefs.current[screen];

    if (!targetSection) {
      isScrollingRef.current = false;
      return;
    }

    isScrollingRef.current = true;

    targetSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    window.setTimeout(() => {
      isScrollingRef.current = false;
    }, 600);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio -
              a.intersectionRatio
          );

        const mostVisible = visibleEntries[0];

        if (!mostVisible) return;

        const screenName =
          mostVisible.target.getAttribute(
            "data-screen"
          );

        if (
          screenName === "menu" ||
          screenName === "about" ||
          screenName === "projects" ||
          screenName === "skills" ||
          screenName === "contact"
        ) {
          setActiveScreen(screenName);
          setViewMode("brief");
          const idx = sections.indexOf(screenName);
          if (idx !== -1) {
            currentSectionIndexRef.current = idx;
          }
        }
      },
      {
        root: null,
        threshold: 0.5,
      }
    );

    const currentSections = sections
      .map(
        (screen) =>
          sectionRefs.current[screen]
      )
      .filter(
        (
          section
        ): section is HTMLElement =>
          section !== null
      );

    currentSections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (isScrollingRef.current) return;

      if (Math.abs(event.deltaY) < 10) return;

      const direction =
        event.deltaY > 0 ? 1 : -1;

      const nextIndex = Math.max(
        0,
        Math.min(
          sections.length - 1,
          currentSectionIndexRef.current +
            direction
        )
      );

      if (
        nextIndex ===
        currentSectionIndexRef.current
      ) {
        return;
      }

      isScrollingRef.current = true;

      currentSectionIndexRef.current =
        nextIndex;

      const nextScreen =
        sections[nextIndex];

      const targetSection =
        sectionRefs.current[nextScreen];

      targetSection?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      window.setTimeout(() => {
        isScrollingRef.current = false;
      }, 900);
    };

    container.addEventListener(
      "wheel",
      handleWheel,
      { passive: false }
    );

    return () => {
      container.removeEventListener(
        "wheel",
        handleWheel
      );
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black text-white">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ParticleBackground
          hoveredIndex={hoveredIndex}
          activeScreen={
            activeScreen === "menu"
              ? "home"
              : activeScreen
          }
          viewMode={viewMode}
        />
      </div>

      <main
        ref={scrollContainerRef}
        className="
          relative
          z-10
          h-screen
          w-full
          overflow-y-scroll
          overflow-x-hidden
        "
      >
        <section
          ref={(element) => {
            sectionRefs.current.menu =
              element;
          }}
          data-screen="menu"
          className="min-h-screen w-full"
        >
          <MainMenu
            setScreen={scrollToSection}
            hoveredIndex={hoveredIndex}
            setHoveredIndex={
              setHoveredIndex
            }
          />
        </section>

        <section
          ref={(element) => {
            sectionRefs.current.about =
              element;
          }}
          data-screen="about"
          className="min-h-screen w-full"
        >
          <About
            setScreen={scrollToSection}
            onViewDetails={() => setViewMode("detail")}
          />
        </section>

        <section
          ref={(element) => {
            sectionRefs.current.projects =
              element;
          }}
          data-screen="projects"
          className="min-h-screen w-full"
        >
          <Projects
            setScreen={scrollToSection}
            onViewDetails={() => setViewMode("detail")}
          />
        </section>

        <section
          ref={(element) => {
            sectionRefs.current.skills =
              element;
          }}
          data-screen="skills"
          className="min-h-screen w-full"
        >
          <Skills
            setScreen={scrollToSection}
            onViewDetails={() => setViewMode("detail")}
          />
        </section>

        <section
          ref={(element) => {
            sectionRefs.current.contact =
              element;
          }}
          data-screen="contact"
          className="min-h-screen w-full"
        >
          <Contact
            setScreen={scrollToSection}
            onViewDetails={() => setViewMode("detail")}
          />
        </section>
      </main>
    </div>
  );
}

export default App;

