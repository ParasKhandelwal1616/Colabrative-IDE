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
import { Code2, Share2, Check, Copy } from "lucide-react";

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
    fetch(`http://localhost:5000/projects/${urlProjectId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Project not found");
        return res.json();
      })
      .then((project) => {
        setProjectId(project._id);
        setProjectOwnerId(project.ownerId); // Save Owner ID
        return fetch(`http://localhost:5000/projects/${project._id}/files`);
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
    fetch(`http://localhost:5000/projects/${id}/files`)
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

      const res = await fetch(
        `http://localhost:5000/projects/${projectId}/files`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, language }),
        },
      );
      if (res.ok) refreshFiles(projectId);
    } catch (error) {
      console.error("Failed to create file", error);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      await fetch(
        `http://localhost:5000/projects/${projectId}/files/${fileId}`,
        { method: "DELETE" },
      );
      if (selectedFile?._id === fileId) setSelectedFile(null);
      refreshFiles(projectId);
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  // 3. Socket Connection
  useEffect(() => {
    if (!projectId) return;
    const newSocket = io("http://localhost:5000");
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

    try {
      const response = await fetch("http://localhost:5000/execute", {
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
  // Owner = Logged In AND Matching ID
  // Viewer = Not Logged In OR ID Mismatch
  const isOwner = user && projectOwnerId && user.id === projectOwnerId;
  const isReadOnly = false;

  return (
    <main className="h-screen w-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
      {/* HEADER */}
      <div className="h-14 shrink-0 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-4 z-20 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Code2 size={18} className="text-blue-500" />
          </div>
          <span className="p-1 font-bold text-lg tracking-tight">NexusIDE</span>

          {/* Read Only Badge */}
          {isReadOnly && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium border border-yellow-500/20">
              View Only
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* SHARE BUTTON */}
          {projectId && (
            <button
              onClick={handleCopyInvite}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                isCopied
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700"
              }`}
            >
              {isCopied ? <Check size={14} /> : <Share2 size={14} />}
              {isCopied ? "Copied!" : "Share"}
            </button>
          )}

          {/* Active Users Stack */}
          <div className="mr-4 border-r border-zinc-700 pr-4">
            <ClientSideAvtarStack users={activeUsers} />
          </div>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox:
                    "w-8 h-8 ring-2 ring-zinc-700 hover:ring-blue-500 transition-all",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          files={files}
          selectedFileId={selectedFile?._id ?? null}
          onFileSelect={(id) =>
            setSelectedFile(files.find((f) => f._id === id) ?? null)
          }
          onFileCreate={handleCreateFile}
          onFileDelete={handleDeleteFile}
          readOnly={isReadOnly} // <--- PERMISSION CONTROL
        />

        <div className="flex-1 flex flex-col relative min-w-0">
          <div className="flex-1 relative min-h-0 overflow-hidden">
            {selectedFile ? (
              <CollaborativeEditor
                key={selectedFile._id}
                roomId={selectedFile._id}
                filename={selectedFile.name}
                language={getLanguageFromFileName(selectedFile.name)}
                onRun={runCode}
                onUserChange={(users) => setActiveUsers(users)}
                readOnly={isReadOnly} // <--- PERMISSION CONTROL
              />
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500 select-none">
                Select a file to start coding...
              </div>
            )}
          </div>
          <Terminal output={output} isRunning={isRunning} />
        </div>
      </div>

      {socket && projectId && (
        <ChatInterface socket={socket} projectId={projectId} />
      )}
    </main>
  );
}
