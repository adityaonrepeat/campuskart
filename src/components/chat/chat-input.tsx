"use client";

import { useState, type KeyboardEvent, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string) => Promise<boolean>;
  onTyping: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, onTyping, disabled, placeholder = "Type a message..." }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    const content = value.trim();
    if (!content || sending || disabled) return;
    setSending(true);
    const prev = value;
    setValue("");
    const ok = await onSend(content);
    setSending(false);
    if (!ok) setValue(prev);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    onTyping();
  }

  return (
    <div className="flex gap-2 items-end p-4 border-t border-border shrink-0">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || sending}
        className={cn(
          "flex-1 px-4 py-3 rounded-xl text-sm",
          "bg-surface border border-border",
          "focus:outline-none focus:ring-2 focus:ring-accent/30",
          "disabled:opacity-50"
        )}
      />
      <button
        onClick={handleSend}
        disabled={!value.trim() || sending || disabled}
        className="w-11 h-11 rounded-xl bg-accent text-white flex items-center justify-center disabled:opacity-50 hover:bg-accent/90 transition-colors shrink-0"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}
