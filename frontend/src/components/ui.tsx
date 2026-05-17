import React from 'react';

// ── icons (lucide-style, 1.6px stroke) ─────────────────────
type IProps = { d: React.ReactNode; size?: number; fill?: string; sw?: number; style?: React.CSSProperties };
const I = ({ d, size = 16, fill = 'none', sw = 1.6, style }: IProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={fill} stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden={true} style={style}>
    {d}
  </svg>
);

export type IconProps = { size?: number; fill?: string; sw?: number; style?: React.CSSProperties };

export const Icon: Record<string, (p: IconProps) => React.ReactElement> = {
  home: (p) => <I {...p} d={<><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9.5a.5.5 0 0 0 .5.5h4V14h5v6h4a.5.5 0 0 0 .5-.5V10"/></>} />,
  edit: (p) => <I {...p} d={<><path d="M4 20h4l10-10-4-4L4 16v4Z"/><path d="m13 6 4 4"/></>} />,
  target: (p) => <I {...p} d={<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/></>} />,
  sparkles: (p) => <I {...p} d={<><path d="M12 4v4M12 16v4M4 12h4M16 12h4M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2"/></>} />,
  briefcase: (p) => <I {...p} d={<><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></>} />,
  user: (p) => <I {...p} d={<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>} />,
  bell: (p) => <I {...p} d={<><path d="M6 8a6 6 0 0 1 12 0v4l2 3H4l2-3V8Z"/><path d="M10 19a2 2 0 0 0 4 0"/></>} />,
  flame: (p) => <I {...p} d={<><path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-3 2-6 0 0 2 1 3-4Z"/></>} />,
  plus: (p) => <I {...p} d={<><path d="M12 5v14M5 12h14"/></>} />,
  arrow: (p) => <I {...p} d={<><path d="M5 12h14M13 5l7 7-7 7"/></>} />,
  chev: (p) => <I {...p} d={<><path d="m9 6 6 6-6 6"/></>} />,
  chevD: (p) => <I {...p} d={<><path d="m6 9 6 6 6-6"/></>} />,
  check: (p) => <I {...p} d={<><path d="m5 13 4 4L19 7"/></>} />,
  x: (p) => <I {...p} d={<><path d="M6 6l12 12M18 6 6 18"/></>} />,
  star: (p) => <I {...p} d={<><path d="M12 3.5 14.5 9l5.8.8-4.2 4.1 1 5.7L12 16.9l-5.1 2.7 1-5.7L3.7 9.8 9.5 9 12 3.5Z"/></>} />,
  upload: (p) => <I {...p} d={<><path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/></>} />,
  doc: (p) => <I {...p} d={<><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z"/><path d="M14 3v6h6"/></>} />,
  link: (p) => <I {...p} d={<><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5"/></>} />,
  search: (p) => <I {...p} d={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>} />,
  calendar: (p) => <I {...p} d={<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></>} />,
  chart: (p) => <I {...p} d={<><path d="M4 19V5M4 19h16M8 16v-6M12 16V8M16 16v-3"/></>} />,
  clock: (p) => <I {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>} />,
  quote: (p) => <I {...p} d={<><path d="M7 7h4v6H7c0 2 1 3 3 3v2c-3 0-5-2-5-5V7Zm9 0h4v6h-4c0 2 1 3 3 3v2c-3 0-5-2-5-5V7Z"/></>} />,
  shield: (p) => <I {...p} d={<><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/></>} />,
  more: (p) => <I {...p} d={<><circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/></>} />,
  globe: (p) => <I {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></>} />,
  pin: (p) => <I {...p} d={<><path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></>} />,
  trend: (p) => <I {...p} d={<><path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/></>} />,
};

// ── ring progress ─────────────────────────────────────────
interface RingProps {
  value?: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  track?: string;
  children?: React.ReactNode;
}
export function Ring({ value = 0, size = 240, stroke = 14, label, sublabel, color = 'var(--ink)', track = 'var(--hairline)', children }: RingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
                strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(.2,.7,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        {children || (
          <div>
            <div className="op-bignum" style={{ fontSize: size * 0.28 }}>{value}<span style={{ fontSize: size * 0.13, color: 'var(--ink-3)', marginLeft: 2 }}>%</span></div>
            {label && <div className="op-eyebrow" style={{ marginTop: 4 }}>{label}</div>}
            {sublabel && <div style={{ fontSize: 11, color: 'var(--ink-2)', marginTop: 6 }}>{sublabel}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── thin progress bar ────────────────────────────────────
interface BarProps {
  value?: number;
  color?: string;
  height?: number;
  track?: string;
}
export function Bar({ value = 0, color = 'var(--ink)', height = 4, track = 'var(--hairline)' }: BarProps) {
  return (
    <div style={{ position: 'relative', height, background: track, borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, width: `${value}%`, background: color, borderRadius: 999, transition: 'width 0.5s cubic-bezier(.2,.7,.2,1)' }} />
    </div>
  );
}

// ── pill button ──────────────────────────────────────────
interface PillProps {
  children: React.ReactNode;
  variant?: 'ink' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  dot?: React.ReactNode;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
}
export function Pill({ children, variant = 'ink', size, dot, onClick, style, type = 'button', icon, iconRight }: PillProps) {
  const cls = ['op-pill'];
  if (variant === 'ghost') cls.push('op-pill--ghost');
  if (variant === 'accent') cls.push('op-pill--accent');
  if (size === 'sm') cls.push('op-pill--sm');
  if (size === 'lg') cls.push('op-pill--lg');
  if (!dot && !icon) cls.push('op-pill--text');
  return (
    <button className={cls.join(' ')} onClick={onClick} type={type} style={style}>
      {dot ? <span className="op-pill__dot">{dot}</span> : icon ? <span className="op-pill__dot">{icon}</span> : null}
      <span>{children}</span>
      {iconRight}
    </button>
  );
}

// ── avatar ───────────────────────────────────────────────
interface AvatarProps {
  name: string;
  size?: number;
  color?: string;
  bg?: string;
}
export function Avatar({ name, size = 32, color, bg }: AvatarProps) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg || 'var(--ink)', color: color || 'var(--on-dark)',
      display: 'grid', placeItems: 'center',
      fontSize: size * 0.42, fontWeight: 600, fontFamily: 'var(--font-display)',
      flex: `0 0 ${size}px`,
    }}>
      {name}
    </div>
  );
}

// ── streak badge (the fire) ─────────────────────────────
interface StreakProps {
  days: number;
  compact?: boolean;
}
export function Streak({ days, compact = false }: StreakProps) {
  if (compact) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px 4px 8px',
        borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--accent-deep)',
        fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)',
      }}>
        <span style={{ fontSize: 14 }}>🔥</span>
        <span className="op-num">{days}</span>
      </span>
    );
  }
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px 6px 8px',
      borderRadius: 999, background: 'var(--accent)', color: 'white',
    }}>
      <span style={{ fontSize: 16 }}>🔥</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span className="op-num op-bignum" style={{ fontSize: 17 }}>{days}</span>
        <span style={{ fontSize: 11, opacity: 0.85 }}>天连击</span>
      </div>
    </div>
  );
}

