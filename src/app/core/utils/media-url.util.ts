/**
 * Resolves a media path returned by the API into a displayable URL.
 * Cloudinary URLs come back absolute (http/https) and must be returned as-is;
 * only legacy relative paths (e.g. "/uploads/...") get prefixed with `origin`.
 */
export function resolveMediaUrl(origin: string, path: string | null | undefined): string | null {
  if (!path) return null;
  const p = path.trim();
  if (!p) return null;
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  if (p.startsWith('//')) return `https:${p}`;
  return p.startsWith('/') ? `${origin}${p}` : `${origin}/${p}`;
}
