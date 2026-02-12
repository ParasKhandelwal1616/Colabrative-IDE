import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { Project } from "./models/Project";
import { File } from "./models/File";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

// ⚠️ REDIS: Optional for Local Dev (Prevents crash if Redis is down)
// Only import these if you are 100% sure Redis is running
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(cors({
    origin: "*", // Allow ALL origins (Vercel, Localhost, etc.)
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"],
    credentials: true
}));
app.use(express.json());

// --- MONGODB CONNECTION ---
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/nexus-ide";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("💾 Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// --- SERVER HTTP ---
const server = http.createServer(app);

// --- SOCKET.IO SETUP ---
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ⚠️ REDIS ADAPTER SETUP (Safe Mode)
// Only attach Redis adapter if REDIS_URL exists, otherwise use default memory
if (process.env.REDIS_URL) {
  const pubClient = new Redis(process.env.REDIS_URL);
  const subClient = pubClient.duplicate();
  
  Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      io.adapter(createAdapter(pubClient, subClient));
      console.log("✅ Redis Adapter Connected");
  }).catch((err) => {
      // Don't crash, just log warning
      console.warn("⚠️ Redis connection failed. Falling back to Memory Adapter.", err.message);
  });
} else {
    console.log("ℹ️ No REDIS_URL found. Using in-memory Socket adapter.");
}

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

// 1. GET Project Details
app.get("/projects/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log(`🔍 Fetching Project: ${projectId}`);
    
    // Validate ID format to prevent CastError
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid Project ID format" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
        console.log("❌ Project Not Found");
        return res.status(404).json({ error: "Project not found" });
    }
    
    res.json(project);
  } catch (err) {
    console.error("❌ Error fetching project:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// 2. GET All Projects for a User
app.get("/projects/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`📋 Fetching projects for user: ${userId}`);
    const projects = await Project.find({ ownerId: userId }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error("❌ Error fetching user projects:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// 3. CREATE Project
app.post("/projects/create", async (req, res) => {
  const { name, userId } = req.body;
  console.log(`📝 Creating project '${name}' for user '${userId}'`);

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const project = await Project.create({
      name: name || "Untitled Project",
      ownerId: userId,
    });

    // Create default file
    await File.create({
      name: "index.js",
      projectId: project._id,
      language: "javascript",
      content: "console.log('Welcome to NexusIDE!');",
    });
    
    console.log(`✅ Project created: ${project._id}`);
    res.json(project);
  } catch (error) {
    console.error("❌ Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// 4. Get Project Files
app.get("/projects/:projectId/files", async (req, res) => {
  try {
    const files = await File.find({ projectId: req.params.projectId });
    res.json(files);
  } catch (error) {
    console.error("❌ Error fetching files:", error);
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
    await File.findByIdAndDelete(req.params.fileId);
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete file" });
  }
});

// 7. Execute Code (Windows Compatible Fix)
app.post("/execute", async (req, res) => {
  const { code, language } = req.body;
  const runtime = RUNTIMES[language];

  if (!runtime) return res.status(400).json({ error: "Unsupported language" });

  const tempDir = path.join(__dirname, "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const fileName = language === "java" ? "Main.java" : `code.${runtime.extension}`;
  const filePath = path.join(tempDir, fileName);
  fs.writeFileSync(filePath, code);

  // FIX: Docker on Windows needs absolute paths with forward slashes or specific formatting
  const absolutePath = path.resolve(filePath); 
  const dockerCmd = `docker run --rm -v "${absolutePath}":/app/${fileName} ${runtime.image} ${runtime.command}`;

  console.log(`⚡ Executing ${language} code...`);

  exec(dockerCmd, { timeout: 10000 }, (error, stdout, stderr) => {
    // Cleanup
    try { fs.unlinkSync(filePath); } catch (e) {}

    if (error) {
      console.error("❌ Execution Error:", stderr || error.message);
      return res.json({ output: stderr || error.message });
    }
    console.log("✅ Execution Success");
    res.json({ output: stdout });
  });
});

// --- SOCKET.IO EVENTS ---
io.on("connection", (socket) => {
  console.log(`🔌 User Connected: ${socket.id}`);

  socket.on("join-project", (projectId) => {
    socket.join(projectId);
    console.log(`👥 User ${socket.id} joined project ${projectId}`);
  });

  socket.on("code-change", (data) => {
    socket.to(data.roomId).emit("code-update", data.code);
  });

  socket.on("send-message", (data) => {
    socket.to(data.projectId).emit("receive-message", data);
  });

  socket.on("disconnect", () => {
    console.log(`❌ User Disconnected: ${socket.id}`);
  });
});

// --- START SERVER ---
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});