/**
 * Optimizes image and screenshot files before uploading for AI analysis.
 * Scales large screenshots down to max 1600px and compresses to JPEG to dramatically
 * accelerate network upload time and AI OCR processing speed.
 */
export async function optimizeImageForScan(file: File): Promise<File> {
  // If it's not an image (e.g. PDF), return as is
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // If it's already small JPEG/WebP (< 300KB), return as is
  if (file.size < 300 * 1024 && (file.type === "image/jpeg" || file.type === "image/webp")) {
    return file;
  }

  // Check if browser environment is available
  if (typeof window === "undefined" || typeof document === "undefined") {
    return file;
  }

  return new Promise((resolve) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const maxDimension = 1600;
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      // Draw white background to handle transparent PNG screenshots cleanly
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const baseName = file.name.replace(/\.[^.]+$/, "");
          const optimizedFileName = `${baseName}.jpg`;
          const optimizedFile = new File([blob], optimizedFileName, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(optimizedFile);
        },
        "image/jpeg",
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}
