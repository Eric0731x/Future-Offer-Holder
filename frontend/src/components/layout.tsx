import React from 'react';
import { Icon, Streak, Pill, Avatar, Logo } from './ui';
import type { PersonaData } from '../data';

// ── TopNav (PC) ──────────────────────────────────────────
interface TopNavProps {
  route: string;
  setRoute: (r: string) => void;
  data: PersonaData;
}
export function TopNav({ route, setRoute, data }: TopNavProps) {
  const links = [
    { id: 'home', label: '首页' },
    { id: 'checkin', label: '打卡' },
    { id: 'kr', label: 'KR 看板' },
    { id: 'advice', label: '建议中心' },
    { id: 'internship', label: '实习' },
  ];
  return (
    <header style={{
      height: 64, padding: '0 28px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid var(--hairline)',
      background: 'var(--bg)',
      flex: '0 0 64px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        <Logo />
        <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {links.map(l => (
            <button key={l.id} className="op-btn" onClick={() => setRoute(l.id)}
              style={{
                fontSize: 13,
                color: route === l.id ? 'var(--ink)' : 'var(--ink-2)',
                fontWeight: route === l.id ? 600 : 500,
                position: 'relative', padding: '6px 0',
              }}>
              {l.label}
              {route === l.id && <span style={{
                position: 'absolute', left: 0, right: 0, bottom: -22, height: 2,
                background: 'var(--ink)', borderRadius: 2,
              }} />}
            </button>
          ))}
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Streak days={data.streak} compact />
        <button className="op-btn" style={{ width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', position: 'relative', color: 'var(--ink-2)' }}>
          <Icon.bell size={18} />
          <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: 999, background: 'var(--accent)' }} />
        </button>
        <Pill variant="ghost" size="sm" dot={<Avatar name={data.avatar} size={20} />}>{data.name} · Lv.{data.level}</Pill>
      </div>
    </header>
  );
}

// ── MobileNav — top bar (slim) ──────────────────────────
interface MobileNavProps {
  route: string;
  setRoute: (r: string) => void;
  data: PersonaData;
  title: string;
}
export function MobileNav({ data, title }: MobileNavProps) {
  return (
    <header style={{
      height: 52, padding: '0 16px', flex: '0 0 52px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'var(--bg)', position: 'relative', zIndex: 5,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={data.avatar} size={32} />
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{title || '早安，' + data.name}</div>
          <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{data.stage}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Streak days={data.streak} compact />
        <button className="op-btn" style={{ width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', position: 'relative', color: 'var(--ink-2)' }}>
          <Icon.bell size={18} />
          <span style={{ position: 'absolute', top: 6, right: 6, width: 5, height: 5, borderRadius: 999, background: 'var(--accent)' }} />
        </button>
      </div>
    </header>
  );
}

// ── BottomTab (mobile) ──────────────────────────────────
interface BottomTabProps {
  route: string;
  setRoute: (r: string) => void;
}
export function BottomTab({ route, setRoute }: BottomTabProps) {
  const items = [
    { id: 'home', label: '首页', icon: Icon.home },
    { id: 'kr', label: 'KR', icon: Icon.target },
    { id: 'checkin', label: '打卡', icon: Icon.edit, big: true },
    { id: 'advice', label: '建议', icon: Icon.sparkles },
    { id: 'internship', label: '实习', icon: Icon.briefcase },
  ];
  return (
    <nav className="op-glass" style={{
      position: 'absolute', left: 12, right: 12, bottom: 12,
      height: 64, borderRadius: 28,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 14px', zIndex: 10,
    }}>
      {items.map(it => {
        const active = route === it.id;
        if (it.big) return (
          <button key={it.id} className="op-btn" onClick={() => setRoute(it.id)}
            style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'var(--ink)', color: 'var(--on-dark)',
              display: 'grid', placeItems: 'center',
              boxShadow: '0 8px 24px rgba(234,88,12,0.0), 0 4px 12px rgba(10,10,10,0.18)',
              transform: 'translateY(-12px)',
            }}>
            <it.icon size={22} />
          </button>
        );
        return (
          <button key={it.id} className="op-btn" onClick={() => setRoute(it.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              padding: '6px 10px', borderRadius: 12,
              color: active ? 'var(--ink)' : 'var(--ink-3)',
            }}>
            <it.icon size={18} />
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 500 }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ── FAB (floating quick-checkin) ──────────────────────
interface FABProps {
  onClick: () => void;
  hide?: boolean;
}
export function FAB({ onClick, hide }: FABProps) {
  if (hide) return null;
  return (
    <button onClick={onClick} className="op-btn op-glass" style={{
      position: 'absolute', right: 24, bottom: 24, zIndex: 9,
      width: 56, height: 56, borderRadius: '50%',
      background: 'var(--ink)', color: 'var(--on-dark)',
      display: 'grid', placeItems: 'center',
      boxShadow: '0 12px 32px -8px rgba(10,10,10,0.4), 0 0 0 0.5px rgba(255,255,255,0.1) inset',
    }}>
      <Icon.edit size={22} />
    </button>
  );
}

// ── Page frame ──────────────────────────────────────────
interface PageFrameProps {
  children: React.ReactNode;
  dark?: boolean;
  padding?: string;
}
export function PageFrame({ children, dark = false, padding = '32px 40px 80px' }: PageFrameProps) {
  return (
    <div className="op-scroll op-fade" style={{
      flex: 1, padding,
      background: dark ? 'var(--ink)' : 'var(--bg)',
      color: dark ? 'var(--on-dark)' : 'var(--ink)',
    }}>
      {children}
    </div>
  );
}
