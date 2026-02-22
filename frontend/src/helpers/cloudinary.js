// Cloudinary Configuration
const CLOUD_NAME = "dluhpsxfi";
const UPLOAD_PRESET = "tweeter_uploads";
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Upload a base64 image to Cloudinary
 * @param {string} base64Data - The base64 encoded image string
 * @param {string} folder - Optional subfolder (e.g. 'profiles', 'tweets')
 * @returns {Promise<string>} - The uploaded image URL
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
  return data.secure_url;
}

/**
 * Check if a URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url) {
  return url && url.includes("res.cloudinary.com");
}
