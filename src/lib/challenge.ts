import type { Step } from '@kazamitte/kazamitte-ui';

export const CHALLENGE = {
  title: '60分でアプリをデプロイするチャレンジ',
  startAt: process.env.NEXT_PUBLIC_CHALLENGE_START ?? '2026-09-29T13:20:00+09:00',
  endAt: process.env.NEXT_PUBLIC_CHALLENGE_END ?? '2026-09-29T14:20:00+09:00',
};

export const MILESTONES: Step[] = [
  { value: 'idea', title: 'アイデア決定', description: 'このページを作る' },
  { value: 'setup', title: 'セットアップ', description: 'Next.js + デザインシステム' },
  { value: 'api', title: 'API', description: 'Turso に保存' },
  { value: 'ui', title: 'UI', description: 'このダッシュボード' },
  { value: 'deploy', title: 'デプロイ', description: 'Vercel に公開' },
];

export type Log = {
  id: number;
  body: string;
  milestone: string | null;
  createdAt: string;
};

export type Cheer = {
  id: number;
  name: string;
  message: string;
  createdAt: string;
};

export const IDEA_STATUSES = ['open', 'adopted', 'done', 'rejected'] as const;
export type IdeaStatus = (typeof IDEA_STATUSES)[number];

export type Idea = {
  id: number;
  title: string;
  votes: number;
  status: IdeaStatus;
};

export const REACTIONS = ['👏', '🔥', '😂', '🚀'] as const;
export type Reaction = (typeof REACTIONS)[number];

export type ChallengeState = {
  reactions: Partial<Record<Reaction, number>>;
  ideas: Idea[];
  logs: Log[];
  cheers: Cheer[];
  cheerCount: number;
};

/** Header one-liner that gets pushier as the deadline approaches. */
export function taunt(remainingMs: number, completed: number, total: number): string {
  const min = Math.ceil(remainingMs / 60_000);
  if (remainingMs <= 0) {
    const over = Math.floor(-remainingMs / 60_000);
    if (over < 1) {
      return completed === total ? '完走！…と見せかけて EXTENDED ROUND 突入' : 'タイムアップ！でも公開はできた！';
    }
    if (over < 10) return `延長${over}分目。60分チャレンジの定義が揺らいでいる`;
    if (over < 30) return `延長${over}分目。もはや別のチャレンジ`;
    if (over < 60) return `延長${over}分目。誰か止めて`;
    return `延長${over}分目。これはもう趣味`;
  }
  if (min > 60) return 'まもなく開始。準備はいい？';
  if (min <= 1) return 'ラスト1分！！手を止めるな！！';
  if (min <= 5) return `残り${min}分！もう新機能は入れるな、デプロイしろ！`;
  if (min <= 10) return `残り${min}分！まだ間に合う！たぶん！`;
  if (completed === total) return `もう完走してる…残り${min}分で何を足す気だ？`;
  if (min <= 30) return `残り${min}分。そろそろ本気出そうか`;
  return `残り${min}分。まだ余裕…と思ってるうちが危ない`;
}
