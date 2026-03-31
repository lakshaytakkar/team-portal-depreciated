import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/layout";
import { PageTransition } from "@/components/ui/animated";
import {
  Search,
  Home,
  User,
  Users,
  Settings,
  Bell,
  Mail,
  Calendar,
  Clock,
  Heart,
  Star,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Minus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Filter,
  Bookmark,
  Link,
  ExternalLink,
  Menu,
  MoreHorizontal,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Share2,
  Send,
  Phone,
  MapPin,
  Globe,
  Image,
  FileText,
  Folder,
  FolderOpen,
  File,
  Paperclip,
  Printer,
  Camera,
  Mic,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Maximize2,
  Minimize2,
  RefreshCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Crosshair,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Grid3X3,
  LayoutDashboard,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Briefcase,
  Building2,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Percent,
  Tag,
  Hash,
  AtSign,
  AlertCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Shield,
  Key,
  LogIn,
  LogOut,
  UserPlus,
  UserMinus,
  UserCheck,
  MessageSquare,
  MessageCircle,
  Inbox,
  Archive,
  Flag,
  Award,
  Gift,
  Zap,
  Sun,
  Moon,
  CloudRain,
  Thermometer,
  Wifi,
  WifiOff,
  Battery,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Cpu,
  HardDrive,
  Database,
  Server,
  Code,
  Terminal,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Layers,
  Package,
  Box,
  Palette,
  Sparkles,
  Wand2,
  Lightbulb,
  Rocket,
  Target,
  Compass,
  Navigation,
  type LucideIcon,
} from "lucide-react";

interface IconEntry {
  name: string;
  icon: LucideIcon;
  category: string;
}

