import { addCheer, getState } from '@/lib/db';
import { guardWrite } from '@/lib/guard';

export async function POST(req: Request) {
  const blocked = await guardWrite(req, 'cheer', 10);
  if (blocked) return blocked;

  const data = (await req.json().catch(() => ({}))) as {
    name?: unknown;
    message?: unknown;
  };
  const name = typeof data.name === 'string' ? data.name.trim().slice(0, 30) : '';
  const message =
    typeof data.message === 'string' ? data.message.trim().slice(0, 140) : '';

  await addCheer(name || '名無しさん', message || '🔥');
  // Fresh state, so the poster sees their cheer despite the cached GET.
  return Response.json(await getState());
}
