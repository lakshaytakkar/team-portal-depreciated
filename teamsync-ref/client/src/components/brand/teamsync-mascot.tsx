interface TeamSyncMascotProps {
  size?: number;
  className?: string;
}

export function TeamSyncMascot({ size = 48, className }: TeamSyncMascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      data-testid="teamsync-mascot"
    >
      <path
        d="M88 19Q100 12 112 19L164 49Q176 56 176 70L176 130Q176 144 164 151L112 181Q100 188 88 181L36 151Q24 144 24 130L24 70Q24 56 36 49Z"
        fill="#225AEA"
      />

      <path
        d="M88 19Q100 12 112 19L164 49Q176 56 176 70L100 108L24 70Q24 56 36 49Z"
        fill="#3068F0"
      />

      <path
        d="M60 132Q74 112 88 132Q74 124 60 132Z"
        fill="white"
      />
      <path
        d="M112 132Q126 112 140 132Q126 124 112 132Z"
        fill="white"
      />

      <path
        d="M80 152Q100 166 120 152"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