const allIcons: IconEntry[] = [
  { name: "Home", icon: Home, category: "Navigation" },
  { name: "LayoutDashboard", icon: LayoutDashboard, category: "Navigation" },
  { name: "Menu", icon: Menu, category: "Navigation" },
  { name: "Search", icon: Search, category: "Navigation" },
  { name: "Filter", icon: Filter, category: "Navigation" },
  { name: "Bookmark", icon: Bookmark, category: "Navigation" },
  { name: "Link", icon: Link, category: "Navigation" },
  { name: "ExternalLink", icon: ExternalLink, category: "Navigation" },
  { name: "Navigation", icon: Navigation, category: "Navigation" },
  { name: "Compass", icon: Compass, category: "Navigation" },
  { name: "Globe", icon: Globe, category: "Navigation" },
  { name: "MapPin", icon: MapPin, category: "Navigation" },

  { name: "Plus", icon: Plus, category: "Actions" },
  { name: "Minus", icon: Minus, category: "Actions" },
  { name: "X", icon: X, category: "Actions" },
  { name: "Check", icon: Check, category: "Actions" },
  { name: "Edit", icon: Edit, category: "Actions" },
  { name: "Trash2", icon: Trash2, category: "Actions" },
  { name: "Copy", icon: Copy, category: "Actions" },
  { name: "Download", icon: Download, category: "Actions" },
  { name: "Upload", icon: Upload, category: "Actions" },
  { name: "Share2", icon: Share2, category: "Actions" },
  { name: "Send", icon: Send, category: "Actions" },
  { name: "RefreshCw", icon: RefreshCw, category: "Actions" },
  { name: "RotateCcw", icon: RotateCcw, category: "Actions" },
  { name: "Printer", icon: Printer, category: "Actions" },
  { name: "Paperclip", icon: Paperclip, category: "Actions" },
  { name: "MoreHorizontal", icon: MoreHorizontal, category: "Actions" },
  { name: "MoreVertical", icon: MoreVertical, category: "Actions" },

  { name: "User", icon: User, category: "Communication" },
  { name: "Users", icon: Users, category: "Communication" },
  { name: "UserPlus", icon: UserPlus, category: "Communication" },
  { name: "UserMinus", icon: UserMinus, category: "Communication" },
  { name: "UserCheck", icon: UserCheck, category: "Communication" },
  { name: "Bell", icon: Bell, category: "Communication" },
  { name: "Mail", icon: Mail, category: "Communication" },
  { name: "Phone", icon: Phone, category: "Communication" },
  { name: "MessageSquare", icon: MessageSquare, category: "Communication" },
  { name: "MessageCircle", icon: MessageCircle, category: "Communication" },
  { name: "Inbox", icon: Inbox, category: "Communication" },
  { name: "AtSign", icon: AtSign, category: "Communication" },

  { name: "Image", icon: Image, category: "Media" },
  { name: "Camera", icon: Camera, category: "Media" },
  { name: "Mic", icon: Mic, category: "Media" },
  { name: "Volume2", icon: Volume2, category: "Media" },
  { name: "VolumeX", icon: VolumeX, category: "Media" },
  { name: "Play", icon: Play, category: "Media" },
  { name: "Pause", icon: Pause, category: "Media" },
  { name: "SkipForward", icon: SkipForward, category: "Media" },
  { name: "SkipBack", icon: SkipBack, category: "Media" },

  { name: "File", icon: File, category: "Files" },
  { name: "FileText", icon: FileText, category: "Files" },
  { name: "Folder", icon: Folder, category: "Files" },
  { name: "FolderOpen", icon: FolderOpen, category: "Files" },
  { name: "Archive", icon: Archive, category: "Files" },
  { name: "Package", icon: Package, category: "Files" },
  { name: "Box", icon: Box, category: "Files" },

  { name: "ArrowUp", icon: ArrowUp, category: "Arrows" },
  { name: "ArrowDown", icon: ArrowDown, category: "Arrows" },
  { name: "ArrowLeft", icon: ArrowLeft, category: "Arrows" },
  { name: "ArrowRight", icon: ArrowRight, category: "Arrows" },
  { name: "ChevronUp", icon: ChevronUp, category: "Arrows" },
  { name: "ChevronDown", icon: ChevronDown, category: "Arrows" },
  { name: "ChevronLeft", icon: ChevronLeft, category: "Arrows" },
  { name: "ChevronRight", icon: ChevronRight, category: "Arrows" },
  { name: "Maximize2", icon: Maximize2, category: "Arrows" },
  { name: "Minimize2", icon: Minimize2, category: "Arrows" },
  { name: "ZoomIn", icon: ZoomIn, category: "Arrows" },
  { name: "ZoomOut", icon: ZoomOut, category: "Arrows" },
  { name: "Move", icon: Move, category: "Arrows" },
  { name: "Crosshair", icon: Crosshair, category: "Arrows" },

  { name: "Eye", icon: Eye, category: "Interface" },
  { name: "EyeOff", icon: EyeOff, category: "Interface" },
  { name: "Lock", icon: Lock, category: "Interface" },
  { name: "Unlock", icon: Unlock, category: "Interface" },
  { name: "Heart", icon: Heart, category: "Interface" },
  { name: "Star", icon: Star, category: "Interface" },
  { name: "Flag", icon: Flag, category: "Interface" },
  { name: "Tag", icon: Tag, category: "Interface" },
  { name: "Hash", icon: Hash, category: "Interface" },
  { name: "Settings", icon: Settings, category: "Interface" },
  { name: "Calendar", icon: Calendar, category: "Interface" },
  { name: "Clock", icon: Clock, category: "Interface" },
  { name: "Grid3X3", icon: Grid3X3, category: "Interface" },
  { name: "List", icon: List, category: "Interface" },
  { name: "Layers", icon: Layers, category: "Interface" },

  { name: "AlertCircle", icon: AlertCircle, category: "Status" },
  { name: "AlertTriangle", icon: AlertTriangle, category: "Status" },
  { name: "Info", icon: Info, category: "Status" },
  { name: "HelpCircle", icon: HelpCircle, category: "Status" },
  { name: "CheckCircle2", icon: CheckCircle2, category: "Status" },
  { name: "XCircle", icon: XCircle, category: "Status" },
  { name: "Shield", icon: Shield, category: "Status" },
  { name: "Key", icon: Key, category: "Status" },
  { name: "Zap", icon: Zap, category: "Status" },
  { name: "Activity", icon: Activity, category: "Status" },

  { name: "BarChart3", icon: BarChart3, category: "Data" },
  { name: "PieChart", icon: PieChart, category: "Data" },
  { name: "TrendingUp", icon: TrendingUp, category: "Data" },
  { name: "TrendingDown", icon: TrendingDown, category: "Data" },
  { name: "DollarSign", icon: DollarSign, category: "Data" },
  { name: "CreditCard", icon: CreditCard, category: "Data" },
  { name: "Percent", icon: Percent, category: "Data" },
  { name: "ShoppingCart", icon: ShoppingCart, category: "Data" },

  { name: "Briefcase", icon: Briefcase, category: "Business" },
  { name: "Building2", icon: Building2, category: "Business" },
  { name: "Award", icon: Award, category: "Business" },
  { name: "Gift", icon: Gift, category: "Business" },
  { name: "Target", icon: Target, category: "Business" },
  { name: "Rocket", icon: Rocket, category: "Business" },
  { name: "Lightbulb", icon: Lightbulb, category: "Business" },
  { name: "Sparkles", icon: Sparkles, category: "Business" },

  { name: "Type", icon: Type, category: "Text" },
  { name: "Bold", icon: Bold, category: "Text" },
  { name: "Italic", icon: Italic, category: "Text" },
  { name: "Underline", icon: Underline, category: "Text" },
  { name: "AlignLeft", icon: AlignLeft, category: "Text" },
  { name: "AlignCenter", icon: AlignCenter, category: "Text" },
  { name: "AlignRight", icon: AlignRight, category: "Text" },

  { name: "Monitor", icon: Monitor, category: "Devices" },
  { name: "Smartphone", icon: Smartphone, category: "Devices" },
  { name: "Tablet", icon: Tablet, category: "Devices" },
  { name: "Laptop", icon: Laptop, category: "Devices" },
  { name: "Cpu", icon: Cpu, category: "Devices" },
  { name: "HardDrive", icon: HardDrive, category: "Devices" },
  { name: "Database", icon: Database, category: "Devices" },
  { name: "Server", icon: Server, category: "Devices" },
  { name: "Wifi", icon: Wifi, category: "Devices" },
  { name: "WifiOff", icon: WifiOff, category: "Devices" },
  { name: "Battery", icon: Battery, category: "Devices" },

  { name: "Sun", icon: Sun, category: "Misc" },
  { name: "Moon", icon: Moon, category: "Misc" },
  { name: "CloudRain", icon: CloudRain, category: "Misc" },
  { name: "Thermometer", icon: Thermometer, category: "Misc" },
  { name: "Palette", icon: Palette, category: "Misc" },
  { name: "Wand2", icon: Wand2, category: "Misc" },
  { name: "Code", icon: Code, category: "Misc" },
  { name: "Terminal", icon: Terminal, category: "Misc" },
  { name: "GitBranch", icon: GitBranch, category: "Misc" },
  { name: "GitCommit", icon: GitCommit, category: "Misc" },
  { name: "GitPullRequest", icon: GitPullRequest, category: "Misc" },
  { name: "LogIn", icon: LogIn, category: "Misc" },
  { name: "LogOut", icon: LogOut, category: "Misc" },
];

