import { useState } from 'react';
import { Icon, Eyebrow } from '../components/ui';
import { PageFrame } from '../components/layout';
import { OP_HISTORY_ADVICE } from '../data';
import type { PageProps } from '../types';

export default function AdvicePage({ data, isMobile }: PageProps) {
  const [tab, setTab] = useState('day');
  const tabs = [
    { id: 'day', label: '日建议' },
    { id: 'week', label: '周建议' },
    { id: 'month', label: '月建议' },
    { id: 'semester', label: '学期' },
    { id: 'kr', label: 'KR 完成' },
  ];

  return (
    <PageFrame padding={isMobile ? '8px 16px 100px' : '32px 40px 80px'}>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow dot>AI 建议中心 · 由你的打卡日志生成</Eyebrow>
        <h1 style={{ fontSize: isMobile ? 28 : 44, marginTop: 8, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
          一个不焦虑你的<br />
          <span style={{ color: 'var(--ink-3)' }}>导师 ——</span> 但是会<br />指出你假装看不见的部分。
        </h1>
      </div>

      {/* Featured advice */}
      <div className="op-card op-card--ink" style={{ padding: isMobile ? 20 : 32, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <Eyebrow>今日重点 · {new Date().toLocaleDateString('zh-CN')}</Eyebrow>
          <span className="op-chip op-chip--accent">最新</span>
        </div>
        <h2 style={{ color: 'var(--on-dark)', fontSize: isMobile ? 22 : 32, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
          "{data.advice.headline}"
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16, marginTop: 28 }}>
          {[
            { icon: '✓', label: '你做得好', text: data.advice.good, color: '#4ade80' },
            { icon: '◐', label: '值得思考', text: data.advice.think, color: '#fbbf24' },
            { icon: '→', label: '下一步', text: data.advice.next, color: '#fb923c' },
          ].map(b => (
            <div key={b.label} style={{ borderTop: `2px solid ${b.color}`, paddingTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: b.color, fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span style={{ fontSize: 14 }}>{b.icon}</span>{b.label}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.78)', lineHeight: 1.7 }}>{b.text}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>对你有帮助吗？</span>
            {['👍', '🤔', '👎'].map(e => (
              <button key={e} className="op-btn" style={{
                width: 30, height: 30, borderRadius: '50%', fontSize: 14,
                background: 'rgba(255,255,255,.08)',
              }}>{e}</button>
            ))}
          </div>
          <button className="op-btn" style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon.doc size={13} /> 打开云文档
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="op-scroll-x" style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {tabs.map(t => (
          <button key={t.id} className="op-btn" onClick={() => setTab(t.id)}
            style={{
              padding: '6px 12px', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
              color: tab === t.id ? 'var(--ink)' : 'var(--ink-3)',
              borderBottom: tab === t.id ? '2px solid var(--ink)' : '2px solid transparent',
              borderRadius: 0, paddingBottom: 8,
            }}>{t.label}</button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {OP_HISTORY_ADVICE.map(a => (
          <div key={a.id} className="op-card op-hover-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: a.tone === 'good' ? 'var(--good-soft)' : a.tone === 'warn' ? 'var(--warn-soft)' : 'var(--surface-sunk)',
              color: a.tone === 'good' ? 'var(--good)' : a.tone === 'warn' ? 'var(--warn)' : 'var(--ink-2)',
              display: 'grid', placeItems: 'center',
            }}>
              <Icon.sparkles size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className="op-chip" style={{ fontSize: 10 }}>{a.type}</span>
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{a.date}</span>
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>· {a.kr}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, color: 'var(--ink)' }}>{a.summary}</div>
            </div>
            <button className="op-btn" style={{ flexShrink: 0, color: 'var(--ink-3)' }}>
              <Icon.chev size={16} />
            </button>
          </div>
        ))}
      </div>
    </PageFrame>
  );
}
