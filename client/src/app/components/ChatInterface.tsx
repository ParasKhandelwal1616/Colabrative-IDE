"use client";
import { Socket } from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import { Send, X, MessageSquare } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface Message {
  id: string;
  text: string;
  sender: {
    name: string;
    avatar: string;
    isMe: boolean;
  };
  timestamp: number;
}

interface ReceiveMessageData {
  message: string;
  sender: {
    name: string;
    avatar: string;
  };
}

interface ChatProps {
  socket: Socket;
  projectId: string;
}

export const ChatInterface = ({ socket, projectId }: ChatProps) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false); // Toggle chat visibility
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, isOpen]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data: ReceiveMessageData) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: data.message,
          sender: { ...data.sender, isMe: false },
          timestamp: Date.now(),
        },
      ]);
    };

    socket.on("receive-message", handleReceiveMessage);
    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [socket]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageData = {
      projectId,
      message: newMessage,
      sender: {
        name: user.fullName || "Anonymous",
        avatar: user.imageUrl,
      },
    };

    // 1. Send to Server
    socket.emit("send-message", messageData);

    // 2. Add to my own list locally
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: newMessage,
        sender: {
          name: "Me",
          avatar: user.imageUrl,
          isMe: true,
        },
        timestamp: Date.now(),
      },
    ]);

    setNewMessage("");
  };

  // Minimized View (Just a button)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 p-3 rounded-full text-white shadow-lg hover:bg-blue-700 transition-all z-50"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  // Expanded View
  return (
    <div className="fixed bottom-4 right-4 w-120 h-150 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="bg-zinc-800 p-3 flex justify-between items-center border-b border-zinc-700">
        <span className="font-semibold text-sm text-zinc-100">Team Chat</span>
        <button
          onClick={() => setIsOpen(false)}
          className="text-zinc-400 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-zinc-900/95">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender.isMe ? "items-end" : "items-start"}`}
          >
            <div className="flex items-center gap-2 mb-1">
              {!msg.sender.isMe && (
                <img
                  src={msg.sender.avatar}
                  className="w-4 h-4 rounded-full"
                  alt={msg.sender.name}
                />
              )}
              <span className="text-[10px] text-zinc-500">
                {msg.sender.isMe ? "You" : msg.sender.name}
              </span>
            </div>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                msg.sender.isMe
                  ? " bg-blue-600 text-white rounded-br-none"
                  : "bg-zinc-800  text-zinc-200 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-zinc-800 border-t border-zinc-700 flex gap-2"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-blue-600 text-white p-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
