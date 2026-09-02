import { v2 as cloudinary } from 'cloudinary';

let configured = false;

function configure() {
  if (configured) return true;
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return false;
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  configured = true;
  return true;
}

const isUrl = (value) => typeof value === 'string' && /^https?:\/\//i.test(value);

// Uploads a base64 or http(s) URL image.
// Returns a URL. If Cloudinary is not configured, returns the URL as-is.
export async function uploadImage(value, folder = 'qaroo') {
  if (!value) return '';
  if (isUrl(value)) return value;

  if (!configure()) {
    // No Cloudinary configured — assume value is already a usable URL/path.
    return value;
  }

  try {
    const result = await cloudinary.uploader.upload(value, { folder });
    return result.secure_url;
  } catch (err) {
    console.error('Cloudinary upload error:', err.message);
    return value;
  }
}
