interface Props { mono: string; hue: number; size?: 'sm' | 'md' | 'lg'; }

const SIZES = { sm: 28, md: 36, lg: 44 };
const FONT  = { sm: 11, md: 13, lg: 16 };

export default function Monogram({ mono, hue, size = 'md' }: Props) {
  const px = SIZES[size];
  const fs = FONT[size];
  return (
    <div className="monogram" style={{
      width: px, height: px, borderRadius: 8,
      background: `oklch(0.55 0.18 ${hue})`,
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-mono)', fontSize: fs, fontWeight: 600, flexShrink: 0,
    }}>
      {mono}
    </div>
  );
}
