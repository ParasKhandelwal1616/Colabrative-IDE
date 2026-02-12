"use client";
import { File, Plus, Trash2, Folder, FolderOpen } from "lucide-react";
import { useState } from "react";
import { FileIcon } from "./FileIcon";

interface CodeFile {
  _id: string;
  name: string;
}

interface SidebarProps {
  files: CodeFile[];
  onFileSelect: (fileId: string) => void;
  onFileCreate: (name: string) => void;
  onFileDelete: (fileId: string) => void;
  selectedFileId: string | null;
  readOnly: boolean;
}

export const Sidebar = ({
  files,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  readOnly,
  selectedFileId,
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
    <div className="w-64 bg-[#0d0d12] border-r border-white/[0.08] h-full flex flex-col font-sans relative">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.02] to-transparent pointer-events-none" />

      {/* Header */}
      <div className="p-3 border-b border-white/[0.08] flex justify-between items-center bg-[#0a0a0f]/50 backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400/20 rounded blur-sm opacity-50" />
            <FolderOpen size={16} className="text-blue-400 relative z-10" />
          </div>
          <span className="font-semibold text-zinc-400 text-xs uppercase tracking-wider">
            Explorer
          </span>
        </div>

        {!readOnly && (
          <button
            onClick={() => setIsCreating(true)}
            className="group/add relative p-1.5 hover:bg-blue-500/10 rounded-md transition-all text-zinc-500 hover:text-blue-400 border border-transparent hover:border-blue-500/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            title="New File"
          >
            <Plus size={16} className="relative z-10" />
            <div className="absolute inset-0 bg-blue-500/5 rounded-md opacity-0 group-hover/add:opacity-100 transition-opacity" />
          </button>
        )}
      </div>

      {/* File List Container */}
      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar relative z-10">
        {/* New File Input */}
        {isCreating && (
          <form
            onSubmit={handleCreateSubmit}
            className="px-3 mb-2 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.15)] backdrop-blur-sm">
              <File size={14} className="text-blue-400 shrink-0" />
              <input
                autoFocus
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onBlur={() => {
                  if (!newFileName.trim()) setIsCreating(false);
                }}
                placeholder="filename.js"
                className="bg-transparent text-sm text-white focus:outline-none w-full placeholder:text-zinc-600 font-mono"
              />
            </div>
          </form>
        )}

        {/* Empty State */}
        {files.length === 0 && !isCreating && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mb-3">
              <Folder size={24} className="text-zinc-600" />
            </div>
            <p className="text-xs text-zinc-600 mb-1">No files yet</p>
            {!readOnly && (
              <p className="text-xs text-zinc-700">Click + to create one</p>
            )}
          </div>
        )}

        {/* File List */}
        <div className="px-2 space-y-0.5">
          {files.map((file, index) => (
            <div
              key={file._id}
              onClick={() => onFileSelect(file._id)}
              className={`group relative flex items-center justify-between px-3 py-2 cursor-pointer rounded-lg transition-all duration-200 border ${
                selectedFileId === file._id
                  ? "bg-blue-500/15 text-blue-100 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 border-transparent hover:border-white/[0.08]"
              } animate-in fade-in slide-in-from-left-2 duration-200`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {/* Selection indicator */}
              {selectedFileId === file._id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              )}

              <div className="flex items-center gap-2.5 overflow-hidden min-w-0 flex-1">
                <FileIcon name={file.name} />
                <span className="truncate text-sm font-medium">
                  {file.name}
                </span>
              </div>

              {/* DELETE BUTTON */}
              {!readOnly && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileDelete(file._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 shrink-0 ml-2 p-1.5 hover:bg-red-500/20 text-zinc-600 hover:text-red-400 rounded-md transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] border border-transparent hover:border-red-500/20"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.2);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  );
};
