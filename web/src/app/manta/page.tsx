"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
import {
  MessageCirclePlus,
  History,
  ArrowUp,
  CirclePlus,
  Square,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import Image from "next/image";
import dynamic from "next/dynamic";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import type { PluggableList } from "unified";
import type { Components } from "react-markdown";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });
import { useSession } from "@/lib/auth-client";

export default function MantaPage() {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { data: session } = useSession();

  // Chat session types and state
  type ChatSession = {
    id: string;
    title: string;
    createdAt: number; // epoch ms
    updatedAt: number; // epoch ms
    messages: UIMessage[];
  };

  const SESSIONS_KEY = "manta:sessions:v1";
  const ACTIVE_KEY = "manta:activeSessionId:v1";
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const apiBase = (process.env.NEXT_PUBLIC_API_URL as string | undefined) ?? "";
  const chatTransport = useMemo(() => {
    const base = apiBase.replace(/\/$/, "");
    const api = base ? `${base}/api/chat` : "/api/chat";
    // include credentials so auth cookies flow across origins
    return new DefaultChatTransport({ api, credentials: "include" });
  }, [apiBase]);

  const markdownPlugins = useMemo(
    () => [remarkGfm, remarkBreaks] as PluggableList,
    [],
  );
  const markdownComponents = useMemo<Components>(
    () => ({
      a: ({ node: _node, ...props }) => (
        <a
          {...props}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-[#1E609E] hover:text-[#164a7a]"
        />
      ),
      ul: ({ node: _node, ...props }) => (
        <ul {...props} className="list-disc pl-5 space-y-1" />
      ),
      ol: ({ node: _node, ...props }) => (
        <ol {...props} className="list-decimal pl-5 space-y-1" />
      ),
      li: ({ node: _node, ...props }) => (
        <li {...props} className="leading-relaxed" />
      ),
      p: ({ node: _node, ...props }) => (
        <p {...props} className="leading-relaxed" />
      ),
      code: ({ inline, className, children, ...props }: HTMLAttributes<HTMLElement> & { inline?: boolean }) => (
        <code
          {...props}
          className={`rounded bg-[#F5F7FA] px-1.5 py-0.5 text-sm ${className ?? ""}`.trim()}
        >
          {children}
        </code>
      ),
    }),
    [],
  );

  const { messages, sendMessage, stop, status, setMessages } = useChat({
    transport: chatTransport,
    // tie the chat state to the active session id so streams don't leak across sessions
    id: activeSessionId ?? "default",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setAttachments((prev) => [...prev, ...files]);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed && attachments.length === 0) return;

    // Send via AI SDK. Note: text is sent; file attachments can be added when backend supports it.
    // For now we only send text to avoid type mismatches; files are a TODO depending on your API.
    sendMessage({ text: trimmed } as any);

    // Clear after send
    setMessage("");
    setAttachments([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Load sessions from localStorage on mount
  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem(SESSIONS_KEY)
          : null;
      const rawActive =
        typeof window !== "undefined" ? localStorage.getItem(ACTIVE_KEY) : null;
      const parsed: ChatSession[] = raw ? JSON.parse(raw) : [];
      // Migrate or ensure structure
      const safe = Array.isArray(parsed) ? parsed : [];
      setSessions(safe);
      if (safe.length === 0) {
        // create first empty session
        const id = crypto.randomUUID();
        const now = Date.now();
        const first: ChatSession = {
          id,
          title: "New chat",
          createdAt: now,
          updatedAt: now,
          messages: [],
        };
        setSessions([first]);
        setActiveSessionId(id);
        localStorage.setItem(SESSIONS_KEY, JSON.stringify([first]));
        localStorage.setItem(ACTIVE_KEY, id);
      } else {
        const chosen =
          rawActive && safe.some((s) => s.id === rawActive)
            ? rawActive
            : safe[0].id;
        setActiveSessionId(chosen);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist sessions whenever sessions change
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
      }
    } catch {
      // ignore
    }
  }, [sessions]);

  // Persist active session id when it changes
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && activeSessionId) {
        localStorage.setItem(ACTIVE_KEY, activeSessionId);
      }
    } catch {
      // ignore
    }
  }, [activeSessionId]);

  // When active session changes, load its messages into the chat hook
  useEffect(() => {
    if (!activeSessionId) return;
    const sess = sessions.find((s) => s.id === activeSessionId);
    if (!sess) return;
    setMessages(sess.messages as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSessionId]);

  // Whenever messages update from the AI hook, reflect them into the active session and persist
  useEffect(() => {
    if (!activeSessionId) return;
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === activeSessionId);
      if (idx === -1) return prev;
      const now = Date.now();
      const next = [...prev];
      const newTitle = (() => {
        const firstUser = messages.find((m) => m.role === "user");
        if (!firstUser) return next[idx].title || "New chat";
        const firstText = firstUser.parts
          .map((p: any) => (p.type === "text" ? p.text : ""))
          .join("")
          .trim();
        if (!firstText) return next[idx].title || "New chat";
        return next[idx].title && next[idx].title !== "New chat"
          ? next[idx].title
          : firstText.slice(0, 60);
      })();
      next[idx] = {
        ...next[idx],
        title: newTitle,
        messages: messages as UIMessage[],
        updatedAt: now,
      };
      return next;
    });
  }, [messages, activeSessionId, setSessions]);

  const createNewSession = () => {
    const id = crypto.randomUUID();
    const now = Date.now();
    const sess: ChatSession = {
      id,
      title: "New chat",
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    setSessions((prev) => [sess, ...prev]);
    setActiveSessionId(id);
    // Clear current chat state
    setMessages([] as any);
  };

  // Reusable input form renderer (keeps DOM stable, avoids remount on each render)
  const renderInputBar = (wrapperClass: string) => {
    const isStreaming = status === "streaming";
    return (
      <form onSubmit={handleSubmit} className={wrapperClass}>
        {/* Text input with padding to accommodate buttons */}
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask anything..."
          className="w-full h-[48px] bg-[#FEFEFE] rounded-full border-[2px] border-[#E8ECEF] focus:ring-0 focus:ring-offset-0 pl-8 pr-12"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
            }
          }}
          disabled={status !== "ready"}
        />

        {/* Send button inside input (right) */}
        <button
          type={isStreaming ? "button" : "submit"}
          aria-label="Send"
          className="absolute right-6 top-2 h-8 w-8 rounded-[10px] flex items-center justify-center bg-[#4EB4E1] text-white hover:bg-[#3A96C6] disabled:opacity-60"
          disabled={!isStreaming && status !== "ready"}
          onClick={isStreaming ? () => stop() : undefined}
        >
          {isStreaming ? (
            <Square className="h-[24px] w-[24px]" />
          ) : (
            <ArrowUp className="h-[24px] w-[24px]" />
          )}
        </button>
      </form>
    );
  };

  return (
    <div className="w-full">
      <div className="w-full h-[72px] flex justify-end items-center gap-4 pr-4 border-b border-b-[#E3E7EA80]">
        <button
          onClick={createNewSession}
          title="New Chat"
          className="bg-[#E6E6E6] w-[40px] h-[40px] flex justify-center items-center rounded-[4px] hover:bg-[#D4D4D4]"
        >
          <MessageCirclePlus className="h-[22px] w-[22px]" />
        </button>
        <button
          onClick={() => setShowHistory((v) => !v)}
          title="Show History"
          className="bg-[#E6E6E6] w-[40px] h-[40px] flex justify-center items-center rounded-[4px] hover:bg-[#D4D4D4]"
        >
          <History className="h-[22px] w-[22px]" />
        </button>
      </div>

      {/* logo and subtitle (only before first message) */}
      {messages.length === 0 && (
        <div className="mt-40 flex flex-col justify-center items-center">
          <Image src="/mantaChat.png" alt="Manta" width={100} height={100} />
          <h1 className="text-[#939A9F] text-[16px] mt-4 mb-2">
            Your AI agent for Contract Management
          </h1>
        </div>
      )}

      {messages.length === 0 ? (
        // Centered input before first send
        <div className="w-full flex justify-center items-center mt-16">
          {renderInputBar("relative w-[931px]")}
        </div>
      ) : (
        // Chat layout after sending at least one message
        <div className="w-full h-[calc(100vh-72px)] flex flex-col items-center">
          {/* Messages area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 w-full max-w-[931px] overflow-y-auto px-4 py-4 space-y-3"
          >
            {messages.map((m) => {
              const isUser = m.role === "user";
              const text = m.parts
                .map((part: any) => (part.type === "text" ? part.text : ""))
                .join("");
              return (
                <div
                  key={m.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div className="h-8 w-8 flex-shrink-0">
                      {isUser ? (
                        session?.user?.image ? (
                          <Image
                            src={session.user.image}
                            alt={session.user.name ?? "You"}
                            width={32}
                            height={32}
                            className="rounded-full border border-[#E3E7EA80] bg-white object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-[#E6E6E6] text-[#4B5563] text-sm font-medium flex items-center justify-center select-none">
                            {(session?.user?.name ?? "U").charAt(0)}
                          </div>
                        )
                      ) : (
                        <Image
                          src="/mantaProfile.png"
                          alt="Manta"
                          width={40}
                          height={40}
                          className="rounded-full border border-[#E3E7EA80] bg-white"
                        />
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={
                        isUser
                          ? "max-w-[75%] bg-[#4EB4E1] text-white px-3 py-2 rounded-2xl rounded-br-md shadow-sm"
                          : "max-w-[75%] bg-white text-[#111827] px-3 py-2 rounded-2xl rounded-bl-md border border-[#E3E7EA80]"
                      }
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {text}
                        </p>
                      ) : (
                        <div className="prose prose-sm max-w-none text-sm text-[#111827] prose-p:leading-relaxed prose-ul:mt-2 prose-ol:mt-2 prose-li:marker:text-[#4EB4E1]">
                          <ReactMarkdown
                            remarkPlugins={markdownPlugins}
                            components={markdownComponents}
                          >
                            {text}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input area at bottom */}
          {renderInputBar("relative w-full max-w-[931px] pb-8")}
        </div>
      )}

      {/* History Drawer */}
      {showHistory && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowHistory(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[360px] bg-white shadow-xl border-l border-[#E3E7EA80] flex flex-col">
            <div className="px-4 py-3 border-b border-[#E3E7EA80] flex items-center justify-between">
              <div className="font-medium">Chat History</div>
              <button
                onClick={createNewSession}
                className="h-8 px-2 text-sm bg-[#E6E6E6] rounded hover:bg-[#D4D4D4] flex items-center gap-1"
              >
                <CirclePlus className="h-4 w-4" /> New Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sessions
                .slice()
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((s) => {
                  const active = s.id === activeSessionId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActiveSessionId(s.id);
                        setShowHistory(false);
                      }}
                      className={`w-full text-left px-4 py-3 border-b border-[#EFF2F4] hover:bg-[#F7F9FA] ${active ? "bg-[#F2FAFF]" : ""}`}
                    >
                      <div className="text-sm font-medium truncate">
                        {s.title || "New chat"}
                      </div>
                      <div className="text-[11px] text-[#6B7280] mt-0.5">
                        {new Date(s.updatedAt).toLocaleString()}
                      </div>
                    </button>
                  );
                })}
              {sessions.length === 0 && (
                <div className="px-4 py-6 text-sm text-[#6B7280]">
                  No chats yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
