import 'server-only';
import { z } from 'zod';
import { IDEA_STATUSES, MILESTONES, REACTIONS } from './challenge';

/**
 * User text: strip control characters and bidi overrides (U+202A–202E,
 * U+2066–2069), which can make a name or title render as something it isn't.
 * React already escapes HTML, so this is about spoofing, not script injection.
 */
const text = (max: number) =>
  z
    .string()
    .transform((s) =>
      s
        .replace(/[\u0000-\u0008\u000B-\u001F\u007F‎‏‪-‮⁦-⁩]/g, '')
        .trim(),
    )
    .pipe(z.string().max(max));

export const cheerSchema = z.object({
  name: text(30).optional(),
  message: text(140).optional(),
});

export const logSchema = z.object({
  body: text(280).pipe(z.string().min(1)),
  milestone: z
    .enum(MILESTONES.map((m) => m.value) as [string, ...string[]])
    .nullish()
    .transform((v) => v ?? null),
});

const ideaId = z.number().int().positive();

export const ideaSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('add'), title: text(60).pipe(z.string().min(1)) }),
  z.object({ action: z.literal('vote'), id: ideaId }),
  z.object({ action: z.literal('status'), id: ideaId, status: z.enum(IDEA_STATUSES) }),
]);

/** Parses a JSON body with `schema`; returns the data, or a 400 response. */
export async function parseBody<T extends z.ZodType>(
  req: Request,
  schema: T,
): Promise<{ data: z.output<T> } | { error: Response }> {
  // Bodies here are tiny; refuse anything big before reading it.
  if (Number(req.headers.get('content-length') ?? 0) > 4096) {
    return { error: Response.json({ error: 'payload too large' }, { status: 413 }) };
  }
  const json: unknown = await req.json().catch(() => undefined);
  const result = schema.safeParse(json);
  if (!result.success) {
    return {
      error: Response.json(
        { error: 'invalid body', issues: z.flattenError(result.error).fieldErrors },
        { status: 400 },
      ),
    };
  }
  return { data: result.data };
}

export const reactSchema = z.object({ emoji: z.enum(REACTIONS) });
