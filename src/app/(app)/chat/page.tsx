import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground bg-surface h-full">
      <MessageSquare className="h-12 w-12 opacity-20" />
      <p className="text-sm font-medium">Select a conversation</p>
      <p className="text-xs">Choose from the list to start chatting</p>
    </div>
  );
}
