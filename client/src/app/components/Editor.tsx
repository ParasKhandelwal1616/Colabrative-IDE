"use client";
import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { MonacoBinding } from 'y-monaco';
import { Play } from "lucide-react";
import { useUser } from "@clerk/nextjs"; // <--- Import Clerk

interface EditorProps {
  roomId: string;
  language: string;
  onRun: (code: string) => void;
}

export const CollaborativeEditor = ({ roomId, language, onRun }: EditorProps) => {
  const { user } = useUser(); // <--- Get User Info
  const editorRef = useRef<any>(null);
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [binding, setBinding] = useState<MonacoBinding | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      provider?.destroy();
      doc?.destroy();
      binding?.destroy();
    };
  }, [provider, doc, binding]);

  // NEW: Update User Identity when Clerk loads
  useEffect(() => {
    if (provider && user) {
      // Send user details to the Collaboration Server
      provider.setAwarenessField('user', {
        name: user.fullName || "Anonymous",
        color: "#" + Math.floor(Math.random()*16777215).toString(16), // Random Cursor Color
        avatar: user.imageUrl, // Profile Picture
      });
    }
  }, [provider, user]);

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor;

    const newDoc = new Y.Doc();
    const newProvider = new HocuspocusProvider({
      url: "ws://localhost:1234",
      name: roomId,
      document: newDoc,
    });

    const type = newDoc.getText('monaco');

    // Init content if empty
    const currentContent = editor.getValue();
    if (type.toString() === "" && currentContent) {
        type.insert(0, currentContent);
    }
    
    const newBinding = new MonacoBinding(
      type,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      newProvider.awareness
    );

    setDoc(newDoc);
    setProvider(newProvider);
    setBinding(newBinding);
  }

  const handleRunClick = () => {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      onRun(code);
    }
  };

  return (
    <div className="relative h-full w-full">
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
        language={language} 
        defaultLanguage="javascript"
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          automaticLayout: true,
          padding: { top: 20 },
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
};