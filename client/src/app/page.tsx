"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import dynamic from "next/dynamic";
import { Sidebar } from "./components/Sidebar";
import { Terminal } from "./components/Terminal";


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

  useEffect(() => {
    // 1. Initialize the Demo Project (Make sure Server is running!)
    fetch("http://localhost:5000/init-demo", { method: "POST" })
      .then((res) => res.json())
      .then((project) => {
        setProjectId(project._id);
        // 2. Fetch Files for this project
        return fetch(`http://localhost:5000/projects/${project._id}/files`);
      })
      .then((res) => res.json())
      .then((data) => {
        setFiles(data);
        if (data.length > 0) setSelectedFile(data[0]);
      })
      .catch((err) => console.error("Error init:", err));
  }, []);

  useEffect(() => {
    if (!projectId) return;

    // Connect to Main API Server (Port 5000)
    const socket = io("http://localhost:5000");
    socket.emit("join-project", projectId);

    return () => {
      socket.disconnect();
    };
  }, [projectId]);

  // function to refresh the files list
  const refreshFiles = (id: string) => {
    fetch(`http://localhost:5000/projects/${id}/files`)
      .then((res) => res.json())
      .then((data) => setFiles(data));
  };

  // NEW: Handle File Creation
  const handleCreateFile = async (name: string) => {
    if (!projectId) return;

    try {
      // 1. Determine language from extension
      const extension = name.split(".").pop();
      // Inside handleCreateFile

      const language =
        extension === "js"
          ? "javascript"
          : extension === "py"
            ? "python" // Add Python
            : extension === "java"
              ? "java" // Add Java
              : extension === "cpp"
                ? "cpp" // Add C++
                : "plaintext";
      // 2. Call API
      const res = await fetch(
        `http://localhost:5000/projects/${projectId}/files`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, language }),
        },
      );

      if (res.ok) {
        // 3. Refresh list so the new file appears
        refreshFiles(projectId);
      }
    } catch (error) {
      console.error("Failed to create file", error);
    }
  };

  // API Call to Execute Code
  const runCode = async (code: string) => {
    setIsRunning(true);
    setOutput([]); // Clear previous output

    try {
      const response = await fetch("http://localhost:5000/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
        code, 
        language: selectedFile.language // <--- Send the file's language!
      }),
      });

      const data = await response.json();
      setOutput(data.output.split("\n")); // Split output into lines
    } catch (error) {
      setOutput(["Error: Failed to execute code"]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <main className="h-screen w-screen flex bg-zinc-950 text-white overflow-hidden">
      <Sidebar
        files={files}
        selectedFileId={selectedFile?._id}
        onFileSelect={(id) => setSelectedFile(files.find((f) => f._id === id))}
        onFileCreate={handleCreateFile}
      />

      <div className="flex-1 flex flex-col">
        {/* Editor Area (Takes available space) */}
        <div className="flex-1 relative">
          {selectedFile ? (
            <CollaborativeEditor
              key={selectedFile._id}
              roomId={selectedFile._id}
              onRun={runCode} // <--- Pass the run function
            />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500">
              Select a file...
            </div>
          )}
        </div>

        {/* Terminal Area (Fixed height at bottom) */}
        <Terminal output={output} isRunning={isRunning} />
      </div>
    </main>
  );
}
