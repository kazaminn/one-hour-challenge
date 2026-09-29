import { addReaction, getState } from '@/lib/db';
import { guardWrite } from '@/lib/guard';
import { parseBody, reactSchema } from '@/lib/schema';

export async function POST(req: Request) {
  const blocked = await guardWrite(req, 'react', 30);
  if (blocked) return blocked;

  const parsed = await parseBody(req, reactSchema);
  if ('error' in parsed) return parsed.error;

  await addReaction(parsed.data.emoji, parsed.data.times);
  return Response.json(await getState());
}
