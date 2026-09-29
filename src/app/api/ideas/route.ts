import { IDEA_STATUSES, type IdeaStatus } from '@/lib/challenge';
import { addIdea, getState, setIdeaStatus, voteIdea } from '@/lib/db';
import { badRequest, guardWrite, isAdmin, isJson } from '@/lib/guard';

type Body = {
  action?: unknown;
  title?: unknown;
  id?: unknown;
  status?: unknown;
};

export async function POST(req: Request) {
  if (!isJson(req)) return badRequest('content-type must be application/json', 415);
  const data = (await req.json().catch(() => ({}))) as Body;
  const id = Number(data.id);

  switch (data.action) {
    case 'add': {
      const blocked = await guardWrite(req, 'idea-add', 5);
      if (blocked) return blocked;
      const title = typeof data.title === 'string' ? data.title.trim().slice(0, 60) : '';
      if (!title) return badRequest('title is required');
      await addIdea(title);
      break;
    }
    case 'vote': {
      // Per-idea bucket: one vote per idea per client per hour.
      if (!Number.isInteger(id)) return badRequest('bad id');
      const blocked =
        (await guardWrite(req, 'vote', 30)) ?? (await guardWrite(req, `vote:${id}`, 1, 3600));
      if (blocked) return blocked;
      await voteIdea(id);
      break;
    }
    case 'status': {
      if (!isAdmin(req)) return badRequest('unauthorized', 401);
      if (!Number.isInteger(id) || !IDEA_STATUSES.includes(data.status as IdeaStatus)) {
        return badRequest('bad request');
      }
      await setIdeaStatus(id, data.status as IdeaStatus);
      break;
    }
    default:
      return badRequest('unknown action');
  }

  return Response.json(await getState());
}
