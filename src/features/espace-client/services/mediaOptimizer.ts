const MAX_DIMENSION = 1920;
const WEBP_QUALITY = 0.82;

/** Redimensionne les images et les encode en WebP avant l'envoi. */
export async function optimizeImageFile(file: File): Promise<File> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error(
      "Format image non pris en charge. Utilisez JPEG, PNG ou WebP."
    );
  }

  const bitmap = await createImageBitmap(file);
  try {
    const ratio = Math.min(
      1,
      MAX_DIMENSION / bitmap.width,
      MAX_DIMENSION / bitmap.height
    );
    const width = Math.max(1, Math.round(bitmap.width * ratio));
    const height = Math.max(1, Math.round(bitmap.height * ratio));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("Impossible de préparer l'image pour l'envoi.");
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        result =>
          result
            ? resolve(result)
            : reject(new Error("La compression de l'image a échoué.")),
        "image/webp",
        WEBP_QUALITY
      );
    });
    if (blob.size > 12 * 1024 * 1024) {
      throw new Error("L'image optimisée dépasse la limite de 12 Mo.");
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "media";
    return new File([blob], `${baseName}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}
