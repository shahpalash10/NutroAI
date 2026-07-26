"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function CinematicHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef1 = useRef<HTMLHeadingElement>(null);
  const titleRef2 = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        titleRef1.current,
        { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)", y: 60, opacity: 0 },
        { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", y: 0, opacity: 1, duration: 1.2, ease: "power4.out" }
      )
        .fromTo(
          titleRef2.current,
          { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)", y: 60, opacity: 0 },
          { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", y: 0, opacity: 1, duration: 1.2, ease: "power4.out" },
          "-=0.9"
        )
        .fromTo(
          textRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
          "-=0.6"
        );

      // Scroll Parallax Effect
      gsap.to(containerRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        y: 100,
        opacity: 0.4,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-[75vh] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/10">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#fc8019]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#60b246]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Label */}
      <div className="flex items-center justify-between text-xs font-mono border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="ff_eng text-white font-bold">STORY 01 // CINEMATIC ORCHESTRATION</span>
        </div>
      </div>

      {/* Hero Display Titles */}
      <div className="my-auto py-12 space-y-6">
        <div className="overflow-hidden">
          <h1 ref={titleRef1} className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white ff_eng tracking-widest leading-none">
            PRECISION <span className="text-[#fc8019]">NUTRITION.</span>
          </h1>
        </div>

        <div className="overflow-hidden">
          <h1 ref={titleRef2} className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-200 ff_eng tracking-widest leading-none">
            AUTOMATED <span className="text-white">DISPATCH.</span>
          </h1>
        </div>

        <p ref={textRef} className="max-w-2xl text-sm sm:text-base text-slate-400 font-sans leading-relaxed pt-2">
          NutroAI synchronizes your live wearable biometric telemetry with Swiggy Food and Instamart MCP servers, autonomously ordering meals that hit your macro budget in real-time.
        </p>
      </div>

      {/* Bottom Scroll Prompt */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10 text-xs font-mono">
        <span className="text-slate-400 ff_eng">EXPLORE PRODUCT STORY</span>
        <div className="flex items-center gap-2 text-[#fc8019] animate-bounce">
          <span className="text-[10px] font-bold">SCROLL DOWN</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </div>
      </div>
    </section>
  );
}
