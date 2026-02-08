"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import dynamic from "next/dynamic";
import { Sidebar } from "./components/Sidebar";
import { Terminal } from "./components/Terminal";
import {
  UserButton,
  SignInButton,
  useUser,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { ClientSideAvtarStack } from "./components/ClientSideAvatarStack";

// Disable SSR for the Editor so it doesn't crash Next.js
const CollaborativeEditor = dynamic(
  () => import("./components/Editor").then((mod) => mod.CollaborativeEditor),
  { ssr: false },
);

export default function Home() {
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [projectId, setProjectId] = useState<string>("");

  // Terminal State
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);

  // 1. Initialize Demo
  useEffect(() => {
    fetch("http://localhost:5000/init-demo", { method: "POST" })
      .then((res) => res.json())
      .then((project) => {
        setProjectId(project._id);
        return fetch(`http://localhost:5000/projects/${project._id}/files`);
      })
      .then((res) => res.json())
      .then((data) => {
        setFiles(data);
        if (data.length > 0) setSelectedFile(data[0]);
      })
      .catch((err) => console.error("Error init:", err));
  }, []);

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

  // 3. Socket Connection (Keep alive)
  useEffect(() => {
    if (!projectId) return;
    const socket = io("http://localhost:5000");
    socket.emit("join-project", projectId);
    return () => {
      socket.disconnect();
    };
  }, [projectId]);

  // 4. Refresh List
  const refreshFiles = (id: string) => {
    fetch(`http://localhost:5000/projects/${id}/files`)
      .then((res) => res.json())
      .then((data) => setFiles(data));
  };

  // 5. Create File
  const handleCreateFile = async (name: string) => {
    if (!projectId) return;
    try {
      const extension = name.split(".").pop();
      const language =
        extension === "js"
          ? "javascript"
          : extension === "py"
            ? "python"
            : extension === "java"
              ? "java"
              : extension === "cpp"
                ? "cpp"
                : "plaintext";

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

  // 6. Delete File
  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      await fetch(
        `http://localhost:5000/projects/${projectId}/files/${fileId}`,
        {
          method: "DELETE",
        },
      );
      if (selectedFile?._id === fileId) setSelectedFile(null);
      refreshFiles(projectId);
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  // 7. Run Code
  const runCode = async (code: string) => {
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
      setOutput(data.output.split("\n"));
    } catch (error) {
      setOutput(["Error: Failed to execute code"]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <main className="h-screen w-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
      {/* HEADER */}
      <div className="h-20 shrink-0 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-4 z-20 relative">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-500 rounded-sm rotate-45" />
          <span className="  p-1 font-bold text-4xl tracking-tight">
            NexusIDE
          </span>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          {selectedFile && (
            <div className="mr-4 border-r border-zinc-700 pr-4">
              <ClientSideAvtarStack users={activeUsers} />
            </div>
          )}
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
                    " w-12 h-12 ring-2 ring-zinc-700 hover:ring-blue-500 transition-all",
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
          selectedFileId={selectedFile?._id}
          onFileSelect={(id) =>
            setSelectedFile(files.find((f) => f._id === id))
          }
          onFileCreate={handleCreateFile}
          onFileDelete={handleDeleteFile} // <--- Added this back!
        />

        <div className="flex-1 flex flex-col relative min-w-0">
          {/* EDITOR AREA - Added min-h-0 to fix overflow */}
          <div className="flex-1 relative min-h-0 overflow-hidden">
            {selectedFile ? (
              <CollaborativeEditor
                key={selectedFile._id}
                roomId={selectedFile._id}
                language={getLanguageFromFileName(selectedFile.name)}
                onRun={runCode}
                onUserChange={(users) => setActiveUsers(users)} // <--- CONNECT HERE
              />
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500 select-none">
                Select a file to start coding...
              </div>
            )}
          </div>

          {/* TERMINAL AREA - Fixed height */}
          <Terminal output={output} isRunning={isRunning} />
        </div>
      </div>
    </main>
  );
}
