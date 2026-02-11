"use client";

import {
  SignInButton,
  SignedIn,
  SignedOut,
  useUser,
  UserButton,
} from "@clerk/nextjs";
import {
  ArrowRight,
  Code2,
  Terminal,
  Users,
  Cpu,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const particleCount = 80;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      canvasWidth: number;
      canvasHeight: number;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.x = Math.random() * this.canvasWidth;
        this.y = Math.random() * this.canvasHeight;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > this.canvasWidth) this.x = 0;
        if (this.x < 0) this.x = this.canvasWidth;
        if (this.y > this.canvasHeight) this.y = 0;
        if (this.y < 0) this.y = this.canvasHeight;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas.width, canvas.height));
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            if (!ctx) return;
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 * (1 - distance / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-blue-500/30 relative overflow-hidden">
      {/* Animated Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px] animate-blob animation-delay-4000" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#09090b]/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-shadow">
              <Code2 size={18} className="text-blue-500" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-[length:200%_auto] animate-gradient">
              NexusIDE
            </span>
          </div>

          <div className="flex items-center gap-6">
            <SignedIn>
              <Link href="/editor">
                <button className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors relative group">
                  Go to Editor
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-full transition-all duration-300" />
                </button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-zinc-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-shadow">
          <Sparkles size={12} className="animate-pulse" />
          <span>v2.0 Now Available with AI Chat</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-blue-100 to-blue-400 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
          Code Together, <br /> Build Faster.
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
          NexusIDE is the ultra-fast cloud editor for modern teams. Collaborate
          in real-time, run code instantly, and deploy with one click.
        </p>

        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000">
          <SignedIn>
            <Link href="/editor">
              <button className="group relative bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-[0_0_40px_rgba(59,130,246,0.4),0_0_80px_rgba(59,130,246,0.2)] hover:shadow-[0_0_60px_rgba(59,130,246,0.6),0_0_100px_rgba(59,130,246,0.3)] hover:scale-105 overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                <span className="flex items-center gap-2 relative z-10">
                  Launch Editor{" "}
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </span>
              </button>
            </Link>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="group relative bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-[0_0_40px_rgba(59,130,246,0.4),0_0_80px_rgba(59,130,246,0.2)] hover:shadow-[0_0_60px_rgba(59,130,246,0.6),0_0_100px_rgba(59,130,246,0.3)] hover:scale-105 overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                <span className="flex items-center gap-2 relative z-10">
                  Start Coding for Free{" "}
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </span>
              </button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* MOCKUP IMAGE (Enhanced) */}
        <div className="mt-20 w-full max-w-5xl aspect-video bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 rounded-xl border border-white/10 shadow-[0_0_60px_rgba(59,130,246,0.4),0_20px_40px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-lg group hover:border-blue-500/40 transition-all hover:shadow-[0_0_80px_rgba(59,130,246,0.6),0_25px_50px_rgba(0,0,0,0.8)] hover:scale-[1.02] duration-500">
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent z-10" />

          {/* Animated Border Glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 blur-xl animate-border-flow" />
          </div>

          {/* Fake UI Header */}
          <div className="h-10 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2 relative z-20">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500 border border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              <div className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-500/50 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
              <div className="w-3 h-3 rounded-full bg-green-500 border border-green-500/50 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            </div>
            <div className="w-32 h-2 rounded-full bg-white/10 ml-4" />
          </div>

          {/* Fake Code Content */}
          <div className="p-8 font-mono text-sm text-left opacity-80 relative z-20">
            <span className="text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]">
              const
            </span>{" "}
            <span className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]">
              future
            </span>{" "}
            ={" "}
            <span className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
              await
            </span>{" "}
            <span className="text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">
              build(
            </span>
            <span className="text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]">
              &quot;NexusIDE&quot;
            </span>
            <span className="text-green-400">)</span>;
            <br />
            <span className="text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]">
              if
            </span>{" "}
            (future.isAwesome) {"{"}
            <br />
            &nbsp;&nbsp;
            <span className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]">
              console
            </span>
            .
            <span className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
              log
            </span>
            (
            <span className="text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]">
              &quot;Deploying to production...&quot;
            </span>
            );
            <br />
            {"}"}
            <span className="w-2 h-4 bg-blue-500 inline-block align-middle ml-1 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
          </div>

          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2000ms] z-30 pointer-events-none" />
        </div>
      </main>

      {/* FEATURES GRID */}
      <section className="py-24 px-6 border-t border-white/5 bg-zinc-900/30 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Cpu className="text-blue-400" />}
            title="Instant Runtimes"
            desc="Spin up Node.js, Python, or C++ environments in milliseconds. No setup required."
            color="blue"
          />
          <FeatureCard
            icon={<Users className="text-purple-400" />}
            title="Real-time Collab"
            desc="Code with your team like you're in the same room. Live cursors, chat, and instant sync."
            color="purple"
          />
          <FeatureCard
            icon={<Terminal className="text-green-400" />}
            title="Cloud Terminal"
            desc="Full root access terminal right in your browser. Install packages, run scripts, and deploy."
            color="green"
          />
        </div>
      </section>

      <style jsx global>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% center;
          }
          50% {
            background-position: 100% center;
          }
          100% {
            background-position: 0% center;
          }
        }

        @keyframes border-flow {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-gradient {
          animation: gradient 3s linear infinite;
        }

        .animate-border-flow {
          animation: border-flow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: "blue" | "purple" | "green";
}) {
  const colorClasses = {
    blue: "hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:border-blue-500/30",
    purple:
      "hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:border-purple-500/30",
    green:
      "hover:shadow-[0_0_40px_rgba(34,197,94,0.3)] hover:border-green-500/30",
  };

  return (
    <div
      className={`p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-500 backdrop-blur-sm hover:scale-105 hover:bg-white/10 ${colorClasses[color]} group relative overflow-hidden`}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="w-12 h-12 rounded-lg bg-black/50 flex items-center justify-center mb-4 text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 relative z-10">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-zinc-100 relative z-10">
        {title}
      </h3>
      <p className="text-zinc-400 leading-relaxed relative z-10">{desc}</p>
    </div>
  );
}
