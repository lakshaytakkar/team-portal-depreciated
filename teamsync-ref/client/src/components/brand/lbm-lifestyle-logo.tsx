interface LbmLifestyleLogoProps {
  size?: number;
  className?: string;
}

export function LbmLifestyleLogo({ size = 48, className }: LbmLifestyleLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      data-testid="lbm-lifestyle-logo"
    >
      <path
        d="M88 19Q100 12 112 19L164 49Q176 56 176 70L176 130Q176 144 164 151L112 181Q100 188 88 181L36 151Q24 144 24 130L24 70Q24 56 36 49Z"
        fill="#673AB7"
      />
      <path
        d="M88 19Q100 12 112 19L164 49Q176 56 176 70L100 108L24 70Q24 56 36 49Z"
        fill="#7E4FC9"
      />
      <path
        d="M100 90C100 90 78 105 78 120C78 132 88 142 100 142C112 142 122 132 122 120C122 105 100 90 100 90Z"
        fill="white"
      />
      <path
        d="M100 82L103 72L108 80L118 78L112 86L120 92L110 92L108 102L100 95L92 102L90 92L80 92L88 86L82 78L92 80L97 72Z"
        fill="white"
      />
    </svg>
  );
}
