<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import type { GalleryImage } from '../gallery'

defineProps<{ image: GalleryImage }>()

const emit = defineEmits<{ (event: 'close'): void }>()

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="backdrop" role="dialog" aria-modal="true" @click.self="emit('close')">
    <button class="close" type="button" aria-label="Close" @click="emit('close')">&times;</button>
    <figure>
      <img :src="image.url" :alt="image.caption || 'Gallery photo'">
      <figcaption v-if="image.caption">{{ image.caption }}</figcaption>
    </figure>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: rgba(0, 0, 0, 0.85);
}
figure {
  margin: 0;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 4px;
}
figcaption {
  color: #bbb;
  font-size: 0.9rem;
}
.close {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  border: none;
  background: none;
  color: rgba(255, 255, 255, 0.87);
  font-size: 2.5rem;
  line-height: 1;
  cursor: pointer;
}
</style>