// ── eyebrow / spec label ────────────────────────────────
interface EyebrowProps {
  children: React.ReactNode;
  dot?: boolean;
}
export function Eyebrow({ children, dot }: EyebrowProps) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {dot && <span className="op-dot op-dot--ink" />}
      <span className="op-eyebrow">{children}</span>
    </div>
  );
}

// ── stat block (number + caption) ────────────────────────
interface StatProps {
  value: string | number;
  unit?: string;
  label: string;
  delta?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  dark?: boolean;
}
export function Stat({ value, unit, label, delta, size = 'md', dark = false }: StatProps) {
  const sizes: Record<string, number> = { sm: 22, md: 32, lg: 44, xl: 64 };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span className="op-bignum op-num" style={{ fontSize: sizes[size], color: dark ? 'var(--on-dark)' : 'var(--ink)' }}>{value}</span>
        {unit && <span style={{ fontSize: sizes[size] * 0.35, color: dark ? 'rgba(255,255,255,.55)' : 'var(--ink-3)', fontFamily: 'var(--font-display)' }}>{unit}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <span style={{ fontSize: 11, color: dark ? 'rgba(255,255,255,.55)' : 'var(--ink-2)' }}>{label}</span>
        {delta && <span style={{ fontSize: 10, color: 'var(--good)', fontWeight: 600 }}>↗ {delta}</span>}
      </div>
    </div>
  );
}