const categories = Array.from(new Set(allIcons.map((i) => i.category)));

export function IconsGuideContent() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return allIcons;
    const q = search.toLowerCase();
    return allIcons.filter(
      (i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
    );
  }, [search]);

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, IconEntry[]> = {};
    for (const cat of categories) {
      const items = filtered.filter((i) => i.category === cat);
      if (items.length > 0) groups[cat] = items;
    }
    return groups;
  }, [filtered]);

  return (
    <div>
      <div className="mb-8 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-icon-search"
          />
        </div>
      </div>

      <div className="flex flex-col gap-10">
        {Object.entries(groupedByCategory).map(([category, icons]) => (
          <div key={category}>
            <div className="mb-4 flex items-center gap-3">
              <p className="text-sm font-semibold text-[#121A26]">{category}</p>
              <span className="text-xs text-muted-foreground">{icons.length}</span>
            </div>
            <div className="grid grid-cols-6 gap-3 sm:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
              {icons.map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col items-center gap-2 rounded-lg border border-[#E2E6F3] bg-white p-3 transition-shadow hover:shadow-[0px_1px_2px_rgba(21,30,58,0.06)]"
                  title={item.name}
                  data-testid={`icon-${item.name}`}
                >
                  <item.icon className="size-5 text-[#36394A]" />
                  <span className="w-full truncate text-center text-[10px] text-muted-foreground">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(groupedByCategory).length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No icons match "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IconsGuide() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return allIcons;
    const q = search.toLowerCase();
    return allIcons.filter(
      (i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
    );
  }, [search]);

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, IconEntry[]> = {};
    for (const cat of categories) {
      const items = filtered.filter((i) => i.category === cat);
      if (items.length > 0) groups[cat] = items;
    }
    return groups;
  }, [filtered]);

  return (
    <PageShell data-testid="page-icons-guide">
        <PageTransition>
          <div className="mb-8 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-icon-search"
              />
            </div>
          </div>

          <div className="flex flex-col gap-10">
            {Object.entries(groupedByCategory).map(([category, icons]) => (
              <div key={category}>
                <div className="mb-4 flex items-center gap-3">
                  <p className="text-sm font-semibold text-[#121A26]">{category}</p>
                  <span className="text-xs text-muted-foreground">{icons.length}</span>
                </div>
                <div className="grid grid-cols-6 gap-3 sm:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
                  {icons.map((item) => (
                    <div
                      key={item.name}
                      className="flex flex-col items-center gap-2 rounded-lg border border-[#E2E6F3] bg-white p-3 transition-shadow hover:shadow-[0px_1px_2px_rgba(21,30,58,0.06)]"
                      title={item.name}
                      data-testid={`icon-${item.name}`}
                    >
                      <item.icon className="size-5 text-[#36394A]" />
                      <span className="w-full truncate text-center text-[10px] text-muted-foreground">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(groupedByCategory).length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No icons match "{search}"</p>
              </div>
            )}
          </div>
        </PageTransition>
    </PageShell>
  );
}
