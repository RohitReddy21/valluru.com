import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not configured. Image uploads will use base64 fallback.');
}

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const BUCKET_NAME = 'valluru-images';
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadImage(file, folder = 'general') {
  if (!supabase) {
    console.warn('Supabase not configured, returning base64');
    return fileToBase64(file);
  }

  try {
    // Compress image before upload
    const compressed = await compressImage(file);
    
    // Generate unique filename
    const ext = getFileExtension(file.type);
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, compressed, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Generate public URL
    const { data: publicUrl } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      url: publicUrl.publicUrl,
      path: data.path,
      filename: filename,
      size: compressed.size,
    };
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
}

async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Max dimensions
        const maxWidth = 1200;
        const maxHeight = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (width > height) {
            width = maxWidth;
            height = maxWidth / aspectRatio;
          } else {
            height = maxHeight;
            width = maxHeight * aspectRatio;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create a new File object with proper name
              const compressedFile = new File(
                [blob],
                `compressed-${Date.now()}.webp`,
                { type: 'image/webp' }
              );
              resolve(compressedFile);
            } else {
              reject(new Error('Canvas conversion failed'));
            }
          },
          'image/webp',
          0.8
        );
      };
      img.onerror = () => reject(new Error('Image load failed'));
    };
    reader.onerror = () => reject(new Error('File read failed'));
  });
}

function getFileExtension(mimeType) {
  const mimeMap = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return mimeMap[mimeType] || 'webp';
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

export function generateImageVariants(imageUrl, imagePath) {
  if (!imageUrl || !supabase) return { original: imageUrl };

  // For Supabase URLs, we can add query parameters for transformations
  // This example assumes the image is already optimized
  return {
    thumbnail: imageUrl,
    medium: imageUrl,
    large: imageUrl,
    original: imageUrl,
  };
}
