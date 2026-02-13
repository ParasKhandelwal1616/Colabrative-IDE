"use client";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import dynamic from "next/dynamic";
import { Sidebar } from "../components/Sidebar";
import { Terminal } from "../components/Terminal";
import { ChatInterface } from "../components/ChatInterface";
import {
  UserButton,
  SignInButton,
  useUser,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { ClientSideAvtarStack } from "../components/ClientSideAvatarStack";
import { ActiveUser } from "../components/Editor";
import { Code2, Share2, Check, Copy, Zap, Cpu } from "lucide-react";

interface CodeFile {
  _id: string;
  name: string;
  language: string;
}

// Disable SSR for the Editor so it doesn't crash Next.js
const CollaborativeEditor = dynamic(
  () => import("../components/Editor").then((mod) => mod.CollaborativeEditor),
  { ssr: false },
);

export default function EditorPage() {
  const { user, isLoaded } = useUser();
  const [projectOwnerId, setProjectOwnerId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const [files, setFiles] = useState<CodeFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [projectId, setProjectId] = useState<string>("");

  // Terminal State
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [executedCode, setExecutedCode] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_APIURL || "http://localhost:5000";

  // 1. Initialize Project from URL
  useEffect(() => {
    if (!isLoaded) return;

    const params = new URLSearchParams(window.location.search);
    const urlProjectId = params.get("projectId");

    // Redirect if no ID
    if (!urlProjectId) {
      window.location.href = "/dashboard";
      return;
    }

    // Load Project
    fetch(`${API_URL}/projects/${urlProjectId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Project not found");
        return res.json();
      })
      .then((project) => {
        setProjectId(project._id);
        setProjectOwnerId(project.ownerId); // Save Owner ID
        return fetch(`${API_URL}/projects/${project._id}/files`);
      })
      .then((res) => res.json())
      .then((data) => {
        setFiles(data);
        if (data.length > 0) setSelectedFile(data[0]);
      })
      .catch((err) => {
        console.error("Error loading project:", err);
        alert("Project not found");
        window.location.href = "/dashboard";
      });
  }, [isLoaded]);

  // 2. Helper for Language
  const getLanguageFromFileName = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "js":
        return "javascript";
      case "jsx":
        return "javascript";
      case "ts":
        return "typescript";
      case "tsx":
        return "typescript";
      case "py":
        return "python";
      case "java":
        return "java";
      case "cpp":
        return "cpp";
      case "c":
        return "c";
      case "html":
        return "html";
      case "css":
        return "css";
      case "json":
        return "json";
      default:
        return "plaintext";
    }
  };

  const refreshFiles = (id: string) => {
    fetch(`${API_URL}/projects/${id}/files`)
      .then((res) => res.json())
      .then((data) => setFiles(data));
  };

  const handleCreateFile = async (name: string) => {
    if (!projectId) return;
    try {
      const extension = name.split(".").pop();
      const language =
        extension === "py"
          ? "python"
          : extension === "cpp"
            ? "cpp"
            : "javascript";

      const res = await fetch(`${API_URL}/projects/${projectId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, language }),
      });
      if (res.ok) refreshFiles(projectId);
    } catch (error) {
      console.error("Failed to create file", error);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      await fetch(`${API_URL}/projects/${projectId}/files/${fileId}`, {
        method: "DELETE",
      });
      if (selectedFile?._id === fileId) setSelectedFile(null);
      refreshFiles(projectId);
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  // 3. Socket Connection
  useEffect(() => {
    if (!projectId) return;
    const newSocket = io(`${API_URL}`);
    newSocket.emit("join-project", projectId);
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [projectId]);

  // 4. Run Code
  const runCode = async (code: string) => {
    if (!selectedFile) return;
    setIsRunning(true);
    setOutput([]);
    setExecutedCode(code);

    try {
      const response = await fetch(`${API_URL}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: selectedFile.language,
        }),
      });

      const data = await response.json();
      setOutput(data.output ? data.output.split("\n") : ["Error: No output"]);
    } catch (error) {
      setOutput(["Error: Failed to execute code"]);
    } finally {
      setIsRunning(false);
    }
  };

  // 5. Share Function
  const handleCopyInvite = () => {
    const inviteLink = window.location.href;
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // 6. PERMISSIONS
  const isOwner = user && projectOwnerId && user.id === projectOwnerId;
  const isReadOnly = false;

  return (
    <main className="h-screen w-screen flex flex-col bg-[#0a0a0f] text-white overflow-hidden relative">
      {/* Subtle animated background */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] animate-pulse-slow animation-delay-1000" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
        `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* HEADER */}
      <div className="h-14 shrink-0 border-b border-white/[0.08] bg-[#0d0d12]/95 backdrop-blur-xl flex items-center justify-between px-4 z-20 relative shadow-[0_1px_0_0_rgba(255,255,255,0.03)] group">
        {/* Animated top border glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="flex items-center gap-3">
          {/* Logo with enhanced glow */}
          <div className="relative group/logo">
            <div className="absolute inset-0 bg-blue-500/30 rounded-lg blur-md opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300" />
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)] relative z-10 group-hover/logo:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-shadow">
              <Code2 size={16} className="text-blue-400" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-[length:200%_auto] animate-gradient">
              NexusIDE
            </span>

            {/* Status indicator */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">
                Live
              </span>
            </div>
          </div>

          {/* Read Only Badge */}
          {isReadOnly && (
            <span className="ml-2 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
              <span className="inline-flex items-center gap-1.5">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                View Only
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* SHARE BUTTON */}
          {projectId && (
            <button
              onClick={handleCopyInvite}
              className={`group/share relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all overflow-hidden ${
                isCopied
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                  : "bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-700/50 hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
              }`}
            >
              {/* Shimmer effect */}
              {!isCopied && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/share:translate-x-full transition-transform duration-1000" />
              )}

              {isCopied ? (
                <>
                  <Check
                    size={14}
                    className="drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span>Share</span>
                </>
              )}
            </button>
          )}

          {/* Active Users Stack */}
          <div className="flex items-center gap-3 border-x border-white/[0.08] px-4">
            <ClientSideAvtarStack users={activeUsers} />
          </div>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="group/signin relative bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/signin:translate-x-full transition-transform duration-1000" />
                <span className="relative z-10">Sign In</span>
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox:
                    "w-8 h-8 ring-2 ring-zinc-700/50 hover:ring-blue-500/50 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        <Sidebar
          files={files}
          selectedFileId={selectedFile?._id ?? null}
          onFileSelect={(id) =>
            setSelectedFile(files.find((f) => f._id === id) ?? null)
          }
          onFileCreate={handleCreateFile}
          onFileDelete={handleDeleteFile}
          readOnly={isReadOnly}
        />

        <div className="flex-1 flex flex-col relative min-w-0">
          {/* Editor Area with enhanced borders */}
          <div className="flex-1 relative min-h-0 overflow-hidden border-l border-white/[0.08]">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-blue-500/0" />

            {selectedFile ? (
              <div className="h-full relative">
                {/* File tab header */}
                <div className="h-10 border-b border-white/[0.08] bg-[#0d0d12]/50 backdrop-blur-sm flex items-center px-4 gap-2">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                    <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]" />
                    <span className="text-xs font-mono text-blue-300">
                      {selectedFile.name}
                    </span>
                  </div>

                  {/* Language badge */}
                  <div className="px-2 py-0.5 rounded bg-zinc-800/50 border border-zinc-700/50">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                      {getLanguageFromFileName(selectedFile.name)}
                    </span>
                  </div>
                </div>

                {/* Editor container */}
                <div className="h-[calc(100%-2.5rem)]">
                  <CollaborativeEditor
                    key={selectedFile._id}
                    roomId={selectedFile._id}
                    filename={selectedFile.name}
                    language={getLanguageFromFileName(selectedFile.name)}
                    onRun={runCode}
                    onUserChange={(users) => setActiveUsers(users)}
                    readOnly={isReadOnly}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 select-none relative">
                {/* Decorative background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                  <Cpu size={300} className="text-blue-500" />
                </div>

                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.2)]">
                    <Code2 size={32} className="text-blue-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-zinc-400 mb-1">
                      No file selected
                    </p>
                    <p className="text-sm text-zinc-600">
                      Choose a file from the sidebar to start coding
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Terminal with enhanced styling */}
          <div className="border-t border-white/[0.08] relative">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/30 to-emerald-500/0" />
            <Terminal output={output} isRunning={isRunning} code={executedCode} />
          </div>
        </div>
      </div>

      {socket && projectId && (
        <ChatInterface socket={socket} projectId={projectId} />
      )}

      <style jsx global>{`
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

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }

        .animate-gradient {
          animation: gradient 3s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </main>
  );
}
