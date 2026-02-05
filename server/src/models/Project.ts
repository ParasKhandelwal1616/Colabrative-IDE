import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now },
});

export const Project = mongoose.model("Project", ProjectSchema);