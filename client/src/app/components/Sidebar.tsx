"use client";
import { File, Plus, Code2 } from "lucide-react";
import { useState } from "react";
import { FileIcon } from "./FileIcon";

interface SidebarProps {
  files: any[];
  onFileSelect: (fileId: string) => void;
  onFileCreate: (name: string) => void; // <--- New Prop
  selectedFileId: string | null;
}

export const Sidebar = ({ files, onFileSelect, onFileCreate, selectedFileId }: SidebarProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFileName.trim()) {
      onFileCreate(newFileName); // Send to parent
      setNewFileName("");
      setIsCreating(false);
    }
  };

  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 h-full flex flex-col">
      {/* Header with Add Button */}
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
        <span className="font-semibold text-zinc-400 text-sm tracking-wider">EXPLORER</span>
        <button 
          onClick={() => setIsCreating(true)}
          className="p-1 hover:bg-zinc-700 rounded transition-colors"
          title="New File"
        >
          <Plus size={16} className="text-zinc-400" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto mt-2">
        {/* The "Creating" Input Box */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="px-4 py-2">
            <div className="flex items-center gap-2 px-2 py-1 bg-zinc-800 border border-blue-500 rounded">
              <File size={14} className="text-zinc-400" />
              <input
                autoFocus
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onBlur={() => setIsCreating(false)} // Cancel if clicked away
                placeholder="filename.js"
                className="bg-transparent text-sm text-white focus:outline-none w-full placeholder:text-zinc-600"
              />
            </div>
          </form>
        )}

        {/* File List */}
        {files.map((file) => (
          <div
            key={file._id}
            onClick={() => onFileSelect(file._id)}
            className={`group flex items-center gap-2 px-4 py-2 cursor-pointer text-sm transition-all ${
              selectedFileId === file._id 
                ? "bg-blue-600/10 text-blue-400 border-l-2 border-blue-500" 
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border-l-2 border-transparent"
            }`}
          >
            {/* Simple icon logic based on extension */}
            
            <FileIcon name={file.name} />
            <span>{file.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};