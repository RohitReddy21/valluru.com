import { Buffer } from 'node:buffer';
import process from 'node:process';

const table = 'resources';

const writableColumns = [
  'title',
  'summary',
  'body',
  'category',
  'post_url',
  'embed_url',
  'image_url',
  'image_alt',
  'tags',
  'published_at',
  'status',
  'featured',
  'sort_order',
];

function supabaseUrl() {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
}

function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

function hasSupabaseConfig() {
  return Boolean(supabaseUrl() && serviceKey());
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(payload));
}

async function readBody(request) {
  if (request.body) {
    return typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
  }

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function isAuthorized(request) {
  const expectedPassword = process.env.ADMIN_PASSWORD || 'admin';
  return request.headers['x-admin-password'] === expectedPassword;
}

async function supabaseRest(path, { method = 'GET', body, prefer } = {}) {
  const headers = {
    apikey: serviceKey(),
    Authorization: `Bearer ${serviceKey()}`,
    'Content-Type': 'application/json',
  };

  if (prefer) headers.Prefer = prefer;

  const response = await fetch(`${supabaseUrl()}/rest/v1/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.message || payload?.error || `Supabase request failed with ${response.status}.`;
    throw new Error(message);
  }

  return payload;
}

// Drop unknown keys so a stray field from the browser cannot reach the database.
function pickWritableColumns(input) {
  const row = {};

  writableColumns.forEach((column) => {
    if (input[column] !== undefined) row[column] = input[column];
  });

  if (row.published_at === '') row.published_at = null;
  if (row.status && !['draft', 'published'].includes(row.status)) row.status = 'draft';
  if (row.tags && !Array.isArray(row.tags)) row.tags = [];

  return row;
}

export default async function handler(request, response) {
  try {
    if (!hasSupabaseConfig()) {
      const message = 'Supabase environment variables are not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.';
      return sendJson(response, request.method === 'GET' ? 200 : 500, {
        configured: false,
        error: message,
        resources: [],
      });
    }

    // GET returns published rows to anyone, and every row (drafts included) to admin.
    if (request.method === 'GET') {
      const statusFilter = isAuthorized(request) ? '' : '&status=eq.published';
      const rows = await supabaseRest(
        `${table}?select=*${statusFilter}&order=sort_order.asc,published_at.desc,created_at.desc`,
      );
      return sendJson(response, 200, { configured: true, resources: rows || [] });
    }

    if (!isAuthorized(request)) {
      return sendJson(response, 401, { error: 'Unauthorized. Unlock admin again to refresh the password.' });
    }

    if (request.method === 'POST') {
      const payload = await readBody(request);
      const row = pickWritableColumns(payload);
      const [created] = await supabaseRest(table, {
        method: 'POST',
        body: row,
        prefer: 'return=representation',
      });
      return sendJson(response, 200, { resource: created });
    }

    if (request.method === 'PUT') {
      const payload = await readBody(request);

      // A bare list of {id, sort_order} pairs means "reorder", nothing else.
      if (Array.isArray(payload.order)) {
        await Promise.all(
          payload.order.map((entry, index) =>
            supabaseRest(`${table}?id=eq.${encodeURIComponent(entry.id)}`, {
              method: 'PATCH',
              body: { sort_order: index },
              prefer: 'return=minimal',
            }),
          ),
        );
        return sendJson(response, 200, { ok: true });
      }

      if (!payload.id) {
        return sendJson(response, 400, { error: 'An id is required to update a resource.' });
      }

      const row = pickWritableColumns(payload);
      const [updated] = await supabaseRest(`${table}?id=eq.${encodeURIComponent(payload.id)}`, {
        method: 'PATCH',
        body: row,
        prefer: 'return=representation',
      });
      return sendJson(response, 200, { resource: updated });
    }

    if (request.method === 'DELETE') {
      const payload = await readBody(request);
      if (!payload.id) {
        return sendJson(response, 400, { error: 'An id is required to delete a resource.' });
      }

      await supabaseRest(`${table}?id=eq.${encodeURIComponent(payload.id)}`, {
        method: 'DELETE',
        prefer: 'return=minimal',
      });
      return sendJson(response, 200, { ok: true });
    }

    return sendJson(response, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(response, 500, { error: error.message || 'Server error' });
  }
}
