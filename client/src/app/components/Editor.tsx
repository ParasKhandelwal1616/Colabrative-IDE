"use client";
import React, { useRef, useState, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { MonacoBinding } from "y-monaco";
import { Play, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import type { editor } from "monaco-editor";

// --- Types ---
export interface AwarenessUser {
  name: string;
  color: string;
  avatar: string;
}

export interface ActiveUser extends AwarenessUser {
  clientId: number;
}

interface EditorProps {
  roomId: string;
  language: string;
  filename: string; // <--- CRITICAL for Syntax Highlighting
  onRun: (code: string) => void;
  onUserChange?: (users: ActiveUser[]) => void;
  readOnly?: boolean;
}

export const CollaborativeEditor = ({
  roomId,
  language,
  filename,
  onRun,
  onUserChange,
  readOnly = false,
}: EditorProps) => {
  const { user } = useUser();
  // ✅ FIX 1: Correctly type the Ref so TypeScript knows it has .getValue()
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [binding, setBinding] = useState<MonacoBinding | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Cleanup on Unmount
  useEffect(() => {
    return () => {
      provider?.destroy();
      doc?.destroy();
      binding?.destroy();
    };
  }, [provider, doc, binding]);

  // 1. Setup User Identity
  useEffect(() => {
    if (provider && user) {
      const randomColor =
        "#" + Math.floor(Math.random() * 16777215).toString(16);
      provider.setAwarenessField("user", {
        name: user.fullName || "Anonymous",
        color: randomColor,
        avatar: user.imageUrl,
      });
    }
  }, [provider, user]);

  // 2. Listen for Active Users
  useEffect(() => {
    if (!provider || !onUserChange) return;

    const updateUsers = () => {
      const states = provider.awareness?.getStates();
      if (!states) return;

      const activeUsers: ActiveUser[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      states.forEach((state: any, clientId: number) => {
        if (state.user) {
          activeUsers.push({
            clientId,
            ...state.user,
          });
        }
      });
      onUserChange(activeUsers);
    };

    provider.awareness?.on("change", updateUsers);
    updateUsers();

    return () => {
      provider.awareness?.off("change", updateUsers);
    };
  }, [provider, onUserChange]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    const newDoc = new Y.Doc();
    const newProvider = new HocuspocusProvider({
      url: "ws://localhost:1234",
      name: roomId,
      document: newDoc,
    });

    const type = newDoc.getText("monaco");
    const currentContent = editor.getValue();

    // Preserve content if it's the first load
    if (type.toString() === "" && currentContent) {
      type.insert(0, currentContent);
    }

    const newBinding = new MonacoBinding(
      type,
      editor.getModel()!,
      new Set([editor]),
      newProvider.awareness,
    );

    setDoc(newDoc);
    setProvider(newProvider);
    setBinding(newBinding);
  };

  const handleRunClick = async () => {
    if (editorRef.current) {
      setIsRunning(true);
      // ✅ FIX 1 (cont): Now safe to call getValue()
      await onRun(editorRef.current.getValue());
      setTimeout(() => setIsRunning(false), 500);
    }
  };

  return (
    <div className="relative h-full w-full bg-[#131313]">
      {!readOnly && (
        <div className="absolute top-4 right-6 z-10 flex gap-2">
          <button
            onClick={handleRunClick}
            disabled={isRunning}
            className="group relative bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-emerald-600/50 disabled:to-emerald-500/50 text-white px-4 py-2 rounded-lg shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] transition-all disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium overflow-hidden"
            title={isRunning ? "Running..." : "Run Code (⌘+Enter)"}
          >
            {/* Shimmer effect */}
            {!isRunning && (
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            )}

            {isRunning ? (
              <>
                <Loader2 size={16} className="animate-spin relative z-10" />
                <span className="relative z-10">Running...</span>
              </>
            ) : (
              <>
                <Play size={16} className="fill-white relative z-10" />
                <span className="relative z-10">Run</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Read-Only Badge */}
      {readOnly && (
        <div className="absolute top-4 right-6 z-10 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium flex items-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Read Only</span>
        </div>
      )}

      <Editor
        height="100%"
        theme="vs-dark"
        path={filename} // <--- THIS IS THE FIX. It tells Monaco "I am a Python file"
        defaultLanguage={language} // Use defaultLanguage instead of language to prevent flicker
        onMount={handleEditorDidMount}
        options={{
          readOnly: readOnly,
          domReadOnly: readOnly,
          minimap: { enabled: false },
          fontSize: 22,
          automaticLayout: true,
          padding: { top: 20 },
          scrollBeyondLastLine: false,
          fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
          fontLigatures: true,
        }}
      />
    </div>
  );
};
