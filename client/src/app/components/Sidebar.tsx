"use client";
import { File, Plus, Trash2 } from "lucide-react"; // Import Trash2
import { useState } from "react";
import { FileIcon } from "./FileIcon"; 

interface SidebarProps {
  files: any[];
  onFileSelect: (fileId: string) => void;
  onFileCreate: (name: string) => void;
  onFileDelete: (fileId: string) => void; // <--- NEW PROP
  selectedFileId: string | null;
}

export const Sidebar = ({ 
  files, 
  onFileSelect, 
  onFileCreate, 
  onFileDelete, // <--- Destructure it
  selectedFileId 
}: SidebarProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFileName.trim()) {
      onFileCreate(newFileName);
      setNewFileName("");
      setIsCreating(false);
    }
  };

  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 h-full flex flex-col font-sans">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
        <span className="font-semibold text-zinc-400 text-xs tracking-widest uppercase">Explorer</span>
        <button 
          onClick={() => setIsCreating(true)}
          className="p-1.5 hover:bg-zinc-800 rounded-md transition-all text-zinc-400 hover:text-white"
          title="New File"
        >
          <Plus size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        {/* Input Box (Same as before) */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="px-3 mb-1">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-zinc-800 border border-blue-500/50 rounded-md shadow-sm">
              <File size={14} className="text-zinc-400" />
              <input
                autoFocus
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onBlur={() => setIsCreating(false)}
                placeholder="filename.js"
                className="bg-transparent text-sm text-white focus:outline-none w-full placeholder:text-zinc-600 font-mono"
              />
            </div>
          </form>
        )}

        {/* File List */}
        <div className="px-2 space-y-0.5">
          {files.map((file) => (
            <div
              key={file._id}
              onClick={() => onFileSelect(file._id)}
              className={`group flex items-center justify-between px-3 py-1.5 cursor-pointer text-sm rounded-md transition-all border border-transparent ${
                selectedFileId === file._id 
                  ? "bg-blue-500/10 text-blue-100 border-blue-500/20" 
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <FileIcon name={file.name} />
                <span className="truncate font-medium">{file.name}</span>
              </div>

              {/* DELETE BUTTON (Visible on Hover) */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Stop clicking the file row
                  onFileDelete(file._id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};