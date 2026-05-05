export const BLOG_IMAGES_BUCKET = "blog images";

export function getBlogImageStoragePathFromPublicUrl(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const encodedBucket = encodeURIComponent(BLOG_IMAGES_BUCKET);
    const marker = `/storage/v1/object/public/${encodedBucket}/`;
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex === -1) return null;

    const encodedPath = url.pathname.slice(markerIndex + marker.length);
    if (!encodedPath) return null;
    return decodeURIComponent(encodedPath);
  } catch {
    return null;
  }
}
