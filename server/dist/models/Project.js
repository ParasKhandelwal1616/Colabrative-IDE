import mongoose from "mongoose";
const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    // NEW: Track the owner's Clerk ID
    ownerId: { type: String, required: true },
    // NEW: List of allowed users and their roles
    collaborators: [{
            userId: String,
            role: { type: String, enum: ["editor", "viewer"], default: "viewer" }
        }],
    createdAt: { type: Date, default: Date.now },
});
export const Project = mongoose.model("Project", ProjectSchema);
//# sourceMappingURL=Project.js.map