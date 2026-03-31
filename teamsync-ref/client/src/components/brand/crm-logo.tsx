export function CrmLogo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="crmGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="8" fill="url(#crmGrad)" />
      <circle cx="13" cy="13" r="4.5" fill="white" opacity="0.9" />
      <path d="M6 26c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <path d="M22 11h8M22 15h6M22 19h7" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      <circle cx="28" cy="26" r="4" fill="white" opacity="0.2" stroke="white" strokeWidth="1.5" />
      <path d="M26.5 26l1.2 1.2 2.3-2.3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
