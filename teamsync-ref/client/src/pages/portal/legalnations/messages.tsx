import { useState } from "react";
import { Send, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/ui/animated";
import { portalMessages, portalClient, type PortalMessage } from "@/lib/mock-data-portal-legalnations";

function MessageBubble({ msg }: { msg: PortalMessage }) {
  const time = new Date(msg.timestamp).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });

  return (
    <div className={cn("flex gap-3", msg.isClient ? "flex-row-reverse" : "")} data-testid={`message-${msg.id}`}>
      <div className={cn(
        "size-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
        msg.isClient
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
      )}>
        {msg.isClient ? portalClient.avatar : msg.from.split(" ").map(n => n[0]).join("")}
      </div>
      <div className={cn("max-w-[75%]", msg.isClient ? "items-end" : "")}>
        <div className={cn("flex items-center gap-2 mb-1", msg.isClient ? "flex-row-reverse" : "")}>
          <span className="text-xs font-semibold">{msg.from}</span>
          {!msg.isClient && (
            <Badge variant="outline" className="text-[9px] h-4">{msg.fromRole}</Badge>
          )}
        </div>
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          msg.isClient
            ? "bg-blue-600 text-white rounded-tr-md"
            : "bg-slate-100 dark:bg-slate-800 rounded-tl-md"
        )}>
          {msg.content}
        </div>
        <div className={cn("text-[10px] text-muted-foreground mt-1", msg.isClient ? "text-right" : "")}>
          {time}
          {!msg.read && !msg.isClient && (
            <Badge variant="destructive" className="text-[8px] h-3.5 ml-2 px-1">New</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PortalMessages() {
  const [messages, setMessages] = useState<PortalMessage[]>(portalMessages);
  const [draft, setDraft] = useState("");

  const handleSend = () => {
    if (!draft.trim()) return;
    const newMsg: PortalMessage = {
      id: `msg-${Date.now()}`,
      from: portalClient.name,
      fromRole: "Client",
      isClient: true,
      content: draft.trim(),
      timestamp: new Date().toISOString(),
      read: true,
    };
    setMessages(prev => [...prev, newMsg]);
    setDraft("");
  };

  return (
    <PageTransition className="px-4 sm:px-8 py-6 lg:px-24 flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)]">
      <div className="shrink-0 mb-4">
        <h1 className="text-2xl font-bold font-heading">Messages</h1>
        <p className="text-sm text-muted-foreground mt-1">Chat with your LegalNations formation team</p>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="p-4 border-b bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="size-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold">Formation Team</p>
              <p className="text-xs text-muted-foreground">Priya Sharma, Arjun Mehta</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4" data-testid="messages-list">
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
        </div>

        <div className="p-4 border-t shrink-0">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              className="min-h-[44px] max-h-[120px] resize-none"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              data-testid="input-message"
            />
            <Button
              onClick={handleSend}
              disabled={!draft.trim()}
              className="h-11 w-11 shrink-0 bg-blue-600 hover:bg-blue-700"
              size="icon"
              data-testid="button-send-message"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </PageTransition>
  );
}
