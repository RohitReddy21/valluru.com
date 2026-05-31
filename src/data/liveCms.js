const apiPath = '/api/site-content';

export async function loadLiveCms() {
  try {
    const response = await fetch(apiPath, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data?.content || data?.theme ? data : null;
  } catch {
    return null;
  }
}

export async function checkLiveCms() {
  try {
    const response = await fetch(apiPath, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));

    return {
      ok: response.ok,
      status: response.status,
      data,
      error: response.ok ? '' : data.error || `Request failed with ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: error.message || 'Live storage check failed.',
    };
  }
}

export async function saveLiveCms({ content, theme, adminPassword }) {
  const response = await fetch(apiPath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPassword || '',
    },
    body: JSON.stringify({
      content,
      theme,
      updatedAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Live save failed.');
  }

  return response.json();
}
