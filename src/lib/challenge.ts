import type { Step } from '@kazamitte/kazamitte-ui';

export const CHALLENGE = {
  title: '60分で、Webアプリを作って公開する',
  startAt: process.env.NEXT_PUBLIC_CHALLENGE_START ?? '2026-09-29T13:20:00+09:00',
  endAt: process.env.NEXT_PUBLIC_CHALLENGE_END ?? '2026-09-29T14:20:00+09:00',
};

export const MILESTONES: Step[] = [
  { value: 'idea', title: 'アイデア決定', description: 'このページを作る' },
  { value: 'setup', title: '準備', description: '開発の土台づくり' },
  { value: 'api', title: 'データ保存', description: '応援や記録を保存する仕組み' },
  { value: 'ui', title: '画面づくり', description: 'このページの見た目' },
  { value: 'deploy', title: '公開', description: '誰でも見られる状態に' },
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
    return completed === total ? '完走！お疲れさまでした 🎉' : 'タイムアップ！でも公開はできた！';
  }
  if (min > 60) return 'まもなく開始。準備はいい？';
  if (min <= 1) return 'ラスト1分！！手を止めるな！！';
  if (min <= 5) return `残り${min}分！もう新機能は入れるな、デプロイしろ！`;
  if (min <= 10) return `残り${min}分！まだ間に合う！たぶん！`;
  if (completed === total) return `もう完走してる…残り${min}分で何を足す気だ？`;
  if (min <= 30) return `残り${min}分。そろそろ本気出そうか`;
  return `残り${min}分。まだ余裕…と思ってるうちが危ない`;
}
