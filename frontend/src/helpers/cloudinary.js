// Cloudinary Configuration
const CLOUD_NAME = "dluhpsxfi";
const UPLOAD_PRESET = "tweeter_uploads";
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
const CLOUDINARY_BASE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/`;

/**
 * Upload a base64 image to Cloudinary
 * Returns a short reference (cloud:public_id.format) to save on-chain bytes
 */
export async function uploadImage(base64Data, folder = "") {
  const formData = new FormData();
  formData.append("file", base64Data);
  formData.append("upload_preset", UPLOAD_PRESET);
  if (folder) {
    formData.append("folder", `tweeter/${folder}`);
  }

  const response = await fetch(UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || "Image upload failed");
  }

  const data = await response.json();
  // Return short ref to save on-chain space (e.g. "cloud:tweeter/tweets/abc123.jpg")
  return `cloud:${data.public_id}.${data.format}`;
}

/**
 * Resolve a cloud: short reference to a full Cloudinary URL
 */
export function resolveCloudinaryRef(ref) {
  if (ref && ref.startsWith("cloud:")) {
    return CLOUDINARY_BASE + ref.substring(6);
  }
  return null;
}

/**
 * Check if a URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url) {
  return url && url.includes("res.cloudinary.com");
}
