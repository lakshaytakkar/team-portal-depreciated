export function SocialLogo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="36" height="36" rx="8" fill="#0D9488" />
      <rect x="7" y="20" width="4" height="9" rx="1.5" fill="white" opacity="0.6" />
      <rect x="13" y="15" width="4" height="14" rx="1.5" fill="white" opacity="0.8" />
      <rect x="19" y="11" width="4" height="18" rx="1.5" fill="white" />
      <rect x="25" y="7" width="4" height="22" rx="1.5" fill="white" opacity="0.9" />
      <rect x="6" y="5" width="12" height="8" rx="2" fill="white" opacity="0.15" />
      <path d="M9 7.5h6M9 10h4" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M17 10.5l2-1.5" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}
