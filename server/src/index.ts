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

const app = express();
app.use(cors());
app.use(express.json());

// mongoose connect
mongoose
  .connect("mongodb://localhost:27017/nexus-ide")
  .then(() => console.log("💾 Connected to MongoDB"))
  .catch((error) => console.error("MongoDB Error:", error));

// API Routes

// FIX 1: Changed route to plural "/projects" and "/files" to match Frontend
app.get("/projects/:projectId/files", async (req, res) => {
  try {
    const projectId = req.params.projectId; // FIX 2: Used 'req.params', not 'req.param'

    // FIX 3: Used 'projectId' (lowercase d) to match your Mongoose Model
    const files = await File.find({ projectId: projectId });
    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// Add a file
app.post("/projects/:projectId/files", async (req, res) => {
  const { name, language } = req.body;
  const newFile = await File.create({
    name,
    projectId: req.params.projectId,
    language: language || "javascript",
    content: "// Start coding...",
  });
  res.json(newFile);
});

// Demo Project Init
app.post("/init-demo", async (req, res) => {
  try {
    // CHANGE 1: Use a new name to force creation
    let project = await Project.findOne({ name: "nexus-project-v2" });

    if (!project) {
      console.log("Creating new project..."); // Add this log to verify it runs

      project = await Project.create({
        name: "nexus-project-v2", // CHANGE 2: Match the name above
        ownerId: "paras-dev",
      });

      await File.create({
        name: "index.js",
        projectId: project._id,
        language: "javascript",
        content: "console.log('Hello World')",
      });

      console.log("Files created!");
    }
    res.json(project);
  } catch (error) {
    console.error("Error initializing demo:", error);
    res.status(500).json({ error: "Failed to init demo" });
  }
});

const RUNTIMES: any = {
  javascript: {
    image: "node:18-alpine",
    command: "node /app/code.js",
    extension: "js",
  },
  python: {
    image: "python:3.10-alpine",
    command: "python3 /app/code.py",
    extension: "py",
  },
  cpp: {
    image: "gcc:latest",
    // C++ needs two steps: Compile (g++) -> then Run (./a.out)
    command: "sh -c 'g++ /app/code.cpp -o /app/a.out && /app/a.out'",
    extension: "cpp",
  },
  java: {
    image: "openjdk:17-alpine",
    // Java is tricky: We force the file to be "Main.java" so "java Main" works
    command: "sh -c 'javac /app/Main.java && java -cp /app Main'",
    extension: "java",
  },
};
// Delete File Route
app.delete("/projects/:projectId/files/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    await File.findByIdAndDelete(fileId);
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete file" });
  }
});

// Execute Code Route
app.post("/execute", async (req, res) => {
  const { code, language } = req.body;
  const runtime = RUNTIMES[language];

  if (!runtime) {
    return res.status(400).json({ error: "Unsupported language" });
  }

  // 1. Create a Temp Directory
  const tempDir = path.join(__dirname, "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  // 2. Save the File
  // Note: For Java, we force the filename to "Main.java" so the class matches
  const fileName = language === "java" ? "Main.java" : `code.${runtime.extension}`;
  const filePath = path.join(tempDir, fileName);
  fs.writeFileSync(filePath, code);

  // 3. Run Docker
  // --rm: Delete container after run
  // -v: Map our temp file to /app/filename inside the container
  const dockerCmd = `docker run --rm -v "${filePath}":/app/${fileName} ${runtime.image} ${runtime.command}`;

  console.log(`Running: ${language}`); // Log for debugging

  exec(dockerCmd, { timeout: 10000 }, (error, stdout, stderr) => {
    // 4. Cleanup: Delete the temp file immediately
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.error("Failed to delete temp file", e);
    }

    // 5. Handle Results
    if (error) {
      // If the container crashed (compiler error), return stderr
      // (We trim it to make it look cleaner)
      return res.json({ output: stderr || error.message });
    }
    res.json({ output: stdout });
  });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000" },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  socket.on("join-project", (projectId) => {
    socket.join(projectId);
    console.log(`User ${socket.id} joined project ${projectId}`);
  });
});

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
