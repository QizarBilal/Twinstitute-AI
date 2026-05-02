'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { COLORS, TYPOGRAPHY, SPACING, MOTION as MOTION_CONFIG } from '@/lib/design-system';

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 1.2 + 0.3,
  delay: Math.random() * 4,
}));

const NODES = [
  { id: 0, x: 50, y: 50, label: "YOU", primary: true },
  { id: 1, x: 20, y: 20, label: "Skills" },
  { id: 2, x: 80, y: 20, label: "Goals" },
  { id: 3, x: 15, y: 60, label: "Tasks" },
  { id: 4, x: 85, y: 60, label: "Proof" },
  { id: 5, x: 35, y: 85, label: "Growth" },
  { id: 6, x: 65, y: 85, label: "Career" },
];

const EDGES = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
  [1, 2], [3, 5], [4, 6],
];

const LOOP_STEPS = ["MODEL", "TRAIN", "EVALUATE", "SIMULATE", "STRATEGIZE"];

function NeuralGraph({ active }) {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setPulse(p => (p + 1) % EDGES.length), 700);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <radialGradient id="nodeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.accents.cyan} />
            <stop offset="100%" stopColor="#00B8D4" />
          </radialGradient>
          <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.accents.cyan} />
            <stop offset="50%" stopColor="#1E3A5F" />
            <stop offset="100%" stopColor="#0A4A6B" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={NODES[a].x} y1={NODES[a].y}
            x2={NODES[b].x} y2={NODES[b].y}
            stroke={pulse === i ? COLORS.accents.cyan : `rgba(0, 217, 255, 0.08)`}
            strokeWidth={pulse === i ? "0.5" : "0.25"}
            filter={pulse === i ? "url(#glow)" : undefined}
            style={{ transition: "all 0.4s ease" }}
          />
        ))}

        {/* Pulse traveling along edges */}
        {EDGES.map(([a, b], i) => (
          <circle key={`p${i}`} r="0.7" fill={COLORS.accents.cyan} opacity={pulse === i ? 0.85 : 0} filter="url(#glow)">
            {pulse === i && (
              <animateMotion
                dur="0.7s"
                repeatCount="1"
                path={`M${NODES[a].x},${NODES[a].y} L${NODES[b].x},${NODES[b].y}`}
              />
            )}
          </circle>
        ))}

        {/* Satellite nodes */}
        {NODES.filter(n => !n.primary).map(node => (
          <g key={node.id} filter="url(#glow)">
            <circle cx={node.x} cy={node.y} r="4" fill="rgba(0, 217, 255, 0.06)" stroke="rgba(0, 217, 255, 0.25)" strokeWidth="0.3" />
            <circle cx={node.x} cy={node.y} r="1.8" fill="url(#nodeGrad)" />
            <text x={node.x} y={node.y + 7} textAnchor="middle" fill={COLORS.text.secondary} fontSize="2.8" fontFamily="'DM Sans', sans-serif" fontWeight="500" letterSpacing="0.04em">
              {node.label}
            </text>
          </g>
        ))}

        {/* Center node */}
        <g filter="url(#strongGlow)">
          <circle cx="50" cy="50" r="9" fill="rgba(0, 217, 255, 0.06)" stroke="rgba(0, 217, 255, 0.18)" strokeWidth="0.25">
            <animate attributeName="r" values="9;11;9" dur="3.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="50" r="6.5" fill="url(#centerGrad)" stroke={COLORS.accents.cyan} strokeWidth="0.4" />
          <text x="50" y="52" textAnchor="middle" fill={COLORS.text.primary} fontSize="3.8" fontWeight="800" fontFamily="'Syne', sans-serif">
            YOU
          </text>
        </g>

        {/* Orbit ring */}
        <circle cx="50" cy="50" r="18" fill="none" stroke="rgba(0, 217, 255, 0.04)" strokeWidth="0.25" strokeDasharray="2 4">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="25s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

function LoopIndicator({ step }) {
  return (
    <div className="flex items-center gap-3 bg-white/[0.02] border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm w-fit">
      {LOOP_STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <span className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
            step === i ? 'text-cyan-400' : 'text-gray-500'
          }`}>
            {s}
          </span>
          {i < LOOP_STEPS.length - 1 && (
            <span className="text-white/10 text-xs">→</span>
          )}
        </div>
      ))}
    </div>
  );
}

function FloatingParticle({ p }) {
  return (
    <div style={{
      position: "absolute",
      left: `${p.x}%`,
      top: `${p.y}%`,
      width: `${p.size}px`,
      height: `${p.size}px`,
      borderRadius: "50%",
      background: COLORS.accents.cyan,
      opacity: 0.15,
      animation: `floatUp ${9 + p.size * 3}s ${p.delay}s infinite linear`,
      pointerEvents: "none",
      boxShadow: `0 0 8px ${COLORS.accents.cyan}`,
    }} />
  );
}

function GlowOrb({ x, y, color, size, blur }) {
  return (
    <div style={{
      position: "absolute",
      left: x, top: y,
      width: size, height: size,
      borderRadius: "50%",
      background: color,
      filter: `blur(${blur})`,
      pointerEvents: "none",
      transform: "translate(-50%, -50%)",
    }} />
  );
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [loopStep, setLoopStep] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [typedText, setTypedText] = useState("");
  const heroRef = useRef(null);

  const fullText = "Real Capability";

  // Infinite typing animation that restarts
  useEffect(() => {
    setMounted(true);
    
    const startTyping = () => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < fullText.length) {
          setTypedText(fullText.slice(0, i + 1));
          i++;
        } else {
          // Restart typing cycle after a delay
          clearInterval(interval);
          setTimeout(startTyping, 1000);
        }
      }, 60);
      return () => clearInterval(interval);
    };

    const timeout = setTimeout(startTyping, 300);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setLoopStep(s => (s + 1) % LOOP_STEPS.length), 1800);
    return () => clearInterval(id);
  }, []);

  const handleMouseMove = useCallback((e) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: var(--op, 0.2); }
          50% { opacity: calc(var(--op, 0.2) * 1.5); }
          100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }

        @keyframes scanLine {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        @keyframes gridPulse {
          0%, 100% { opacity: 0.01; }
          50% { opacity: 0.03; }
        }

        @keyframes orbPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.08); }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.7; }
        }

        @keyframes shimmerGradient {
          0% { backgroundPosition: -200% center; }
          100% { backgroundPosition: 200% center; }
        }

        @keyframes rotateRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes counterRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }

        @keyframes breathe {
          0%, 100% { opacity: 0.5; transform: scaleX(1); }
          50% { opacity: 1; transform: scaleX(1.02); }
        }

        @keyframes badgePop {
          0% { transform: scale(0.8) translateY(10px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        .grid-bg {
          backgroundImage: 
            linear-gradient(rgba(0, 217, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.02) 1px, transparent 1px);
          backgroundSize: 60px 60px;
          animation: gridPulse 8s ease-in-out infinite;
        }

        .scan-line {
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.15), transparent);
          animation: scanLine 8s linear infinite;
          pointer-events: none;
        }
      `}</style>

      <div
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-screen bg-black overflow-hidden flex flex-col"
      >
        {/* Background gradients - subtle and professional */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 -right-40 w-96 h-96 bg-blue-600/25 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl" />
        </div>

        {/* Grid background */}
        <div className="grid-bg absolute inset-0 pointer-events-none" />

        {/* Scan line */}
        <div className="scan-line" />

        {/* Floating particles */}
        {mounted && PARTICLES.map(p => <FloatingParticle key={p.id} p={p} />)}

        {/* Rotating decorative rings */}
        <div className="absolute -right-32 top-1/4 w-96 h-96 border border-white/5 rounded-full pointer-events-none" style={{
          animation: "rotateRing 40s linear infinite",
        }}>
          <div className="absolute inset-10 border border-white/[0.02] rounded-full" style={{
            animation: "counterRotate 25s linear infinite",
          }} />
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 px-6 lg:px-8 py-24 max-w-7xl mx-auto w-full relative z-5">
          {/* LEFT COLUMN */}
          <div className="min-h-0 flex flex-col justify-center">
            {/* Loop indicator */}
            <div className="mb-8 opacity-100 transform-none transition-all duration-600">
              <LoopIndicator step={loopStep} />
            </div>

            {/* Heading */}
            <div className="opacity-100 transform-none transition-all duration-800 mb-6">
              <h1 className="text-6xl lg:text-7xl font-black text-white leading-tight mb-0 tracking-tight">
                Building the <br />
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {typedText}
                  <span className="text-cyan-400 animate-pulse">|</span>
                </span>
              </h1>
            </div>

            {/* Subheading */}
            <p className="text-lg lg:text-xl text-gray-400 max-w-xl mb-10 font-light leading-relaxed">
              Your AI-powered digital twin maps your capability state in real time.{" "}
              <span className="text-white font-semibold">
                Execute real-world tasks. Earn verifiable proof.
              </span>{" "}
              Land elite roles in months, not years.
            </p>

            {/* Trust signals */}
            <div className="flex items-center gap-6 flex-wrap text-sm">
              <div className="flex">
                {["G", "A", "M", "S", "J"].map((l, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-xs font-bold text-white -ml-2 first:ml-0" style={{
                    background: `hsl(${200 + i * 28}, 65%, 48%)`,
                  }}>
                    {l}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-cyan-400 text-xs">★</span>
                  ))}
                </div>
                <span className="text-gray-400 text-sm">
                  Trusted by 12,840+ engineers
                </span>
              </div>
              <div className="w-px h-9 bg-white/10" />
              <div className="text-sm text-gray-500">
                No subscription trap.<br />
                <span className="text-cyan-400">Real capability or money back.</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Digital Twin Visualization */}
          <div className="relative h-96 opacity-100 transform-none transition-all duration-1000 min-h-0 flex items-center justify-center">
            {/* Main viz container */}
            <div className="absolute inset-0 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm overflow-hidden">
              {/* Neural graph */}
              <div className="absolute inset-5">
                <NeuralGraph active={mounted} />
              </div>

              {/* Corner labels */}
              <div className="absolute top-4 left-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                Digital Twin
              </div>
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-gray-500 font-semibold uppercase">LIVE</span>
              </div>

              {/* Animated scan overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-20" style={{
                backgroundImage: `linear-gradient(180deg, transparent 40%, rgba(59, 130, 246, 0.015) 50%, transparent 60%)`,
                animation: "scanLine 6s ease-in-out infinite",
              }} />
            </div>

            {/* Floating capability cards */}
            {[
              { label: "Capability", value: "9.4", x: "-70px", y: "50px", delay: "0s" },
              { label: "Problem Solving", value: "8.7", x: "calc(100% + 15px)", y: "130px", delay: "0.2s" },
              { label: "Growth", value: "↑ 34%", x: "-60px", y: "330px", delay: "0.4s" },
            ].map(card => (
              <div key={card.label} className="absolute bg-black/80 border border-white/10 rounded-xl p-3 backdrop-blur-md min-w-max" style={{
                left: card.x,
                top: card.y,
                animation: `badgePop 0.6s ${card.delay} cubic-bezier(0.16,1,0.3,1) both`,
                boxShadow: `0 10px 40px rgba(0,0,0,0.6), 0 0 24px rgba(59, 130, 246, 0.1)`,
              }}>
                <div className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                  {card.label}
                </div>
                <div className="text-xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {card.value}
                </div>
              </div>
            ))}

            {/* Bottom status bar */}
            <div className="absolute -bottom-5 left-5 right-5 bg-black/90 border border-white/10 rounded-xl p-3 flex items-center justify-between backdrop-blur-md" style={{
              boxShadow: `0 10px 40px rgba(0,0,0,0.6)`,
            }}>
              <span className="text-gray-400 font-medium text-sm">
                Next task generating...
              </span>
              <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden mx-2">
                <div className="h-full w-2/3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" style={{
                  animation: "breathe 2s ease-in-out infinite",
                }} />
              </div>
              <span className="text-cyan-400 font-semibold text-xs uppercase">
                Loop #{loopStep + 1}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom scroll indicator */}
        <div className="relative z-5 flex flex-col items-center py-6 gap-2 opacity-40 transition-opacity duration-1000">
          <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">
            Scroll to explore
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-cyan-400 to-transparent" style={{
            animation: "breathe 2.2s ease-in-out infinite",
          }} />
        </div>
      </div>
    </>
  );
}

export default HeroSection;

