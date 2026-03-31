import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Search,
  Hash,
  Users,
  MoreVertical,
  Paperclip,
  Send,
  MessageCircle,
  Plus,
  ChevronDown,
  Reply,
  Pencil,
  Trash2,
  X,
  Check,
  Megaphone,
  Info,
  ArrowDown,
  FileText,
  Download,
  Image as ImageIcon,
  Menu,
  ArrowLeft,
  Phone,
  Video,
  Smile,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { detectVerticalFromUrl, verticals } from "@/lib/verticals-config";
import { verticalMembers } from "@/lib/mock-data-shared";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition } from "@/components/ui/animated";
import { FilterPill } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageLoading } from "@/components/ui/page-loading";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { supabaseClient } from "@/lib/supabase-client";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ── Types ───────────────────────────────────────────────────────────────────────

interface DBChannel {
  id: string;
  vertical_id: string;
  name: string;
  type: string;
  description: string | null;
  member_names: string[];
  is_pinned: boolean;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  topic: string | null;
  is_archived: boolean;
  created_at: string;
}

interface DBMessage {
  id: string;
  channel_id: string;
  sender_id: string | null;
  sender_name: string;
  content: string;
  attachments: unknown[];
  reply_to_id: string | null;
  edited_at: string | null;
  is_deleted: boolean;
  reactions: Record<string, string[]>;
  message_type: string;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  created_at: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "🔥", "👀"];
