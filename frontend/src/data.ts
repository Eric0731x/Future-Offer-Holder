// OFFER 预备役 — typed mock data

export interface KR {
  id: string;
  title: string;
  priority: 'P0' | 'P1' | 'P2';
  progress: number;
  semester: string;
  tag: string;
  updated: string;
  state: 'ok' | 'done' | 'warn' | 'bad';
}

export interface Advice {
  headline: string;
  good: string;
  think: string;
  next: string;
}

export interface PersonaData {
  name: string;
  avatar: string;
  school: string;
  major: string;
  stage: string;
  countdown: string;
  objective: string;
  objectiveTag: string;
  streak: number;
  totalHours: number;
  weekDelta: string;
  level: number;
  okrProgress: number;
  krs: KR[];
  advice: Advice;
}

export type Stage = 'fresh' | 'soph' | 'junior';

export const OP_DATA: Record<Stage, PersonaData> = {
  fresh: {
    name: '林浩',
    avatar: '浩',
    school: '北京邮电大学',
    major: '计算机科学与技术',
    stage: '大一上学期 · 第 8 周',
    countdown: '距离暑期实习投递 还有 412 天',
    objective: '搞清楚自己想做什么，夯实计算机基础',
    objectiveTag: '探索期',
    streak: 9,
    totalHours: 47,
    weekDelta: '+4 小时',
    level: 1,
    okrProgress: 28,
    krs: [
      { id: 'k1', title: 'C 语言基础与第一份代码作品', priority: 'P0', progress: 55, semester: '大一上', tag: '编程基础', updated: '2 小时前', state: 'ok' },
      { id: 'k2', title: '高等数学 + 线性代数同步课程', priority: 'P0', progress: 40, semester: '大一上', tag: '数理基础', updated: '昨天', state: 'ok' },
      { id: 'k3', title: '了解 5 个互联网岗位方向', priority: 'P1', progress: 60, semester: '大一上', tag: '职业探索', updated: '3 天前', state: 'ok' },
      { id: 'k4', title: '加入一个学生技术社团', priority: 'P1', progress: 100, semester: '大一上', tag: '人脉', updated: '完成', state: 'done' },
      { id: 'k5', title: '英语基础打底 (词汇 4000)', priority: 'P2', progress: 30, semester: '大一上', tag: '语言', updated: '一周前', state: 'warn' },
      { id: 'k6', title: '阅读《计算机系统漫游》', priority: 'P2', progress: 15, semester: '大一上', tag: '阅读', updated: '12 天前', state: 'bad' },
    ],
    advice: {
      headline: '探索比深耕更重要 —— 别急着选方向',
      good: '你这周完成了第一个 C 语言小项目，并主动旁听了字节的开放分享会，说明你正在做"广撒网"。',
      think: '5 个方向还只看了 2 个，距离目标用时也才占 30%。如果不在大一下学期前完成至少 4 个方向的"试水"，到大二会很被动。',
      next: '本周内试着用一个下午做完 BFE.dev 的前 3 道题、看一段产品经理的工作日 vlog —— 各方向 2 小时的"小尝试"，比读 10 本书有用。',
    },
  },

  soph: {
    name: '林浩',
    avatar: '浩',
    school: '北京邮电大学',
    major: '计算机科学与技术',
    stage: '大二上学期 · 第 8 周',
    countdown: '距离春招暑期实习 还有 142 天',
    objective: '大二结束前拿到字节跳动前端暑期实习 Offer',
    objectiveTag: '锚定 · 前端工程师',
    streak: 23,
    totalHours: 187,
    weekDelta: '+12 小时',
    level: 4,
    okrProgress: 47,
    krs: [
      { id: 'k1', title: 'JavaScript 深度掌握：闭包 / 原型 / 异步 / 事件循环', priority: 'P0', progress: 60, semester: '大二上', tag: '语言核心', updated: '今天', state: 'ok' },
      { id: 'k2', title: 'React 完整作品：状态管理 + 路由 + 部署', priority: 'P0', progress: 40, semester: '大二上', tag: '框架', updated: '今天', state: 'ok' },
      { id: 'k3', title: '前端算法 LeetCode 100 题（含手写）', priority: 'P1', progress: 35, semester: '大二上', tag: '算法', updated: '昨天', state: 'ok' },
      { id: 'k4', title: 'CSS 进阶：Flex / Grid / 响应式 / 动画', priority: 'P1', progress: 72, semester: '大二上', tag: '样式', updated: '3 天前', state: 'ok' },
      { id: 'k5', title: '前端工程化：Vite / Webpack / CI / 性能', priority: 'P2', progress: 22, semester: '大二上', tag: '工程化', updated: '一周前', state: 'warn' },
      { id: 'k6', title: 'TypeScript 上手与项目改造', priority: 'P2', progress: 18, semester: '大二上', tag: '语言扩展', updated: '12 天前', state: 'bad' },
      { id: 'k7', title: 'Git 协作流 + Linux 常用命令', priority: 'P2', progress: 95, semester: '大二上', tag: '协作', updated: '完成', state: 'done' },
    ],
    advice: {
      headline: 'JS 基础已经过半 —— 是时候用项目把它"消化"',
      good: '过去一周你花了 14 小时啃事件循环和 Promise 源码，并完整画出了一张执行栈流程图。这种深度学习是字节面试官最看重的痕迹。',
      think: '但你的 React 项目进度只有 40%，而 P0 要求"完整作品"。如果项目空缺，纯理论会被一道场景题打回原形。',
      next: '本周用 8 小时把 React 项目的状态管理（Zustand）和路由跑通，把你学的事件循环知识嵌进一个"实时数据看板"的 Demo —— 学的东西就能直接进简历。',
    },
  },

  junior: {
    name: '林浩',
    avatar: '浩',
    school: '北京邮电大学',
    major: '计算机科学与技术',
    stage: '大三下学期 · 第 8 周',
    countdown: '距离秋招正式批 还有 38 天',
    objective: '拿到字节跳动前端正式 Offer (SP 及以上)',
    objectiveTag: '冲刺 · 字节前端',
    streak: 47,
    totalHours: 612,
    weekDelta: '+22 小时',
    level: 12,
    okrProgress: 76,
    krs: [
      { id: 'k1', title: '系统设计：从 0 设计一个微前端架构', priority: 'P0', progress: 70, semester: '大三下', tag: '系统', updated: '今天', state: 'ok' },
      { id: 'k2', title: '完成 50 场模拟面试（含算法 + 项目 + 系统）', priority: 'P0', progress: 80, semester: '大三下', tag: '面试', updated: '今天', state: 'ok' },
      { id: 'k3', title: '简历沉淀：3 个完整项目 + 2 篇技术博客', priority: 'P0', progress: 90, semester: '大三下', tag: '简历', updated: '昨天', state: 'ok' },
      { id: 'k4', title: 'BFE.dev / GreatFrontEnd 全部 hard 题', priority: 'P1', progress: 65, semester: '大三下', tag: '面试题', updated: '3 天前', state: 'ok' },
      { id: 'k5', title: '深入一个开源项目 (React / Vite)', priority: 'P1', progress: 50, semester: '大三下', tag: '开源', updated: '一周前', state: 'warn' },
      { id: 'k6', title: '英语口语 Mock Interview 10 场', priority: 'P2', progress: 40, semester: '大三下', tag: '语言', updated: '5 天前', state: 'ok' },
    ],
    advice: {
      headline: '战场上别再补基础 —— 把"反向工程能力"立出来',
      good: '本周你在一次模拟面试里把"为什么 React 用 Fiber"答到了源码层级，并主动写了对照 Vue 的分析笔记。这一条上简历就是亮点。',
      think: '但你的开源贡献还停留在"读"，没有可被 GitHub 验证的 PR / Issue。字节面试官会问"你给社区贡献了什么"，目前没有可回答的实物。',
      next: '本周用 6 小时给 Vite 提一个 docs PR + 一个小 bug fix。不求大，求"有"。比再刷 20 道算法管用 10 倍。',
    },
  },
};

