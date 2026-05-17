import React, { useState } from 'react';
import { Icon, Ring, Pill, Eyebrow } from '../components/ui';
import { PageFrame } from '../components/layout';
import { OP_INTERNSHIPS } from '../data';
import type { PageProps } from '../types';

export default function InternshipPage({ isMobile }: PageProps) {
  const [filter, setFilter] = useState('match');
  const items = OP_INTERNSHIPS;

  return (
    <PageFrame padding={isMobile ? '8px 16px 100px' : '32px 40px 80px'}>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow dot>实习推荐 · 与你的 KR 完成度联动</Eyebrow>
        <h1 style={{ fontSize: isMobile ? 28 : 44, marginTop: 8, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
          {items.length} 个 Offer 候选 ——<br />
          <span style={{ color: 'var(--ink-3)' }}>距离</span>{' '}
          <span style={{ color: 'var(--accent)' }}>{items.filter(i => i.match >= 80).length}</span>{' '}
          <span style={{ color: 'var(--ink-3)' }}>个高匹配岗位，只剩几个 KR。</span>
        </h1>
      </div>

      {/* filter */}
      <div className="op-scroll-x" style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'match', label: '匹配度 ↓' },
          { id: 'salary', label: '日薪 ↓' },
          { id: 'beijing', label: '北京' },
          { id: 'shanghai', label: '上海' },
          { id: 'large', label: '10000+ 人' },
        ].map(f => {
          const active = filter === f.id;
          return (
            <button key={f.id} className="op-btn" onClick={() => setFilter(f.id)}
              style={{
                padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                background: active ? 'var(--ink)' : 'var(--surface)',
                color: active ? 'var(--on-dark)' : 'var(--ink-2)',
                border: `1px solid ${active ? 'var(--ink)' : 'var(--hairline)'}`,
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>{f.label}</button>
          );
        })}
      </div>

      {/* list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(it => (
          <div key={it.id} className="op-card op-hover-card" style={{
            padding: isMobile ? 16 : 20,
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '48px 1fr auto',
            gap: isMobile ? 12 : 20,
            alignItems: 'flex-start',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: it.logoColor, color: 'white',
              display: 'grid', placeItems: 'center',
              fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-display)',
            }}>{it.logo}</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>{it.company}</h3>
                <span style={{ color: 'var(--ink-3)' }}>·</span>
                <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>{it.role}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, fontSize: 11, color: 'var(--ink-3)', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon.pin size={11} /> {it.city}</span>
                <span>·</span>
                <span>{it.size} 人</span>
                <span>·</span>
                <span className="op-num" style={{ color: 'var(--ink-2)', fontWeight: 600 }}>¥ {it.salary}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                {it.tags.map(t => <span key={t} className="op-chip">{t}</span>)}
              </div>
              <div style={{
                marginTop: 12, padding: '10px 12px', background: 'var(--surface-sunk)',
                borderRadius: 'var(--r-md)', fontSize: 12, lineHeight: 1.55, color: 'var(--ink-2)',
                display: 'flex', alignItems: 'flex-start', gap: 8,
              }}>
                <Icon.sparkles size={13} style={{ flexShrink: 0, marginTop: 2 } as React.CSSProperties} />
                <span><strong style={{ color: 'var(--ink)' }}>AI · </strong>{it.reason}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'flex-start' : 'flex-end', gap: 12, paddingTop: isMobile ? 0 : 4 }}>
              <Ring value={it.match} size={isMobile ? 64 : 80} stroke={6} color={it.match >= 85 ? 'var(--accent)' : 'var(--ink)'} track="var(--hairline)">
                <div style={{ textAlign: 'center' }}>
                  <div className="op-bignum op-num" style={{ fontSize: isMobile ? 18 : 22, color: it.match >= 85 ? 'var(--accent)' : 'var(--ink)' }}>{it.match}<span style={{ fontSize: 10, color: 'var(--ink-3)' }}>%</span></div>
                  <div style={{ fontSize: 8, color: 'var(--ink-3)' }}>MATCH</div>
                </div>
              </Ring>
              <div style={{ display: 'flex', gap: 6 }}>
                <Pill variant="ghost" size="sm">忽略</Pill>
                <Pill variant="ink" size="sm" dot={<Icon.arrow size={10} />}>JD</Pill>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageFrame>
  );
}
