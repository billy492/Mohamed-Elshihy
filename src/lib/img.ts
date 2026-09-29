// Responsive image sources.
//
// The project photography is exported at up to 2000px and ~1MB each, and was
// being served at full size to every screen — 307 images, 138MB in total, so a
// single project page could pull 35MB. A phone shows those at 339 CSS px and a
// desktop at roughly 700px, i.e. we were sending ~9x more pixels than either
// screen can resolve, which is why project pages felt slow to open on both.
//
// Vercel's image endpoint resizes and re-encodes to AVIF on demand. Measured on
// the live site: osoul-06.jpg 1,056,905 bytes -> 25,730 at w=640 (41x smaller),
// 67,369 at w=1080. Same picture, just not sending detail the display cannot
// show. This keeps the plain <img> tag and every existing class, so no layout
// anywhere changes — only the bytes on the wire.
// The endpoint accepts ONLY the configured widths and qualities — anything else
// is rejected with 400 INVALID_IMAGE_OPTIMIZE_REQUEST and the image simply fails
// to load. That is not a soft failure: it broke every optimized image on the
// site. 1440 is NOT a default width (640/750/828/1080/1200/1920/2048 are), and
// 75 is the only default quality. Do not invent values here; if a different
// width or quality is ever needed, add it to `images` in next.config.ts first.
const WIDTHS = [640, 750, 828, 1080, 1200, 1920];
const QUALITY = 75;

/** srcSet across the permitted widths for a local asset path. */
export function imgSrcSet(src: string): string {
  if (!src.startsWith("/")) return "";           // external/data URLs pass through untouched
  return WIDTHS.map(
    (w) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${QUALITY} ${w}w`
  ).join(", ");
}

/**
 * How wide the image actually renders, so the browser picks the right width.
 * `perRow` is how many photos share the row. Phones stack to one or two up;
 * on desktop the photo column is roughly 55% of the page in the split layout.
 * Deliberately a little generous — over-serving costs a few KB, under-serving
 * looks soft, and soft is not acceptable on a portfolio.
 */
export function imgSizes(perRow = 1): string {
  if (perRow >= 3) return "(max-width: 760px) 34vw, 20vw";
  if (perRow === 2) return "(max-width: 760px) 50vw, 28vw";
  return "(max-width: 760px) 100vw, 56vw";
}
