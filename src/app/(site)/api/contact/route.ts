import { getPayload } from 'payload';
import config from '@payload-config';

import { consumeRateLimit, parseCooldownMs } from '@/lib/rateLimit';
import { siteUrlNormalized } from '@/lib/seoHelpers';

export const runtime = 'nodejs';

const MAX_SUBMISSION_FIELDS = 50;
const MAX_FIELD_VALUE_LENGTH = 5_000;
/** Reject bodies larger than this before JSON.parse (DoS / memory). */
const MAX_BODY_BYTES = 64 * 1024;

type SubmissionRow = { field: string; value: string };

type ContactBody = {
  form?: unknown;
  submissionData?: unknown;
  hp?: unknown;
};

function jsonError(status: number, error: string): Response {
  return Response.json({ ok: false, error }, { status });
}

/**
 * Client IP behind a trusted reverse proxy (Caddy).
 * Use the *last* X-Forwarded-For hop — Caddy appends the real peer;
 * the first value is client-controlled and can spoof the rate-limit key.
 * Requests without proxy headers share the 'unknown' bucket (intentional).
 */
function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',').map((p) => p.trim()).filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) return last;
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

async function readJsonBody(req: Request): Promise<ContactBody | Response> {
  const contentLength = req.headers.get('content-length');
  if (contentLength != null) {
    const n = Number(contentLength);
    if (Number.isFinite(n) && n > MAX_BODY_BYTES) {
      return jsonError(413, 'Payload too large');
    }
  }

  let text: string;
  try {
    text = await req.text();
  } catch {
    return jsonError(400, 'Invalid body');
  }

  // Chunked / missing Content-Length: enforce after read.
  if (Buffer.byteLength(text, 'utf8') > MAX_BODY_BYTES) {
    return jsonError(413, 'Payload too large');
  }

  try {
    return JSON.parse(text) as ContactBody;
  } catch {
    return jsonError(400, 'Invalid JSON');
  }
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

function parseFormId(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function submissionFieldValue(rows: SubmissionRow[], field: string): string {
  return rows.find((r) => r.field === field)?.value.trim() ?? '';
}

/** Loose email check — empty allowed (field may be optional); non-empty must look like an address. */
function isValidEmailOrEmpty(value: string): boolean {
  if (!value) return true;
  return /^\S+@\S+\.\S+$/.test(value);
}

function isPayloadValidationError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { name?: string; status?: number; data?: unknown };
  if (e.name === 'ValidationError') return true;
  if (e.status === 400) return true;
  return false;
}

export async function POST(req: Request): Promise<Response> {
  // 1) CSRF-ish origin check (browser only; bots can spoof — honeypot + rate limit remain)
  if (!isAllowedOrigin(req)) {
    return jsonError(403, 'Forbidden');
  }

  // 2) Size + rate limit BEFORE JSON.parse so oversized bodies never burn CPU
  const contentLength = req.headers.get('content-length');
  if (contentLength != null) {
    const n = Number(contentLength);
    if (Number.isFinite(n) && n > MAX_BODY_BYTES) {
      return jsonError(413, 'Payload too large');
    }
  }

  const cooldownMs = parseCooldownMs(process.env.CONTACT_FORM_COOLDOWN_MS);
  const ip = clientIp(req);
  if (!consumeRateLimit(`contact:${ip}`, cooldownMs)) {
    return jsonError(429, 'Too many requests. Please try again later.');
  }

  // 3) Parse body (re-check size for chunked transfers)
  const parsed = await readJsonBody(req);
  if (parsed instanceof Response) return parsed;
  const body = parsed;

  const hp = typeof body.hp === 'string' ? body.hp.trim() : '';
  if (hp) {
    return new Response(null, { status: 204 });
  }

  const formId = parseFormId(body.form);
  const submissionData = parseSubmissionData(body.submissionData);
  if (formId == null || submissionData == null) {
    return jsonError(400, 'Invalid form data');
  }

  const email = submissionFieldValue(submissionData, 'email');
  if (!isValidEmailOrEmpty(email)) {
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
        email,
        phone: submissionFieldValue(submissionData, 'phone'),
        message: submissionFieldValue(submissionData, 'message'),
      },
    });
  } catch (err) {
    // Log full error for ops; never log submission body (PII).
    console.error('[api/contact] submission failed', err);
    if (isPayloadValidationError(err)) {
      return jsonError(400, 'Invalid form data');
    }
    return jsonError(500, 'Failed to submit form');
  }

  return new Response(null, { status: 204 });
}
