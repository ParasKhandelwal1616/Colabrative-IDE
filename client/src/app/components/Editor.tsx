"use client";
import React, { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { MonacoBinding } from 'y-monaco';
import { Play, Loader2 } from "lucide-react";

// NEW: Accept an onRun function from the parent
export const CollaborativeEditor = ({ 
  roomId, 
  onRun 
}: { 
  roomId: string, 
  onRun: (code: string) => void 
}) => {
  const editorRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor;
    setIsReady(true);

    const doc = new Y.Doc();
    const provider = new HocuspocusProvider({
      url: "ws://localhost:1234",
      name: roomId,
      document: doc,
    });

    const type = doc.getText('monaco');
    const binding = new MonacoBinding(
      type,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    );
  }

  // Helper to extract code and trigger run
  const handleRunClick = () => {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      onRun(code);
    }
  };

  return (
    <div className="relative h-full w-full">
      {/* Floating Run Button */}
      <button 
        onClick={handleRunClick}
        className="absolute top-4 right-6 z-10 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow-lg transition-all flex items-center justify-center group"
        title="Run Code"
      >
        <Play size={18} className="fill-white ml-0.5" />
      </button>

      <Editor
        height="100%"
        theme="vs-dark"
        defaultLanguage="javascript"
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          automaticLayout: true,
          padding: { top: 20 }
        }}
      />
    </div>
  );
};