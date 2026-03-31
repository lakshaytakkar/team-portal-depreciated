interface LegalNationsLogoProps {
  size?: number;
  className?: string;
}

export function LegalNationsLogo({ size = 48, className }: LegalNationsLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      data-testid="legalnations-logo"
    >
      <path
        d="M88 19Q100 12 112 19L164 49Q176 56 176 70L176 130Q176 144 164 151L112 181Q100 188 88 181L36 151Q24 144 24 130L24 70Q24 56 36 49Z"
        fill="#225AEA"
      />
      <path
        d="M88 19Q100 12 112 19L164 49Q176 56 176 70L100 108L24 70Q24 56 36 49Z"
        fill="#3068F0"
      />
      <line x1="100" y1="80" x2="100" y2="145" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <line x1="72" y1="95" x2="128" y2="95" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <path d="M72 95L62 115H82Z" fill="white" />
      <path d="M128 95L118 115H138Z" fill="white" />
      <line x1="58" y1="115" x2="86" y2="115" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <line x1="114" y1="115" x2="142" y2="115" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <rect x="85" y="145" width="30" height="5" rx="2.5" fill="white" />
    </svg>
  );
}
