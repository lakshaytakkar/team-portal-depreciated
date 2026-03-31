export function SupransLogo({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="supransGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4338CA" />
          <stop offset="50%" stopColor="#3730A3" />
          <stop offset="100%" stopColor="#312E81" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#supransGrad)" />
      <text
        x="20"
        y="27"
        textAnchor="middle"
        fill="white"
        fontSize="18"
        fontWeight="800"
        fontFamily="'Plus Jakarta Sans', sans-serif"
        letterSpacing="-1"
      >
        S
      </text>
    </svg>
  );
}
