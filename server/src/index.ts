import express from "express";
import cors from "cors";
import { Project } from "./models/Project";
import { File } from "./models/File";
import { Server } from "socket.io";
import http from "http";
import mongoose from "mongoose";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { createAdapter } from "@socket.io/redis-adapter";
import  { Redis } from "ioredis";
import dotenv from "dotenv";

const app = express();
app.use(cors());
app.use(express.json());

// --- MONGODB CONNECTION ---
dotenv.config();

// 1. Use the Environment Variable (or localhost as a fallback for your laptop)
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/nexus-ide";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("💾 Connected to MongoDB"))
  .catch((error) => console.error("❌ MongoDB Connection Error:", error));

// --- REDIS SETUP ---
const pubClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const subClient = pubClient.duplicate();

pubClient.on("error", (err : string) => console.error("Redis Pub Error:", err));
subClient.on("error", (err : string) => console.error("Redis Sub Error:", err));

// --- RUNTIME CONFIG ---
const RUNTIMES: any = {
  javascript: { image: "node:18-alpine", command: "node /app/code.js", extension: "js" },
  python: { image: "python:3.10-alpine", command: "python3 /app/code.py", extension: "py" },
  cpp: { image: "gcc:latest", command: "sh -c 'g++ /app/code.cpp -o /app/a.out && /app/a.out'", extension: "cpp" },
  java: { image: "openjdk:17-alpine", command: "sh -c 'javac /app/Main.java && java -cp /app Main'", extension: "java" },
};

// ==========================================
// 🚀 API ROUTES
// ==========================================

// 1. GET Project Details (THIS WAS MISSING!)
// Used by the Editor to check if the project exists
app.get("/projects/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// 2. GET All Projects for a User (For Dashboard)
app.get("/projects/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Sort by newest first (-1)
    const projects = await Project.find({ ownerId: userId }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// 3. CREATE Project (Updated to ALWAYS create new)
app.post("/projects/create", async (req, res) => {
  const { name, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Force a unique name if empty, but ALWAYS create a new doc
    const projectName = name || `Untitled Project ${Date.now()}`;
    
    console.log(`Creating NEW project for user: ${userId}`);

    const project = await Project.create({
      name: projectName,
      ownerId: userId,
    });

    // Create default file
    await File.create({
      name: "index.js",
      projectId: project._id,
      language: "javascript",
      content: "console.log('Welcome to NexusIDE!');",
    });
    
    res.json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// 4. Get Project Files
app.get("/projects/:projectId/files", async (req, res) => {
  try {
    const files = await File.find({ projectId: req.params.projectId });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// 5. Create New File
app.post("/projects/:projectId/files", async (req, res) => {
  const { name, language } = req.body;
  try {
    const newFile = await File.create({
      name,
      projectId: req.params.projectId,
      language: language || "javascript",
      content: "// Start coding...",
    });
    res.json(newFile);
  } catch (err) {
    res.status(500).json({ error: "Failed to create file" });
  }
});

// 6. Delete File
app.delete("/projects/:projectId/files/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    await File.findByIdAndDelete(fileId);
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete file" });
  }
});

app.delete("/projects/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // 1. Delete all files belonging to this project first
    await File.deleteMany({ projectId: projectId });

    // 2. Delete the project itself
    await Project.findByIdAndDelete(projectId);

    res.json({ message: "Project and associated files deleted successfully" });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// ---------------------------------------------------------
// RENAME Project
// ---------------------------------------------------------
app.patch("/projects/:projectId", async (req, res) => {
  try {
    const { name } = req.body;
    const projectId = req.params.projectId;

    if (!name) return res.status(400).json({ error: "Name is required" });

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { name },
      { new: true } // Return the updated document
    );

    if (!updatedProject) return res.status(404).json({ error: "Project not found" });

    res.json(updatedProject);
  } catch (err) {
    console.error("Error renaming project:", err);
    res.status(500).json({ error: "Failed to rename project" });
  }
});

// 7. Execute Code
app.post("/execute", async (req, res) => {
  const { code, language } = req.body;
  const runtime = RUNTIMES[language];

  if (!runtime) {
    return res.status(400).json({ error: "Unsupported language" });
  }

  const tempDir = path.join(__dirname, "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const fileName = language === "java" ? "Main.java" : `code.${runtime.extension}`;
  const filePath = path.join(tempDir, fileName);
  fs.writeFileSync(filePath, code);

  const dockerCmd = `docker run --rm -v "${filePath}":/app/${fileName} ${runtime.image} ${runtime.command}`;

  console.log(`Running: ${language}`);

  exec(dockerCmd, { timeout: 10000 }, (error, stdout, stderr) => {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.error("Failed to delete temp file");
    }

    if (error) {
      return res.json({ output: stderr || error.message });
    }
    res.json({ output: stdout });
  });
});

// --- SOCKET.IO SERVER ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  adapter: createAdapter(pubClient, subClient),
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-project", (projectId) => {
    socket.join(projectId);
    console.log(`User ${socket.id} joined project ${projectId}`);
  });

  socket.on("send-message", (data) => {
    socket.to(data.projectId).emit("receive-message", data);
  });
});

// --- START SERVER ---
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("Redis Adapter connected");
});