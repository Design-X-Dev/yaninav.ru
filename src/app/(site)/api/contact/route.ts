import { getPayload } from 'payload';
import config from '@payload-config';

import { consumeRateLimit, parseCooldownMs } from '@/lib/rateLimit';
import { siteUrlNormalized } from '@/lib/seoHelpers';

export const runtime = 'nodejs';

const MAX_SUBMISSION_FIELDS = 50;
const MAX_FIELD_VALUE_LENGTH = 5_000;

type SubmissionRow = { field: string; value: string };

type ContactBody = {
  form?: unknown;
  submissionData?: unknown;
  hp?: unknown;
};

function jsonError(status: number, error: string): Response {
  return Response.json({ ok: false, error }, { status });
}

function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return 'unknown';
}

function allowedHosts(): Set<string> {
  const hosts = new Set<string>();
  try {
    hosts.add(new URL(siteUrlNormalized()).host);
  } catch {
    /* ignore invalid site URL */
  }

  if (process.env.NODE_ENV !== 'production') {
    hosts.add('localhost');
    hosts.add('127.0.0.1');
  }

  return hosts;
}

function headerHost(value: string | null): string | null {
  if (!value) return null;
  try {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return new URL(value).host;
    }
    return new URL(`https://${value}`).host;
  } catch {
    return null;
  }
}

function isAllowedOrigin(req: Request): boolean {
  const allowed = allowedHosts();
  const originHost = headerHost(req.headers.get('origin'));
  const refererHost = headerHost(req.headers.get('referer'));

  if (originHost && allowed.has(originHost)) return true;
  if (refererHost && allowed.has(refererHost)) return true;
  return false;
}

function parseSubmissionData(raw: unknown): SubmissionRow[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_SUBMISSION_FIELDS) {
    return null;
  }

  const rows: SubmissionRow[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') return null;
    const row = item as Record<string, unknown>;
    if (typeof row.field !== 'string' || !row.field.trim()) return null;
    if (typeof row.value !== 'string') return null;
    if (row.value.length > MAX_FIELD_VALUE_LENGTH) return null;
    rows.push({ field: row.field.trim(), value: row.value });
  }

  return rows;
}

function parseFormId(raw: unknown): string | number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  return null;
}

function submissionFieldValue(rows: SubmissionRow[], field: string): string {
  return rows.find((r) => r.field === field)?.value.trim() ?? '';
}

export async function POST(req: Request): Promise<Response> {
  if (!isAllowedOrigin(req)) {
    return jsonError(403, 'Forbidden');
  }

  let body: ContactBody;
  try {
    body = (await req.json()) as ContactBody;
  } catch {
    return jsonError(400, 'Invalid JSON');
  }

  const hp = typeof body.hp === 'string' ? body.hp.trim() : '';
  if (hp) {
    return new Response(null, { status: 204 });
  }

  const cooldownMs = parseCooldownMs(process.env.CONTACT_FORM_COOLDOWN_MS);
  const ip = clientIp(req);
  if (!consumeRateLimit(`contact:${ip}`, cooldownMs)) {
    return jsonError(429, 'Too many requests. Please try again later.');
  }

  const formId = parseFormId(body.form);
  const submissionData = parseSubmissionData(body.submissionData);
  if (formId == null || submissionData == null) {
    return jsonError(400, 'Invalid form data');
  }

  try {
    const payload = await getPayload({ config });
    await payload.create({
      collection: 'form-submissions',
      overrideAccess: true,
      data: {
        form: formId,
        submissionData,
        name: submissionFieldValue(submissionData, 'name'),
        email: submissionFieldValue(submissionData, 'email'),
        phone: submissionFieldValue(submissionData, 'phone'),
        message: submissionFieldValue(submissionData, 'message'),
      },
    });
  } catch (err) {
    console.error('[api/contact] submission failed', err instanceof Error ? err.name : 'Error');
    return jsonError(500, 'Failed to submit form');
  }

  return new Response(null, { status: 204 });
}
