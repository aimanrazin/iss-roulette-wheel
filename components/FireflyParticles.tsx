import React, { useEffect, useRef, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { Container, IOptions, RecursivePartial } from "@tsparticles/engine";
import { loadAll } from "@tsparticles/all";

interface FireflyParticlesProps {}

const FireflyParticles: React.FC<FireflyParticlesProps> = ({}) => {
  const [init, setInit] = useState(false);

  const particlesOptions = useRef<RecursivePartial<IOptions>>({
    // background: {
    //   color: {
    //     value: isDark ? "#0d0d0d" : "#ffffff",
    //   },
    // },
    particles: {
      number: {
        value: 50,
        density: {
          enable: true,
          // area: 800,
          height: 800,
          width: 800,
        },
      },
      color: {
        value: "#c1d8f0",
      },
      shape: {
        type: "circle",
        // stroke: {
        //   width: 0,
        //   color: "#b6b2b2",
        // },
      },
      opacity: {
        value: { min: 0.3, max: 0.8 },
        animation: {
          enable: true,
          speed: 1,
          decay: 0,
          mode: "auto",
          // minimumValue: 0.1,
          count: { min: 0.1, max: 1 },
          startValue: "random",
          sync: false,
        },
      },
      size: {
        value: { max: 8, min: 3 },
        // random: true,
        animation: {
          enable: true,
          speed: 12.18,
          decay: { min: 1, max: 3 },
          mode: "decrease",
          // destroy: "min",
          // minimumValue: 0.1,
          count: { min: 0.1, max: 1 },
          startValue: "random",
          sync: false,
        },
      },
      links: {
        enable: false,
      },
      move: {
        enable: true,
        speed: 1,
        direction: "none",
        random: false,
        straight: false,
        outModes: "out",
        // bounce: false,
        attract: {
          enable: false,
          rotate: { x: 600, y: 1200 },
          // rotateX: 600,
          // rotateY: 1200,
        },
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onHover: {
          enable: true,
          // mode: [/* "grab", "bubble", */ "repulse"],
        },
        onClick: {
          enable: true,
          mode: ["push", "remove"],
        },
        resize: { enable: true },
      },
      modes: {
        grab: {
          distance: 400,
          links: {
            opacity: 1,
          },
        },
        bubble: {
          distance: 400,
          size: 20,
          duration: 2,
          opacity: 8,
          speed: 3,
        },
        repulse: {
          distance: 200,
          duration: 0.4,
        },
        push: {
          quantity: 4,
        },
        remove: {
          quantity: 2,
        },
      },
    },
    detectRetina: true,
    fullScreen: { enable: true, zIndex: 0 },
  });

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      await loadAll(engine);
      //await loadFull(engine);
      // await loadSlim(engine);
      //await loadBasic(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    if (container) {
      console.log("Particles loaded", container);
    }
  };

  return (
    <>
      {init && (
        <Particles
          id="firefly"
          className="particle-container"
          // init={particlesInit}
          // loaded={particlesLoaded}

          particlesLoaded={particlesLoaded}
          options={particlesOptions.current}
        />
      )}
      <style>{`
        .particle-container canvas {
          position: absolute;
          z-index: -1 !important;
        }
      `}</style>
    </>
  );
};

export default FireflyParticles;
