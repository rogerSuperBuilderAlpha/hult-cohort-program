"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MessageSquare, Hash, Search, Bell, Send } from "lucide-react";

type Channel = { id: string; name: string; description: string; is_announcement: boolean };
type Message = { id: string; content: string; created_at: string; sender_id: string; channel_id: string };

export default function Home() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Simple mock auth for demonstration within 30 min constraint
  // In production, use Supabase Auth hooks
  useEffect(() => {
    const loginMock = async () => {
      // 1. Check for real session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
      } else {
        // Fallback for demo: just show a mock user if not logged in to Supabase
        // Must be a valid UUID format for the messages table!
        setCurrentUser({ id: "11111111-1111-1111-1111-111111111111", email: "demo@hult.edu" });
      }
    };
    loginMock();

    const fetchChannels = async () => {
      const { data } = await supabase.from("channels").select("*").order("name");
      if (data) {
        setChannels(data);
        if (data.length > 0) setActiveChannel(data[0]);
      }
    };
    fetchChannels();
  }, []);

  useEffect(() => {
    if (!activeChannel) return;

    // Fetch existing messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("channel_id", activeChannel.id)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    // Subscribe to new real-time messages
    const channelSub = supabase
      .channel(`room:${activeChannel.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `channel_id=eq.${activeChannel.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelSub);
    };
  }, [activeChannel]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChannel || !currentUser) return;

    // Optimistic UI update could go here
    const content = newMessage;
    setNewMessage("");

    await supabase.from("messages").insert({
      content,
      channel_id: activeChannel.id,
      sender_id: currentUser.id,
    });
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gray-950 flex flex-col border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-500" />
            HultChat
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Channels</h2>
            <div className="space-y-1">
              {channels.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChannel(c)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                    activeChannel?.id === c.id ? "bg-indigo-600/20 text-indigo-400" : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <Hash className="w-4 h-4 opacity-70" />
                  {c.name}
                </button>
              ))}
              {channels.length === 0 && (
                <div className="text-gray-500 text-sm">No channels found. Run the Supabase SQL migration!</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-900 border-t border-gray-800 text-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white">
            {currentUser?.email?.charAt(0).toUpperCase() || "?"}
          </div>
          <div className="truncate text-gray-300">{currentUser?.email || "Not logged in"}</div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {/* Header */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-lg">{activeChannel?.name || "Select a channel"}</h2>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <Search className="w-5 h-5 hover:text-gray-200 cursor-pointer transition-colors" />
            <Bell className="w-5 h-5 hover:text-gray-200 cursor-pointer transition-colors" />
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => {
            const isMe = msg.sender_id === currentUser?.id;
            return (
              <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isMe ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-200"}`}>
                  <p>{msg.content}</p>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && activeChannel && (
            <div className="text-center text-gray-500 mt-20">
              No messages yet. Start the conversation!
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="p-4 bg-gray-900">
          <form onSubmit={sendMessage} className="flex gap-2 bg-gray-800 p-2 rounded-xl border border-gray-700 focus-within:border-indigo-500 transition-colors">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message #${activeChannel?.name || "..."}`}
              disabled={!activeChannel}
              className="flex-1 bg-transparent border-none outline-none text-sm px-3 text-gray-100 placeholder:text-gray-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!activeChannel || !newMessage.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
