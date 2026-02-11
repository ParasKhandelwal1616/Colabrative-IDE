"use client";
import React, { useRef, useState, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { MonacoBinding } from "y-monaco";
import { Play, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

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
  const editorRef = useRef<any>(null);
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [binding, setBinding] = useState<MonacoBinding | null>(null);

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
      const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
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
      newProvider.awareness
    );

    setDoc(newDoc);
    setProvider(newProvider);
    setBinding(newBinding);
  };

  const handleRunClick = () => {
    if (editorRef.current) {
      onRun(editorRef.current.getValue());
    }
  };

  return (
    <div className="relative h-full w-full bg-[#1e1e1e]">
      {!readOnly && (
        <button
          onClick={handleRunClick}
          className="absolute top-4 right-6 z-10 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow-lg transition-all flex items-center justify-center group"
          title="Run Code"
        >
          <Play size={18} className="fill-white ml-0.5" />
        </button>
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