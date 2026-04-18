// ── Sanitizer Middleware — PRD §7.3 ───────────────────
// Strips XSS, escapes special chars, rejects prototype pollution & oversized payloads.

import type { Context, Next } from 'hono';

const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];
const MAX_FIELD_LENGTH = 10_000;
const HTML_TAG_REGEX = /<[^>]*>/g;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/`/g, '&#x60;');
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    if (value.length > MAX_FIELD_LENGTH) {
      throw new Error(`Field exceeds maximum length of ${MAX_FIELD_LENGTH} characters`);
    }
    // Strip HTML tags, then escape remaining special chars
    return escapeHtml(value.replace(HTML_TAG_REGEX, ''));
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    return sanitizeObject(value as Record<string, unknown>);
  }
  return value;
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (DANGEROUS_KEYS.includes(key)) {
      throw new Error(`Forbidden key: '${key}' (prototype pollution attempt)`);
    }
    result[key] = sanitizeValue(obj[key]);
  }
  return result;
}

export async function sanitizer(c: Context, next: Next) {
  // Only sanitize methods that have a body
  if (['POST', 'PUT', 'PATCH'].includes(c.req.method)) {
    try {
      const contentType = c.req.header('content-type');
      if (contentType?.includes('application/json')) {
        const body = await c.req.json();
        const sanitized = sanitizeObject(body as Record<string, unknown>);
        // Store sanitized body on context for route handlers
        (c as unknown as Record<string, unknown>).sanitizedBody = sanitized;
      }
    } catch (error) {
      return c.json({
        error: 'INVALID_INPUT',
        detail: (error as Error).message,
      }, 400);
    }
  }
  await next();
}
