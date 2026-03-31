interface EazyToSellLogoProps {
  size?: number;
  className?: string;
}

export function EazyToSellLogo({ size = 48, className }: EazyToSellLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      data-testid="eazytosell-logo"
    >
      <path
        d="M88 19Q100 12 112 19L164 49Q176 56 176 70L176 130Q176 144 164 151L112 181Q100 188 88 181L36 151Q24 144 24 130L24 70Q24 56 36 49Z"
        fill="#F97316"
      />
      <path
        d="M88 19Q100 12 112 19L164 49Q176 56 176 70L100 108L24 70Q24 56 36 49Z"
        fill="#FB923C"
      />
      <path
        d="M72 85L128 85L128 145C128 148 126 150 123 150L77 150C74 150 72 148 72 145Z"
        fill="white"
        opacity="0.95"
      />
      <path
        d="M78 85L78 78C78 66 88 56 100 56C112 56 122 66 122 78L122 85"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="100" cy="118" r="8" fill="#F97316" />
      <line x1="100" y1="118" x2="100" y2="130" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
