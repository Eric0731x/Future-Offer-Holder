import React, { useState, useEffect } from 'react';
import { Icon, Bar, Pill, Eyebrow, PrioChip } from '../components/ui';
import { OP_PROMPTS } from '../data';
import type { PageProps, MoodItem, CheckinResult } from '../types';

const MOODS: MoodItem[] = [
  { id: 'smooth', emoji: '😀', label: '顺利', submit: '记录这美好的一天' },
  { id: 'stuck',  emoji: '😤', label: '卡壳', submit: '卡住了？提交后看建议' },
  { id: 'fly',    emoji: '⚡', label: '高效', submit: '今天就是 GOAT' },
  { id: 'tired',  emoji: '😴', label: '疲惫', submit: '辛苦了，先记录' },
  { id: 'hype',   emoji: '🚀', label: '兴奋', submit: '记下这股劲！' },
];

function hourEmoji(h: number): string {
  if (h <= 1) return '😞';
  if (h <= 3) return '🙂';
  if (h <= 6) return '😊';
  return '🤩';
}

interface CheckinPageProps extends PageProps {
  openSuccess: (result: CheckinResult) => void;
}

export default function CheckinPage({ data, isMobile, openSuccess }: CheckinPageProps) {
  const [mode, setMode] = useState('daily');
  const [krId, setKrId] = useState(data.krs[0].id);
  const [hours, setHours] = useState(2);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [problem, setProblem] = useState('');
  const [showProblem, setShowProblem] = useState(false);
  const [evidence, setEvidence] = useState<string[]>([]);
  const [mood, setMood] = useState('smooth');
  const [stars, setStars] = useState(3);
  const [promptIdx, setPromptIdx] = useState(0);
  const [polishing, setPolishing] = useState(false);

  const selectedKr = data.krs.find(k => k.id === krId) || data.krs[0];
  const selectedMood = MOODS.find(m => m.id === mood) || MOODS[0];
  const newProgress = Math.min(100, selectedKr.progress + progress);

  useEffect(() => {
    const id = setInterval(() => setPromptIdx(i => (i + 1) % OP_PROMPTS.length), 4000);
    return () => clearInterval(id);
  }, []);

  const onPolish = () => {
    if (!text.trim()) return;
    setPolishing(true);
    setTimeout(() => {
      const polished = text + (text.endsWith('。') ? '' : '。') + '\n\n[AI 整理] 核心收获：' + text.split(/[，,。.]/)[0] + '；下一步：把这部分知识写进 React 项目作为练习。';
      setText(polished);
      setPolishing(false);
    }, 900);
  };

  const onSubmit = () => {
    openSuccess({ kr: selectedKr, hours, progress, newProgress, mood: selectedMood, stars, text });
  };

  return (
    <div className="op-scroll op-fade" style={{ flex: 1, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Mode tab */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 4, background: 'var(--bg)',
        padding: isMobile ? '8px 16px 8px' : '20px 40px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: 4, background: 'var(--surface-sunk)', borderRadius: 999 }}>
          {[
            { id: 'daily', label: '每日打卡' },
            { id: 'session', label: '每次学习后' },
          ].map(t => (
            <button key={t.id} className="op-btn" onClick={() => setMode(t.id)}
              style={{
                padding: '7px 14px', borderRadius: 999, fontSize: 12,
                background: mode === t.id ? 'var(--surface)' : 'transparent',
                color: mode === t.id ? 'var(--ink)' : 'var(--ink-2)',
                fontWeight: mode === t.id ? 600 : 500,
                boxShadow: mode === t.id ? 'var(--shadow-1)' : 'none',
              }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}</div>
      </div>

      <div style={{ padding: isMobile ? '8px 16px 140px' : '8px 40px 140px', maxWidth: isMobile ? '100%' : 880, width: '100%', margin: '0 auto' }}>

        {/* Hero header */}
        <div style={{ paddingBottom: 24 }}>
          <Eyebrow dot>{mode === 'daily' ? '每日打卡' : '本次学习'} · {selectedKr.tag}</Eyebrow>
          <h1 style={{ fontSize: isMobile ? 28 : 44, lineHeight: 1.1, marginTop: 10, letterSpacing: '-0.03em' }}>
            今天，把哪个 KR<br />往前推一格？
          </h1>
        </div>

        {/* Step 1: KR selection */}
        <Section number="01" title="选一个 KR" hint="点击下方任意一张卡片">
          <div className="op-scroll-x" style={{
            display: 'flex', gap: 12, paddingBottom: 8,
            marginLeft: isMobile ? -16 : -40, paddingLeft: isMobile ? 16 : 40, paddingRight: isMobile ? 16 : 40,
          }}>
            {data.krs.filter(k => k.state !== 'done').map(kr => {
              const active = kr.id === krId;
              return (
                <button key={kr.id} className="op-btn" onClick={() => setKrId(kr.id)}
                  style={{
                    flex: '0 0 auto', width: 240, padding: 16, textAlign: 'left',
                    background: active ? 'var(--ink)' : 'var(--surface)',
                    color: active ? 'var(--on-dark)' : 'var(--ink)',
                    border: `1px solid ${active ? 'var(--ink)' : 'var(--hairline)'}`,
                    borderRadius: 'var(--r-lg)',
                    transition: 'all 0.15s',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <PrioChip p={kr.priority} />
                    {active && <Icon.check size={16} />}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35, minHeight: 36 }}>{kr.title}</div>
                  <div style={{ marginTop: 14, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span className="op-num op-bignum" style={{ fontSize: 22 }}>{kr.progress}%</span>
                    <span style={{ fontSize: 10, color: active ? 'rgba(255,255,255,.55)' : 'var(--ink-3)' }}>{kr.tag}</span>
                  </div>
                  <Bar value={kr.progress} color={active ? 'var(--on-dark)' : 'var(--ink)'} track={active ? 'rgba(255,255,255,.15)' : 'var(--hairline)'} height={3} />
                </button>
              );
            })}
          </div>
        </Section>

        {/* Step 2: Hours */}
        <Section number="02" title="今天投入多久？" hint="0.5h 步长">
          <div className="op-card" style={{ padding: 28, display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ fontSize: 48, lineHeight: 1, flexShrink: 0 }}>{hourEmoji(hours)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
                <span className="op-num op-bignum" style={{ fontSize: 44 }}>{hours.toFixed(1)}</span>
                <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>小时</span>
              </div>
              <input type="range" min="0.5" max="12" step="0.5" value={hours} onChange={e => setHours(+e.target.value)}
                style={{ width: '100%', accentColor: 'var(--ink)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--ink-3)', marginTop: 6 }}>
                <span>0.5</span><span>3</span><span>6</span><span>9</span><span>12</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Step 3: What you did */}
        <Section number="03" title="今天做了什么？" hint="必填 · AI 可帮你润色">
          <div className="op-card" style={{ padding: 0, overflow: 'hidden' }}>
            <textarea
              value={text} onChange={e => setText(e.target.value)} maxLength={500}
              placeholder={OP_PROMPTS[promptIdx]}
              style={{
                width: '100%', padding: 20, fontSize: 14, lineHeight: 1.6,
                border: 'none', outline: 'none', resize: 'vertical', minHeight: 120,
                background: 'transparent', color: 'var(--ink)', fontFamily: 'var(--font-body)',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 14px', borderTop: '1px solid var(--hairline)' }}>
              <button className="op-btn" onClick={onPolish} disabled={!text.trim() || polishing}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
                  padding: '6px 12px', borderRadius: 999, background: 'var(--surface-sunk)',
                  color: text.trim() ? 'var(--ink)' : 'var(--ink-3)', fontWeight: 500,
                  opacity: polishing ? 0.6 : 1,
                }}>
                <Icon.sparkles size={13} />
                {polishing ? '正在整理...' : '帮我整理'}
              </button>
              <span className="op-num" style={{ fontSize: 11, color: text.length > 450 ? 'var(--warn)' : 'var(--ink-3)' }}>
                {text.length} / 500
              </span>
            </div>
          </div>
        </Section>

        {/* Step 4: Progress */}
        <Section number="04" title="把进度往前推几格？" hint="选填">
          <div className="op-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span className="op-num" style={{ fontSize: 13, color: 'var(--ink-3)' }}>当前 {selectedKr.progress}%</span>
                <Icon.arrow size={12} />
                <span className="op-num op-bignum" style={{ fontSize: 24, color: newProgress >= 100 ? 'var(--good)' : 'var(--ink)' }}>{newProgress}%</span>
                {progress > 0 && <span style={{ fontSize: 11, color: 'var(--good)', fontWeight: 600 }}>+{progress}%</span>}
              </div>
              {newProgress >= 100 && (
                <span className="op-chip op-chip--accent">🏁 完成 · 需上传证据</span>
              )}
            </div>
            <input type="range" min="0" max={Math.max(20, 100 - selectedKr.progress)} step="1" value={progress} onChange={e => setProgress(+e.target.value)}
              style={{ width: '100%', accentColor: newProgress >= 100 ? 'var(--good)' : 'var(--ink)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>
              <span>+0%</span><span>+{Math.max(20, 100 - selectedKr.progress)}%</span>
            </div>
          </div>
        </Section>

        {/* Step 5: Problem */}
        <Section number="05" title="遇到了什么问题？" hint="选填 · 说出来 AI 才能帮你">
          {!showProblem ? (
            <button className="op-btn" onClick={() => setShowProblem(true)}
              style={{
                width: '100%', padding: 16, border: '1px dashed var(--hairline-strong)',
                borderRadius: 'var(--r-lg)', color: 'var(--ink-2)', fontSize: 13, textAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
              <Icon.plus size={14} /> 我遇到了问题
            </button>
          ) : (
            <div className="op-card" style={{ padding: 0, overflow: 'hidden' }}>
              <textarea value={problem} onChange={e => setProblem(e.target.value)}
                placeholder="卡在哪里了？描述越具体，AI 建议越有用。"
                style={{
                  width: '100%', padding: 16, fontSize: 13, lineHeight: 1.6,
                  border: 'none', outline: 'none', resize: 'vertical', minHeight: 80,
                  background: 'transparent', color: 'var(--ink)', fontFamily: 'var(--font-body)',
                }}
              />
            </div>
          )}
        </Section>

        {/* Step 6: Evidence */}
        <Section number="06" title="上传证据" hint={newProgress >= 100 ? '必填 · 100% 完成需要证据' : '选填'}>
          <div style={{
            border: `1px dashed ${newProgress >= 100 && evidence.length === 0 ? 'var(--accent)' : 'var(--hairline-strong)'}`,
            borderRadius: 'var(--r-lg)', padding: 20, textAlign: 'center',
            background: newProgress >= 100 && evidence.length === 0 ? 'var(--accent-soft)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap',
          }}>
            {evidence.length === 0 ? (
              <>
                <Icon.upload size={20} />
                <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                  拖拽文件 或 <button className="op-btn" onClick={() => setEvidence(['demo.png', 'note.pdf'])} style={{ textDecoration: 'underline', color: 'var(--ink)' }}>点击上传</button>
                </div>
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>图片 / PDF / 链接 · 最多 5 个</span>
              </>
            ) : (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', width: '100%' }}>
                {evidence.map((ev, i) => (
                  <div key={i} className="op-chip" style={{ padding: '6px 10px' }}>
                    <Icon.doc size={12} /> {ev}
                    <button className="op-btn" onClick={() => setEvidence(evidence.filter((_, j) => j !== i))} style={{ marginLeft: 4, color: 'var(--ink-3)' }}>
                      <Icon.x size={11} />
                    </button>
                  </div>
                ))}
                <button onClick={() => setEvidence([...evidence, 'extra-' + (evidence.length + 1) + '.png'])}
                  className="op-btn op-chip" style={{ padding: '6px 10px', cursor: 'pointer' }}>
                  <Icon.plus size={12} /> 添加
                </button>
              </div>
            )}
          </div>
        </Section>

        {/* Step 7: Mood + stars */}
        <Section number="07" title="状态心情 · 自评" hint="一秒交互">
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr', gap: 12 }}>
            <div className="op-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 12 }}>心情</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                {MOODS.map(m => {
                  const active = mood === m.id;
                  return (
                    <button key={m.id} className="op-btn" onClick={() => setMood(m.id)}
                      style={{
                        flex: 1, padding: '10px 6px', borderRadius: 'var(--r-md)',
                        background: active ? 'var(--ink)' : 'var(--surface-sunk)',
                        color: active ? 'var(--on-dark)' : 'var(--ink)',
                        transform: active ? 'scale(1.06)' : 'scale(1)',
                        transition: 'all 0.15s cubic-bezier(.2,.7,.2,1.4)',
                      }}>
                      <div style={{ fontSize: 22, lineHeight: 1 }}>{m.emoji}</div>
                      <div style={{ fontSize: 10, marginTop: 4, opacity: active ? 1 : 0.7 }}>{m.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="op-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>自评 · 整体满意度</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} className="op-btn" onClick={() => setStars(n)}
                    style={{ color: n <= stars ? 'var(--accent)' : 'var(--ink-4)', transition: 'transform 0.1s', transform: n === stars ? 'scale(1.1)' : 'scale(1)' }}>
                    <Icon.star size={28} fill={n <= stars ? 'currentColor' : 'none'} />
                  </button>
                ))}
                <span className="op-num" style={{ fontSize: 16, fontWeight: 600, marginLeft: 8, color: 'var(--ink-2)' }}>{stars}.0</span>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Sticky submit */}
      <div className="op-glass" style={{
        position: 'absolute', left: 0, right: 0, bottom: isMobile ? 88 : 0,
        padding: isMobile ? '12px 16px' : '14px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '0.5px solid var(--hairline-strong)',
        zIndex: 5, gap: 12,
      }}>
        <div style={{ fontSize: 11, color: 'var(--ink-2)', flex: '1 1 auto', minWidth: 0 }}>
          <span style={{ display: isMobile ? 'none' : 'inline' }}>{selectedKr.title} · </span>
          <span className="op-num">{hours.toFixed(1)}h</span> · {selectedMood.emoji} {selectedMood.label} · {progress > 0 ? `+${progress}%` : '进度不变'}
        </div>
        <Pill variant="ink" size="lg" dot={<Icon.check size={14} />} onClick={onSubmit}>
          {selectedMood.submit}
        </Pill>
      </div>
    </div>
  );
}

// ── Section wrapper ──────────────────────────────────────
function Section({ number, title, hint, children }: { number: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
        <span className="op-eyebrow op-num" style={{ color: 'var(--ink-3)' }}>{number}</span>
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h3>
        {hint && <span style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 'auto' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ── CheckinSuccess overlay ────────────────────────────────
interface CheckinSuccessProps {
  result: CheckinResult;
  data: { streak: number; totalHours: number };
  onClose: () => void;
  onViewAdvice: () => void;
}
export function CheckinSuccess({ result, data, onClose, onViewAdvice }: CheckinSuccessProps) {
  const [showAdvice, setShowAdvice] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setShowAdvice(true), 1400);
    return () => clearTimeout(id);
  }, []);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(10,10,10,0.85)',
      WebkitBackdropFilter: 'blur(24px)', backdropFilter: 'blur(24px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'op-fade-up 0.3s both',
    }}>
      <div style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 16, color: 'var(--on-dark)' }}>
        {/* big checkmark */}
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{
            width: 88, height: 88, margin: '0 auto', borderRadius: '50%',
            background: 'var(--accent)', display: 'grid', placeItems: 'center', color: 'white',
            animation: 'op-pop 0.5s cubic-bezier(.2,.7,.2,1.4) both',
          }}>
            <Icon.check size={48} sw={2.2} />
          </div>
          <div className="op-eyebrow" style={{ color: 'rgba(255,255,255,.4)', marginTop: 18 }}>打卡成功</div>
          <h2 style={{ color: 'var(--on-dark)', fontSize: 36, marginTop: 6, letterSpacing: '-0.025em' }}>
            离 Offer 又近了一格。
          </h2>
        </div>

        {/* stat changes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { label: '连续打卡', value: `${data.streak + 1}`, delta: '+1 天' },
            { label: 'KR 推进', value: `${result.newProgress}%`, delta: `+${result.progress}%` },
            { label: '累计投入', value: `${(data.totalHours + result.hours).toFixed(0)}h`, delta: `+${result.hours.toFixed(1)}h` },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,.06)', borderRadius: 'var(--r-md)', padding: 14, textAlign: 'center',
              border: '0.5px solid rgba(255,255,255,.08)',
            }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              <div className="op-bignum op-num" style={{ fontSize: 28, marginTop: 6, color: 'var(--on-dark)' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 2, fontWeight: 600 }}>{s.delta}</div>
            </div>
          ))}
        </div>

        {/* AI advice card — slides in */}
        {showAdvice && (
          <div className="op-fade" style={{
            background: 'var(--surface)', color: 'var(--ink)',
            borderRadius: 'var(--r-lg)', padding: 20, marginTop: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Icon.sparkles size={14} />
              <span className="op-eyebrow">AI 即时建议 · {result.kr.title.slice(0, 16)}…</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0, fontWeight: 500 }}>
              {result.mood.id === 'stuck'
                ? '卡壳是好事 —— 把刚才写的"卡点"贴进飞书云文档，AI 已经为你定位了相关学习路径文档的章节 3.2。'
                : result.mood.id === 'fly'
                ? '高效的一天值得记录。把这个状态写进你的"个人手册"，下次低谷时翻一下。'
                : '今天的投入很扎实。建议本周内把这部分写成一段 60 秒的口述，对面试官的"自我介绍"环节有用。'}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 8, justifyContent: 'center' }}>
          <Pill variant="ghost" size="lg" style={{ color: 'var(--on-dark)', borderColor: 'rgba(255,255,255,.2)' }} onClick={onClose}>关闭</Pill>
          <Pill variant="accent" size="lg" dot={<Icon.arrow size={14} />} onClick={onViewAdvice}>查看完整建议</Pill>
        </div>
      </div>
    </div>
  );
}
