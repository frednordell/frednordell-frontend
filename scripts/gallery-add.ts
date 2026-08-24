/**
 * Adds one photo to the gallery bucket.
 *
 *   bun run gallery:add ~/Pictures/stockholm.jpg "Stockholm, 2025"
 *
 * Writes three objects to R2:
 *
 *   originals/<slug>.<ext>  the untouched source, never served publicly
 *   photos/<slug>.webp      lightbox copy, long edge capped at MAX_PHOTO_EDGE
 *   thumbs/<slug>.webp      grid tile, long edge capped at MAX_THUMB_EDGE
 *
 * Only the derived copies are public, so the highest resolution anyone can
 * take from the site is MAX_PHOTO_EDGE. Keeping the originals in the bucket is
 * what makes that cap a decision you can revisit: change the constant, re-run
 * over originals/, and nothing has been lost.
 *
 * sharp drops EXIF on write, so GPS coordinates never reach the public objects.
 *
 * Requires (install once, locally — these are not needed to build or test):
 *   bun add -d sharp @aws-sdk/client-s3
 *
 * Requires in .env:
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
 *   R2_BUCKET (optional, defaults to frednordell-gallery)
 */
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import { basename, extname } from 'node:path'

const MAX_PHOTO_EDGE = 1600
const MAX_THUMB_EDGE = 600

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.heic': 'image/heic',
}

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name} — see the header of this script.`)
  return value
}

const [source, caption = ''] = process.argv.slice(2)
if (!source) {
  console.error('usage: bun run gallery:add <file> [caption]')
  process.exit(1)
}

const bucket = process.env.R2_BUCKET ?? 'frednordell-gallery'
const extension = extname(source).toLowerCase()
const slug = basename(source, extname(source))
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')

if (!slug) throw new Error(`Could not derive a name from ${source}`)

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${required('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: required('R2_ACCESS_KEY_ID'),
    secretAccessKey: required('R2_SECRET_ACCESS_KEY'),
  },
})

const original = await readFile(source)

// .rotate() with no argument bakes in EXIF orientation. Without it, portrait
// photos from a phone come out sideways once the metadata is stripped — and
// width/height would be recorded swapped.
const upright = sharp(original).rotate()

const photo = await upright
  .clone()
  .resize({
    width: MAX_PHOTO_EDGE,
    height: MAX_PHOTO_EDGE,
    fit: 'inside',
    withoutEnlargement: true,
  })
  .webp({ quality: 82 })
  .toBuffer({ resolveWithObject: true })

const thumb = await upright
  .clone()
  .resize({
    width: MAX_THUMB_EDGE,
    height: MAX_THUMB_EDGE,
    fit: 'inside',
    withoutEnlargement: true,
  })
  .webp({ quality: 75 })
  .toBuffer({ resolveWithObject: true })

// The grid reserves space from these, so they must describe the published
// photo rather than the original.
const metadata = {
  width: String(photo.info.width),
  height: String(photo.info.height),
  caption,
}

async function put(key: string, body: Buffer, contentType: string) {
  await r2.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
      Metadata: metadata,
    }),
  )
  console.log(`  ${key}  ${(body.length / 1024).toFixed(0)} KB`)
}

console.log(`Uploading ${slug} to ${bucket}`)
await put(`originals/${slug}${extension}`, original, CONTENT_TYPES[extension] ?? 'application/octet-stream')
await put(`photos/${slug}.webp`, photo.data, 'image/webp')
await put(`thumbs/${slug}.webp`, thumb.data, 'image/webp')
console.log(`Done — ${photo.info.width}×${photo.info.height}`)
