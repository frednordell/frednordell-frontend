<script setup lang="ts">
import type { GalleryImage } from '../gallery'

defineProps<{ images: GalleryImage[] }>()

const emit = defineEmits<{ (event: 'select', image: GalleryImage): void }>()

/**
 * Reserving the tile's aspect ratio up front stops the grid reflowing as
 * thumbnails arrive. Dimensions come from R2 custom metadata, so fall back to
 * a square for anything uploaded before the script started recording them.
 */
function ratio(image: GalleryImage): string {
  if (!image.width || !image.height) return '1 / 1'
  return `${image.width} / ${image.height}`
}
</script>

<template>
  <ul class="grid">
    <li v-for="image in images" :key="image.key">
      <button type="button" @click="emit('select', image)">
        <img
          :src="image.thumbUrl"
          :alt="image.caption || 'Gallery photo'"
          :style="{ aspectRatio: ratio(image) }"
          loading="lazy"
          decoding="async"
        >
      </button>
    </li>
  </ul>
</template>

<style scoped>
.grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}
button {
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  cursor: zoom-in;
  border-radius: 8px;
  overflow: hidden;
}
img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
  background-color: #2f2f2f;
  transition: transform 0.2s ease;
}
button:hover img,
button:focus-visible img {
  transform: scale(1.03);
}
</style>
