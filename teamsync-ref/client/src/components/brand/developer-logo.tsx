interface DeveloperLogoProps {
  size?: number;
  className?: string;
}

export function DeveloperLogo({ size = 48, className }: DeveloperLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      data-testid="developer-logo"
    >
      <path
        d="M88 19Q100 12 112 19L164 49Q176 56 176 70L176 130Q176 144 164 151L112 181Q100 188 88 181L36 151Q24 144 24 130L24 70Q24 56 36 49Z"
        fill="#10B981"
      />
      <path
        d="M88 19Q100 12 112 19L164 49Q176 56 176 70L100 108L24 70Q24 56 36 49Z"
        fill="#34D399"
      />
      <polyline
        points="65,95 85,115 65,135"
        stroke="white"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <line x1="95" y1="135" x2="135" y2="135" stroke="white" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
