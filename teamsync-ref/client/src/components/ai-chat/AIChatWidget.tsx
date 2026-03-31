import { useState, useRef, useCallback, useEffect, useContext, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X, Maximize2, Minimize2, Plus, Send, Square, Trash2,
  MessageSquare, Clock, ChevronRight, Bot,
  Paperclip, Download, FileText, Menu, Pencil, Check,
  Search, Loader2, Image as ImageIcon,
  Copy, AlertCircle, ChevronLeft, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { VerticalContext } from "@/lib/vertical-store";
import aiIcon from "@assets/ai-chat-icon.png";

const _preload = new Image();
_preload.src = aiIcon;

interface SearchResult {
  id: string;
  title: string;
  vertical_id: string | null;
  created_at: string;
  updated_at: string;
  titleMatch: boolean;
  messageSnippets: { content: string; role: string }[];
}

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query || query.length < 2) return <>{text}</>;
  const parts: { text: string; match: boolean }[] = [];
  const lower = text.toLowerCase();
  const qLower = query.toLowerCase();
  let lastIdx = 0;
  let idx = lower.indexOf(qLower);
  while (idx !== -1) {
    if (idx > lastIdx) parts.push({ text: text.slice(lastIdx, idx), match: false });
    parts.push({ text: text.slice(idx, idx + query.length), match: true });
    lastIdx = idx + query.length;
    idx = lower.indexOf(qLower, lastIdx);
  }
  if (lastIdx < text.length) parts.push({ text: text.slice(lastIdx), match: false });
  return (
    <>
      {parts.map((p, i) =>
        p.match ? (
          <mark key={i} className="bg-primary/20 text-primary rounded-sm px-0.5">{p.text}</mark>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  );
}

interface GeneratedImageData {
  id: string;
  prompt: string;
  negative_prompt: string | null;
  status: "pending" | "completed" | "failed";
  image_data: string | null;
  image_url: string | null;
  width: number | null;
  height: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  style: string;
  aspect_ratio: string;
}


function ImagePreviewModal({
  image,
  images,
  onClose,
  onNavigate,
  onDelete,
}: {
  image: GeneratedImageData;
  images: GeneratedImageData[];
  onClose: () => void;
  onNavigate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const currentIndex = images.findIndex((i) => i.id === image.id);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0)
        onNavigate(images[currentIndex - 1].id);
      if (e.key === "ArrowRight" && currentIndex < images.length - 1)
        onNavigate(images[currentIndex + 1].id);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, onNavigate, currentIndex, images]);

  const copyPrompt = useCallback(() => {
    navigator.clipboard.writeText(image.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [image.prompt]);

  const imgSrc = image.image_data || image.image_url;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl max-h-[90vh] mx-4 flex flex-col md:flex-row gap-4 bg-background rounded-2xl overflow-hidden shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          data-testid="close-image-preview"
        >
          <X className="size-5" />
        </button>

        <div className="flex-1 min-h-0 flex items-center justify-center bg-black/20 relative p-4">
          {currentIndex > 0 && (
            <button
              onClick={() => onNavigate(images[currentIndex - 1].id)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              data-testid="prev-image"
            >
              <ChevronLeft className="size-5" />
            </button>
          )}
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={image.prompt}
              className="max-w-full max-h-[70vh] rounded-lg object-contain"
              data-testid="preview-image"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-64 text-muted-foreground">
              <ImageIcon className="size-16 opacity-30" />
            </div>
          )}
          {currentIndex < images.length - 1 && (
            <button
              onClick={() => onNavigate(images[currentIndex + 1].id)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              data-testid="next-image"
            >
              <ChevronRight className="size-5" />
            </button>
          )}
        </div>

        <div className="w-full md:w-80 p-5 flex flex-col gap-4 border-l overflow-y-auto">
          <div>
            <h3 className="font-semibold text-sm mb-1">Prompt</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{image.prompt}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 h-7 text-xs gap-1"
              onClick={copyPrompt}
              data-testid="copy-prompt"
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied ? "Copied" : "Copy prompt"}
            </Button>
          </div>

          {image.negative_prompt && (
            <div>
              <h3 className="font-semibold text-sm mb-1">Negative Prompt</h3>
              <p className="text-xs text-muted-foreground">{image.negative_prompt}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{image.style}</Badge>
            <Badge variant="outline">{image.aspect_ratio}</Badge>
            {image.width && image.height && (
              <Badge variant="outline">{image.width}x{image.height}</Badge>
            )}
          </div>

          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="size-3" />
            {formatRelativeTime(image.created_at)}
          </div>

          <div className="flex gap-2 mt-auto pt-4 border-t">
            {imgSrc && (
              <Button asChild className="flex-1 gap-1.5" size="sm" data-testid="download-image">
                <a href={`/api/images/${image.id}/download`} download>
                  <Download className="size-4" />
                  Download
                </a>
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5"
              onClick={() => { onDelete(image.id); onClose(); }}
              data-testid="delete-image"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageStudioPanel() {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "completed" | "pending" | "failed">("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: images = [], isLoading } = useQuery<GeneratedImageData[]>({
    queryKey: ["/api/images"],
    refetchInterval: (query) => {
      const data = query.state.data as GeneratedImageData[] | undefined;
      const hasPending = data?.some((img) => img.status === "pending");
      return hasPending ? 3000 : false;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/images/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/images"] });
      toast({ title: "Image deleted" });
    },
    onError: () => {
      toast({ title: "Delete failed", variant: "destructive" });
    },
  });

  const filteredImages = images.filter((img) => filter === "all" || img.status === filter);
  const completedImages = images.filter((i) => i.status === "completed");
  const previewImage = previewId ? images.find((i) => i.id === previewId) : null;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b shrink-0">
        <ImageIcon className="size-4 text-primary" />
        <span className="font-semibold text-sm">Asset Library</span>
        <Badge variant="secondary" className="text-[10px]">{images.length}</Badge>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="size-4 text-muted-foreground" />
                <h2 className="font-semibold text-sm">Generated Images</h2>
              </div>
              <div className="flex gap-1">
                {(["all", "completed", "pending", "failed"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "text-[11px] px-2.5 py-1 rounded-full border transition-colors capitalize",
                      filter === f
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/60 bg-muted/30 hover:bg-muted/60 text-foreground/70"
                    )}
                    data-testid={`studio-filter-${f}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredImages.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <ImageIcon className="size-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {filter === "all" ? "No images generated yet. Create your first one above!" : `No ${filter} images.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredImages.map((img) => {
                  const imgSrc = img.image_data || img.image_url;
                  return (
                    <Card key={img.id} className="group overflow-hidden cursor-pointer" data-testid={`studio-image-${img.id}`}>
                      <div
                        className="relative aspect-square bg-muted/30 overflow-hidden"
                        onClick={img.status === "completed" ? () => setPreviewId(img.id) : undefined}
                      >
                        {img.status === "completed" && imgSrc ? (
                          <>
                            <img
                              src={imgSrc}
                              alt={img.prompt}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <Button size="icon" variant="secondary" className="size-8 rounded-full" data-testid={`studio-preview-${img.id}`}>
                                  <Maximize2 className="size-4" />
                                </Button>
                                <Button size="icon" variant="secondary" className="size-8 rounded-full" asChild>
                                  <a href={`/api/images/${img.id}/download`} download onClick={(e) => e.stopPropagation()}>
                                    <Download className="size-4" />
                                  </a>
                                </Button>
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  className="size-8 rounded-full"
                                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(img.id); }}
                                  data-testid={`studio-delete-${img.id}`}
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            </div>
                          </>
                        ) : img.status === "pending" ? (
                          <div className="flex flex-col items-center justify-center h-full gap-2">
                            <RefreshCw className="size-6 animate-spin text-primary/50" />
                            <span className="text-[10px] text-muted-foreground">Generating...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full gap-2 px-3">
                            <AlertCircle className="size-6 text-red-400" />
                            <span className="text-[10px] text-red-400 text-center line-clamp-2">{img.error_message || "Failed"}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-6"
                              onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(img.id); }}
                            >
                              <Trash2 className="size-3 text-muted-foreground" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-2.5">
                        <p className="text-[11px] text-foreground/80 line-clamp-2 leading-snug">{img.prompt}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Badge variant={img.status === "completed" ? "default" : img.status === "pending" ? "secondary" : "destructive"} className="text-[9px] h-4 px-1.5">
                            {img.status}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{img.aspect_ratio}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {previewImage && (
        <ImagePreviewModal
          image={previewImage}
          images={completedImages}
          onClose={() => setPreviewId(null)}
          onNavigate={(id) => setPreviewId(id)}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      )}
    </div>
  );
}

function InlineGeneratedImage({ imageId }: { imageId: string }) {
  const { data: image, isLoading } = useQuery<GeneratedImageData>({
    queryKey: ["/api/images", imageId],
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && data.status === "pending") return 2000;
      return false;
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="my-2 rounded-xl border bg-muted/30 p-4 flex items-center gap-3 max-w-[320px]">
        <Loader2 className="size-5 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Loading image…</span>
      </div>
    );
  }

  if (!image) return null;

  if (image.status === "pending") {
    return (
      <div className="my-2 rounded-xl border bg-muted/30 overflow-hidden max-w-[320px]">
        <div className="aspect-square max-h-[240px] flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 relative">
          <div className="absolute inset-0 ai-shimmer" />
          <ImageIcon className="size-10 text-primary/30 mb-2" />
          <span className="text-xs text-muted-foreground font-medium">Generating image…</span>
        </div>
        <div className="px-3 py-2">
          <p className="text-[10px] text-muted-foreground truncate">{image.prompt}</p>
        </div>
      </div>
    );
  }

  if (image.status === "failed") {
    return (
      <div className="my-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 max-w-[320px]">
        <div className="flex items-center gap-2 text-destructive text-xs">
          <X className="size-3.5" />
          <span>Image generation failed</span>
        </div>
        {image.error_message && (
          <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{image.error_message}</p>
        )}
      </div>
    );
  }

  const imgSrc = image.image_data || image.image_url;
  if (!imgSrc) return null;

  return (
    <div className="my-2 rounded-xl border overflow-hidden max-w-[320px] group" data-testid={`generated-image-inline-${imageId}`}>
      <a
        href={`/api/images/${imageId}/download`}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative"
      >
        <img
          src={imgSrc}
          alt={image.prompt}
          className="w-full h-auto max-h-[280px] object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Download className="size-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
        </div>
      </a>
      <div className="px-3 py-2 bg-muted/30">
        <p className="text-[10px] text-muted-foreground truncate">{image.prompt}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <ImageIcon className="size-2.5 text-primary/60" />
          <span className="text-[9px] text-primary/60 font-medium">AI Generated</span>
          <span className="text-[9px] text-muted-foreground/50">{image.aspect_ratio}</span>
        </div>
      </div>
    </div>
  );
}

function renderMessageWithImages(text: string) {
  const pattern = /\[GENERATED_IMAGE:([^\]]+)\]/g;
  const parts: (string | { imageId: string })[] = [];
  let lastIdx = 0;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.slice(lastIdx, match.index));
    }
    parts.push({ imageId: match[1] });
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx));
  }

  if (parts.length === 1 && typeof parts[0] === "string") return null;

  return (
    <>
      {parts.map((part, i) =>
        typeof part === "string" ? (
          <MessageResponse key={i}>{part}</MessageResponse>
        ) : (
          <InlineGeneratedImage key={i} imageId={part.imageId} />
        )
      )}
    </>
  );
}

