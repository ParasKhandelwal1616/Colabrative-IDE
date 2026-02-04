"use client"
import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';

export const CollaborativeEditor = ({ roomId }: { roomId: string }) => {
  const editorRef = useRef<any>(null);

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor;

    // 1. Initialize Yjs Document
    const doc = new Y.Doc();

    // 2. Connect to the Y-Websocket Server
    // Note: We use the server port 1234 for the Yjs specific websocket
    const provider = new WebsocketProvider(
      'ws://localhost:1234', 
      roomId, 
      doc
    );

    const type = doc.getText('monaco');

    // 3. Bind Yjs to Monaco
    const binding = new MonacoBinding(
      type, 
      editorRef.current.getModel(), 
      new Set([editorRef.current]), 
      provider.awareness
    );

    return () => {
      doc.destroy();
      provider.destroy();
    };
  }

  return (
    <Editor
      height="90vh"
      theme="vs-dark"
      defaultLanguage="javascript"
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        automaticLayout: true,
      }}
    />
  );
};