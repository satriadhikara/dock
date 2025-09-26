"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MessageCirclePlus,
  History,
  ArrowUp,
  CirclePlus,
  Square,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Image from "next/image";

export default function MantaPage() {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  const apiBase = (process.env.NEXT_PUBLIC_API_URL as string | undefined) ?? "";
  const chatTransport = useMemo(() => {
    const base = apiBase.replace(/\/$/, "");
    const api = base ? `${base}/api/chat` : "/api/chat";
    return new DefaultChatTransport({ api });
  }, [apiBase]);

  const { messages, sendMessage, stop, status } = useChat({
    transport: chatTransport,
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
        <button className="bg-[#E6E6E6] w-[40px] h-[40px] flex justify-center items-center rounded-[4px] hover:bg-[#D4D4D4]">
          <MessageCirclePlus className="h-[22px] w-[22px]" />
        </button>
        <button className="bg-[#E6E6E6] w-[40px] h-[40px] flex justify-center items-center rounded-[4px] hover:bg-[#D4D4D4]">
          <History className="h-[22px] w-[22px]" />
        </button>
      </div>

      {/* logo and subtitle (only before first message) */}
      {messages.length === 0 && (
        <div className="mt-40 flex flex-col justify-center items-center">
          <Image 
            src="/mantaChat.png" 
            alt="Manta" 
            width={100} 
            height={100}
          />
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
                  <div className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
                    {/* Avatar */}
                    <div className="h-8 w-8 flex-shrink-0">
                      {isUser ? (
                        <div className="h-8 w-8 rounded-full bg-[#E6E6E6] text-[#4B5563] text-sm font-medium flex items-center justify-center select-none">
                          U
                        </div>
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
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {text}
                      </p>
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
    </div>
  );
}
