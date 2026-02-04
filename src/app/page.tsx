"use client";
import { useEffect } from "react";
import { io } from "socket.io-client";

export default function Home() {
  useEffect(() => {
    const socket = io("http://localhost:5000");
    socket.emit("join-project", "project-test1");
  }, []);


return (
  <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <h1 className="text-2xl font-bold">NexusIDE: Environment Setup Complete</h1>
    </main>
)
}