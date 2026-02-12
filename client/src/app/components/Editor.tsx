"use client";
import React, { useRef, useState, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { MonacoBinding } from "y-monaco";
import { Play, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import type { editor } from "monaco-editor"; // Import Monaco types

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
  filename: string;
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

  const handleEditorDidMount: OnMount = (editorInstance, monaco) => {
    editorRef.current = editorInstance;

    const newDoc = new Y.Doc();
    const newProvider = new HocuspocusProvider({
      url: "ws://localhost:1234",
      name: roomId,
      document: newDoc,
    });

    const type = newDoc.getText("monaco");
    const currentContent = editorInstance.getValue();

    // Preserve content if it's the first load
    if (type.toString() === "" && currentContent) {
      type.insert(0, currentContent);
    }

    const newBinding = new MonacoBinding(
      type,
      editorInstance.getModel()!,
      new Set([editorInstance]),
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
    <div className="relative h-full w-full bg-[#0a0a0f]">
      {!readOnly && (
        <div className="absolute top-4 right-6 z-10 flex gap-2">
          <button
            onClick={handleRunClick}
            disabled={isRunning}
            className="group relative bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-emerald-600/50 disabled:to-emerald-500/50 text-white px-4 py-2 rounded-lg shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] transition-all disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium overflow-hidden"
          >
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

      {readOnly && (
        <div className="absolute top-4 right-6 z-10 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium flex items-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
          <span>Read Only</span>
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-blue-500/[0.03] to-transparent pointer-events-none z-[1]" />

      <Editor
        height="100%"
        theme="vs-dark"
        path={filename}
        defaultLanguage={language}
        onMount={handleEditorDidMount}
        options={{
          readOnly: readOnly,
          domReadOnly: readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          fontFamily: "monospace",
          fontLigatures: false,
          lineNumbers: "on",
          renderLineHighlight: "line",
          cursorBlinking: "blink",
          cursorSmoothCaretAnimation: "off",
          smoothScrolling: false,
          contextmenu: true,
          mouseWheelZoom: false,
          links: false,
          colorDecorators: false,
          renderWhitespace: "none",
          guides: {
            indentation: false,
            bracketPairs: false,
          },
          bracketPairColorization: {
            enabled: false,
          },
          suggest: {
            insertMode: "replace",
            showWords: false,
            showSnippets: false,
          },
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          wordBasedSuggestions: "off",
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
          acceptSuggestionOnCommitCharacter: false,
          acceptSuggestionOnEnter: "off",
          tabCompletion: "off",
          renderValidationDecorations: "off",
          renderFinalNewline: "off",
          rulers: [],
          folding: false,
          foldingHighlight: false,
          unfoldOnClickAfterEndOfLine: false,
          showFoldingControls: "never",
          matchBrackets: "never",
          selectionHighlight: false,
          occurrencesHighlight: "off",
          codeLens: false,
          // lightbulb: false ,
          hover: {
            enabled: false,
          },
          parameterHints: {
            enabled: false,
          },
          glyphMargin: false,
          disableLayerHinting: true,
          disableMonospaceOptimizations: false,
        }}
      />
    </div>
  );
};
