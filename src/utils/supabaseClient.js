import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Supabase Config Check:');
console.log('   URL:', supabaseUrl ? '✓ Found' : '✗ Missing');
console.log('   Key:', supabaseKey ? '✓ Found' : '✗ Missing');

let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
  }
} else {
  console.warn('⚠️ Supabase not configured - will use base64 fallback');
}

export { supabase };
export const BUCKET_NAME = 'valluru-images';
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadImage(file, folder = 'general') {
  console.log('uploadImage called:', { fileName: file.name, size: file.size, folder });

  if (!supabase) {
    console.warn('Supabase not configured, using base64 fallback');
    const base64 = await fileToBase64(file);
    return { url: base64, type: 'base64' };
  }

  try {
    // Compress image before upload
    const compressed = await compressImage(file);
    console.log('Image compressed:', {
      original: file.size,
      compressed: compressed.size,
      saved: ((1 - compressed.size / file.size) * 100).toFixed(1) + '%'
    });

    // Generate unique filename
    const ext = getFileExtension(file.type);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const filename = `${folder}/${timestamp}-${random}.${ext}`;

    console.log('Uploading to:', BUCKET_NAME, filename);

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, compressed, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    console.log('Upload successful:', data);

    // Generate public URL
    const { data: publicUrl } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    console.log('Public URL:', publicUrl.publicUrl);

    return {
      url: publicUrl.publicUrl,
      path: data.path,
      filename: filename,
      size: compressed.size,
      type: 'cloud',
    };
  } catch (error) {
    console.error('Image upload error:', error);
    console.log('Falling back to base64');
    const base64 = await fileToBase64(file);
    return { url: base64, type: 'base64' };
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
