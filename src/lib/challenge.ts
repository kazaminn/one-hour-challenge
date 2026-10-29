import type { Step } from '@kazamitte/kazamitte-ui';

export type Round = {
  round: number;
  title: string;
  startAt: string;
  endAt: string;
  milestones: Step[];
  /** Hub lead copy, before/while live and after the hour is up. */
  lead: { live: string; finished: string };
  /** This round's app, embedded as a demo on the hub. Round 1 has none: the hub was the app. */
  appPath?: string;
};

/**
 * Every round of the series, oldest first. The last one is the current round:
 * it owns `/` and is the only one that accepts writes. Earlier rounds are
 * frozen and readable at `/archive/<round>/`.
 */
export const ROUNDS: Round[] = [
  {
    round: 1,
    title: '60分で、Webアプリを作って公開する',
    startAt: '2026-09-29T13:20:00+09:00',
    endAt: '2026-09-29T14:20:00+09:00',
    milestones: [
      { value: 'idea', title: 'アイデア決定', description: 'このページを作る' },
      { value: 'setup', title: '準備', description: '開発の土台づくり' },
      { value: 'api', title: 'データ保存', description: '応援や記録を保存する仕組み' },
      { value: 'ui', title: '画面づくり', description: 'このページの見た目' },
      { value: 'deploy', title: '公開', description: '誰でも見られる状態に' },
    ],
    lead: {
      live: 'エンジニアが AI（Claude）と一緒に、ゼロからこのページを作っています。いま見ているこのページが、まさに作っている最中のアプリです。',
      finished:
        'エンジニアが AI（Claude）と一緒に、ゼロからこのページを60分で作って公開しました。いま見ているこのページが、その完成品です。',
    },
  },
  {
    round: 2,
    title: '60分で、餃子クリッカーを作って公開する',
    // TODO: 本番の日時が決まったら書き換える（仮の値）
    startAt: '2026-10-29T13:31:00+09:00',
    endAt: '2026-10-29T14:31:00+09:00',
    milestones: [
      { value: 'setup', title: '準備', description: '画面に餃子を出す' },
      { value: 'click', title: '餃子を焼く', description: 'クリックで餃子が増える' },
      { value: 'chef', title: '餃子シェフ', description: '雇うと自動で焼いてくれる' },
      { value: 'idle', title: '放置', description: '閉じて戻っても増えている' },
      { value: 'deploy', title: '公開', description: '誰でも遊べる状態に' },
    ],
    lead: {
      live: 'エンジニアが AI（Claude）と一緒に、餃子クリッカーをゼロから作っています。下のデモは、いま作っている最中のゲームです。',
      finished:
        'エンジニアが AI（Claude）と一緒に、餃子クリッカーを60分で作って公開しました。下のデモで遊べます。',
    },
    appPath: '/gyoza',
  },
];

export const CURRENT_ROUND = ROUNDS[ROUNDS.length - 1]!;

export function getRound(round: number): Round | undefined {
  return ROUNDS.find((r) => r.round === round);
}

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
