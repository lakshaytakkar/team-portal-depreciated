interface UsdropAiLogoProps {
  size?: number;
  className?: string;
}

export function UsdropAiLogo({ size = 48, className }: UsdropAiLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      data-testid="usdrop-ai-logo"
    >
      <path
        d="M88 19Q100 12 112 19L164 49Q176 56 176 70L176 130Q176 144 164 151L112 181Q100 188 88 181L36 151Q24 144 24 130L24 70Q24 56 36 49Z"
        fill="#F34147"
      />
      <path
        d="M88 19Q100 12 112 19L164 49Q176 56 176 70L100 108L24 70Q24 56 36 49Z"
        fill="#F75A5F"
      />
      <rect x="70" y="80" width="50" height="55" rx="4" stroke="white" strokeWidth="5" fill="none" />
      <polyline points="70,95 95,95 95,80" stroke="white" strokeWidth="5" fill="none" strokeLinejoin="round" />
      <path d="M120 110L140 90V120H120V110Z" fill="white" />
      <path d="M130 120L140 110" stroke="white" strokeWidth="3" />
      <line x1="100" y1="145" x2="100" y2="160" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <polyline points="90,152 100,162 110,152" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
