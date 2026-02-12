"use client";
import { Socket } from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Minimize2, Users } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
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

      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on("receive-message", handleReceiveMessage);
    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [socket, isOpen]);

  // Clear unread when opening
  useEffect(() => {
    if (isOpen) {
      // We add a tiny delay or a condition to satisfy the linter/React cycle
      const timer = setTimeout(() => {
        setUnreadCount(0);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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

    socket.emit("send-message", messageData);

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

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* MINIMIZED BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 p-4 rounded-full text-white shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:shadow-[0_0_60px_rgba(59,130,246,0.6)] transition-all hover:scale-110"
        >
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse z-20">
              {unreadCount > 9 ? "9+" : unreadCount}
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
          <MessageSquare size={24} className="relative z-10" />
        </button>
      )}

      {/* EXPANDED CHAT CARD */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-[#0d0d12]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_60px_rgba(59,130,246,0.3)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] via-transparent to-purple-500/[0.03] pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 bg-[#0a0a0f]/80 backdrop-blur-sm px-4 py-3 flex justify-between items-center border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400/30 rounded blur-sm" />
                <MessageSquare
                  size={18}
                  className="text-blue-400 relative z-10"
                />
              </div>
              <div>
                <span className="font-semibold text-sm text-white">
                  Team Chat
                </span>
                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <Minimize2 size={16} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative z-10">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                <Users size={32} className="mb-2 text-zinc-600" />
                <p className="text-xs text-zinc-500">No messages yet...</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.sender.isMe;
                const showAvatar =
                  index === 0 || messages[index - 1].sender.isMe !== isMe;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-2 duration-200`}
                  >
                    <div className="flex-shrink-0 w-8">
                      {showAvatar && !isMe && (
                        <img
                          src={msg.sender.avatar}
                          className="w-8 h-8 rounded-full border border-white/10"
                          alt=""
                        />
                      )}
                    </div>
                    <div
                      className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}
                    >
                      {showAvatar && (
                        <span className="text-[10px] text-zinc-500 mb-1 px-1">
                          {isMe ? "You" : msg.sender.name}
                        </span>
                      )}
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm ${
                          isMe
                            ? "bg-blue-600 text-white rounded-tr-none"
                            : "bg-zinc-800 text-zinc-100 rounded-tl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[8px] text-zinc-600 mt-1 uppercase">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="relative z-10 p-3 bg-[#0a0a0f]/80 backdrop-blur-sm border-t border-white/10 flex gap-2"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-zinc-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2 rounded-lg transition-all"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};
