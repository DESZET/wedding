/**
 * Utility to compress images client-side before uploading.
 * Reduces 5-15MB phone photos to ~150-350KB while retaining high visual clarity.
 */
export async function compressImage(file: File, maxWidth = 1600, quality = 0.82): Promise<File> {
  // If not an image or is SVG, return original
  if (!file.type || !file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }

  // If already under 350KB, no need to compress
  if (file.size < 350 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
              resolve(new File([blob], newFileName, { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
