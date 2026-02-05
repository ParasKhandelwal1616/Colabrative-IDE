"use client";
import { File, Plus, Trash2 } from "lucide-react";

interface SidebarProps {
  files: any[];
  onFileSelect: (fileId: string) => void;
  selectedFileId: string | null;
}

export const Sidebar = ({ files, onFileSelect, selectedFileId }: SidebarProps) => {
  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 h-full flex flex-col">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
        <span className="font-semibold text-zinc-400 text-sm">EXPLORER</span>
        <button className="p-1 hover:bg-zinc-800 rounded">
          <Plus size={16} className="text-zinc-400" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto mt-2">
        {files.map((file) => (
          <div
            key={file._id}
            onClick={() => onFileSelect(file._id)}
            className={`flex items-center gap-2 px-4 py-2 cursor-pointer text-sm ${
              selectedFileId === file._id 
                ? "bg-blue-600/20 text-blue-400 border-l-2 border-blue-500" 
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            }`}
          >
            <File size={14} />
            {file.name}
          </div>
        ))}
      </div>
    </div>
  );
};