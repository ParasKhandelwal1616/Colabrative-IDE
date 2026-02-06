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

// Execute Code  -Route
app.post("/execute", async (req, res) => {
  const { code, language } = req.body;

  // 1. Validation
  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  // 2. Create a temporary file
  // We save the code to a file so Docker can read it
  const tempDir = path.join(__dirname, "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const fileName = `job-${Date.now()}.js`;
  const filePath = path.join(tempDir, fileName);

  fs.writeFileSync(filePath, code);

  // 3. Define the Docker Command
  // "docker run" = start container
  // "--rm" = delete container after it finishes (save space)
  // "-v" = share the file from host to container
  // "node:18-alpine" = the image to use
  // "node /app/..." = the command to run inside
  const command = `docker run --rm -v "${filePath}":/app/${fileName} node:18-alpine node /app/${fileName}`;

  // 4. Execute
  exec(command, (error, stdout, stderr) => {
    // Clean up: Delete the temp file
    fs.unlinkSync(filePath);

    if (error) {
      console.error(`Execution Error: ${stderr}`);
      return res.json({ output: stderr || error.message });
    }

    // Return the successful output
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
