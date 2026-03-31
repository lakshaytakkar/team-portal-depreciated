interface RndLogoProps {
  size?: number;
  className?: string;
}

export function RndLogo({ size = 48, className }: RndLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      data-testid="rnd-logo"
    >
      <path
        d="M88 19Q100 12 112 19L164 49Q176 56 176 70L176 130Q176 144 164 151L112 181Q100 188 88 181L36 151Q24 144 24 130L24 70Q24 56 36 49Z"
        fill="#6366F1"
      />
      <path
        d="M88 19Q100 12 112 19L164 49Q176 56 176 70L100 108L24 70Q24 56 36 49Z"
        fill="#818CF8"
      />
      <circle cx="100" cy="105" r="22" stroke="white" strokeWidth="6" fill="none" />
      <line x1="100" y1="83" x2="100" y2="65" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <circle cx="100" cy="60" r="5" fill="white" />
      <line x1="116" y1="121" x2="128" y2="140" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <line x1="84" y1="121" x2="72" y2="140" stroke="white" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
