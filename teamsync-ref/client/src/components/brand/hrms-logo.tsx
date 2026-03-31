export function HrmsLogo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="36" height="36" rx="8" fill="#0EA5E9" />
      <circle cx="18" cy="13" r="4" fill="white" opacity="0.95" />
      <ellipse cx="18" cy="23.5" rx="7" ry="4" fill="white" opacity="0.8" />
      <circle cx="10" cy="15" r="2.5" fill="white" opacity="0.6" />
      <circle cx="26" cy="15" r="2.5" fill="white" opacity="0.6" />
      <ellipse cx="10" cy="23" rx="4" ry="2.5" fill="white" opacity="0.45" />
      <ellipse cx="26" cy="23" rx="4" ry="2.5" fill="white" opacity="0.45" />
    </svg>
  );
}
