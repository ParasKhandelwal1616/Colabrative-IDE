"use client";
import { 
  File, 
  FileCode, 
  FileJson, 
  FileType, 
  FileImage, 
  Terminal 
} from "lucide-react";

interface FileIconProps {
  name: string;
  className?: string;
}

export const FileIcon = ({ name, className = "" }: FileIconProps) => {
  const extension = name.split('.').pop()?.toLowerCase();

  switch (extension) {
    // JavaScript / TypeScript
    case "js":
      return <FileCode size={16} className={`text-yellow-400 ${className}`} />;
    case "jsx":
      return <FileCode size={16} className={`text-yellow-300 ${className}`} />;
    case "ts":
      return <FileCode size={16} className={`text-blue-500 ${className}`} />;
    case "tsx":
      return <FileCode size={16} className={`text-blue-400 ${className}`} />;
    
    // Web
    case "html":
      return <FileType size={16} className={`text-orange-500 ${className}`} />;
    case "css":
      return <FileType size={16} className={`text-blue-400 ${className}`} />;
    case "json":
      return <FileJson size={16} className={`text-yellow-200 ${className}`} />;
    
    // Python
    case "py":
      return <Terminal size={16} className={`text-blue-300 ${className}`} />;
    
    // C++ / C
    case "cpp":
    case "c":
    case "h":
      return <FileCode size={16} className={`text-blue-600 ${className}`} />;
    
    // Java
    case "java":
    case "class":
      return <FileCode size={16} className={`text-red-500 ${className}`} />;

    // Images
    case "png":
    case "jpg":
    case "jpeg":
    case "svg":
      return <FileImage size={16} className={`text-purple-400 ${className}`} />;

    // Default
    default:
      return <File size={16} className={`text-zinc-500 ${className}`} />;
  }
};