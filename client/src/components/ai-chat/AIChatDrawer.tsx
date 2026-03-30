import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Send,
  Plus,
  MessageSquare,
  Trash2,
  Pencil,
  Check,
  X,
  Loader2,
  Bot,
  User,
  ChevronLeft,
  Zap,
  Search,
  Paperclip,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { ToolCallDisplay } from "@/components/ai-elements/ToolCallDisplay";
import { MessageContent } from "@/components/ai-elements/MessageContent";
import { StreamingShimmer } from "@/components/ai-elements/StreamingShimmer";

interface AiConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface AiMessage {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  tool_calls?: any[];
  reasoning?: string;
  created_at: string;
}

interface StreamMessage {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  toolInvocations?: any[];
  reasoning?: string;
}

const SUGGESTIONS = [
  "How many leads are in the pipeline?",
  "Show me today's tasks",
  "What's our conversion rate?",
  "Show top performing leads by value",
];

export function AIChatDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [streamMessages, setStreamMessages] = useState<StreamMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState<{ file: File; preview?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: conversations = [] } = useQuery<AiConversation[]>({
    queryKey: ["/api/ai/conversations"],
    enabled: open,
  });

  const { data: existingMessages = [] } = useQuery<AiMessage[]>({
    queryKey: ["/api/ai/conversations", activeConversationId, "messages"],
    queryFn: async () => {
      if (!activeConversationId) return [];
      const res = await fetch(`/api/ai/conversations/${activeConversationId}/messages`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!activeConversationId && open,
  });

  const { data: searchResults } = useQuery<AiConversation[]>({
    queryKey: ["/api/ai/conversations/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const res = await fetch(`/api/ai/conversations/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!searchQuery.trim() && showConversations,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (ev) => setPendingAttachment({ file, preview: ev.target?.result as string });
      reader.readAsDataURL(file);
    } else {
      setPendingAttachment({ file });
    }
    e.target.value = "";
  };

  const createConversation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/conversations", { title: "New Chat" });
      return res.json();
    },
    onSuccess: (data: AiConversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
      setActiveConversationId(data.id);
      setStreamMessages([]);
      setShowConversations(false);
    },
  });

  const deleteConversation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/ai/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
      if (activeConversationId) {
        setActiveConversationId(null);
        setStreamMessages([]);
      }
    },
  });

  const renameConversation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const res = await apiRequest("PATCH", `/api/ai/conversations/${id}`, { title });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
      setEditingId(null);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamMessages, existingMessages]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, activeConversationId]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    let convId = activeConversationId;
    if (!convId) {
      const res = await apiRequest("POST", "/api/ai/conversations", { title: "New Chat" });
      const conv = await res.json();
      convId = conv.id;
      setActiveConversationId(convId);
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
    }

    const attachment = pendingAttachment;
    setInputValue("");
    setPendingAttachment(null);
    setIsStreaming(true);

    const attachmentNote = attachment ? `\n[Attached file: ${attachment.file.name}]` : "";
    const userMsg: StreamMessage = { role: "user", content: text + attachmentNote };
    const assistantMsg: StreamMessage = { role: "assistant", content: "", isStreaming: true, toolInvocations: [] };
    setStreamMessages((prev) => [...prev, userMsg, assistantMsg]);

    try {
      if (attachment && convId) {
        const formData = new FormData();
        formData.append("file", attachment.file);
        formData.append("conversationId", convId);
        try {
          await fetch("/api/ai/upload", { method: "POST", body: formData });
        } catch {}
      }

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId, message: text + attachmentNote }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";
      let accContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const text = JSON.parse(line.slice(2));
              accContent += text;
              setStreamMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === "assistant") {
                  updated[updated.length - 1] = { ...last, content: accContent };
                }
                return updated;
              });
            } catch {}
          }
          if (line.startsWith("g:")) {
            try {
              const reasoning = JSON.parse(line.slice(2));
              setStreamMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === "assistant") {
                  updated[updated.length - 1] = {
                    ...last,
                    reasoning: (last.reasoning || "") + reasoning,
                  };
                }
                return updated;
              });
            } catch {}
          }
          if (line.startsWith("9:") || line.startsWith("a:")) {
            try {
              const toolData = JSON.parse(line.slice(2));
              setStreamMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === "assistant") {
                  const invocations = [...(last.toolInvocations || [])];
                  if (line.startsWith("9:")) {
                    invocations.push({ type: "call", ...toolData });
                  } else {
                    const existing = invocations.find((t: any) => t.toolCallId === toolData.toolCallId);
                    if (existing) {
                      existing.type = "result";
                      existing.result = toolData.result;
                    } else {
                      invocations.push({ type: "result", ...toolData });
                    }
                  }
                  updated[updated.length - 1] = { ...last, toolInvocations: invocations };
                }
                return updated;
              });
            } catch {}
          }
        }
      }

      setStreamMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === "assistant") {
          updated[updated.length - 1] = { ...last, isStreaming: false };
        }
        return updated;
      });

      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations", convId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
    } catch (e: any) {
      setStreamMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === "assistant") {
          updated[updated.length - 1] = {
            ...last,
            content: "Sorry, I encountered an error processing your request. Please try again.",
            isStreaming: false,
          };
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [activeConversationId, isStreaming, queryClient]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const openConversation = (conv: AiConversation) => {
    setActiveConversationId(conv.id);
    setStreamMessages([]);
    setShowConversations(false);
  };

  const displayMessages: StreamMessage[] = streamMessages.length > 0
    ? streamMessages
    : existingMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
        toolInvocations: m.tool_calls || undefined,
        reasoning: m.reasoning || undefined,
      }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[480px] p-0 flex flex-col gap-0 [&>button]:hidden"
        data-testid="ai-chat-drawer"
      >
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(activeConversationId || showConversations) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    if (showConversations) {
                      setShowConversations(false);
                    } else {
                      setShowConversations(true);
                    }
                  }}
                  data-testid="button-chat-back"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <SheetTitle className="text-base font-semibold">
                  {showConversations ? "Chat History" : "AI Assistant"}
                </SheetTitle>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowConversations(!showConversations)}
                data-testid="button-chat-history"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  createConversation.mutate();
                }}
                data-testid="button-new-chat"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {showConversations ? (
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                  data-testid="input-search-conversations"
                />
              </div>
              {(searchQuery.trim() ? searchResults || [] : conversations).length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {searchQuery.trim() ? "No matching conversations" : "No conversations yet"}
                </div>
              )}
              {(searchQuery.trim() ? searchResults || [] : conversations).map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer group transition-colors",
                    activeConversationId === conv.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )}
                  onClick={() => editingId !== conv.id && openConversation(conv)}
                  data-testid={`conversation-item-${conv.id}`}
                >
                  <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {editingId === conv.id ? (
                    <div className="flex-1 flex items-center gap-1">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 text-sm bg-background border rounded px-2 py-0.5"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") renameConversation.mutate({ id: conv.id, title: editTitle });
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        data-testid="input-rename-conversation"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          renameConversation.mutate({ id: conv.id, title: editTitle });
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(null);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 text-sm truncate">{conv.title}</span>
                      <div className="hidden group-hover:flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(conv.id);
                            setEditTitle(conv.title);
                          }}
                          data-testid={`button-rename-${conv.id}`}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation.mutate(conv.id);
                          }}
                          data-testid={`button-delete-${conv.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {displayMessages.length === 0 && !isStreaming && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Suprans AI Assistant</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-[300px]">
                      Ask me anything about your CRM data — leads, tasks, performance, analytics, and more.
                    </p>
                    <div className="grid grid-cols-1 gap-2 w-full max-w-[320px]">
                      {SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => sendMessage(suggestion)}
                          className="flex items-center gap-2 px-3 py-2.5 text-left text-sm border rounded-lg hover:bg-muted transition-colors"
                          data-testid={`suggestion-${suggestion.slice(0, 20)}`}
                        >
                          <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {displayMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex items-start pt-1">
                        <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[85%] rounded-xl px-3.5 py-2.5",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/60"
                      )}
                    >
                      {msg.reasoning && (
                        <div className="mb-2 px-3 py-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
                          <div className="flex items-center gap-1.5 mb-1 font-medium">
                            <Sparkles className="h-3 w-3" />
                            <span>Reasoning</span>
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.reasoning}</p>
                        </div>
                      )}
                      {msg.toolInvocations && msg.toolInvocations.length > 0 && (
                        <div className="mb-2">
                          {msg.toolInvocations.map((tool: any, j: number) => (
                            <ToolCallDisplay
                              key={j}
                              toolName={tool.toolName}
                              args={tool.args}
                              result={tool.result}
                            />
                          ))}
                        </div>
                      )}
                      {msg.content ? (
                        <MessageContent content={msg.content} />
                      ) : msg.isStreaming ? (
                        <StreamingShimmer />
                      ) : null}
                    </div>
                    {msg.role === "user" && (
                      <div className="flex items-start pt-1">
                        <div className="flex items-center justify-center h-7 w-7 rounded-full bg-foreground/10 shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t p-3 shrink-0">
              {pendingAttachment && (
                <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-muted rounded-lg text-sm">
                  {pendingAttachment.preview ? (
                    <img src={pendingAttachment.preview} alt="" className="h-8 w-8 rounded object-cover" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="flex-1 truncate text-xs">{pendingAttachment.file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => setPendingAttachment(null)}
                    data-testid="button-remove-attachment"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex items-end gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".csv,.txt,.json,.png,.jpg,.jpeg,.pdf"
                  onChange={handleFileSelect}
                  data-testid="input-file-upload"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isStreaming}
                  data-testid="button-attach-file"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask the AI assistant..."
                  className="flex-1 resize-none rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[40px] max-h-[120px]"
                  rows={1}
                  disabled={isStreaming}
                  data-testid="input-ai-message"
                />
                <Button
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim() || isStreaming}
                  data-testid="button-send-ai-message"
                >
                  {isStreaming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                AI can make mistakes. Verify important information.
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
