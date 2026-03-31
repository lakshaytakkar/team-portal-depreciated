import { TeamSyncMascot } from "./teamsync-mascot";

interface TeamSyncLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  darkText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: 36, text: "text-lg", gap: "gap-2.5" },
  md: { icon: 48, text: "text-xl", gap: "gap-3" },
  lg: { icon: 56, text: "text-3xl", gap: "gap-3.5" },
  xl: { icon: 80, text: "text-4xl", gap: "gap-4" },
};

export function TeamSyncLogo({
  size = "md",
  showText = true,
  darkText = true,
  className,
}: TeamSyncLogoProps) {
  const s = sizeMap[size];

  return (
    <div className={`flex items-center ${s.gap} ${className ?? ""}`} data-testid="teamsync-logo">
      <TeamSyncMascot size={s.icon} />
      {showText && (
        <span
          className={`font-heading font-bold tracking-tight ${s.text} ${
            darkText ? "text-foreground" : "text-white"
          }`}
        >
          TeamSync
        </span>
      )}
    </div>
  );
}