interface AiConversation {
  id: string;
  title: string;
  vertical_id: string | null;
  created_at: string;
  updated_at: string;
}

interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface AiAttachment {
  id: string;
  filename: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

const SUGGESTIONS = [
  "Summarize active formations this week",
  "What tasks are overdue right now?",
  "Show me open escalations",
  "What's the compliance status?",
];


function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FilePreview({ attachment }: { attachment: AiAttachment }) {
  const isImage = attachment.mime_type.startsWith("image/");

  if (isImage) {
    return (
      <a
        href={`/api/ai/attachments/${attachment.id}/download`}
        target="_blank"
        rel="noopener noreferrer"
        className="block max-w-[200px] rounded-lg overflow-hidden border hover:opacity-90 transition-opacity"
        data-testid={`attachment-preview-${attachment.id}`}
      >
        <img
          src={`/api/ai/attachments/${attachment.id}/download`}
          alt={attachment.filename}
          className="w-full h-auto max-h-[160px] object-cover"
        />
        <div className="px-2 py-1 text-[10px] text-muted-foreground truncate bg-muted/50">
          {attachment.filename}
        </div>
      </a>
    );
  }

  return (
    <a
      href={`/api/ai/attachments/${attachment.id}/download`}
      download={attachment.filename}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors max-w-[240px]"
      data-testid={`attachment-file-${attachment.id}`}
    >
      <FileText className="size-4 shrink-0 text-primary" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{attachment.filename}</p>
        <p className="text-[10px] text-muted-foreground">{formatFileSize(attachment.file_size)}</p>
      </div>
      <Download className="size-3.5 shrink-0 text-muted-foreground" />
    </a>
  );
}

interface ChatWindowProps {
  conversationId: string;
  initialMessages: AiMessage[];
  verticalId: string;
  isExpanded: boolean;
}

function ChatWindow({
  conversationId,
  initialMessages,
  verticalId,
  isExpanded,
}: ChatWindowProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [uploadingFile, setUploadingFile] = useState(false);
  const [input, setInput] = useState("");
  const [pendingAttachmentIds, setPendingAttachmentIds] = useState<string[]>([]);

  const mappedInitial = initialMessages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    parts: [{ type: "text" as const, text: m.content }],
  }));

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ai/chat",
        body: { conversationId, verticalId },
      }),
    [conversationId, verticalId]
  );

  const { messages, status, stop, sendMessage } = useChat({
    transport,
    messages: mappedInitial.length > 0 ? mappedInitial : undefined,
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
    },
  });

  const { data: attachments = [] } = useQuery<AiAttachment[]>({
    queryKey: ["/api/ai/conversations", conversationId, "attachments"],
    enabled: !!conversationId,
    refetchOnWindowFocus: false,
  });

  const isLoading = status === "submitted" || status === "streaming";

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const idsToSend = [...pendingAttachmentIds];
    setPendingAttachmentIds([]);
    sendMessage(
      { text },
      idsToSend.length > 0 ? { body: { attachmentIds: idsToSend } } : undefined
    );
  }, [input, sendMessage, pendingAttachmentIds]);

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleSend();
    },
    [handleSend]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setInput("");
      sendMessage({ text: suggestion });
    },
    [sendMessage]
  );

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Maximum file size is 10 MB.", variant: "destructive" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversationId", conversationId);

      const res = await fetch("/api/ai/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.id) {
          setPendingAttachmentIds((prev) => [...prev, data.id]);
        }
        queryClient.invalidateQueries({
          queryKey: ["/api/ai/conversations", conversationId, "attachments"],
        });
      } else {
        const errData = await res.json().catch(() => ({ error: "Upload failed" }));
        console.error("[ai-chat] Upload failed:", res.status, errData);
        toast({ title: "Upload failed", description: errData.error || "Could not upload file.", variant: "destructive" });
      }
    } catch (err) {
      console.error("File upload failed:", err);
      toast({ title: "Upload failed", description: "Network error — could not upload file.", variant: "destructive" });
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [conversationId, queryClient, toast]);

  const getMessageText = useCallback((msg: typeof messages[0]) => {
    if (!msg.parts) return "";
    return msg.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
  }, []);

  const handleDownloadConversation = useCallback(() => {
    const markdown = messages
      .map((m) => `**${m.role === "user" ? "You" : "TeamSync AI"}:**\n${getMessageText(m)}`)
      .join("\n\n---\n\n");
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "conversation.md";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [messages]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <Conversation className="flex-1 min-h-0">
        <ConversationContent className={cn("py-4", isExpanded ? "px-4 sm:px-8 max-w-3xl mx-auto w-full" : "px-4")}>
          {messages.length === 0 ? (
            <ConversationEmptyState>
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2 mx-auto">
                <img src={aiIcon} alt="TeamSync AI" className="w-8 h-8" />
              </div>
              <div className="space-y-1 mb-4">
                <h3 className="font-semibold text-base">TeamSync AI</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Your intelligent co-pilot for business operations. Ask me anything.
                </p>
              </div>

              <div className={cn("grid gap-2 w-full mb-4", isExpanded ? "grid-cols-2 max-w-md mx-auto" : "grid-cols-2")}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="text-left text-xs px-3 py-2.5 rounded-lg border border-border/60 bg-muted/30 hover:bg-primary/5 hover:border-primary/30 transition-colors text-foreground/80 leading-snug whitespace-normal"
                    data-testid={`suggestion-${s.slice(0, 20).replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    {s}
                  </button>
                ))}
              </div>

            </ConversationEmptyState>
          ) : (
            <>
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {attachments.map((att) => (
                    <FilePreview key={att.id} attachment={att} />
                  ))}
                </div>
              )}
              {messages.map((message) => {
                const text = getMessageText(message);
                const imageContent = message.role === "assistant" ? renderMessageWithImages(text) : null;
                return (
                  <Message key={message.id} from={message.role}>
                    <MessageContent>
                      {message.role === "assistant" ? (
                        imageContent || <MessageResponse>{text}</MessageResponse>
                      ) : (
                        <span>{text}</span>
                      )}
                    </MessageContent>
                  </Message>
                );
              })}
              {status === "submitted" && (
                <Message from="assistant">
                  <MessageContent>
                    <Shimmer className="text-sm" duration={1.5}>
                      TeamSync AI is thinking…
                    </Shimmer>
                  </MessageContent>
                </Message>
              )}
            </>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {messages.length > 0 && messages.length < 3 && (
        <div className={cn("px-4 pb-2", isExpanded && "px-4 sm:px-8 max-w-3xl mx-auto w-full")}>
          <div className="grid grid-cols-2 gap-1.5">
            {SUGGESTIONS.slice(0, 4).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSuggestionClick(s)}
                className="text-left text-[11px] px-2.5 py-2 rounded-lg border border-border/60 bg-muted/30 hover:bg-primary/5 hover:border-primary/30 transition-colors text-foreground/80 leading-snug whitespace-normal"
                data-testid={`followup-suggestion-${s.slice(0, 20).replace(/\s+/g, "-").toLowerCase()}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={cn("border-t p-3", isExpanded && "px-4 sm:px-8 pb-6")}>
        {pendingAttachmentIds.length > 0 && (
          <div className={cn("flex items-center gap-2 mb-2 px-1", isExpanded && "max-w-3xl mx-auto")}>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-1">
              <Paperclip className="size-3" />
              <span>{pendingAttachmentIds.length} file{pendingAttachmentIds.length > 1 ? "s" : ""} attached — will be sent with your next message</span>
              <button
                type="button"
                className="ml-1 text-muted-foreground hover:text-foreground"
                onClick={() => setPendingAttachmentIds([])}
                data-testid="ai-chat-clear-attachments"
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        )}
        <form ref={formRef} onSubmit={handleFormSubmit}>
          <div className={cn(
            "relative flex items-end gap-2 rounded-xl border bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring px-3 py-2",
            isExpanded && "max-w-3xl mx-auto"
          )}>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.json"
              data-testid="ai-chat-file-input"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
              title="Attach file"
              data-testid="ai-chat-attach"
            >
              <Paperclip className={cn("size-3.5", uploadingFile && "animate-spin")} />
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask TeamSync AI…"
              rows={1}
              className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent p-0 text-sm min-h-[28px] max-h-32"
              data-testid="ai-chat-input"
            />
            {messages.length > 0 && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={handleDownloadConversation}
                title="Download conversation"
                data-testid="ai-chat-download"
              >
                <Download className="size-3.5" />
              </Button>
            )}
            {isLoading ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={stop}
                className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                data-testid="ai-chat-stop"
              >
                <Square className="size-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={!input?.trim()}
                className="h-8 w-8 shrink-0 rounded-lg"
                data-testid="ai-chat-send"
              >
                <Send className="size-3.5" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [chatKey, setChatKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"chats" | "studio">("chats");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { currentVertical } = useContext(VerticalContext);
  const queryClient = useQueryClient();

  const { data: conversations = [] } = useQuery<AiConversation[]>({
    queryKey: ["/api/ai/conversations"],
    enabled: isOpen,
    refetchOnWindowFocus: false,
  });

  const { data: savedMessages = [], isFetching: messagesLoading, dataUpdatedAt: messagesUpdatedAt } = useQuery<AiMessage[]>({
    queryKey: ["/api/ai/conversations", activeConversationId, "messages"],
    enabled: !!activeConversationId,
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
  });

  const { data: libraryImages = [], isLoading: libraryLoading } = useQuery<GeneratedImageData[]>({
    queryKey: ["/api/images"],
    enabled: isOpen && isExpanded && sidebarTab === "studio",
    refetchOnWindowFocus: false,
    staleTime: 15000,
  });

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedQuery(value.trim());
    }, 300);
  }, []);

  const { data: searchResults = [], isFetching: isSearching, isError: isSearchError } = useQuery<SearchResult[]>({
    queryKey: ["/api/ai/conversations/search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];
      const res = await fetch(`/api/ai/conversations/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    retry: 1,
    enabled: searchMode && debouncedQuery.length >= 2,
    refetchOnWindowFocus: false,
    staleTime: 10000,
  });

  const openSearch = useCallback(() => {
    setSearchMode(true);
    setSearchQuery("");
    setDebouncedQuery("");
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchMode(false);
    setSearchQuery("");
    setDebouncedQuery("");
  }, []);

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verticalId: currentVertical?.id }),
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      return res.json() as Promise<AiConversation>;
    },
    onSuccess: (data) => {
      setActiveConversationId(data.id);
      setChatKey((k) => k + 1);
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/ai/conversations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete conversation");
    },
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: ["/api/ai/conversations"] });
      const previous = queryClient.getQueryData<AiConversation[]>(["/api/ai/conversations"]);
      queryClient.setQueryData<AiConversation[]>(
        ["/api/ai/conversations"],
        (old) => old ? old.filter((c) => c.id !== deletedId) : []
      );
      if (activeConversationId === deletedId) {
        setActiveConversationId(null);
        setChatKey((k) => k + 1);
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["/api/ai/conversations"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
    },
  });

  const renameConversationMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const res = await fetch(`/api/ai/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to rename conversation");
      return res.json() as Promise<AiConversation>;
    },
    onMutate: async ({ id, title }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/ai/conversations"] });
      const previous = queryClient.getQueryData<AiConversation[]>(["/api/ai/conversations"]);
      queryClient.setQueryData<AiConversation[]>(
        ["/api/ai/conversations"],
        (old) => old ? old.map((c) => c.id === id ? { ...c, title } : c) : []
      );
      setEditingId(null);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["/api/ai/conversations"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
    },
  });

  const startRenaming = useCallback((conv: AiConversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
    setTimeout(() => editInputRef.current?.focus(), 50);
  }, []);

  const renamePendingRef = useRef(false);
  const submitRename = useCallback(() => {
    if (renamePendingRef.current) return;
    if (!editingId || !editTitle.trim()) {
      setEditingId(null);
      return;
    }
    renamePendingRef.current = true;
    renameConversationMutation.mutate(
      { id: editingId, title: editTitle.trim() },
      { onSettled: () => { renamePendingRef.current = false; } }
    );
  }, [editingId, editTitle, renameConversationMutation]);

  const handleOpen = useCallback(async () => {
    setIsOpen(true);
    if (!activeConversationId) {
      await createConversationMutation.mutateAsync();
    }
  }, [activeConversationId, createConversationMutation]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsExpanded(false);
    setSearchMode(false);
    setSearchQuery("");
    setDebouncedQuery("");
  }, []);

  const handleNewChat = useCallback(() => {
    createConversationMutation.mutate();
  }, [createConversationMutation]);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setChatKey((k) => k + 1);
    if (window.innerWidth < 640) {
      setSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (searchMode) {
          closeSearch();
          return;
        }
        if (isExpanded) setIsExpanded(false);
        else handleClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k" && isOpen && isExpanded) {
        e.preventDefault();
        if (searchMode) closeSearch();
        else openSearch();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isExpanded, searchMode, handleClose, closeSearch, openSearch]);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="trigger"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center focus:outline-none"
            aria-label="Open TeamSync AI"
            data-testid="ai-chat-trigger"
          >
            <div className="relative w-14 h-14">
              <img
                src={aiIcon}
                alt="TeamSync AI"
                className="w-14 h-14 object-contain"
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none ai-shimmer" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && isExpanded && (
          <motion.div
            key="fullpage"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex bg-background"
          >
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "-100%", opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="w-full sm:w-[280px] flex flex-col border-r bg-muted/30 shrink-0 absolute sm:relative inset-y-0 left-0 z-10"
                >
                  <div className="flex items-center gap-2.5 px-4 py-4 border-b">
                    <img src={aiIcon} alt="" className="w-7 h-7 object-contain shrink-0" />
                    <span className="font-semibold text-sm">TeamSync AI</span>
                    <div className="ml-auto flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 sm:h-7 sm:w-7 sm:hidden"
                        onClick={() => setSidebarOpen(false)}
                        data-testid="ai-chat-close-sidebar"
                        title="Close sidebar"
                      >
                        <ChevronLeft className="size-4 sm:size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => setIsExpanded(false)}
                        data-testid="ai-chat-minimize"
                        title="Compact view"
                      >
                        <Minimize2 className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={handleClose}
                        data-testid="ai-chat-close-expanded"
                        title="Close"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex border-b">
                    <button
                      onClick={() => setSidebarTab("chats")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-3 sm:py-2.5 text-sm sm:text-xs font-medium transition-colors border-b-2",
                        sidebarTab === "chats"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                      data-testid="ai-sidebar-tab-chats"
                    >
                      <MessageSquare className="size-4 sm:size-3.5" />
                      Chats
                    </button>
                    <button
                      onClick={() => setSidebarTab("studio")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-3 sm:py-2.5 text-sm sm:text-xs font-medium transition-colors border-b-2",
                        sidebarTab === "studio"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                      data-testid="ai-sidebar-tab-studio"
                    >
                      <ImageIcon className="size-4 sm:size-3.5" />
                      Assets
                    </button>
                  </div>

                  {sidebarTab === "chats" && (
                    <>
                      <div className="p-3 border-b flex items-center gap-2">
                        <Button
                          className="flex-1 h-10 sm:h-9 gap-2 justify-start text-sm font-medium"
                          onClick={handleNewChat}
                          disabled={createConversationMutation.isPending}
                          data-testid="ai-chat-new"
                        >
                          <Plus className="size-4 sm:size-3.5" />
                          New Chat
                        </Button>
                        <Button
                          size="icon"
                          variant={searchMode ? "secondary" : "ghost"}
                          className="h-10 w-10 sm:h-9 sm:w-9 shrink-0"
                          onClick={searchMode ? closeSearch : openSearch}
                          data-testid="ai-chat-search-toggle"
                          title="Search chats"
                        >
                          {searchMode ? <X className="size-4 sm:size-3.5" /> : <Search className="size-4 sm:size-3.5" />}
                        </Button>
                      </div>
                    </>
                  )}

                  {sidebarTab === "chats" && (
                    <>
                      <AnimatePresence>
                        {searchMode && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden border-b"
                          >
                            <div className="p-3">
                              <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                                <Input
                                  ref={searchInputRef}
                                  value={searchQuery}
                                  onChange={(e) => handleSearchChange(e.target.value)}
                                  placeholder="Search titles & messages…"
                                  className="h-8 pl-8 pr-3 text-xs"
                                  data-testid="ai-chat-search-input"
                                  onKeyDown={(e) => {
                                    if (e.key === "Escape") closeSearch();
                                  }}
                                />
                              </div>
                              {debouncedQuery.length >= 2 && (
                                <p className={cn("text-[10px] mt-1.5 px-0.5", isSearchError ? "text-destructive" : "text-muted-foreground")}>
                                  {isSearching
                                    ? "Searching…"
                                    : isSearchError
                                      ? "Search failed — try again"
                                      : `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""} found`}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <ScrollArea className="flex-1">
                        {searchMode && debouncedQuery.length >= 2 ? (
                      <div className="p-2 space-y-0.5">
                        {isSearchError && !isSearching && (
                          <div className="text-center py-8 px-3">
                            <Search className="size-8 mx-auto text-destructive/30 mb-2" />
                            <p className="text-xs text-destructive">Search failed</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Please try again</p>
                          </div>
                        )}
                        {searchResults.length === 0 && !isSearching && !isSearchError && (
                          <div className="text-center py-8 px-3">
                            <Search className="size-8 mx-auto text-muted-foreground/30 mb-2" />
                            <p className="text-xs text-muted-foreground">No conversations found</p>
                            <p className="text-[10px] text-muted-foreground/70 mt-0.5">Try different search terms</p>
                          </div>
                        )}
                        {searchResults.map((result) => (
                          <div
                            key={result.id}
                            className={cn(
                              "group flex flex-col gap-1 rounded-lg px-3 py-3 sm:px-2.5 sm:py-2 cursor-pointer text-sm transition-colors",
                              activeConversationId === result.id
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted text-foreground"
                            )}
                            onClick={() => {
                              handleSelectConversation(result.id);
                              closeSearch();
                            }}
                            data-testid={`ai-search-result-${result.id}`}
                          >
                            <div className="flex items-start gap-2">
                              <MessageSquare className="size-3.5 mt-0.5 shrink-0 opacity-60" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate leading-tight text-xs">
                                  <HighlightText text={result.title} query={debouncedQuery} />
                                </p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Clock className="size-2.5 opacity-50" />
                                  <span className="text-[10px] text-muted-foreground">
                                    {formatRelativeTime(result.updated_at)}
                                  </span>
                                  {result.titleMatch && result.messageSnippets.length > 0 && (
                                    <span className="text-[9px] bg-primary/10 text-primary px-1 rounded ml-1">
                                      title + messages
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {result.messageSnippets.length > 0 && (
                              <div className="ml-6 pl-0.5 border-l-2 border-muted space-y-1 mt-0.5">
                                {result.messageSnippets.map((snippet, i) => (
                                  <p key={i} className="text-[10px] text-muted-foreground leading-relaxed pl-2 line-clamp-2">
                                    <span className="text-[9px] font-medium uppercase opacity-60 mr-1">
                                      {snippet.role === "user" ? "You" : "AI"}:
                                    </span>
                                    <HighlightText text={snippet.content} query={debouncedQuery} />
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2 space-y-0.5">
                        {conversations.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-6 px-3">
                            Your conversations will appear here
                          </p>
                        )}
                        {conversations.map((conv) => (
                          <div
                            key={conv.id}
                            className={cn(
                              "group flex items-start gap-2 rounded-lg px-3 py-3 sm:px-2.5 sm:py-2 cursor-pointer text-sm transition-colors",
                              activeConversationId === conv.id
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted text-foreground"
                            )}
                            onClick={() => editingId !== conv.id && handleSelectConversation(conv.id)}
                            data-testid={`ai-conversation-${conv.id}`}
                          >
                            <MessageSquare className="size-3.5 mt-0.5 shrink-0 opacity-60" />
                            <div className="flex-1 min-w-0 overflow-hidden">
                              {editingId === conv.id ? (
                                <input
                                  ref={editInputRef}
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") submitRename();
                                    if (e.key === "Escape") setEditingId(null);
                                  }}
                                  onBlur={submitRename}
                                  className="w-full text-xs font-medium bg-background border rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring"
                                  data-testid={`ai-rename-input-${conv.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <p className="font-medium leading-tight text-xs break-words line-clamp-2">
                                  {conv.title}
                                </p>
                              )}
                              <div className="flex items-center gap-1 mt-0.5">
                                <Clock className="size-2.5 opacity-50 shrink-0" />
                                <span className="text-[10px] text-muted-foreground">
                                  {formatRelativeTime(conv.updated_at)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0 self-center">
                              {editingId === conv.id ? (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 sm:h-6 sm:w-6 text-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    submitRename();
                                  }}
                                  data-testid={`ai-rename-save-${conv.id}`}
                                >
                                  <Check className="size-3.5 sm:size-3" />
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 sm:h-6 sm:w-6 text-muted-foreground hover:text-foreground"
                                    onClick={(e) => startRenaming(conv, e)}
                                    data-testid={`ai-rename-conversation-${conv.id}`}
                                  >
                                    <Pencil className="size-3 sm:size-2.5" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 sm:h-6 sm:w-6 text-muted-foreground hover:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteConversationMutation.mutate(conv.id);
                                    }}
                                    data-testid={`ai-delete-conversation-${conv.id}`}
                                  >
                                    <Trash2 className="size-3 sm:size-2.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                    </>
                  )}

                  {sidebarTab === "studio" && (
                    <ScrollArea className="flex-1">
                      <div className="p-3 space-y-3">
                        <div className="flex items-center gap-1.5">
                          <ImageIcon className="size-3.5 text-primary" />
                          <span className="text-xs font-semibold">Asset Library</span>
                          {!libraryLoading && (
                            <Badge variant="secondary" className="text-[9px] h-4 px-1.5 ml-auto">{libraryImages.length}</Badge>
                          )}
                        </div>

                        {libraryLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="size-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : libraryImages.filter(i => i.status === "completed").length > 0 ? (
                          <div className="grid grid-cols-2 gap-1.5">
                            {libraryImages.filter(i => i.status === "completed").map((img) => {
                              const src = img.image_data || img.image_url;
                              if (!src) return null;
                              return (
                                <div
                                  key={img.id}
                                  className="relative rounded-lg overflow-hidden border bg-muted/20 aspect-square group"
                                  data-testid={`sidebar-image-${img.id}`}
                                >
                                  <img src={src} alt={img.prompt} className="w-full h-full object-cover" loading="lazy" />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                                    <p className="text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity p-1.5 line-clamp-2 leading-tight">{img.prompt}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <ImageIcon className="size-8 text-muted-foreground/30 mb-2" />
                            <p className="text-[11px] text-muted-foreground">No images yet</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">Ask AI in chat to generate images</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/20 z-[5] sm:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            <div className="flex-1 flex flex-col min-w-0">
              {sidebarTab === "studio" ? (
                <>
                  {!sidebarOpen && (
                    <div className="absolute top-4 left-4 z-10">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => setSidebarOpen(true)}
                        data-testid="ai-studio-open-sidebar"
                        title="Open sidebar"
                      >
                        <Menu className="size-4" />
                      </Button>
                    </div>
                  )}
                  <ImageStudioPanel />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b">
                    {!sidebarOpen && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 mr-1"
                        onClick={() => setSidebarOpen(true)}
                        data-testid="ai-chat-open-sidebar"
                        title="Open sidebar"
                      >
                        <Menu className="size-4" />
                      </Button>
                    )}
                    <Bot className="size-4 text-primary" />
                    <span className="font-semibold text-sm truncate">
                      {conversations.find((c) => c.id === activeConversationId)?.title ?? "New Chat"}
                    </span>
                    <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ChevronRight className="size-3.5" />
                      <span className="capitalize hidden sm:inline">{currentVertical?.id ?? "all"}</span>
                    </div>
                  </div>

                  {activeConversationId && messagesLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : activeConversationId ? (
                    <ChatWindow
                      key={`expanded-${activeConversationId}-${chatKey}-${messagesUpdatedAt}`}
                      conversationId={activeConversationId}
                      initialMessages={savedMessages}
                      verticalId={currentVertical?.id ?? ""}
                      isExpanded
                    />
                  ) : null}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && !isExpanded && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/10"
              onClick={handleClose}
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[420px] flex flex-col bg-background border-l shadow-2xl"
            >
              <div className="flex items-center gap-2.5 px-4 py-3.5 border-b shrink-0">
                <img src={aiIcon} alt="" className="w-7 h-7 object-contain shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-none">TeamSync AI</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                    {currentVertical?.id ?? "All verticals"} assistant
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => setIsExpanded(true)}
                    data-testid="ai-chat-expand"
                    title="Expand to full screen"
                  >
                    <Maximize2 className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={handleNewChat}
                    data-testid="ai-chat-new-drawer"
                    title="New chat"
                  >
                    <Plus className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={handleClose}
                    data-testid="ai-chat-close"
                    title="Close"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 min-h-0">
                {activeConversationId && messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  </div>
                ) : activeConversationId ? (
                  <ChatWindow
                    key={`drawer-${activeConversationId}-${chatKey}-${messagesUpdatedAt}`}
                    conversationId={activeConversationId}
                    initialMessages={savedMessages}
                    verticalId={currentVertical?.id ?? ""}
                    isExpanded={false}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Shimmer className="text-sm text-muted-foreground">
                      Starting a new conversation…
                    </Shimmer>
                  </div>
                )}
              </div>


            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
