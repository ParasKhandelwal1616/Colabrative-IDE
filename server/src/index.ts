import express from "express";
import cors from "cors";
import { Project } from "./models/Project";
import { File } from "./models/File";
import { Server } from "socket.io";
import http from "http";
import mongoose from "mongoose"; // Standard import

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
        ownerId: "paras-dev" 
      });

      await File.create({ 
        name: "index.js", 
        projectId: project._id, 
        language: "javascript", 
        content: "console.log('Hello World')" 
      });
      
      console.log("Files created!");
    }
    res.json(project);
  } catch (error) {
    console.error("Error initializing demo:", error);
    res.status(500).json({ error: "Failed to init demo" });
  }
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