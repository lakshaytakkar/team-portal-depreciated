import { useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  LN_CONVERSATIONS,
  LN_MESSAGES,
  CLIENT_PROFILE,
  type LnMessage,
  type LnConversation,
} from "@/lib/mock-data-dashboard-ln";

function formatTime(ts: string) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function formatShortTime(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const roleBadgeColor: Record<string, string> = {
  "Formation Specialist": "bg-sky-50 text-sky-700 border-sky-200",
  "Compliance Officer": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Tax Specialist": "bg-amber-50 text-amber-700 border-amber-200",
};

export default function LnMessages() {
  const [activeConvo, setActiveConvo] = useState(LN_CONVERSATIONS[0]?.id || "");
  const [localMessages, setLocalMessages] = useState<LnMessage[]>([...LN_MESSAGES]);
  const [draft, setDraft] = useState("");
  const [localConvos, setLocalConvos] = useState<LnConversation[]>([...LN_CONVERSATIONS]);

  const activeConversation = localConvos.find(c => c.id === activeConvo);
  const threadMessages = localMessages.filter(m => m.conversationId === activeConvo);

  function handleSend() {
    if (!draft.trim() || !activeConversation) return;
    const newMsg: LnMessage = {
      id: `msg-${Date.now()}`,
      conversationId: activeConvo,
      from: CLIENT_PROFILE.name,
      fromRole: "Client",
      isClient: true,
      content: draft.trim(),
      timestamp: new Date().toISOString(),
    };
    setLocalMessages(prev => [...prev, newMsg]);
    setLocalConvos(prev => prev.map(c =>
      c.id === activeConvo ? { ...c, lastMessage: draft.trim(), lastTimestamp: newMsg.timestamp, unread: 0 } : c
    ));
    setDraft("");
  }

  return (
    <div className="p-6 flex flex-col h-[calc(100vh-3.5rem)]" data-testid="ln-messages-page">
      <div className="shrink-0 mb-4">
        <h1 className="text-2xl font-bold font-heading" data-testid="text-page-title">Messages</h1>
        <p className="text-sm text-muted-foreground mt-1">Chat with your LegalNations specialists</p>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <Card className="w-80 shrink-0 flex flex-col overflow-hidden" data-testid="conversations-list">
          <div className="p-3 border-b bg-muted/30">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {Object.entries(
              localConvos.reduce<Record<string, typeof localConvos>>((groups, convo) => {
                const role = convo.specialistRole;
                if (!groups[role]) groups[role] = [];
                groups[role].push(convo);
                return groups;
              }, {})
            ).map(([role, convos]) => (
              <div key={role}>
                <div className="px-4 py-1.5 bg-muted/20 border-b">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{role}</p>
                </div>
                {convos.map(convo => (
                  <button
                    key={convo.id}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b hover:bg-muted/30 transition-colors",
                      activeConvo === convo.id && "bg-blue-50 border-l-2 border-l-blue-600"
                    )}
                    onClick={() => {
                      setActiveConvo(convo.id);
                      setLocalConvos(prev => prev.map(c => c.id === convo.id ? { ...c, unread: 0 } : c));
                    }}
                    data-testid={`convo-${convo.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                        {convo.specialistInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold truncate">{convo.specialistName}</p>
                          {convo.unread > 0 && (
                            <span className="size-2 rounded-full bg-blue-600 shrink-0 ml-1" data-testid={`unread-dot-${convo.id}`} />
                          )}
                        </div>
                        <Badge variant="outline" className={cn("text-[9px] h-4 mt-0.5", roleBadgeColor[convo.specialistRole] || "")}>
                          {convo.specialistRole}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{convo.companyName}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{convo.lastMessage}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatShortTime(convo.lastTimestamp)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex-1 flex flex-col min-h-0 overflow-hidden" data-testid="message-thread">
          {activeConversation ? (
            <>
              <div className="p-4 border-b bg-muted/30 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    {activeConversation.specialistInitials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{activeConversation.specialistName}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn("text-[9px] h-4", roleBadgeColor[activeConversation.specialistRole] || "")}>
                        {activeConversation.specialistRole}
                      </Badge>
                      <span className="text-xs text-muted-foreground">· {activeConversation.companyName}</span>
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-muted-foreground">Online</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4" data-testid="messages-list">
                {threadMessages.map(msg => (
                  <div key={msg.id} className={cn("flex gap-3", msg.isClient && "flex-row-reverse")} data-testid={`message-${msg.id}`}>
                    <div className={cn(
                      "size-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      msg.isClient ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                    )}>
                      {msg.isClient ? CLIENT_PROFILE.avatar : msg.from.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className={cn("max-w-[75%]")}>
                      <div className={cn("flex items-center gap-2 mb-1", msg.isClient && "flex-row-reverse")}>
                        <span className="text-xs font-semibold">{msg.from}</span>
                        {!msg.isClient && (
                          <Badge variant="outline" className={cn("text-[9px] h-4", roleBadgeColor[msg.fromRole] || "")}>{msg.fromRole}</Badge>
                        )}
                      </div>
                      <div className={cn(
                        "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        msg.isClient ? "bg-blue-600 text-white rounded-tr-md" : "bg-slate-100 rounded-tl-md"
                      )}>
                        {msg.content}
                      </div>
                      <p className={cn("text-[10px] text-muted-foreground mt-1", msg.isClient && "text-right")}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="size-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
