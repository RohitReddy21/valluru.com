import { useState, useEffect } from 'react';

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
  const [imgSrc, setImgSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      setImgSrc(fallback);
      setIsLoading(false);
      return;
    }

    // Use Intersection Observer for true lazy loading
    if (loading === 'lazy') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setImgSrc(src);
            observer.unobserve(entry.target);
          }
        },
        { rootMargin: '50px' }
      );

      const img = document.createElement('img');
      observer.observe(img);

      return () => observer.disconnect();
    } else {
      setImgSrc(src);
    }
  }, [src, loading, fallback]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setImgSrc(fallback);
    setIsLoading(false);
  };

  if (!imgSrc) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse`} />
    );
  }

  return (
    <picture>
      {/* Offer WebP format first for modern browsers */}
      <source srcSet={convertToWebP(imgSrc)} type="image/webp" />
      <img
        src={hasError ? fallback : imgSrc}
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
  return <div className={`${className} bg-gray-200 animate-pulse`} />;
}
