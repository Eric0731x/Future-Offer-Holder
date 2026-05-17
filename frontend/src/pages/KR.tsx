import { useState } from 'react';
import { Icon, Bar, Eyebrow, PrioChip, statusColor } from '../components/ui';
import { PageFrame } from '../components/layout';
import type { KR } from '../data';
import type { PageProps } from '../types';

export default function KRPage({ data, isMobile }: PageProps) {
  const [filter, setFilter] = useState('all');
  const filters = [
    { id: 'all', label: '全部', count: data.krs.length },
    { id: 'P0', label: 'P0', count: undefined },
    { id: 'P1', label: 'P1', count: undefined },
    { id: 'P2', label: 'P2', count: undefined },
    { id: 'done', label: '已完成', count: data.krs.filter(k => k.state === 'done').length },
  ];
  const filtered = data.krs.filter(k =>
    filter === 'all' ? true : filter === 'done' ? k.state === 'done' : k.priority === filter
  );

  return (
    <PageFrame padding={isMobile ? '8px 16px 100px' : '32px 40px 80px'}>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow dot>{data.objectiveTag}</Eyebrow>
        <h1 style={{ fontSize: isMobile ? 28 : 44, marginTop: 8, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
          {data.krs.length} 个 KR ——<br />
          <span style={{ color: 'var(--ink-3)' }}>{data.krs.filter(k => k.state === 'done').length} 个已完成，{data.krs.filter(k => k.state === 'ok').length} 个在轨道上。</span>
        </h1>
      </div>

      {/* filter */}
      <div className="op-scroll-x" style={{ display: 'flex', gap: 8, marginBottom: 20, marginLeft: isMobile ? -16 : 0, paddingLeft: isMobile ? 16 : 0, paddingRight: isMobile ? 16 : 0 }}>
        {filters.map(f => {
          const active = filter === f.id;
          return (
            <button key={f.id} className="op-btn" onClick={() => setFilter(f.id)}
              style={{
                padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                background: active ? 'var(--ink)' : 'var(--surface)',
                color: active ? 'var(--on-dark)' : 'var(--ink-2)',
                border: `1px solid ${active ? 'var(--ink)' : 'var(--hairline)'}`,
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
              {f.label}{f.count != null && <span style={{ marginLeft: 6, opacity: 0.6 }}>{f.count}</span>}
            </button>
          );
        })}
      </div>

      {/* grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {filtered.map((kr, i) => (
          <KRCard key={kr.id} kr={kr} idx={i+1} />
        ))}
      </div>

      {/* semester divider */}
      <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="op-eyebrow">{data.stage.split(' · ')[0]}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>下学期 KR 将在 8 周后由 AI 自动建议</div>
      </div>
    </PageFrame>
  );
}

function KRCard({ kr, idx }: { kr: KR; idx: number }) {
  const stateCol = statusColor(kr.state);
  return (
    <div className="op-hover-card" style={{
      background: kr.state === 'done' ? 'var(--good-soft)' : 'var(--surface)',
      border: `1px solid ${kr.state === 'done' ? 'transparent' : kr.state === 'bad' ? 'var(--bad)' : kr.state === 'warn' ? 'var(--warn)' : 'var(--hairline)'}`,
      borderRadius: 'var(--r-lg)', padding: 20,
      opacity: kr.state === 'done' ? 0.85 : 1,
      display: 'flex', flexDirection: 'column', gap: 16, minHeight: 200,
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="op-eyebrow op-num" style={{ color: 'var(--ink-3)' }}>00{idx}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="op-dot" style={{ background: stateCol }} />
          <PrioChip p={kr.priority} />
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: 15, lineHeight: 1.4, letterSpacing: '-0.01em' }}>{kr.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 11, color: 'var(--ink-3)' }}>
          <span className="op-chip" style={{ fontSize: 10 }}>{kr.tag}</span>
          <span>·</span>
          <span>{kr.updated}</span>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span className="op-bignum op-num" style={{ fontSize: 28 }}>{kr.progress}<span style={{ fontSize: 14, color: 'var(--ink-3)' }}>%</span></span>
          <button className="op-btn" style={{ fontSize: 11, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
            详情 <Icon.arrow size={11} />
          </button>
        </div>
        <Bar value={kr.progress} color={stateCol} height={4} />
      </div>
    </div>
  );
}
