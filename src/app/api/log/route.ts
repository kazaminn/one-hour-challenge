import { MILESTONES } from '@/lib/challenge';
import { addLog, getState } from '@/lib/db';
import { badRequest, isAdmin, isJson } from '@/lib/guard';

export async function POST(req: Request) {
  if (!isAdmin(req)) return badRequest('unauthorized', 401);
  if (!isJson(req)) return badRequest('content-type must be application/json', 415);

  const data = (await req.json().catch(() => ({}))) as {
    body?: unknown;
    milestone?: unknown;
  };
  const body = typeof data.body === 'string' ? data.body.trim().slice(0, 280) : '';
  const milestone = MILESTONES.some((m) => m.value === data.milestone)
    ? (data.milestone as string)
    : null;
  if (!body) return badRequest('body is required');

  await addLog(body, milestone);
  return Response.json(await getState());
}
