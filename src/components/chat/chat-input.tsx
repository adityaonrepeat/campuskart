"use client";

import { useState, useRef, type KeyboardEvent, type ChangeEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string) => Promise<boolean>;
  onTyping: () => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, onTyping, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSend() {
    const content = value.trim();
    if (!content || sending || disabled) return;
    setSending(true);
    const prev = value;
    setValue("");
    const ok = await onSend(content);
    setSending(false);
    if (!ok) setValue(prev);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    onTyping();
  }

  return (
    <div className="flex items-end gap-2 border-t bg-background px-3 py-2.5 shrink-0">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message…"
        rows={1}
        className={cn(
          "flex-1 min-h-[38px] max-h-28 resize-none overflow-y-auto",
          "rounded-xl border-0 bg-muted px-3 py-2 text-sm shadow-none",
          "focus-visible:ring-0 focus-visible:ring-offset-0"
        )}
        disabled={disabled || sending}
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={!value.trim() || sending || disabled}
        className="shrink-0 rounded-full"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
