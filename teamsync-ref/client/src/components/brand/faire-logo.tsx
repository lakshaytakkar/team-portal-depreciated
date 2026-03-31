interface FaireLogoProps {
  size?: number;
  className?: string;
}

export function FaireLogo({ size = 36, className }: FaireLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="36" height="36" rx="8" fill="#1A6B45" />
      <text
        x="18"
        y="25"
        textAnchor="middle"
        fill="white"
        fontSize="20"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        F
      </text>
      <circle cx="27" cy="10" r="4" fill="#4ADE80" />
      <circle cx="27" cy="10" r="2" fill="#1A6B45" />
    </svg>
  );
}
