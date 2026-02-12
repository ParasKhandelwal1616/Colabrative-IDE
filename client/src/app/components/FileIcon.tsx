"use client";
import {
  File,
  FileCode,
  FileJson,
  FileType,
  FileImage,
  Terminal,
  Database,
  Settings,
  FileText,
  Lock,
  GitBranch,
  Package,
  Braces,
  Code2,
  Layers,
} from "lucide-react";

interface FileIconProps {
  name: string;
  className?: string;
  showGlow?: boolean;
}

export const FileIcon = ({
  name,
  className = "",
  showGlow = false,
}: FileIconProps) => {
  const extension = name.split(".").pop()?.toLowerCase();
  const fileName = name.toLowerCase();

  // Special files (by name)
  if (fileName === "package.json" || fileName === "package-lock.json") {
    return (
      <div className="relative">
        {showGlow && (
          <div className="absolute inset-0 bg-emerald-400/30 rounded blur-sm" />
        )}
        <Package
          size={16}
          className={`text-emerald-400 relative z-10 ${className}`}
        />
      </div>
    );
  }
  if (fileName === ".gitignore" || fileName === ".git") {
    return (
      <div className="relative">
        {showGlow && (
          <div className="absolute inset-0 bg-orange-400/30 rounded blur-sm" />
        )}
        <GitBranch
          size={16}
          className={`text-orange-400 relative z-10 ${className}`}
        />
      </div>
    );
  }
  if (fileName === "readme.md" || fileName === "readme") {
    return (
      <div className="relative">
        {showGlow && (
          <div className="absolute inset-0 bg-blue-400/30 rounded blur-sm" />
        )}
        <FileText
          size={16}
          className={`text-blue-400 relative z-10 ${className}`}
        />
      </div>
    );
  }
  if (fileName === ".env" || fileName.startsWith(".env.")) {
    return (
      <div className="relative">
        {showGlow && (
          <div className="absolute inset-0 bg-yellow-400/30 rounded blur-sm" />
        )}
        <Lock
          size={16}
          className={`text-yellow-400 relative z-10 ${className}`}
        />
      </div>
    );
  }
  if (fileName === "dockerfile" || fileName === "docker-compose.yml") {
    return (
      <div className="relative">
        {showGlow && (
          <div className="absolute inset-0 bg-blue-500/30 rounded blur-sm" />
        )}
        <Layers
          size={16}
          className={`text-blue-500 relative z-10 ${className}`}
        />
      </div>
    );
  }

  // By extension
  switch (extension) {
    // JavaScript / TypeScript
    case "js":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-yellow-400/30 rounded blur-sm" />
          )}
          <FileCode
            size={16}
            className={`text-yellow-400 relative z-10 ${className}`}
          />
        </div>
      );
    case "jsx":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-cyan-400/30 rounded blur-sm" />
          )}
          <Code2
            size={16}
            className={`text-cyan-400 relative z-10 ${className}`}
          />
        </div>
      );
    case "ts":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-blue-500/30 rounded blur-sm" />
          )}
          <FileCode
            size={16}
            className={`text-blue-500 relative z-10 ${className}`}
          />
        </div>
      );
    case "tsx":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-blue-400/30 rounded blur-sm" />
          )}
          <Code2
            size={16}
            className={`text-blue-400 relative z-10 ${className}`}
          />
        </div>
      );

    // Web
    case "html":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-orange-500/30 rounded blur-sm" />
          )}
          <FileType
            size={16}
            className={`text-orange-500 relative z-10 ${className}`}
          />
        </div>
      );
    case "css":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-blue-400/30 rounded blur-sm" />
          )}
          <FileType
            size={16}
            className={`text-blue-400 relative z-10 ${className}`}
          />
        </div>
      );
    case "scss":
    case "sass":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-pink-400/30 rounded blur-sm" />
          )}
          <FileType
            size={16}
            className={`text-pink-400 relative z-10 ${className}`}
          />
        </div>
      );

    // Data formats
    case "json":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-yellow-300/30 rounded blur-sm" />
          )}
          <Braces
            size={16}
            className={`text-yellow-300 relative z-10 ${className}`}
          />
        </div>
      );
    case "xml":
    case "yaml":
    case "yml":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-purple-400/30 rounded blur-sm" />
          )}
          <FileJson
            size={16}
            className={`text-purple-400 relative z-10 ${className}`}
          />
        </div>
      );

    // Python
    case "py":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-blue-400/30 rounded blur-sm" />
          )}
          <Terminal
            size={16}
            className={`text-blue-400 relative z-10 ${className}`}
          />
        </div>
      );

    // C++ / C
    case "cpp":
    case "cc":
    case "cxx":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-blue-600/30 rounded blur-sm" />
          )}
          <FileCode
            size={16}
            className={`text-blue-600 relative z-10 ${className}`}
          />
        </div>
      );
    case "c":
    case "h":
    case "hpp":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-blue-500/30 rounded blur-sm" />
          )}
          <FileCode
            size={16}
            className={`text-blue-500 relative z-10 ${className}`}
          />
        </div>
      );

    // Java
    case "java":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-red-500/30 rounded blur-sm" />
          )}
          <FileCode
            size={16}
            className={`text-red-500 relative z-10 ${className}`}
          />
        </div>
      );
    case "class":
    case "jar":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-red-400/30 rounded blur-sm" />
          )}
          <Package
            size={16}
            className={`text-red-400 relative z-10 ${className}`}
          />
        </div>
      );

    // Ruby
    case "rb":
    case "erb":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-red-400/30 rounded blur-sm" />
          )}
          <FileCode
            size={16}
            className={`text-red-400 relative z-10 ${className}`}
          />
        </div>
      );

    // PHP
    case "php":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-purple-500/30 rounded blur-sm" />
          )}
          <FileCode
            size={16}
            className={`text-purple-500 relative z-10 ${className}`}
          />
        </div>
      );

    // Go
    case "go":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-cyan-500/30 rounded blur-sm" />
          )}
          <FileCode
            size={16}
            className={`text-cyan-500 relative z-10 ${className}`}
          />
        </div>
      );

    // Rust
    case "rs":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-orange-600/30 rounded blur-sm" />
          )}
          <FileCode
            size={16}
            className={`text-orange-600 relative z-10 ${className}`}
          />
        </div>
      );

    // Shell scripts
    case "sh":
    case "bash":
    case "zsh":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-emerald-400/30 rounded blur-sm" />
          )}
          <Terminal
            size={16}
            className={`text-emerald-400 relative z-10 ${className}`}
          />
        </div>
      );

    // Markdown
    case "md":
    case "markdown":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-zinc-400/30 rounded blur-sm" />
          )}
          <FileText
            size={16}
            className={`text-zinc-400 relative z-10 ${className}`}
          />
        </div>
      );

    // Images
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "webp":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-purple-400/30 rounded blur-sm" />
          )}
          <FileImage
            size={16}
            className={`text-purple-400 relative z-10 ${className}`}
          />
        </div>
      );
    case "svg":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-orange-400/30 rounded blur-sm" />
          )}
          <FileImage
            size={16}
            className={`text-orange-400 relative z-10 ${className}`}
          />
        </div>
      );

    // Database
    case "sql":
    case "db":
    case "sqlite":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-blue-300/30 rounded blur-sm" />
          )}
          <Database
            size={16}
            className={`text-blue-300 relative z-10 ${className}`}
          />
        </div>
      );

    // Config files
    case "config":
    case "conf":
    case "ini":
    case "toml":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-zinc-500/30 rounded blur-sm" />
          )}
          <Settings
            size={16}
            className={`text-zinc-500 relative z-10 ${className}`}
          />
        </div>
      );

    // Vue
    case "vue":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-emerald-500/30 rounded blur-sm" />
          )}
          <FileCode
            size={16}
            className={`text-emerald-500 relative z-10 ${className}`}
          />
        </div>
      );

    // Svelte
    case "svelte":
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-orange-500/30 rounded blur-sm" />
          )}
          <FileCode
            size={16}
            className={`text-orange-500 relative z-10 ${className}`}
          />
        </div>
      );

    // Default
    default:
      return (
        <div className="relative">
          {showGlow && (
            <div className="absolute inset-0 bg-zinc-500/30 rounded blur-sm" />
          )}
          <File
            size={16}
            className={`text-zinc-500 relative z-10 ${className}`}
          />
        </div>
      );
  }
};
