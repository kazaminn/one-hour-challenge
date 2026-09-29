import { addLog, getState } from '@/lib/db';
import { badRequest, isAdmin, isJson } from '@/lib/guard';
import { logSchema, parseBody } from '@/lib/schema';

export async function POST(req: Request) {
  if (!isAdmin(req)) return badRequest('unauthorized', 401);
  if (!isJson(req)) return badRequest('content-type must be application/json', 415);

  const parsed = await parseBody(req, logSchema);
  if ('error' in parsed) return parsed.error;

  await addLog(parsed.data.body, parsed.data.milestone);
  return Response.json(await getState());
}