export interface Internship {
  id: string;
  company: string;
  role: string;
  city: string;
  logo: string;
  logoColor: string;
  match: number;
  salary: string;
  size: string;
  tags: string[];
  reason: string;
  krs: string[];
}

export const OP_INTERNSHIPS: Internship[] = [
  { id: 'i1', company: '字节跳动', role: '前端工程师 · 实习', city: '北京', logo: 'B', logoColor: '#0a0a0a', match: 92, salary: '350-450/天', size: '10000+', tags: ['React', 'TypeScript', '工程化'], reason: '你的 React 作品 + 算法进度匹配字节实习招聘"项目优先于算法"的偏好。', krs: ['k1', 'k2', 'k3'] },
  { id: 'i2', company: '美团', role: '前端开发 · 暑期实习', city: '北京', logo: '美', logoColor: '#facc15', match: 85, salary: '300-400/天', size: '10000+', tags: ['Vue', 'React', '性能'], reason: '美团对响应式与样式工程化要求高，你 CSS 进阶完成度 72% 是优势。', krs: ['k2', 'k4'] },
  { id: 'i3', company: '拼多多', role: '前端 · 实习', city: '上海', logo: '拼', logoColor: '#dc2626', match: 78, salary: '400-500/天', size: '10000+', tags: ['React', '算法'], reason: '拼多多算法门槛偏高，建议算法 KR 推到 60% 后再投。', krs: ['k3'] },
  { id: 'i4', company: '小红书', role: '前端工程师 · 暑期', city: '上海', logo: '红', logoColor: '#dc2626', match: 74, salary: '300-380/天', size: '5000-10000', tags: ['React Native', 'TypeScript'], reason: 'TS 完成度偏低 (18%)，但小红书重视产品感，你的设计敏感度可以加分。', krs: ['k2', 'k6'] },
  { id: 'i5', company: 'SHEIN', role: '前端开发 · 实习', city: '广州', logo: 'S', logoColor: '#0a0a0a', match: 68, salary: '280-350/天', size: '5000-10000', tags: ['Vue', '工程化'], reason: '岗位偏 Vue 栈，与你目前的 React 主攻方向匹配度一般。', krs: ['k5'] },
];

