interface VendorPortalLogoProps {
  size?: number;
  className?: string;
}

export function VendorPortalLogo({ size = 36, className }: VendorPortalLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="36" height="36" rx="8" fill="#1E3A5F" />
      <path
        d="M10 14L18 10L26 14V22L18 26L10 22V14Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M18 18V26"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 14L18 18L26 14"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M14 12L22 16"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
