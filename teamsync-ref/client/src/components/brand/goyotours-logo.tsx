interface GoyoToursLogoProps {
  size?: number;
  className?: string;
}

export function GoyoToursLogo({ size = 48, className }: GoyoToursLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      data-testid="goyotours-logo"
    >
      <path
        d="M88 19Q100 12 112 19L164 49Q176 56 176 70L176 130Q176 144 164 151L112 181Q100 188 88 181L36 151Q24 144 24 130L24 70Q24 56 36 49Z"
        fill="#E91E63"
      />
      <path
        d="M88 19Q100 12 112 19L164 49Q176 56 176 70L100 108L24 70Q24 56 36 49Z"
        fill="#F0346F"
      />
      <circle cx="100" cy="115" r="35" stroke="white" strokeWidth="5" fill="none" />
      <circle cx="100" cy="115" r="5" fill="white" />
      <line x1="100" y1="115" x2="100" y2="88" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <line x1="100" y1="115" x2="118" y2="103" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <line x1="100" y1="80" x2="100" y2="75" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="100" y1="150" x2="100" y2="155" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="65" y1="115" x2="60" y2="115" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="135" y1="115" x2="140" y2="115" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
