import mongoose from "mongoose";
const FileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    content: { type: String, default: "" }, // Initial content
    language: { type: String, default: "javascript" }, // "javascript", "python", etc.
});
export const File = mongoose.model("File", FileSchema);
//# sourceMappingURL=File.js.map