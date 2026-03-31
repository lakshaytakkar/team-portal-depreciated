export function TripHQLogo({ size = 48, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      data-testid="triphq-logo"
    >
      <path
        d="M88 19Q100 12 112 19L164 49Q176 56 176 70L176 130Q176 144 164 151L112 181Q100 188 88 181L36 151Q24 144 24 130L24 70Q24 56 36 49Z"
        fill="#0891B2"
      />
      <path
        d="M88 19Q100 12 112 19L164 49Q176 56 176 70L100 108L24 70Q24 56 36 49Z"
        fill="#06B6D4"
      />
      <circle cx="100" cy="118" r="38" stroke="white" strokeWidth="4" fill="none" />
      <circle cx="100" cy="118" r="3" fill="white" />
      <path d="M100 118L100 88" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M100 118L80 102" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M100 80L96 88L104 88Z" fill="white" />
      <line x1="100" y1="78" x2="100" y2="74" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round" />
      <line x1="100" y1="158" x2="100" y2="162" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="62" y1="118" x2="58" y2="118" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="138" y1="118" x2="142" y2="118" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="73" y1="87" x2="70" y2="84" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="127" y1="87" x2="130" y2="84" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="73" y1="149" x2="70" y2="152" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="127" y1="149" x2="130" y2="152" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
