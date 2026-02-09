"use client";
import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { MonacoBinding } from 'y-monaco';
import { Play } from "lucide-react";
import { useUser } from "@clerk/nextjs"; 

interface EditorProps {
  roomId: string;
  language: string;
  onRun: (code: string) => void;
  // NEW: Callback to tell the parent who is online
  onUserChange?: (users: any[]) => void; 
}

export const CollaborativeEditor = ({ roomId, language, onRun, onUserChange }: EditorProps) => {
  const { user } = useUser();
  const editorRef = useRef<any>(null);
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [binding, setBinding] = useState<MonacoBinding | null>(null);

  // Cleanup
  useEffect(() => {
    return () => {
      provider?.destroy();
      doc?.destroy();
      binding?.destroy();
    };
  }, [provider, doc, binding]);

  // 1. SETUP USER IDENTITY
  useEffect(() => {
    if (provider && user) {
      const randomColor = "#" + Math.floor(Math.random()*16777215).toString(16);
      
      // Set my details
      provider.setAwarenessField('user', {
        name: user.fullName || "Anonymous",
        color: randomColor,
        avatar: user.imageUrl,
      });
    }
  }, [provider, user]);

  // 2. LISTEN FOR ACTIVE USERS (The Logic)
  useEffect(() => {
    if (!provider || !onUserChange) return;

    const updateUsers = () => {
      // FIX 1: Add '?' before .getStates()
      const states = provider.awareness?.getStates();
      
      if (!states) return; // If no states, stop.

      const activeUsers: any[] = [];
      states.forEach((state: any, clientId: number) => {
        if (state.user) {
          activeUsers.push({
            clientId,
            ...state.user
          });
        }
      });
      
      onUserChange(activeUsers);
    };

    // Listen to changes
    provider.awareness?.on('change', updateUsers);
    
    // Initial call
    updateUsers();

    return () => {
      provider.awareness?.off('change', updateUsers);
    };
  }, [provider, onUserChange]);

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor;

    const newDoc = new Y.Doc();
    const newProvider = new HocuspocusProvider({
      url: "ws://localhost:1234",
      name: roomId,
      document: newDoc,
    });

    const type = newDoc.getText('monaco');

    // Init content
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
      onRun(editorRef.current.getValue());
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
          fontSize: 20,
          automaticLayout: true,
          padding: { top: 20 },
        }}
      />
    </div>
  );
};