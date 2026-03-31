export function OmsLogo({ size = 28, className }: { size?: number; className?: string }) {
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
        <linearGradient id="omsGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0E7490" />
          <stop offset="50%" stopColor="#0891B2" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#omsGrad)" />
      <text
        x="20"
        y="26"
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontWeight="700"
        fontFamily="'Plus Jakarta Sans', sans-serif"
        letterSpacing="-0.5"
      >
        OMS
      </text>
    </svg>
  );
}
