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
