import { Icon, Ring, Bar, Pill, Eyebrow, Stat, PrioChip } from '../components/ui';
import { PageFrame } from '../components/layout';
import { OP_INTERNSHIPS } from '../data';
import type { PageProps } from '../types';

export default function HomePage({ data, isMobile, setRoute, openCheckin }: PageProps) {
  return isMobile
    ? <HomeMobile data={data} setRoute={setRoute} openCheckin={openCheckin} />
    : <HomePC data={data} setRoute={setRoute} openCheckin={openCheckin} />;
}

function HomePC({ data, setRoute, openCheckin }: Omit<PageProps, 'isMobile'>) {
  const todayKrs = data.krs.filter(k => k.priority !== 'P2' && k.state !== 'done').slice(0, 3);

  return (
    <PageFrame padding="0">
      {/* HERO BAND */}
      <section style={{ padding: '40px 40px 32px', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap' }}>
            <Eyebrow dot>{data.objectiveTag}</Eyebrow>
            <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>· 早安，{data.name}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{data.stage} · {data.countdown}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 56, alignItems: 'flex-start' }}>
          <div style={{ maxWidth: 720 }}>
            <h1 className="op-fade" style={{ fontSize: 56, lineHeight: 1.08, fontWeight: 600, letterSpacing: '-0.035em' }}>
              <span style={{ color: 'var(--ink-3)' }}>把今天，</span><br/>
              变成离<span style={{ color: 'var(--accent)' }}> Offer </span>更近的一天。
            </h1>
            <p style={{ marginTop: 24, fontSize: 14, color: 'var(--ink-2)', maxWidth: 520, lineHeight: 1.7 }}>
              你的目标 ——「{data.objective}」<br/>
              今天的整体完成度是 <strong style={{ color: 'var(--ink)' }}>{data.okrProgress}%</strong>，本周投入 <strong style={{ color: 'var(--ink)' }}>{data.weekDelta}</strong>。AI 已为你识别出 <strong style={{ color: 'var(--ink)' }}>3 个</strong> 今天最值得推进的关键结果。
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <Pill variant="ink" size="lg" dot={<Icon.arrow size={14} />} onClick={openCheckin}>开始今日打卡</Pill>
              <Pill variant="ghost" size="lg" onClick={() => setRoute('kr')}>查看全部 KR</Pill>
            </div>
          </div>

          {/* OKR Ring */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Ring value={data.okrProgress} size={260} stroke={9} color="var(--ink)">
              <div style={{ textAlign: 'center' }}>
                <div className="op-eyebrow" style={{ color: 'var(--ink-3)' }}>OKR · 整体进度</div>
                <div className="op-bignum op-num" style={{ fontSize: 80, marginTop: 4, color: 'var(--ink)' }}>
                  {data.okrProgress}<span style={{ fontSize: 28, color: 'var(--ink-3)' }}>%</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-2)', marginTop: 2 }}>{data.krs.filter(k => k.state === 'done').length} / {data.krs.length} KR 完成</div>
              </div>
            </Ring>
            <div style={{ display: 'flex', gap: 22, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--hairline)', width: '100%', justifyContent: 'center' }}>
              <Stat value={data.streak} unit="天" label="连击" size="sm" />
              <Stat value={data.totalHours} unit="h" label="累计" size="sm" />
              <Stat value={`Lv.${data.level}`} label="等级" size="sm" />
            </div>
          </div>
        </div>
      </section>

      {/* DARK BAND — today's tasks */}
      <section style={{ background: 'var(--ink)', color: 'var(--on-dark)', padding: '40px 40px 48px', borderRadius: '32px 32px 0 0', marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div className="op-eyebrow" style={{ color: 'rgba(255,255,255,.5)' }}>001 · 今日任务</div>
            <h2 style={{ color: 'var(--on-dark)', fontSize: 36, marginTop: 8, letterSpacing: '-0.025em' }}>
              这 3 件事 ——<br /><span style={{ color: 'rgba(255,255,255,.4)' }}>把今天变成离 Offer 更近的一天。</span>
            </h2>
          </div>
          <Pill variant="ghost" size="sm" style={{ borderColor: 'rgba(255,255,255,.2)', color: 'var(--on-dark)' }} onClick={() => setRoute('kr')}>全部 →</Pill>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {todayKrs.map((kr, i) => (
            <div key={kr.id} style={{
              border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--r-lg)', padding: 20,
              display: 'flex', flexDirection: 'column', gap: 16, minHeight: 200,
              background: 'rgba(255,255,255,.02)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="op-eyebrow" style={{ color: 'rgba(255,255,255,.4)' }}>00{i+1}</span>
                <PrioChip p={kr.priority} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: 'var(--on-dark)', fontSize: 17, fontWeight: 600, lineHeight: 1.35, letterSpacing: '-0.01em' }}>{kr.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,.5)' }}>
                  <span>{kr.tag}</span><span>·</span><span>最近更新 {kr.updated}</span>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span className="op-num" style={{ fontSize: 24, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{kr.progress}%</span>
                  <button className="op-btn" onClick={openCheckin}
                    style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    打卡推进 <Icon.arrow size={11} />
                  </button>
                </div>
                <Bar value={kr.progress} color="var(--on-dark)" track="rgba(255,255,255,.1)" height={3} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI ADVICE + INTERNSHIP */}
      <section style={{ padding: '40px 40px 48px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        {/* advice teaser */}
        <div className="op-card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Eyebrow dot>002 · AI 建议 · 今天 14:23</Eyebrow>
            <Pill variant="ghost" size="sm" onClick={() => setRoute('advice')}>查看历史 →</Pill>
          </div>
          <h2 style={{ fontSize: 28, lineHeight: 1.25, letterSpacing: '-0.02em' }}>
            "{data.advice.headline}"
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
            {[
              { icon: '✓', label: '你做得好', text: data.advice.good, color: 'var(--good)' },
              { icon: '◐', label: '值得思考', text: data.advice.think, color: 'var(--warn)' },
              { icon: '→', label: '下一步', text: data.advice.next, color: 'var(--accent)' },
            ].map(b => (
              <div key={b.label} style={{ borderTop: `2px solid ${b.color}`, paddingTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: b.color, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <span style={{ fontSize: 14 }}>{b.icon}</span>{b.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.65 }}>{b.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* internship mini */}
        <div className="op-card" style={{ padding: 28, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Eyebrow dot>003 · 本周匹配</Eyebrow>
            <Pill variant="ghost" size="sm" onClick={() => setRoute('internship')}>全部 →</Pill>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {OP_INTERNSHIPS.slice(0, 3).map(it => (
              <button key={it.id} className="op-btn op-hover-card" onClick={() => setRoute('internship')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)', textAlign: 'left',
                  background: 'var(--surface)',
                }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: it.logoColor, color: 'white', display: 'grid', placeItems: 'center', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                  {it.logo}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{it.company} · {it.role}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{it.city} · {it.salary}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="op-num op-bignum" style={{ fontSize: 18, color: 'var(--accent)' }}>{it.match}%</div>
                  <div style={{ fontSize: 9, color: 'var(--ink-3)' }}>匹配</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </PageFrame>
  );
}

function HomeMobile({ data, setRoute, openCheckin }: Omit<PageProps, 'isMobile'>) {
  const todayKrs = data.krs.filter(k => k.priority !== 'P2' && k.state !== 'done').slice(0, 3);
  return (
    <PageFrame padding="16px 16px 100px">
      {/* hero */}
      <div style={{ marginTop: 4 }}>
        <Eyebrow dot>{data.objectiveTag}</Eyebrow>
        <h1 style={{ fontSize: 28, lineHeight: 1.2, marginTop: 8, letterSpacing: '-0.025em' }}>
          离春招还有<br />
          <span className="op-num" style={{ color: 'var(--accent)' }}>142</span> <span style={{ color: 'var(--ink-3)' }}>天。</span>
        </h1>
        <p style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 10, lineHeight: 1.6 }}>
          {data.objective}
        </p>
      </div>

      {/* OKR ring card */}
      <div className="op-card op-card--ink" style={{ marginTop: 20, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Ring value={data.okrProgress} size={110} stroke={6} color="var(--accent)" track="rgba(255,255,255,.1)">
          <div style={{ textAlign: 'center' }}>
            <div className="op-bignum op-num" style={{ fontSize: 30, color: 'var(--on-dark)' }}>{data.okrProgress}<span style={{ fontSize: 14, color: 'rgba(255,255,255,.4)' }}>%</span></div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>OKR</div>
          </div>
        </Ring>
        <div style={{ flex: 1 }}>
          <div className="op-eyebrow" style={{ color: 'rgba(255,255,255,.5)' }}>{data.stage}</div>
          <div style={{ fontSize: 13, color: 'var(--on-dark)', marginTop: 8, lineHeight: 1.4, fontWeight: 600 }}>
            {data.krs.filter(k => k.state === 'done').length} / {data.krs.length} KR 已完成
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <Stat value={data.totalHours} unit="h" label="累计" size="sm" dark />
            <Stat value={data.streak} unit="天" label="连击" size="sm" dark />
          </div>
        </div>
      </div>

      {/* today tasks */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>今日 · 3 件事</h3>
          <button className="op-btn" onClick={() => setRoute('kr')} style={{ fontSize: 11, color: 'var(--ink-3)' }}>全部 →</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {todayKrs.map(kr => (
            <div key={kr.id} className="op-card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <PrioChip p={kr.priority} />
                <span style={{ fontSize: 10, color: 'var(--ink-3)' }}>{kr.tag} · {kr.updated}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35, marginBottom: 12 }}>{kr.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="op-num" style={{ fontSize: 13, fontWeight: 600, minWidth: 36 }}>{kr.progress}%</span>
                <div style={{ flex: 1 }}>
                  <Bar value={kr.progress} color="var(--ink)" height={3} />
                </div>
                <button className="op-btn op-pill op-pill--sm" onClick={openCheckin}
                  style={{ background: 'var(--ink)', color: 'var(--on-dark)' }}>
                  <span className="op-pill__dot" style={{ background: 'var(--on-dark)', color: 'var(--ink)' }}>+</span>
                  打卡
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* advice teaser */}
      <button className="op-btn op-card" onClick={() => setRoute('advice')}
        style={{ marginTop: 20, padding: 18, textAlign: 'left', width: '100%', display: 'block' }}>
        <Eyebrow dot>AI 建议 · 今天 14:23</Eyebrow>
        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, marginTop: 8, letterSpacing: '-0.01em' }}>
          "{data.advice.headline}"
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>3 条洞察</span>
          <Icon.arrow size={14} />
        </div>
      </button>

      {/* internship mini */}
      <div style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>本周匹配</h3>
          <button className="op-btn" onClick={() => setRoute('internship')} style={{ fontSize: 11, color: 'var(--ink-3)' }}>全部 →</button>
        </div>
        <div className="op-scroll-x" style={{ display: 'flex', gap: 10, paddingBottom: 4, marginLeft: -16, paddingLeft: 16, paddingRight: 16 }}>
          {OP_INTERNSHIPS.slice(0, 4).map(it => (
            <div key={it.id} className="op-card" style={{ minWidth: 200, padding: 14, flex: '0 0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: it.logoColor, color: 'white', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>{it.logo}</div>
                <div className="op-num op-bignum" style={{ fontSize: 18, color: 'var(--accent)' }}>{it.match}%</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{it.company}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>{it.role}</div>
              <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 8 }}>{it.city} · {it.salary}</div>
            </div>
          ))}
        </div>
      </div>
    </PageFrame>
  );
}
