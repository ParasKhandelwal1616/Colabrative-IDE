"use client";
import { useUser, SignedIn, UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
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
  X,
} from "lucide-react";

interface Project {
  _id: string;
  name: string;
  createdAt: string;
}

export default function Dashboard() {
  const { user } = useUser();
  const router = useRouter();

  // State
  const [joinId, setJoinId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Rename State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // MODAL STATE (NEW)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  // 1. Fetch User's Projects
  useEffect(() => {
    if (user) {
      fetch(`http://localhost:5000/projects/user/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setProjects(data);
          setIsLoadingProjects(false);
        })
        .catch((err) => console.error("Failed to load projects:", err));
    }
  }, [user]);

  // 2. CREATE PROJECT (Step 1: Open Modal)
  const openCreateModal = () => {
    setNewProjectName(""); // Reset input
    setIsModalOpen(true);
  };

  // 3. CONFIRM CREATE (Step 2: Call API)
  const handleCreateProject = async () => {
    if (!user || !newProjectName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch("http://localhost:5000/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName, // <--- Use user input
          userId: user.id,
        }),
      });
      const data = await res.json();
      if (data._id) router.push(`/editor?projectId=${data._id}`);
    } catch (error) {
      console.error("Failed to create:", error);
    } finally {
      setIsCreating(false);
      setIsModalOpen(false); // Close Modal
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
      const res = await fetch(`http://localhost:5000/projects/${projectId}`, {
        method: "DELETE",
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
      const res = await fetch(`http://localhost:5000/projects/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col font-sans relative">
      {/* --- CREATE PROJECT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              Name your Project
            </h2>
            <input
              type="text"
              placeholder="e.g. AI Chatbot, Portfolio Site..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all mb-6"
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
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
      )}

      {/* NAVBAR */}
      <nav className="h-16 border-b border-white/5 bg-[#09090b]/80 flex items-center justify-between px-6 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Code2 className="text-blue-500" />
          <span className="font-bold text-lg">NexusIDE Dashboard</span>
        </div>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </nav>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {/* Header & Create Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
              Welcome back, {user?.firstName || "Developer"}
            </h1>
            <p className="text-zinc-400 mt-1">
              Manage your projects or join a session.
            </p>
          </div>
          {/* BUTTON NOW OPENS MODAL */}
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Join Card */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
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
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50"
                />
                <button
                  type="submit"
                  disabled={!joinId}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  Join
                </button>
              </form>
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
              <div className="p-8 border border-dashed border-zinc-800 text-center text-zinc-500 rounded-2xl">
                No projects yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <div
                    key={project._id}
                    onClick={() =>
                      router.push(`/editor?projectId=${project._id}`)
                    }
                    className="group cursor-pointer p-5 rounded-xl bg-zinc-900/30 border border-white/5 hover:border-blue-500/30 hover:bg-zinc-900/80 transition-all flex flex-col justify-between relative"
                  >
                    {/* Top Row: Icon + Actions */}
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Code2 className="w-5 h-5" />
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => startEditing(e, project)}
                          className="text-zinc-600 hover:text-blue-400 p-2 rounded-md hover:bg-blue-500/10"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={(e) => copyProjectId(e, project._id)}
                          className="text-zinc-600 hover:text-white p-2 rounded-md hover:bg-white/10"
                        >
                          {copiedId === project._id ? (
                            <Check size={16} className="text-green-500" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                        <button
                          onClick={(e) => handleDeleteProject(e, project._id)}
                          className="text-zinc-600 hover:text-red-500 p-2 rounded-md hover:bg-red-500/10"
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
                            className="bg-black/50 border border-blue-500/50 rounded px-2 py-1 text-sm w-full focus:outline-none text-white"
                            autoFocus
                          />
                          <button
                            onClick={saveRename}
                            className="text-green-500 hover:bg-green-500/10 p-1 rounded"
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-semibold text-zinc-200 group-hover:text-white truncate">
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
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
