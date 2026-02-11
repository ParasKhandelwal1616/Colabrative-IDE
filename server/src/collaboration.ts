import { Server } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
import mongoose from "mongoose";
import { File } from "./models/File";
import * as Y from "yjs"; // <--- Import Yjs to create the initial state

// 1. Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/nexus-ide")
  .then(() => console.log("✅ Collab Server Connected to DB"))
  .catch((err) => console.error("❌ DB Error:", err));

// 2. Configure the Server
const server = new Server({
  port: 1234,
  extensions: [
    new Database({
      // LOAD: Fetch data from MongoDB when a user connects
      fetch: async ({ documentName }) => {
        try {
          const file = await File.findById(documentName);
          
          if (file && file.content) {
            console.log(`📂 Loaded file from DB: ${documentName}`);
            
            // Create a temporary Yjs doc to merge the DB content
            const doc = new Y.Doc();
            doc.getText("monaco").insert(0, file.content);
            
            // Send this state to the user
            return Y.encodeStateAsUpdate(doc);
          }
        } catch (error) {
          console.error("Error loading file:", error);
        }
        return null; // Start empty if no file found
      },

      // SAVE: Save changes to MongoDB (Throttle: saves every 2s max)
      store: async ({ documentName, document }) => {
        try {
          const text = document.getText("monaco").toString();
          // documentName is the fileId
          await File.findByIdAndUpdate(documentName, { content: text });
          console.log(`💾 Saved file: ${documentName}`);
        } catch (error) {
          console.error("Failed to save:", error);
        }
      },
    }),
  ],
});

server.listen().then(() => {
  console.log("🚀 Hocuspocus Server running on port 1234");
});