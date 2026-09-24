const CLOUD_NAME = "e2bgjv9e";
const UPLOAD_PRESET = "VIDEO WEDDING";

export interface CloudinaryResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
  duration?: number;
  format: string;
}

/**
 * Transforms a Cloudinary image URL to auto-compress and resize.
 * Returns original URL if not a Cloudinary URL.
 *
 * Usage:
 *   cloudinaryImage(url, 600)  → thumbnail 600px wide, auto format & quality
 *   cloudinaryImage(url, 1600) → full-size lightbox, still auto format
 */
export function cloudinaryImage(url: string, width = 800): string {
  if (!url) return url;
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`);
  }
  return url;
}

/**
 * Transforms a Cloudinary video URL to use auto quality + format.
 * Also adds poster extraction (thumbnail at 1 second).
 */
export function cloudinaryVideo(url: string): { src: string; poster: string } {
  if (!url) return { src: url, poster: "" };
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    const src = url.replace("/upload/", "/upload/q_auto,f_auto/");
    // Generate poster from video at 1 second, as JPEG thumbnail
    const poster = url
      .replace("/upload/", "/upload/so_1,f_jpg,q_auto,w_800/")
      .replace(/\.(mp4|webm|mov|avi|mkv)$/i, ".jpg");
    return { src, poster };
  }
  return { src: url, poster: "" };
}

/**
 * Upload file (video atau gambar) langsung ke Cloudinary dari browser.
 * Tidak melalui server Vercel — aman dari limit serverless.
 */
export async function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<CloudinaryResult> {
  const resourceType = file.type.startsWith("video/") ? "video" : "image";
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload gagal: ${xhr.status} ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Upload error")));
    xhr.addEventListener("abort", () => reject(new Error("Upload dibatalkan")));

    xhr.open("POST", url);
    xhr.send(formData);
  });
}
