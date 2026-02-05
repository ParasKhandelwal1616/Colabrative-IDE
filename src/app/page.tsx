"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import dynamic from "next/dynamic"; // 1. Import dynamic
import { Sidebar } from "./components/Sidebar";

// 2. THIS FIXES THE 500 ERROR
// We tell Next.js: "Do not load this on the server. Wait for the browser."
const CollaborativeEditor = dynamic(
  () => import("./components/Editor").then((mod) => mod.CollaborativeEditor),
  { ssr: false }
);

export default function Home() {
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [projectId, setProjectId] = useState<string>("");

  useEffect(() => {
    // 1. Initialize the Demo Project
    fetch("http://localhost:5000/init-demo", { method: "POST" })
      .then((res) => res.json())
      .then((project) => {
        setProjectId(project._id);
        // 2. Fetch Files
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
    if (!projectId) return; // Don't connect until we have a Project ID

    const socket = io("http://localhost:5000");
    socket.emit("join-project", projectId);

    return () => {
      socket.disconnect();
    };
  }, [projectId]); // <--- Added dependency so it runs AFTER we get the ID

  return (
    <main className="h-screen w-screen flex bg-zinc-950 text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        files={files} 
        selectedFileId={selectedFile?._id} 
        onFileSelect={(id) => setSelectedFile(files.find((f) => f._id === id))} 
      />

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <CollaborativeEditor 
             // KEY TRICK: Forces remount when file changes
             key={selectedFile._id} 
             roomId={selectedFile._id} 
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500">
            Select a file to start editing
          </div>
        )}
      </div>
    </main>
  );
}