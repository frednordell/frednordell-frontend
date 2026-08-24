/**
 * Cloudflare Pages Function backing GET /api/gallery.
 *
 * Lists the published photos in R2 and returns the JSON the gallery page
 * renders. The image bytes are not served through here — they come off the
 * bucket's own custom domain so Cloudflare's CDN caches them.
 *
 * Types are declared locally rather than pulled from @cloudflare/workers-types
 * so this file needs no extra dependency; the shapes match the runtime.
 */

interface R2Object {
  key: string
  size: number
  uploaded: Date
  customMetadata?: Record<string, string>
}

interface R2Objects {
  objects: R2Object[]
  truncated: boolean
  cursor?: string
}

interface R2ListOptions {
  prefix?: string
  cursor?: string
  limit?: number
  include?: ('customMetadata' | 'httpMetadata')[]
}

interface R2Bucket {
  list(options?: R2ListOptions): Promise<R2Objects>
}

interface Env {
  GALLERY: R2Bucket
  IMAGE_BASE_URL?: string
}

interface GalleryImage {
  key: string
  url: string
  thumbUrl: string
  width?: number
  height?: number
  caption: string
  uploaded: string
}

const PHOTO_PREFIX = 'photos/'
const THUMB_PREFIX = 'thumbs/'
const DEFAULT_IMAGE_BASE_URL = 'https://img.frednordell.com'

function toNumber(value: string | undefined): number | undefined {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

async function listAll(bucket: R2Bucket): Promise<R2Object[]> {
  const objects: R2Object[] = []
  let cursor: string | undefined

  // R2 pages at 1000 keys; keep going so a large gallery isn't silently cut off.
  do {
    const page = await bucket.list({
      prefix: PHOTO_PREFIX,
      include: ['customMetadata'],
      cursor,
    })
    objects.push(...page.objects)
    cursor = page.truncated ? page.cursor : undefined
  } while (cursor)

  return objects
}

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  const { env } = context

  if (!env.GALLERY) {
    return Response.json({ error: 'GALLERY binding is not configured' }, { status: 500 })
  }

  const base = (env.IMAGE_BASE_URL ?? DEFAULT_IMAGE_BASE_URL).replace(/\/+$/, '')
  const objects = await listAll(env.GALLERY)

  const images: GalleryImage[] = objects
    .map((object) => {
      const name = object.key.slice(PHOTO_PREFIX.length)
      return {
        key: object.key,
        url: `${base}/${object.key}`,
        thumbUrl: `${base}/${THUMB_PREFIX}${name}`,
        width: toNumber(object.customMetadata?.width),
        height: toNumber(object.customMetadata?.height),
        caption: object.customMetadata?.caption ?? '',
        uploaded: new Date(object.uploaded).toISOString(),
      }
    })
    .sort((a, b) => b.uploaded.localeCompare(a.uploaded))

  return Response.json(
    { images },
    {
      headers: {
        // Short in the browser, an hour at the edge: adding a photo shows up
        // without a deploy, and the list() call stays far inside R2's free tier.
        'cache-control': 'public, max-age=300, s-maxage=3600',
      },
    },
  )
}
