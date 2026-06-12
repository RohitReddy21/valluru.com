import { useState } from 'react';

export default function OptimizedImage({
  src,
  alt = '',
  className = '',
  width,
  height,
  onLoad,
  fallback = '/placeholder.jpg',
  loading = 'lazy',
}) {
  const [failedSrc, setFailedSrc] = useState('');
  const resolvedSrc = src || fallback;
  const displaySrc = failedSrc === resolvedSrc ? fallback : resolvedSrc;

  const handleLoad = () => {
    onLoad?.();
  };

  const handleError = () => {
    if (displaySrc !== fallback) {
      setFailedSrc(resolvedSrc);
    }
  }

  return (
    <picture>
      {/* Offer WebP format first for modern browsers */}
      <source srcSet={convertToWebP(displaySrc)} type="image/webp" />
      <img
        src={displaySrc}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
      />
    </picture>
  );
}

function convertToWebP(url) {
  if (!url || url.startsWith('data:')) return url;
  
  // If URL already has format param, modify it
  if (url.includes('format=')) {
    return url.replace(/format=[^&]+/, 'format=webp');
  }
  
  // Add WebP format parameter
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}format=webp`;
}

export function ImagePlaceholder({ className = '' }) {
  return <div className={`${className} bg-[var(--surface-grey)] animate-pulse`} />;
}
