"use client";
import { useUser, SignedIn, UserButton } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Code2,
  Users,
  Loader2,
  Folder,
  Copy,
  Check,
  Trash2,
  Pencil,
} from "lucide-react";

interface Project {
  _id: string;
  name: string;
  createdAt: string;
}

// ✅ FIX 1: Move Class OUTSIDE the component to satisfy Next.js/React rules
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

  // ✅ FIX 2: Pass ctx as argument
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function Dashboard() {
  const { user } = useUser();
  const router = useRouter();

  // ✅ FIX 3: Correct Env Var Name
  const API_URL = process.env.NEXT_PUBLIC_APIURL || "http://localhost:5000";
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State
  const [joinId, setJoinId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Rename State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // MODAL STATE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  // Particle Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas.width, canvas.height));
    }

    let animationId: number;

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw(ctx); // Pass ctx here
      });

      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 * (1 - distance / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // ✅ FIX 4: Proper Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // 1. Fetch User's Projects
  useEffect(() => {
    if (user) {
      fetch(`${API_URL}/projects/user/${user.id}`, {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then((data) => {
          setProjects(data);
          setIsLoadingProjects(false);
        })
        .catch((err) => {
          console.error("Failed to load projects:", err);
          setIsLoadingProjects(false);
        });
    }
  }, [user, API_URL]); // ✅ FIX: Added API_URL dependency

  // 2. CREATE PROJECT (Step 1: Open Modal)
  const openCreateModal = () => {
    setNewProjectName("");
    setIsModalOpen(true);
  };

  // 3. CONFIRM CREATE (Step 2: Call API)
  const handleCreateProject = async () => {
    if (!user || !newProjectName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch(`${API_URL}/projects/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          name: newProjectName,
          userId: user.id,
        }),
      });
      const data = await res.json();
      if (data._id) router.push(`/editor?projectId=${data._id}`);
    } catch (error) {
      console.error("Failed to create:", error);
    } finally {
      setIsCreating(false);
      setIsModalOpen(false);
    }
  };

  // 4. JOIN PROJECT
  const handleJoinProject = (e: React.FormEvent) => {
    e.preventDefault();
    let id = joinId.trim();
    if (id.includes("projectId=")) id = id.split("projectId=")[1];
    if (id) router.push(`/editor?projectId=${id}`);
  };

  // 5. DELETE PROJECT
  const handleDeleteProject = async (
    e: React.MouseEvent,
    projectId: string,
  ) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "⚠️ Are you sure? This will delete the project and all files.",
      )
    )
      return;

    try {
      const res = await fetch(`${API_URL}/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
      if (res.ok)
        setProjects((prev) => prev.filter((p) => p._id !== projectId));
    } catch (error) {
      alert("Failed to delete project.");
    }
  };

  // 6. RENAME LOGIC
  const startEditing = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditingId(project._id);
    setEditName(project.name);
  };

  const saveRename = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingId || !editName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/projects/${editingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ name: editName }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p._id === editingId ? { ...p, name: editName } : p)),
        );
        setEditingId(null);
      }
    } catch (error) {
      alert("Failed to rename project");
    }
  };

  const copyProjectId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col font-sans relative overflow-hidden">
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

      {/* --- CREATE PROJECT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900/90 border border-zinc-700/50 rounded-2xl p-6 w-full max-w-md shadow-[0_0_60px_rgba(59,130,246,0.3)] backdrop-blur-xl relative overflow-hidden">
            {/* Modal Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                Name your Project
              </h2>
              <input
                type="text"
                placeholder="e.g. AI Chatbot, Portfolio Site..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all mb-6"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim() || isCreating}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transition-all"
                >
                  {isCreating ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    "Create Project"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="h-16 border-b border-white/5 bg-[#09090b]/60 flex items-center justify-between px-6 backdrop-blur-2xl sticky top-0 z-40 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <Code2 size={18} className="text-blue-500" />
          </div>
          <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-[length:200%_auto] animate-gradient">
            NexusIDE Dashboard
          </span>
        </div>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </nav>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full relative z-10">
        {/* Header & Create Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-400 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              Welcome back, {user?.firstName || "Developer"}
            </h1>
            <p className="text-zinc-400 mt-1">
              Manage your projects or join a session.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] hover:scale-105 relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            <Plus className="w-4 h-4 relative z-10" />
            <span className="relative z-10">New Project</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Join Card */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] group relative overflow-hidden">
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(168,85,247,0.3)] group-hover:scale-110 transition-transform duration-300">
                  <Users className="text-purple-400 w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-zinc-100">Join a Team</h3>
                <p className="text-sm text-zinc-500 mt-1 mb-4">
                  Paste a Project ID or URL to join.
                </p>
                <form onSubmit={handleJoinProject} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste ID or Link..."
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!joinId}
                    className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all"
                  >
                    Join
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Project List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Folder className="w-5 h-5 text-zinc-400" /> Your Projects
            </h2>
            {isLoadingProjects ? (
              <div className="text-zinc-500 flex items-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" /> Loading...
              </div>
            ) : projects.length === 0 ? (
              <div className="p-8 border border-dashed border-zinc-800 text-center text-zinc-500 rounded-2xl backdrop-blur-sm bg-zinc-900/30">
                No projects yet. Create one to get started!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <div
                    key={project._id}
                    onClick={() =>
                      router.push(`/editor?projectId=${project._id}`)
                    }
                    className="group cursor-pointer p-5 rounded-xl bg-zinc-900/40 border border-white/10 hover:border-blue-500/40 hover:bg-zinc-900/60 transition-all duration-500 flex flex-col justify-between relative backdrop-blur-sm hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:scale-[1.02] overflow-hidden"
                  >
                    {/* Card Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2000ms] pointer-events-none" />

                    <div className="relative z-10">
                      {/* Top Row: Icon + Actions */}
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.2)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] group-hover:scale-110">
                          <Code2 className="w-5 h-5" />
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => startEditing(e, project)}
                            className="text-zinc-600 hover:text-blue-400 p-2 rounded-md hover:bg-blue-500/10 transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={(e) => copyProjectId(e, project._id)}
                            className="text-zinc-600 hover:text-white p-2 rounded-md hover:bg-white/10 transition-all"
                          >
                            {copiedId === project._id ? (
                              <Check
                                size={16}
                                className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                              />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                          <button
                            onClick={(e) => handleDeleteProject(e, project._id)}
                            className="text-zinc-600 hover:text-red-500 p-2 rounded-md hover:bg-red-500/10 transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Row: Name */}
                      <div className="mt-4 h-12 flex flex-col justify-center">
                        {editingId === project._id ? (
                          <div
                            className="flex gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="bg-black/50 border border-blue-500/50 rounded px-2 py-1 text-sm w-full focus:outline-none text-white focus:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-shadow"
                              autoFocus
                            />
                            <button
                              onClick={saveRename}
                              className="text-green-500 hover:bg-green-500/10 p-1 rounded transition-all hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                            >
                              <Check size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-semibold text-zinc-200 group-hover:text-white truncate transition-colors">
                              {project.name}
                            </h3>
                            <p className="text-xs text-zinc-500 mt-1">
                              Created{" "}
                              {new Date(project.createdAt).toLocaleDateString()}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

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
      `}</style>
    </div>
  );
}