const EMOJI_LIST = ["😀", "😂", "😍", "🤔", "😎", "🙌", "👍", "❤️", "🔥", "🎉", "👀", "💯", "✅", "🚀", "💪", "🙏"];

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(fileName: string | null): boolean {
  if (!fileName) return false;
  return /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(fileName);
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffDay === 0) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  }
  if (diffDay === 1) {
    return `Yesterday ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatSidebarTime(isoString: string | null): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const diffDay = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDay === 0) return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return date.toLocaleDateString("en-US", { weekday: "short" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isSameGroup(a: DBMessage, b: DBMessage): boolean {
  if (a.sender_name !== b.sender_name) return false;
  const diff = Math.abs(new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return diff < 5 * 60 * 1000;
}

function getOnlineStatus(name: string, verticalId: string): "online" | "away" | "offline" {
  const member = verticalMembers.find((m) => m.name === name && m.verticalId === verticalId);
  return member?.status ?? "offline";
}

function OnlineDot({ status }: { status: "online" | "away" | "offline" }) {
  return (
    <span className={cn(
      "inline-block w-2 h-2 rounded-full shrink-0",
      status === "online" && "bg-green-500",
      status === "away" && "bg-yellow-400",
      status === "offline" && "bg-gray-300 dark:bg-gray-600"
    )} />
  );
}

// ── Current User ────────────────────────────────────────────────────────────────

function useCurrentUser(verticalId: string) {
  const members = useMemo(() => verticalMembers.filter((m) => m.verticalId === verticalId), [verticalId]);
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem(`chat_user_${verticalId}`) ?? members[0]?.name ?? "You";
  });

  useEffect(() => {
    const stored = localStorage.getItem(`chat_user_${verticalId}`);
    if (stored) {
      setCurrentUser(stored);
    } else if (members.length > 0) {
      setCurrentUser(members[0].name);
    }
  }, [verticalId, members]);

  const switchUser = useCallback((name: string) => {
    localStorage.setItem(`chat_user_${verticalId}`, name);
    setCurrentUser(name);
  }, [verticalId]);

  return { currentUser, switchUser, members };
}

// ── Channel Sidebar Item ────────────────────────────────────────────────────────

function ChannelItem({
  channel,
  active,
  verticalColor,
  verticalId,
  onClick,
}: {
  channel: DBChannel;
  active: boolean;
  verticalColor: string;
  verticalId: string;
  onClick: () => void;
}) {
  const isDM = channel.type === "dm";
  const isAnnouncement = channel.type === "announcement";
  const dmPartner = isDM ? channel.name : null;
  const onlineStatus = isDM ? getOnlineStatus(dmPartner!, verticalId) : null;

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-3 sm:py-2.5 cursor-pointer transition-colors hover:bg-muted/50 group",
        active && "bg-muted/70"
      )}
      style={active ? { backgroundColor: `${verticalColor}12` } : {}}
      data-testid={isDM ? `dm-item-${channel.id}` : `channel-item-${channel.id}`}
    >
      {isDM ? (
        <div className="relative shrink-0">
          <Avatar className="h-7 w-7">
            <AvatarImage src={getPersonAvatar(channel.name)} alt={channel.name} />
            <AvatarFallback className="text-[10px]">{channel.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          {onlineStatus && (
            <span className={cn(
              "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background",
              onlineStatus === "online" && "bg-green-500",
              onlineStatus === "away" && "bg-yellow-400",
              onlineStatus === "offline" && "bg-gray-300"
            )} />
          )}
        </div>
      ) : (
        <div className={cn(
          "h-7 w-7 shrink-0 flex items-center justify-center rounded",
          active ? "text-foreground" : "text-muted-foreground"
        )}
        style={active ? { color: verticalColor } : {}}
        >
          {isAnnouncement ? <Megaphone className="h-3.5 w-3.5" /> : <Hash className="h-3.5 w-3.5" />}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className={cn(
            "text-sm truncate",
            active ? "font-semibold" : "font-medium",
            channel.unread_count > 0 && "font-semibold"
          )}
          style={active ? { color: verticalColor } : {}}
          >
            {channel.name}
          </span>
          {channel.last_message_at && (
            <span className="text-[10px] text-muted-foreground shrink-0">{formatSidebarTime(channel.last_message_at)}</span>
          )}
        </div>
        {channel.last_message && (
          <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
            {channel.last_message}
          </p>
        )}
      </div>

      {channel.unread_count > 0 && (
        <div
          className="h-4 min-w-4 flex items-center justify-center text-white rounded-full text-[10px] font-medium px-1 shrink-0"
          style={{ backgroundColor: verticalColor }}
          data-testid={`unread-badge-${channel.id}`}
        >
          {channel.unread_count}
        </div>
      )}
    </div>
  );
}

// ── Message Bubble ───────────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  isMe,
  showHeader,
  replyToMsg,
  verticalColor,
  currentUser,
  onReply,
  onEdit,
  onDelete,
  onReact,
}: {
  msg: DBMessage;
  isMe: boolean;
  showHeader: boolean;
  replyToMsg?: DBMessage;
  verticalColor: string;
  currentUser: string;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReact: (emoji: string) => void;
}) {
  const [hovering, setHovering] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const totalReactions = Object.values(msg.reactions ?? {}).reduce((sum, users) => sum + users.length, 0);
  const hasReactions = totalReactions > 0;

  return (
    <div
      className={cn("flex gap-2 group relative px-4", isMe ? "flex-row-reverse" : "flex-row")}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setShowReactionPicker(false); }}
      data-testid={`message-${msg.id}`}
    >
      {!isMe && (
        <div className="w-8 shrink-0 mt-1">
          {showHeader && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={getPersonAvatar(msg.sender_name)} alt={msg.sender_name} />
              <AvatarFallback className="text-xs">{msg.sender_name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
        </div>
      )}

      <div className={cn("flex flex-col gap-0.5 max-w-[72%]", isMe ? "items-end" : "items-start")}>
        {showHeader && (
          <div className={cn("flex items-center gap-2 px-1", isMe && "flex-row-reverse")}>
            <span className="text-xs font-semibold">{msg.sender_name}</span>
            <span className="text-[10px] text-muted-foreground">{formatTime(msg.created_at)}</span>
            {msg.edited_at && <span className="text-[10px] text-muted-foreground italic">(edited)</span>}
          </div>
        )}

        {replyToMsg && (
          <div className={cn(
            "border-l-2 pl-2 mb-1 opacity-70 text-xs text-muted-foreground max-w-full",
            isMe ? "self-end" : "self-start"
          )}
          style={{ borderColor: verticalColor }}
          >
            <span className="font-medium">{replyToMsg.sender_name}: </span>
            <span className="truncate">{replyToMsg.content.substring(0, 80)}{replyToMsg.content.length > 80 ? "…" : ""}</span>
          </div>
        )}

        {msg.file_url && !msg.is_deleted ? (
          isImageFile(msg.file_name) ? (
            <div className="rounded-2xl overflow-hidden shadow-sm border max-w-xs">
              <a href={msg.file_url} target="_blank" rel="noopener noreferrer">
                <img src={msg.file_url} alt={msg.file_name ?? "image"} className="max-h-64 w-auto object-cover" loading="lazy" />
              </a>
              <div className={cn("px-3 py-1.5 text-xs flex items-center justify-between gap-2", isMe ? "text-white" : "bg-card text-foreground")} style={isMe ? { backgroundColor: verticalColor } : {}}>
                <span className="truncate">{msg.file_name}</span>
                <a href={msg.file_url} download={msg.file_name ?? undefined} target="_blank" rel="noopener noreferrer" className="shrink-0 opacity-70 hover:opacity-100" data-testid={`btn-download-${msg.id}`}>
                  <Download className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className={cn("rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3 min-w-[200px]", isMe ? "text-white" : "bg-card border text-foreground")} style={isMe ? { backgroundColor: verticalColor } : {}}>
              <FileText className="h-8 w-8 shrink-0 opacity-70" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{msg.file_name}</p>
                <p className="text-xs opacity-70">{formatFileSize(msg.file_size)}</p>
              </div>
              <a href={msg.file_url} download={msg.file_name ?? undefined} target="_blank" rel="noopener noreferrer" className="shrink-0 opacity-70 hover:opacity-100" data-testid={`btn-download-${msg.id}`}>
                <Download className="h-4 w-4" />
              </a>
            </div>
          )
        ) : (
          <div className={cn(
            "rounded-2xl px-4 py-2 text-sm shadow-sm leading-relaxed",
            msg.is_deleted ? "opacity-50 italic" : "",
            isMe ? "text-white" : "bg-card border text-foreground"
          )}
          style={isMe ? { backgroundColor: verticalColor } : {}}
          >
            {msg.content}
          </div>
        )}

        {!showHeader && !msg.is_deleted && (
          <span className={cn("text-[10px] text-muted-foreground px-1 opacity-0 group-hover:opacity-100 transition-opacity")}>
            {formatTime(msg.created_at)}
            {msg.edited_at && " · edited"}
          </span>
        )}

        {hasReactions && (
          <div className="flex flex-wrap gap-1 px-1 mt-0.5">
            {Object.entries(msg.reactions ?? {}).map(([emoji, users]) => (
              <TooltipProvider key={emoji}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onReact(emoji)}
                      className={cn(
                        "flex items-center gap-1 text-xs rounded-full px-2 py-0.5 border transition-colors",
                        users.includes(currentUser)
                          ? "border-opacity-50 text-white"
                          : "bg-muted border-transparent hover:border-border"
                      )}
                      style={users.includes(currentUser) ? { backgroundColor: verticalColor, borderColor: verticalColor } : {}}
                      data-testid={`reaction-${msg.id}-${emoji}`}
                    >
                      {emoji} <span>{users.length}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{users.join(", ")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}
      </div>

      {hovering && !msg.is_deleted && (
        <div className={cn(
          "absolute top-0 flex items-center gap-0.5 bg-background border rounded-lg shadow-md px-1 py-0.5 z-10",
          isMe ? "right-14 left-auto" : "left-12 right-auto"
        )}>
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReact(emoji)}
              className="text-sm hover:scale-125 transition-transform p-0.5"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
          <div className="w-px h-5 bg-border mx-0.5" />
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onReply} title="Reply">
            <Reply className="h-3 w-3" />
          </Button>
          {isMe && (
            <>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit} title="Edit">
                <Pencil className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={onDelete} title="Delete">
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Create Channel Dialog ───────────────────────────────────────────────────────

function CreateChannelDialog({
  open,
  onClose,
  verticalId,
  verticalColor,
  availableMembers,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  verticalId: string;
  verticalColor: string;
  availableMembers: string[];
  onCreated: (channel: DBChannel) => void;
}) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/core/channels", {
        vertical_id: verticalId,
        name: name.toLowerCase().replace(/\s+/g, "-"),
        description,
        member_names: selectedMembers,
        type: "channel",
      }),
    onSuccess: async (res) => {
      const ch = await res.json();
      queryClient.invalidateQueries({ queryKey: [`/api/core/channels?verticalId=${verticalId}`] });
      toast({ title: `#${ch.name} created` });
      onCreated(ch);
      onClose();
      setName(""); setDescription(""); setSelectedMembers([]);
    },
    onError: () => toast({ title: "Failed to create channel", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Channel Name</label>
            <Input
              placeholder="e.g. design-feedback"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-channel-name"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Description (optional)</label>
            <Input
              placeholder="What is this channel about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Add Members</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {availableMembers.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMembers((prev) =>
                    prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
                  )}
                  className={cn(
                    "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors",
                    selectedMembers.includes(m) ? "text-white" : "bg-muted border-transparent"
                  )}
                  style={selectedMembers.includes(m) ? { backgroundColor: verticalColor } : {}}
                >
                  {selectedMembers.includes(m) && <Check className="h-3 w-3" />}
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!name.trim() || mutation.isPending}
            onClick={() => mutation.mutate()}
            style={{ backgroundColor: verticalColor }}
            data-testid="btn-create-channel"
          >
            {mutation.isPending ? "Creating…" : "Create Channel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── New DM Dialog ────────────────────────────────────────────────────────────────

function NewDMDialog({
  open,
  onClose,
  verticalId,
  verticalColor,
  availableMembers,
  currentUser,
  existingDMs,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  verticalId: string;
  verticalColor: string;
  availableMembers: string[];
  currentUser: string;
  existingDMs: DBChannel[];
  onCreated: (channel: DBChannel) => void;
}) {
  const { toast } = useToast();
  const existingDMNames = new Set(existingDMs.flatMap((d) => d.member_names));
  const candidates = availableMembers.filter((m) => m !== currentUser);

  const mutation = useMutation({
    mutationFn: (target: string) =>
      apiRequest("POST", "/api/core/channels/dm", {
        vertical_id: verticalId,
        member_names: [currentUser, target],
      }),
    onSuccess: async (res) => {
      const dm = await res.json();
      queryClient.invalidateQueries({ queryKey: [`/api/core/channels?verticalId=${verticalId}`] });
      toast({ title: `DM with ${dm.name} opened` });
      onCreated(dm);
      onClose();
    },
    onError: () => toast({ title: "Failed to start DM", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New Direct Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {candidates.map((m) => (
            <button
              key={m}
              onClick={() => mutation.mutate(m)}
              disabled={mutation.isPending}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors text-left"
              data-testid={`dm-candidate-${m}`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={getPersonAvatar(m)} />
                <AvatarFallback className="text-xs">{m.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{m}</span>
                {existingDMNames.has(m) && <span className="text-xs text-muted-foreground ml-2">(existing DM)</span>}
              </div>
              <OnlineDot status={getOnlineStatus(m, verticalId)} />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Channel Info Panel ────────────────────────────────────────────────────────

function ChannelInfoPanel({
  channel,
  verticalId,
  onClose,
}: {
  channel: DBChannel;
  verticalId: string;
  onClose: () => void;
}) {
  return (
    <aside className="w-[280px] sm:w-64 shrink-0 border-l flex flex-col bg-background overflow-hidden fixed inset-y-0 right-0 z-40 md:relative md:z-auto shadow-lg md:shadow-none">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h3 className="text-sm font-semibold">Details</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">About</p>
            <p className="text-sm text-foreground/80">{channel.description || "No description."}</p>
            {channel.topic && (
              <p className="text-xs text-muted-foreground mt-1">Topic: {channel.topic}</p>
            )}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              Members ({channel.member_names.length})
            </p>
            <div className="space-y-2">
              {channel.member_names.map((name) => (
                <div key={name} className="flex items-center gap-2.5">
                  <div className="relative">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={getPersonAvatar(name)} />
                      <AvatarFallback className="text-[10px]">{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-background",
                      getOnlineStatus(name, verticalId) === "online" ? "bg-green-500" :
                      getOnlineStatus(name, verticalId) === "away" ? "bg-yellow-400" : "bg-gray-300"
                    )} />
                  </div>
                  <div>
                    <p className="text-xs font-medium">{name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{getOnlineStatus(name, verticalId)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Created</p>
            <p className="text-xs text-muted-foreground">{new Date(channel.created_at).toLocaleDateString("en-US", { dateStyle: "medium" })}</p>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}

// ── Main Chat Component ────────────────────────────────────────────────────────

export default function UniversalChat() {
  const [location] = useLocation();
  const vertical = detectVerticalFromUrl(location);
  const loading = useSimulatedLoading(400);
  const { toast } = useToast();

  const { currentUser, switchUser, members } = useCurrentUser(vertical?.id ?? "");

  const [activeTab, setActiveTab] = useState<"channel" | "dm">("channel");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [replyTo, setReplyTo] = useState<DBMessage | null>(null);
  const [editingMsg, setEditingMsg] = useState<DBMessage | null>(null);
  const [editText, setEditText] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showNewDM, setShowNewDM] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const [hasNewOutOfView, setHasNewOutOfView] = useState(false);
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const realtimeRef = useRef<RealtimeChannel | null>(null);
  const typingChannelRef = useRef<RealtimeChannel | null>(null);

  const verticalId = vertical?.id ?? "";
  const verticalColor = vertical?.color ?? "#1A6B45";

  // ── Channels Query ─────────────────────────────────────────────────────────
  const channelsKey = `/api/core/channels?verticalId=${verticalId}`;
  const { data: allChannels = [] } = useQuery<DBChannel[]>({
    queryKey: [channelsKey],
    enabled: !!verticalId,
  });

  const filteredChannels = useMemo(() =>
    allChannels.filter((c) => c.type !== "dm"), [allChannels]);
  const filteredDMs = useMemo(() =>
    allChannels.filter((c) => c.type === "dm"), [allChannels]);

  const filteredList = useMemo(() => {
    const list = activeTab === "channel" ? filteredChannels : filteredDMs;
    if (!searchQuery) return list;
    return list.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [activeTab, filteredChannels, filteredDMs, searchQuery]);

  // ── Auto-select first channel ──────────────────────────────────────────────
  useEffect(() => {
    if (!activeChannelId && filteredChannels.length > 0) {
      const pinned = filteredChannels.find((c) => c.is_pinned);
      setActiveChannelId(pinned?.id ?? filteredChannels[0].id);
    }
  }, [filteredChannels, activeChannelId]);

  const activeChannel = useMemo(() =>
    allChannels.find((c) => c.id === activeChannelId), [allChannels, activeChannelId]);

  // ── Messages Query ─────────────────────────────────────────────────────────
  const messagesKey = activeChannelId ? `/api/core/channels/${activeChannelId}/messages?limit=100` : null;
  const { data: messages = [], isLoading: msgsLoading } = useQuery<DBMessage[]>({
    queryKey: messagesKey ? [messagesKey] : ["noop"],
    enabled: !!activeChannelId,
  });

  // Map messages by ID for replies
  const messageMap = useMemo(() => {
    const map: Record<string, DBMessage> = {};
    messages.forEach((m) => { map[m.id] = m; });
    return map;
  }, [messages]);

  // ── Realtime subscription ──────────────────────────────────────────────────
  useEffect(() => {
    if (!activeChannelId || !messagesKey) return;

    const sub = supabaseClient
      .channel(`chat:${activeChannelId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "channel_messages",
        filter: `channel_id=eq.${activeChannelId}`,
      }, (payload) => {
        const newMsg = payload.new as DBMessage;
        queryClient.setQueryData([messagesKey], (old: DBMessage[] | undefined) => {
          if (!old) return [newMsg];
          if (old.find((m) => m.id === newMsg.id)) return old;
          return [...old, newMsg];
        });

        // Check if user is scrolled up
        const container = messagesContainerRef.current;
        if (container) {
          const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
          if (distFromBottom > 100 && newMsg.sender_name !== currentUser) {
            setHasNewOutOfView(true);
            setShowJumpToBottom(true);
          }
        }

        // Invalidate channels to update last_message + unread
        queryClient.invalidateQueries({ queryKey: [channelsKey] });
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "channel_messages",
        filter: `channel_id=eq.${activeChannelId}`,
      }, (payload) => {
        const updated = payload.new as DBMessage;
        queryClient.setQueryData([messagesKey], (old: DBMessage[] | undefined) =>
          old ? old.map((m) => m.id === updated.id ? updated : m) : old
        );
      })
      .subscribe();

    realtimeRef.current = sub;
    return () => { supabaseClient.removeChannel(sub); };
  }, [activeChannelId, messagesKey, currentUser, channelsKey]);

  // ── Typing Presence ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeChannelId) return;

    const typingChannel = supabaseClient.channel(`typing:${activeChannelId}`, {
      config: { presence: { key: currentUser } },
    });

    typingChannel
      .on("presence", { event: "sync" }, () => {
        const state = typingChannel.presenceState<{ typing?: boolean }>();
        const others = Object.entries(state)
          .filter(([key, presences]) => {
            const p = Array.isArray(presences) ? presences[0] : presences;
            return key !== currentUser && (p as { typing?: boolean })?.typing;
          })
          .map(([key]) => key);
        setTypingUsers(others);
      })
      .subscribe();

    typingChannelRef.current = typingChannel;
    return () => { supabaseClient.removeChannel(typingChannel); };
  }, [activeChannelId, currentUser]);

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distFromBottom < 150) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShowJumpToBottom(false);
      setHasNewOutOfView(false);
    }
  }, [messages]);

  // Mark as read on channel open
  useEffect(() => {
    if (!activeChannelId || !currentUser) return;
    const lastMsg = messages[messages.length - 1];
    apiRequest("POST", `/api/core/channels/${activeChannelId}/read`, {
      user_name: currentUser,
      last_message_id: lastMsg?.id,
    }).catch(() => null);
    queryClient.setQueryData([channelsKey], (old: DBChannel[] | undefined) =>
      old ? old.map((c) => c.id === activeChannelId ? { ...c, unread_count: 0 } : c) : old
    );
    setShowJumpToBottom(false);
    setHasNewOutOfView(false);
  }, [activeChannelId]);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowJumpToBottom(distFromBottom > 200);
    if (distFromBottom < 50) setHasNewOutOfView(false);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowJumpToBottom(false);
    setHasNewOutOfView(false);
  };

  // ── Mutations ──────────────────────────────────────────────────────────────
  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      apiRequest("POST", `/api/core/channels/${activeChannelId}/messages`, {
        sender_name: currentUser,
        content,
        reply_to_id: replyTo?.id ?? null,
        message_type: "text",
      }),
    onSuccess: async (res) => {
      const newMsg = await res.json();
      if (messagesKey) {
        queryClient.setQueryData([messagesKey], (old: DBMessage[] | undefined) =>
          old ? (old.find((m) => m.id === newMsg.id) ? old : [...old, newMsg]) : [newMsg]
        );
      }
      queryClient.invalidateQueries({ queryKey: [channelsKey] });
      setReplyTo(null);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    },
    onError: () => toast({ title: "Failed to send message", variant: "destructive" }),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      apiRequest("PATCH", `/api/core/channels/${activeChannelId}/messages/${id}`, { content }),
    onSuccess: async (res) => {
      const updated = await res.json();
      if (messagesKey) {
        queryClient.setQueryData([messagesKey], (old: DBMessage[] | undefined) =>
          old ? old.map((m) => m.id === updated.id ? updated : m) : old
        );
      }
      setEditingMsg(null);
      setEditText("");
    },
    onError: () => toast({ title: "Failed to edit message", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/core/channels/${activeChannelId}/messages/${id}`),
    onMutate: async (id) => {
      if (!messagesKey) return;
      await queryClient.cancelQueries({ queryKey: [messagesKey] });
      const previous = queryClient.getQueryData<DBMessage[]>([messagesKey]);
      queryClient.setQueryData([messagesKey], (old: DBMessage[] | undefined) =>
        old ? old.map((m) => m.id === id ? { ...m, is_deleted: true, content: "This message was deleted" } : m) : old
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous && messagesKey) {
        queryClient.setQueryData([messagesKey], context.previous);
      }
      toast({ title: "Failed to delete message", variant: "destructive" });
    },
    onSettled: () => {
      if (messagesKey) queryClient.invalidateQueries({ queryKey: [messagesKey] });
    },
  });

  const reactMutation = useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      apiRequest("POST", `/api/core/channels/${activeChannelId}/messages/${messageId}/react`, {
        emoji,
        user_name: currentUser,
      }),
    onMutate: async ({ messageId, emoji }) => {
      if (!messagesKey) return;
      await queryClient.cancelQueries({ queryKey: [messagesKey] });
      const previous = queryClient.getQueryData<DBMessage[]>([messagesKey]);
      queryClient.setQueryData([messagesKey], (old: DBMessage[] | undefined) =>
        old ? old.map((m) => {
          if (m.id !== messageId) return m;
          const reactions = { ...(m.reactions ?? {}) };
          const users = reactions[emoji] ? [...reactions[emoji]] : [];
          const idx = users.indexOf(currentUser);
          if (idx >= 0) {
            users.splice(idx, 1);
            if (users.length === 0) {
              delete reactions[emoji];
            } else {
              reactions[emoji] = users;
            }
          } else {
            reactions[emoji] = [...users, currentUser];
          }
          return { ...m, reactions };
        }) : old
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous && messagesKey) {
        queryClient.setQueryData([messagesKey], context.previous);
      }
    },
    onSuccess: async (res) => {
      const updated = await res.json();
      if (messagesKey) {
        queryClient.setQueryData([messagesKey], (old: DBMessage[] | undefined) =>
          old ? old.map((m) => m.id === updated.id ? updated : m) : old
        );
      }
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sender_name", currentUser);
      const res = await fetch(`/api/core/channels/${activeChannelId}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: (newMsg) => {
      if (messagesKey) {
        queryClient.setQueryData([messagesKey], (old: DBMessage[] | undefined) =>
          old ? (old.find((m) => m.id === newMsg.id) ? old : [...old, newMsg]) : [newMsg]
        );
      }
      queryClient.invalidateQueries({ queryKey: [channelsKey] });
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    },
    onError: () => toast({ title: "Failed to upload file", variant: "destructive" }),
  });

  const handleFileUpload = useCallback((file: File) => {
    if (!activeChannelId) return;
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 50MB", variant: "destructive" });
      return;
    }
    uploadMutation.mutate(file);
  }, [activeChannelId, uploadMutation, toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    if (dragCounterRef.current === 1) setIsDragOver(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setIsDragOver(false);
  }, []);

  // ── Typing broadcast ───────────────────────────────────────────────────────
  const handleTyping = useCallback(() => {
    if (!typingChannelRef.current) return;
    typingChannelRef.current.track({ typing: true }).catch(() => null);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      typingChannelRef.current?.track({ typing: false }).catch(() => null);
    }, 2000);
  }, []);

  const handleSendMessage = () => {
    const text = messageText.trim();
    if (!text || !activeChannelId) return;
    setMessageText("");
    sendMutation.mutate(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    handleTyping();
  };

  const memberNames = useMemo(() => members.map((m) => m.name), [members]);

  if (loading) return <PageLoading />;
  if (!vertical) return <div>Vertical not found</div>;

  return (
    <TooltipProvider>
    <PageTransition className="px-2 sm:px-6 lg:px-12 py-2 sm:py-4 h-full flex flex-col min-h-0">
      <div className="flex flex-1 rounded-xl border bg-card overflow-hidden min-h-0 shadow-sm">

        {/* ── Mobile sidebar backdrop ──────────────────────────────────── */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
        <aside className={cn(
          "w-[280px] sm:w-64 shrink-0 flex flex-col border-r overflow-hidden bg-card md:bg-muted/20 transition-transform duration-200",
          "fixed inset-y-0 left-0 z-40 md:relative md:z-auto md:translate-x-0",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Header */}
          <div className="p-3 border-b space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 md:hidden"
                  onClick={() => setMobileSidebarOpen(false)}
                  data-testid="btn-close-sidebar"
                  aria-label="Close sidebar"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-sm font-bold">Team Chat</h2>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowUserSwitcher(!showUserSwitcher)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-md px-2 py-1 hover:bg-muted"
                  data-testid="btn-switch-user"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={getPersonAvatar(currentUser)} />
                    <AvatarFallback className="text-[8px]">{currentUser.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-20">{currentUser.split(" ")[0]}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                {showUserSwitcher && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-background border rounded-lg shadow-lg z-50 py-1">
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground px-3 pt-1 pb-2">Switch Account</p>
                    {memberNames.map((name) => (
                      <button
                        key={name}
                        onClick={() => { switchUser(name); setShowUserSwitcher(false); }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted text-left",
                          name === currentUser && "font-semibold"
                        )}
                      >
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={getPersonAvatar(name)} />
                          <AvatarFallback className="text-[8px]">{name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        {name}
                        {name === currentUser && <Check className="h-3 w-3 ml-auto" style={{ color: verticalColor }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-8 h-8 text-xs bg-background border-none focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-chats"
              />
            </div>

            <div className="flex gap-1.5">
              <FilterPill active={activeTab === "channel"} color={verticalColor} onClick={() => setActiveTab("channel")} testId="tab-channels">
                Channels
              </FilterPill>
              <FilterPill active={activeTab === "dm"} color={verticalColor} onClick={() => setActiveTab("dm")} testId="tab-dms">
                DMs
              </FilterPill>
            </div>
          </div>

          {/* Channel/DM List */}
          <ScrollArea className="flex-1">
            <div className="py-1">
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {activeTab === "channel" ? "Channels" : "Direct Messages"}
                </span>
                <button
                  onClick={() => activeTab === "channel" ? setShowCreateChannel(true) : setShowNewDM(true)}
                  className="h-5 w-5 flex items-center justify-center rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  data-testid={activeTab === "channel" ? "btn-add-channel" : "btn-add-dm"}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {filteredList.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                  {searchQuery ? "No results" : activeTab === "channel" ? "No channels yet" : "No DMs yet"}
                </div>
              ) : (
                filteredList.map((channel) => (
                  <ChannelItem
                    key={channel.id}
                    channel={channel}
                    active={channel.id === activeChannelId}
                    verticalColor={verticalColor}
                    verticalId={verticalId}
                    onClick={() => {
                      setActiveChannelId(channel.id);
                      setActiveTab(channel.type === "dm" ? "dm" : "channel");
                      setShowInfo(false);
                      if (window.innerWidth < 768) setMobileSidebarOpen(false);
                    }}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* ── MAIN CHAT AREA ────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {activeChannel ? (
            <>
              {/* Channel Header */}
              <div className="border-b px-3 sm:px-4 py-2.5 flex items-center justify-between shrink-0 bg-background">
                <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 md:hidden"
                    onClick={() => setMobileSidebarOpen(true)}
                    data-testid="btn-open-sidebar"
                    aria-label="Open sidebar"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                  {activeChannel.type === "dm" ? (
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getPersonAvatar(activeChannel.name)} />
                        <AvatarFallback className="text-xs">{activeChannel.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background",
                        getOnlineStatus(activeChannel.name, verticalId) === "online" ? "bg-green-500" :
                        getOnlineStatus(activeChannel.name, verticalId) === "away" ? "bg-yellow-400" : "bg-gray-300"
                      )} />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${verticalColor}20` }}>
                      {activeChannel.type === "announcement" ? (
                        <Megaphone className="h-4 w-4" style={{ color: verticalColor }} />
                      ) : (
                        <Hash className="h-4 w-4" style={{ color: verticalColor }} />
                      )}
                    </div>
                  )}
                  <div className="min-w-0">
                    <button
                      onClick={() => setShowInfo(!showInfo)}
                      className="text-sm font-semibold hover:underline underline-offset-2 truncate block"
                    >
                      {activeChannel.name}
                    </button>
                    <p className="text-xs text-muted-foreground truncate">
                      {activeChannel.type === "dm"
                        ? getOnlineStatus(activeChannel.name, verticalId) === "online" ? "Active now" :
                          getOnlineStatus(activeChannel.name, verticalId) === "away" ? "Away" : "Offline"
                        : activeChannel.description || `${activeChannel.member_names.length} members`
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <div className="flex -space-x-2 mr-2">
                    {activeChannel.member_names.slice(0, 4).map((name) => (
                      <Avatar key={name} className="h-6 w-6 border-2 border-background">
                        <AvatarImage src={getPersonAvatar(name)} />
                        <AvatarFallback className="text-[8px]">{name.substring(0, 1)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {activeChannel.member_names.length > 4 && (
                      <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[9px] font-medium text-muted-foreground">
                        +{activeChannel.member_names.length - 4}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="Voice call">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="Video call">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8", showInfo && "bg-muted")}
                    onClick={() => setShowInfo(!showInfo)}
                    title="Channel info"
                    data-testid="btn-channel-info"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages + Info Panel */}
              <div className="flex flex-1 min-h-0">
                <div
                  className="flex-1 flex flex-col min-h-0 relative"
                  onDrop={handleDrop}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {isDragOver && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-primary/5 border-2 border-dashed border-primary/30 rounded-lg m-2 pointer-events-none">
                      <div className="text-sm font-medium text-primary/70">Drop file to upload</div>
                    </div>
                  )}
                  {/* Messages */}
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto py-4 space-y-0.5"
                    onScroll={handleScroll}
                  >
                    {msgsLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="text-sm text-muted-foreground">Loading messages…</div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-16">
                        <MessageCircle className="h-12 w-12 mb-3 opacity-20" />
                        <p className="text-sm font-medium">Say hello!</p>
                        <p className="text-xs mt-1 opacity-70">Be the first to message in #{activeChannel.name}</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg, idx) => {
                          const prev = messages[idx - 1];
                          const showHeader = idx === 0 || !isSameGroup(prev, msg);
                          const isMe = msg.sender_name === currentUser;
                          const replyToMsg = msg.reply_to_id ? messageMap[msg.reply_to_id] : undefined;

                          return (
                            <div key={msg.id} className={cn("py-0.5", showHeader && idx > 0 && "mt-3")}>
                              <MessageBubble
                                msg={msg}
                                isMe={isMe}
                                showHeader={showHeader}
                                replyToMsg={replyToMsg}
                                verticalColor={verticalColor}
                                currentUser={currentUser}
                                onReply={() => setReplyTo(msg)}
                                onEdit={() => {
                                  setEditingMsg(msg);
                                  setEditText(msg.content);
                                }}
                                onDelete={() => deleteMutation.mutate(msg.id)}
                                onReact={(emoji) => reactMutation.mutate({ messageId: msg.id, emoji })}
                              />
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} className="h-1" />
                      </>
                    )}
                  </div>

                  {/* Jump to bottom */}
                  {showJumpToBottom && (
                    <button
                      onClick={scrollToBottom}
                      className={cn(
                        "absolute bottom-20 right-6 flex items-center gap-1.5 text-xs text-white rounded-full px-3 py-1.5 shadow-lg transition-all",
                        hasNewOutOfView && "animate-bounce"
                      )}
                      style={{ backgroundColor: verticalColor }}
                      data-testid="btn-jump-to-bottom"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                      {hasNewOutOfView ? "New message" : "Jump to bottom"}
                    </button>
                  )}

                  {/* Typing indicator */}
                  {typingUsers.length > 0 && (
                    <div className="px-4 pb-1 flex items-center gap-2">
                      <div className="flex gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: verticalColor, animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: verticalColor, animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: verticalColor, animationDelay: "300ms" }} />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {typingUsers.length === 1
                          ? `${typingUsers[0]} is typing…`
                          : `${typingUsers.slice(0, -1).join(", ")} and ${typingUsers[typingUsers.length - 1]} are typing…`}
                      </span>
                    </div>
                  )}

                  {/* Composer */}
                  <div className="border-t px-4 py-3 shrink-0 bg-background">
                    {/* Reply preview */}
                    {replyTo && (
                      <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-muted/50 border-l-2" style={{ borderColor: verticalColor }}>
                        <Reply className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold">{replyTo.sender_name}: </span>
                          <span className="text-xs text-muted-foreground truncate">{replyTo.content.substring(0, 100)}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0" onClick={() => setReplyTo(null)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}

                    {/* Edit mode */}
                    {editingMsg ? (
                      <div className="flex items-end gap-2">
                        <div className="flex-1 p-2 rounded-lg bg-muted/30 border text-xs text-muted-foreground mb-1">
                          <div className="flex items-center gap-1 mb-1">
                            <Pencil className="h-3 w-3" />
                            <span className="font-medium">Editing message</span>
                          </div>
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="text-sm resize-none border-none bg-transparent p-0 focus-visible:ring-0 min-h-8"
                            rows={2}
                            autoFocus
                            data-testid="input-edit-message"
                          />
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="outline" size="sm" className="h-8" onClick={() => { setEditingMsg(null); setEditText(""); }}>
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="h-8"
                            disabled={!editText.trim() || editMutation.isPending}
                            onClick={() => editMutation.mutate({ id: editingMsg.id, content: editText })}
                            style={{ backgroundColor: verticalColor }}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.mp4,.mp3"
                        data-testid="input-file-upload"
                      />
                      {uploadMutation.isPending && (
                        <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground bg-muted/50 rounded-t-lg border-x border-t">
                          <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Uploading file…
                        </div>
                      )}
                      <div className="flex items-end gap-2">
                        <div className="flex-1 relative">
                          <Textarea
                            placeholder={`Message ${activeChannel.type === "dm" ? activeChannel.name : `#${activeChannel.name}`}`}
                            className="min-h-10 max-h-32 pr-20 resize-none bg-muted/30 border-none focus-visible:ring-1 text-sm leading-relaxed"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            data-testid="input-message"
                          />
                          <div className="absolute right-2 bottom-2 flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                              <Smile className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploadMutation.isPending}
                              data-testid="btn-attach-file"
                              aria-label="Attach file"
                            >
                              {uploadMutation.isPending ? (
                                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Paperclip className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <Button
                          onClick={handleSendMessage}
                          size="icon"
                          className="h-10 w-10 shrink-0 mb-0.5"
                          style={{ backgroundColor: verticalColor }}
                          disabled={!messageText.trim() || sendMutation.isPending}
                          data-testid="btn-send"
                        >
                          <Send className="h-4 w-4 text-white" />
                        </Button>
                      </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Channel Info Panel */}
                {showInfo && activeChannel && (
                  <>
                    <div
                      className="fixed inset-0 bg-black/20 z-30 md:hidden"
                      onClick={() => setShowInfo(false)}
                    />
                    <ChannelInfoPanel
                      channel={activeChannel}
                      verticalId={verticalId}
                      onClose={() => setShowInfo(false)}
                    />
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 mb-4 md:hidden"
                onClick={() => setMobileSidebarOpen(true)}
                data-testid="btn-open-sidebar-empty"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <MessageCircle className="h-14 w-14 mb-4 opacity-15" />
              <p className="text-sm font-medium">Select a conversation</p>
              <p className="text-xs mt-1 opacity-70">Choose a channel or DM to start chatting</p>
            </div>
          )}
        </main>
      </div>

      {/* Dialogs */}
      <CreateChannelDialog
        open={showCreateChannel}
        onClose={() => setShowCreateChannel(false)}
        verticalId={verticalId}
        verticalColor={verticalColor}
        availableMembers={memberNames}
        onCreated={(ch) => setActiveChannelId(ch.id)}
      />
      <NewDMDialog
        open={showNewDM}
        onClose={() => setShowNewDM(false)}
        verticalId={verticalId}
        verticalColor={verticalColor}
        availableMembers={memberNames}
        currentUser={currentUser}
        existingDMs={filteredDMs}
        onCreated={(ch) => { setActiveChannelId(ch.id); setActiveTab("dm"); }}
      />
    </PageTransition>
    </TooltipProvider>
  );
}
