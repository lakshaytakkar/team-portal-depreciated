import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Wand2,
  Download,
  Trash2,
  Image as ImageIcon,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Maximize2,
  LayoutGrid,
  RefreshCw,
} from "lucide-react";
import { useLocation } from "wouter";
import { PageHeader, PageShell } from "@/components/layout";
import { detectVerticalFromUrl } from "@/lib/verticals-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Fade } from "@/components/ui/animated";

interface GeneratedImage {
  id: string;
  prompt: string;
  negative_prompt: string | null;
  style: string;
  aspect_ratio: string;
  image_data: string | null;
  image_url: string | null;
  width: number | null;
  height: number | null;
  status: "pending" | "completed" | "failed";
  vertical_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

const STYLES = [
  { value: "auto", label: "Auto" },
  { value: "photorealistic", label: "Photorealistic" },
  { value: "digital-art", label: "Digital Art" },
  { value: "illustration", label: "Illustration" },
  { value: "3d-render", label: "3D Render" },
  { value: "anime", label: "Anime" },
  { value: "watercolor", label: "Watercolor" },
  { value: "oil-painting", label: "Oil Painting" },
  { value: "pixel-art", label: "Pixel Art" },
  { value: "minimalist", label: "Minimalist" },
];

const ASPECT_RATIOS = [
  { value: "1:1", label: "1:1 Square" },
  { value: "16:9", label: "16:9 Landscape" },
  { value: "9:16", label: "9:16 Portrait" },
  { value: "4:3", label: "4:3 Standard" },
  { value: "3:4", label: "3:4 Portrait" },
];

const QUICK_PROMPTS = [
  "Modern abstract gradient background",
  "Professional team collaboration",
  "Futuristic technology dashboard",
  "Nature landscape at sunset",
  "Minimalist logo concept",
  "Product mockup on clean surface",
];

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function ImagePreviewModal({
  image,
  images,
  onClose,
  onNavigate,
  onDelete,
}: {
  image: GeneratedImage;
  images: GeneratedImage[];
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
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
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
      aria-label="Image preview"
    >
      <div className="relative w-full max-w-5xl max-h-[90vh] mx-4 flex flex-col md:flex-row gap-4 bg-background rounded-2xl overflow-hidden shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          aria-label="Close preview"
          data-testid="close-image-preview"
        >
          <X className="size-5" />
        </button>

        <div className="flex-1 min-h-0 flex items-center justify-center bg-black/20 relative p-4">
          {currentIndex > 0 && (
            <button
              onClick={() => onNavigate(images[currentIndex - 1].id)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              aria-label="Previous image"
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
              aria-label="Next image"
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
              <Badge variant="outline">{image.width}×{image.height}</Badge>
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

export default function ImageStudio() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [style, setStyle] = useState("auto");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "completed" | "pending" | "failed">("all");
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [location] = useLocation();
  const currentVertical = detectVerticalFromUrl(location);

  const { data: images = [], isLoading } = useQuery<GeneratedImage[]>({
    queryKey: ["/api/images"],
    refetchInterval: (query) => {
      const data = query.state.data as GeneratedImage[] | undefined;
      const hasPending = data?.some((img) => img.status === "pending");
      return hasPending ? 3000 : false;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: { prompt: string; negativePrompt?: string; style: string; aspectRatio: string; verticalId?: string }) => {
      const res = await fetch("/api/images/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Generation failed");
      return res.json() as Promise<GeneratedImage>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/images"] });
      setPrompt("");
      setNegativePrompt("");
      toast({ title: "Image generation started", description: "Your image is being generated. This may take a moment." });
    },
    onError: () => {
      toast({ title: "Generation failed", description: "Could not start image generation.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/images/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["/api/images"] });
      const previous = queryClient.getQueryData<GeneratedImage[]>(["/api/images"]);
      queryClient.setQueryData<GeneratedImage[]>(["/api/images"], (old) =>
        old ? old.filter((img) => img.id !== id) : []
      );
      return { previous };
    },
    onSuccess: () => {
      toast({ title: "Image deleted" });
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["/api/images"], context.previous);
      }
      toast({ title: "Delete failed", description: "Could not delete the image.", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/images"] });
    },
  });

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) return;
    const finalPrompt = style !== "auto" ? `${prompt.trim()}, ${style} style` : prompt.trim();
    generateMutation.mutate({
      prompt: finalPrompt,
      negativePrompt: negativePrompt.trim() || undefined,
      style,
      aspectRatio,
      verticalId: currentVertical?.id,
    });
  }, [prompt, negativePrompt, style, aspectRatio, generateMutation, currentVertical]);

  const handleQuickPrompt = useCallback((text: string) => {
    setPrompt(text);
    promptRef.current?.focus();
  }, []);

  const filteredImages = images.filter((img) => filter === "all" || img.status === filter);

  const previewImage = previewId ? images.find((i) => i.id === previewId) : null;
  const completedImages = images.filter((i) => i.status === "completed");

  return (
    <PageShell>
      <Fade>
        <PageHeader
          title="Image Studio"
          subtitle="Generate, preview, and manage AI-created images"
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-6 mt-6">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Wand2 className="size-5 text-primary" />
                  <h2 className="font-semibold text-sm">Generate Image</h2>
                </div>

                <Textarea
                  ref={promptRef}
                  placeholder="Describe the image you want to create..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[80px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
                  }}
                  data-testid="image-prompt-input"
                />

                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((qp) => (
                    <button
                      key={qp}
                      type="button"
                      onClick={() => handleQuickPrompt(qp)}
                      className="text-[11px] px-2.5 py-1 rounded-full border border-border/60 bg-muted/30 hover:bg-primary/5 hover:border-primary/30 transition-colors text-foreground/70"
                      data-testid={`quick-prompt-${qp.slice(0, 15).replace(/\s+/g, "-").toLowerCase()}`}
                    >
                      {qp}
                    </button>
                  ))}
                </div>

                <Input
                  placeholder="Negative prompt (optional) — what to avoid..."
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  className="text-sm"
                  data-testid="negative-prompt-input"
                />

                <div className="flex flex-wrap gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-medium">Style</label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className="w-[150px] h-9 text-sm" data-testid="style-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STYLES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-medium">Aspect Ratio</label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger className="w-[160px] h-9 text-sm" data-testid="aspect-ratio-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASPECT_RATIOS.map((ar) => (
                          <SelectItem key={ar.value} value={ar.value}>{ar.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || generateMutation.isPending}
                    className="gap-2"
                    data-testid="generate-button"
                  >
                    {generateMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    Generate
                  </Button>
                  <span className="text-xs text-muted-foreground">Ctrl+Enter to generate</span>
                </div>
              </CardContent>
            </Card>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="size-4 text-muted-foreground" />
                  <h2 className="font-semibold text-sm">Library</h2>
                  <Badge variant="secondary" className="text-[10px]">{images.length}</Badge>
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
                      data-testid={`filter-${f}`}
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredImages.map((img) => (
                    <ImageCard
                      key={img.id}
                      image={img}
                      onPreview={() => setPreviewId(img.id)}
                      onDelete={() => deleteMutation.mutate(img.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  Generation Stats
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Generated</span>
                    <span className="font-medium">{images.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium text-emerald-600">{images.filter(i => i.status === "completed").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending</span>
                    <span className="font-medium text-amber-600">{images.filter(i => i.status === "pending").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Failed</span>
                    <span className="font-medium text-red-500">{images.filter(i => i.status === "failed").length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {completedImages.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-3">Recent Creations</h3>
                  <div className="space-y-2">
                    {completedImages.slice(0, 5).map((img) => (
                      <button
                        key={img.id}
                        onClick={() => setPreviewId(img.id)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                        data-testid={`recent-image-${img.id}`}
                      >
                        {img.image_data || img.image_url ? (
                          <img
                            src={(img.image_data || img.image_url)!}
                            alt=""
                            className="size-10 rounded object-cover shrink-0"
                          />
                        ) : (
                          <div className="size-10 rounded bg-muted flex items-center justify-center shrink-0">
                            <ImageIcon className="size-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{img.prompt.slice(0, 50)}</p>
                          <p className="text-[10px] text-muted-foreground">{formatRelativeTime(img.created_at)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-2">Tips</h3>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex gap-1.5"><span className="text-primary">•</span> Be specific and descriptive with prompts</li>
                  <li className="flex gap-1.5"><span className="text-primary">•</span> Use negative prompts to avoid unwanted elements</li>
                  <li className="flex gap-1.5"><span className="text-primary">•</span> Try different styles for varied results</li>
                  <li className="flex gap-1.5"><span className="text-primary">•</span> Press Ctrl+Enter to generate quickly</li>
                </ul>
              </CardContent>
            </Card>
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
      </Fade>
    </PageShell>
  );
}

function ImageCard({
  image,
  onPreview,
  onDelete,
}: {
  image: GeneratedImage;
  onPreview: () => void;
  onDelete: () => void;
}) {
  const imgSrc = image.image_data || image.image_url;

  return (
    <Card className="group overflow-hidden cursor-pointer" data-testid={`image-card-${image.id}`}>
      <div
        className="relative aspect-square bg-muted/30 overflow-hidden"
        onClick={image.status === "completed" ? onPreview : undefined}
      >
        {image.status === "completed" && imgSrc ? (
          <>
            <img
              src={imgSrc}
              alt={image.prompt}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <Button size="icon" variant="secondary" className="size-8 rounded-full" data-testid={`preview-btn-${image.id}`}>
                  <Maximize2 className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="size-8 rounded-full"
                  asChild
                  data-testid={`download-btn-${image.id}`}
                >
                  <a href={`/api/images/${image.id}/download`} download onClick={(e) => e.stopPropagation()}>
                    <Download className="size-4" />
                  </a>
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  className="size-8 rounded-full"
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  data-testid={`delete-btn-${image.id}`}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          </>
        ) : image.status === "pending" ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <RefreshCw className="size-6 animate-spin text-primary/50" />
            <span className="text-[10px] text-muted-foreground">Generating...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-3">
            <AlertCircle className="size-6 text-red-400" />
            <span className="text-[10px] text-red-400 text-center line-clamp-2">{image.error_message || "Failed"}</span>
            <Button
              size="icon"
              variant="ghost"
              className="size-6"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              data-testid={`delete-failed-${image.id}`}
            >
              <Trash2 className="size-3 text-muted-foreground" />
            </Button>
          </div>
        )}
      </div>
      <CardContent className="p-2.5">
        <p className="text-[11px] text-foreground/80 line-clamp-2 leading-snug">{image.prompt}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Badge variant={image.status === "completed" ? "default" : image.status === "pending" ? "secondary" : "destructive"} className="text-[9px] h-4 px-1.5">
            {image.status}
          </Badge>
          <span className="text-[10px] text-muted-foreground">{image.aspect_ratio}</span>
        </div>
      </CardContent>
    </Card>
  );
}
