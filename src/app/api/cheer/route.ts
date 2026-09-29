import { addCheer, addQuickCheers, getState } from '@/lib/db';
import { guardWrite } from '@/lib/guard';
import { cheerSchema, parseBody } from '@/lib/schema';

export async function POST(req: Request) {
  const blocked = await guardWrite(req, 'cheer', 10);
  if (blocked) return blocked;

  const parsed = await parseBody(req, cheerSchema);
  if ('error' in parsed) return parsed.error;
  const { name, message, times } = parsed.data;

  let postedId: number | undefined;
  if (message) {
    postedId = await addCheer(name || '名無しさん', message);
  } else {
    await addQuickCheers(times);
  }
  // Fresh state, so the poster sees their cheer despite the cached GET.
  return Response.json({ ...(await getState()), postedId });
}