// ── priority chip ────────────────────────────────────────
interface PrioChipProps {
  p: string;
}
export function PrioChip({ p }: PrioChipProps) {
  const map: Record<string, { bg: string; fg: string; border?: string }> = {
    P0: { bg: '#0a0a0a', fg: '#fafaf9' },
    P1: { bg: 'var(--hairline-strong)', fg: 'var(--ink)' },
    P2: { bg: 'transparent', fg: 'var(--ink-3)', border: 'var(--hairline-strong)' },
  };
  const s = map[p] || map['P2'];
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 999,
      background: s.bg, color: s.fg, fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
      fontFamily: 'var(--font-mono)', border: s.border ? `1px solid ${s.border}` : 'none',
    }}>{p}</span>
  );
}

// ── status edge color ────────────────────────────────────
export function statusColor(state: string): string {
  const map: Record<string, string> = { ok: 'var(--ink)', done: 'var(--good)', warn: 'var(--warn)', bad: 'var(--bad)' };
  return map[state] || 'var(--ink)';
}
export function statusBg(state: string): string {
  const map: Record<string, string> = { ok: 'var(--surface)', done: 'var(--good-soft)', warn: 'var(--warn-soft)', bad: 'var(--bad-soft)' };
  return map[state] || 'var(--surface)';
}

// ── logo wordmark ────────────────────────────────────────
interface LogoProps {
  tone?: 'ink' | 'on-dark';
  size?: 'sm' | 'md';
}
export function Logo({ tone = 'ink', size = 'md' }: LogoProps) {
  const sizes = {
    sm: { mark: { w: 24, h: 14, dot: 7 }, font: 13 },
    md: { mark: { w: 28, h: 16, dot: 8 }, font: 14 },
  };
  const s = sizes[size];
  const fg = tone === 'ink' ? 'var(--ink)' : 'var(--on-dark)';
  const bg = tone === 'ink' ? 'var(--on-dark)' : 'var(--ink)';
  return (
    <div className="op-logo" style={{ fontSize: s.font, color: fg }}>
      <span style={{
        width: s.mark.w, height: s.mark.h, background: fg, borderRadius: 999,
        position: 'relative', flex: `0 0 ${s.mark.w}px`, display: 'inline-block',
      }}>
        <span style={{
          position: 'absolute', top: '50%', left: 4,
          width: s.mark.dot, height: s.mark.dot, background: bg, borderRadius: 999,
          transform: 'translateY(-50%)',
        }} />
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
        <span>OFFER</span>
        <span style={{ fontWeight: 500, color: tone === 'ink' ? 'var(--ink-2)' : 'rgba(255,255,255,.7)' }}>预备役</span>
      </span>
    </div>
  );
}

// ── card title row ───────────────────────────────────────
interface CardTitleProps {
  eyebrow?: string;
  title?: string;
  action?: React.ReactNode;
  dark?: boolean;
}
export function CardTitle({ eyebrow, title, action, dark = false }: CardTitleProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
      <div>
        {eyebrow && <Eyebrow dot>{eyebrow}</Eyebrow>}
        {title && <h3 style={{ marginTop: eyebrow ? 6 : 0, fontSize: 16, fontWeight: 600, color: dark ? 'var(--on-dark)' : 'var(--ink)' }}>{title}</h3>}
      </div>
      {action}
    </div>
  );
}