export interface HistoryAdvice {
  id: string;
  type: string;
  date: string;
  kr: string;
  summary: string;
  tone: 'good' | 'warn' | 'bad';
}

export const OP_HISTORY_ADVICE: HistoryAdvice[] = [
  { id: 'a1', type: '日建议', date: '今天 14:23', kr: 'JavaScript 深度掌握', summary: '事件循环的笔记很好 —— 下一步把它写进项目', tone: 'good' },
  { id: 'a2', type: '日建议', date: '昨天 21:01', kr: 'React 完整作品', summary: '别先搭脚手架 —— 先决定要解决的问题', tone: 'warn' },
  { id: 'a3', type: '周建议', date: '10 月 12 日', kr: '本周综合', summary: '14 小时 JS / 6 小时 React，配比偏理论。建议本周倒过来', tone: 'warn' },
  { id: 'a4', type: '日建议', date: '10 月 11 日', kr: '前端算法 LeetCode', summary: '链表已通畅 —— 树和图是面试高频，别绕过', tone: 'good' },
  { id: 'a5', type: '月建议', date: '10 月 1 日', kr: '九月综合', summary: '从「广撒网」转向「定向深耕」的拐点已到', tone: 'good' },
  { id: 'a6', type: 'KR 完成建议', date: '9 月 28 日', kr: 'Git 协作流', summary: 'Git 已基本掌握 —— 是时候参与一次开源贡献了', tone: 'good' },
];

export const OP_PROMPTS: string[] = [
  '今天的核心任务是什么？',
  '学到了什么新的概念？',
  '解决了什么问题？',
  '哪一句话你想发给一个月前的自己？',
  '今天的 30 分钟最高效在干嘛？',
];
