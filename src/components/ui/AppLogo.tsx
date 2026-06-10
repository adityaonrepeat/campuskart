interface AppLogoProps {
  size?: number;
  className?: string;
}

export default function AppLogo({ size = 32, className }: AppLogoProps) {
  const s = Math.round(size * 0.56);
  return (
    <div
      className={`rounded-xl flex items-center justify-center shrink-0 ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
      }}
    >
      {/* viewBox padded by 1 unit on all sides so the cart handle + wheels never clip */}
      <svg
        width={s}
        height={s}
        viewBox="-1 -1 26 26"
        fill="none"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1.5" fill="white" stroke="none" />
        <circle cx="20" cy="21" r="1.5" fill="white" stroke="none" />
        <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6" />
      </svg>
    </div>
  );
}
