import { Badge, Card, Stack, Text, type Step } from '@kazamitte/kazamitte-ui';
import type { Log } from '@/lib/challenge';

const timeFormat = new Intl.DateTimeFormat('ja-JP', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Tokyo',
});

/** "+16分" from the start — easier to follow than a wall-clock time. */
function offset(iso: string, start: number) {
  const min = Math.round((new Date(iso).getTime() - start) / 60_000);
  return min <= 0 ? 'スタート' : `+${min}分`;
}

/**
 * The dev log told as a story: oldest first once the challenge is over,
 * newest first while it's live (so watchers see what just happened).
 */
export function Journey({
  logs,
  startAt,
  milestones,
  live,
}: {
  logs: Log[];
  startAt: string;
  milestones: Step[];
  live: boolean;
}) {
  const start = new Date(startAt).getTime();
  const ordered = live ? logs : [...logs].reverse();

  return (
    <Card.Root id="journey" className="scroll-mt-6">
      <Card.Header>
        <Card.Title>60分のあゆみ</Card.Title>
        <Card.Description>
          {live
            ? '作っている様子をリアルタイムで記録しています'
            : 'スタートから公開、そのあとの追加まで'}
        </Card.Description>
      </Card.Header>
      <Card.Body>
        {ordered.length === 0 ? (
          <Text tone="muted">まだ記録はありません</Text>
        ) : (
          <ol className="flex max-h-[32rem] flex-col overflow-y-auto pr-1">
            {ordered.map((log) => {
              const milestone = milestones.find((m) => m.value === log.milestone);
              return (
                <li
                  key={log.id}
                  className="relative border-l-2 border-(--r-base-border) py-2 pl-5 last:pb-0"
                >
                  <span
                    aria-hidden
                    className={
                      milestone
                        ? 'absolute top-3.5 -left-[7px] size-3 rounded-full bg-(--r-primary-bg-solid)'
                        : 'absolute top-3.5 -left-[5px] size-2 rounded-full bg-(--r-base-border)'
                    }
                  />
                  <Stack direction="row" gap={2} align="center" wrap>
                    <Text asChild textStyle="mono-16" tone="strong" weight="bold">
                      <span>{offset(log.createdAt, start)}</span>
                    </Text>
                    <Text asChild textStyle="mono-14" tone="muted">
                      <time dateTime={log.createdAt}>
                        {timeFormat.format(new Date(log.createdAt))}
                      </time>
                    </Text>
                    {milestone && (
                      <Badge tone="primary" size="sm">
                        {milestone.title}
                      </Badge>
                    )}
                  </Stack>
                  <Text>{log.body}</Text>
                </li>
              );
            })}
          </ol>
        )}
      </Card.Body>
    </Card.Root>
  );
}
