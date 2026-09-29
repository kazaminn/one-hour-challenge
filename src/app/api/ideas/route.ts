import { addIdea, getState, setIdeaStatus, voteIdea } from '@/lib/db';
import { badRequest, guardWrite, isAdmin, isJson } from '@/lib/guard';
import { ideaSchema, parseBody } from '@/lib/schema';

export async function POST(req: Request) {
  if (!isJson(req)) return badRequest('content-type must be application/json', 415);
  const parsed = await parseBody(req, ideaSchema);
  if ('error' in parsed) return parsed.error;
  const data = parsed.data;

  switch (data.action) {
    case 'add': {
      const blocked = await guardWrite(req, 'idea-add', 5);
      if (blocked) return blocked;
      await addIdea(data.title);
      break;
    }
    case 'vote': {
      // Per-idea bucket: one vote per idea per client per hour.
      const blocked =
        (await guardWrite(req, 'vote', 30)) ??
        (await guardWrite(req, `vote:${data.id}`, 1, 3600));
      if (blocked) return blocked;
      await voteIdea(data.id);
      break;
    }
    case 'status': {
      if (!isAdmin(req)) return badRequest('unauthorized', 401);
      await setIdeaStatus(data.id, data.status);
      break;
    }
  }

  return Response.json(await getState());
}
