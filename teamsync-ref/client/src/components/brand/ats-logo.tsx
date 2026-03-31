export function AtsLogo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="36" height="36" rx="8" fill="#8B5CF6" />
      <rect x="8" y="8" width="13" height="16" rx="2" fill="white" opacity="0.9" />
      <rect x="10" y="11" width="7" height="1.5" rx="0.75" fill="#8B5CF6" opacity="0.5" />
      <rect x="10" y="14" width="9" height="1.5" rx="0.75" fill="#8B5CF6" opacity="0.5" />
      <rect x="10" y="17" width="6" height="1.5" rx="0.75" fill="#8B5CF6" opacity="0.5" />
      <circle cx="25" cy="22" r="5" fill="white" opacity="0.2" stroke="white" strokeWidth="1.5" />
      <circle cx="25" cy="22" r="3" fill="white" opacity="0.6" />
      <line x1="28.5" y1="25.5" x2="31" y2="28" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
