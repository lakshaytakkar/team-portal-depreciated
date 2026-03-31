import { type ReactNode, useState } from "react";
import { Search, Star, Paperclip, Trash2, Archive, MailOpen, Mail, Reply, Forward, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface InboxItem {
  id: string;
  sender: string;
  senderAvatar?: string;
  subject: string;
  preview: string;
  timestamp: string;
  isRead?: boolean;
  isStarred?: boolean;
  labels?: Array<{ label: string; color?: string }>;
  attachmentCount?: number;
}

interface InboxListProps {
  items: InboxItem[];
  selectedId?: string;
  onItemClick?: (item: InboxItem) => void;
  onStarToggle?: (item: InboxItem) => void;
  emptyMessage?: string;
  className?: string;
}

export function InboxList({
  items,
  selectedId,
  onItemClick,
  onStarToggle,
  emptyMessage = "Your inbox is empty",
  className,
}: InboxListProps) {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground" data-testid="inbox-list-empty">
        <Mail className="h-8 w-8 mx-auto mb-2 opacity-40" />
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("divide-y", className)} data-testid="inbox-list">
      {items.map((item) => {
        const initials = item.sender.slice(0, 2).toUpperCase();
        return (
          <div
            key={item.id}
            className={cn(
              "flex items-start gap-3 py-3 px-3 cursor-pointer hover-elevate",
              !item.isRead && "bg-accent/30",
              selectedId === item.id && "bg-accent/50"
            )}
            onClick={() => onItemClick?.(item)}
            data-testid={`inbox-item-${item.id}`}
          >
            <Avatar className="h-9 w-9 shrink-0 mt-0.5">
              {item.senderAvatar && <AvatarImage src={item.senderAvatar} alt={item.sender} />}
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span
                  className={cn("text-sm truncate", !item.isRead ? "font-semibold" : "font-medium")}
                  data-testid={`inbox-item-sender-${item.id}`}
                >
                  {item.sender}
                </span>
                <span className="text-xs text-muted-foreground shrink-0" data-testid={`inbox-item-time-${item.id}`}>
                  {item.timestamp}
                </span>
              </div>

              <p
                className={cn("text-sm truncate", !item.isRead ? "font-medium" : "text-muted-foreground")}
                data-testid={`inbox-item-subject-${item.id}`}
              >
                {item.subject}
              </p>

              <p className="text-xs text-muted-foreground truncate mt-0.5" data-testid={`inbox-item-preview-${item.id}`}>
                {item.preview}
              </p>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {item.labels?.map((lbl) => (
                  <Badge
                    key={lbl.label}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                    style={lbl.color ? { backgroundColor: lbl.color, color: "#fff" } : undefined}
                    data-testid={`inbox-item-label-${item.id}-${lbl.label}`}
                  >
                    {lbl.label}
                  </Badge>
                ))}
                {item.attachmentCount != null && item.attachmentCount > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground" data-testid={`inbox-item-attachments-${item.id}`}>
                    <Paperclip className="h-3 w-3" />
                    {item.attachmentCount}
                  </span>
                )}
              </div>
            </div>

            <button
              className={cn(
                "shrink-0 mt-0.5 p-0.5 rounded-md",
                item.isStarred ? "text-yellow-500" : "text-muted-foreground/40"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onStarToggle?.(item);
              }}
              data-testid={`inbox-item-star-${item.id}`}
            >
              <Star className={cn("h-4 w-4", item.isStarred && "fill-current")} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

type InboxFilter = "all" | "unread" | "starred";

interface InboxToolbarProps {
  filter?: InboxFilter;
  onFilterChange?: (filter: InboxFilter) => void;
  onSearch?: (query: string) => void;
  onBulkArchive?: () => void;
  onBulkDelete?: () => void;
  onBulkMarkRead?: () => void;
  className?: string;
}

export function InboxToolbar({
  filter = "all",
  onFilterChange,
  onSearch,
  onBulkArchive,
  onBulkDelete,
  onBulkMarkRead,
  className,
}: InboxToolbarProps) {
  const [searchValue, setSearchValue] = useState("");

  const filters: Array<{ value: InboxFilter; label: string }> = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
    { value: "starred", label: "Starred" },
  ];

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)} data-testid="inbox-toolbar">
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          className="pl-8"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            onSearch?.(e.target.value);
          }}
          data-testid="inbox-toolbar-search"
        />
      </div>

      <div className="flex items-center gap-1" data-testid="inbox-toolbar-filters">
        {filters.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onFilterChange?.(f.value)}
            className="toggle-elevate"
            data-testid={`inbox-toolbar-filter-${f.value}`}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-1" data-testid="inbox-toolbar-actions">
        {onBulkMarkRead && (
          <Button size="icon" variant="ghost" onClick={onBulkMarkRead} data-testid="inbox-toolbar-mark-read">
            <MailOpen className="h-4 w-4" />
          </Button>
        )}
        {onBulkArchive && (
          <Button size="icon" variant="ghost" onClick={onBulkArchive} data-testid="inbox-toolbar-archive">
            <Archive className="h-4 w-4" />
          </Button>
        )}
        {onBulkDelete && (
          <Button size="icon" variant="ghost" onClick={onBulkDelete} data-testid="inbox-toolbar-delete">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export interface ThreadMessage {
  id: string;
  sender: string;
  senderAvatar?: string;
  timestamp: string;
  body: ReactNode;
  isCurrentUser?: boolean;
}

interface MessageThreadProps {
  subject: string;
  messages: ThreadMessage[];
  onReply?: (text: string) => void;
  onForward?: () => void;
  className?: string;
}

export function MessageThread({
  subject,
  messages,
  onReply,
  onForward,
  className,
}: MessageThreadProps) {
  const [replyText, setReplyText] = useState("");

  return (
    <div className={cn("flex flex-col", className)} data-testid="message-thread">
      <div className="flex items-center justify-between gap-2 pb-3 border-b flex-wrap">
        <h2 className="text-lg font-semibold" data-testid="message-thread-subject">{subject}</h2>
        <div className="flex items-center gap-1">
          {onForward && (
            <Button size="icon" variant="ghost" onClick={onForward} data-testid="message-thread-forward">
              <Forward className="h-4 w-4" />
            </Button>
          )}
          <Button size="icon" variant="ghost" data-testid="message-thread-more">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-4" data-testid="message-thread-messages">
        {messages.map((msg) => {
          const initials = msg.sender.slice(0, 2).toUpperCase();
          return (
            <div
              key={msg.id}
              className={cn("flex gap-3", msg.isCurrentUser && "flex-row-reverse")}
              data-testid={`message-thread-msg-${msg.id}`}
            >
              <Avatar className="h-8 w-8 shrink-0 mt-1">
                {msg.senderAvatar && <AvatarImage src={msg.senderAvatar} alt={msg.sender} />}
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>

              <div className={cn("max-w-[80%] min-w-0", msg.isCurrentUser && "text-right")}>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-medium" data-testid={`message-thread-msg-sender-${msg.id}`}>
                    {msg.sender}
                  </span>
                  <span className="text-xs text-muted-foreground" data-testid={`message-thread-msg-time-${msg.id}`}>
                    {msg.timestamp}
                  </span>
                </div>
                <div
                  className={cn(
                    "text-sm rounded-lg p-3",
                    msg.isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}
                  data-testid={`message-thread-msg-body-${msg.id}`}
                >
                  {msg.body}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {onReply && (
        <div className="border-t pt-3 flex items-start gap-2" data-testid="message-thread-reply">
          <Input
            placeholder="Type your reply..."
            className="flex-1"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && replyText.trim()) {
                onReply(replyText.trim());
                setReplyText("");
              }
            }}
            data-testid="message-thread-reply-input"
          />
          <Button
            size="sm"
            onClick={() => {
              if (replyText.trim()) {
                onReply(replyText.trim());
                setReplyText("");
              }
            }}
            data-testid="message-thread-reply-send"
          >
            <Reply className="h-4 w-4 mr-1" />
            Reply
          </Button>
        </div>
      )}
    </div>
  );
}
