interface EventHubLogoProps {
  size?: number;
  className?: string;
}

export function EventHubLogo({ size = 48, className }: EventHubLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      data-testid="eventhub-logo"
    >
      <path
        d="M88 19Q100 12 112 19L164 49Q176 56 176 70L176 130Q176 144 164 151L112 181Q100 188 88 181L36 151Q24 144 24 130L24 70Q24 56 36 49Z"
        fill="#7C3AED"
      />
      <path
        d="M88 19Q100 12 112 19L164 49Q176 56 176 70L100 108L24 70Q24 56 36 49Z"
        fill="#8B5CF6"
      />
      <circle cx="100" cy="100" r="10" fill="white" />
      <circle cx="60" cy="80" r="7" fill="white" fillOpacity="0.85" />
      <circle cx="140" cy="80" r="7" fill="white" fillOpacity="0.85" />
      <circle cx="68" cy="128" r="7" fill="white" fillOpacity="0.85" />
      <circle cx="132" cy="128" r="7" fill="white" fillOpacity="0.85" />
      <line x1="100" y1="100" x2="60" y2="80" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeOpacity="0.9" />
      <line x1="100" y1="100" x2="140" y2="80" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeOpacity="0.9" />
      <line x1="100" y1="100" x2="68" y2="128" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeOpacity="0.9" />
      <line x1="100" y1="100" x2="132" y2="128" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeOpacity="0.9" />
      <line x1="60" y1="80" x2="140" y2="80" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4" />
      <line x1="68" y1="128" x2="132" y2="128" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4" />
    </svg>
  );
}
