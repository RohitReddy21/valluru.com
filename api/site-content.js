import { Buffer } from 'node:buffer';
import process from 'node:process';

const contentKey = 'thevalluru:site-state';

function hasUpstashConfig() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
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

async function upstash(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error('Upstash environment variables are not configured in Vercel.');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    throw new Error(`Upstash request failed with ${response.status}.`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }

  return data.result;
}

export default async function handler(request, response) {
  try {
    if (request.method === 'GET') {
      if (!hasUpstashConfig()) {
        return sendJson(response, 200, {
          configured: false,
          error: 'Upstash environment variables are not configured in Vercel.',
        });
      }

      const result = await upstash(['GET', contentKey]);
      return sendJson(response, 200, result ? JSON.parse(result) : {});
    }

    if (request.method === 'POST') {
      const expectedPassword = process.env.ADMIN_PASSWORD || 'admin';
      const providedPassword = request.headers['x-admin-password'];

      if (providedPassword !== expectedPassword) {
        return sendJson(response, 401, { error: 'Unauthorized. Enter the current admin password again.' });
      }

      if (!hasUpstashConfig()) {
        return sendJson(response, 500, {
          error: 'Upstash environment variables are not configured in Vercel.',
        });
      }

      const payload = await readBody(request);
      await upstash(['SET', contentKey, JSON.stringify(payload)]);
      return sendJson(response, 200, { ok: true });
    }

    return sendJson(response, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(response, 500, { error: error.message || 'Server error' });
  }
}
