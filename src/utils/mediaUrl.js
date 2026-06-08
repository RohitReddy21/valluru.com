const publicAssetPattern = /\.(avif|gif|jpe?g|mp4|ogg|png|svg|webm|webp)$/i;

export function normalizeMediaUrl(value) {
  const url = String(value || '').trim();
  if (!url) return '';

  if (/^(data:|blob:|https?:\/\/|mailto:|tel:)/i.test(url)) {
    return url;
  }

  const normalized = url.replace(/\\/g, '/');
  const withoutFakePath = normalized.replace(/^.*fakepath\//i, '');
  const withoutPublic = withoutFakePath.replace(/^\/?public\//i, '');

  if (withoutPublic.startsWith('/')) {
    return withoutPublic;
  }

  if (withoutPublic.startsWith('./')) {
    return `/${withoutPublic.slice(2)}`;
  }

  if (withoutPublic.startsWith('../')) {
    return '';
  }

  if (publicAssetPattern.test(withoutPublic)) {
    return `/${withoutPublic}`;
  }

  return withoutPublic;
}
