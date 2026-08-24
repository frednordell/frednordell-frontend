<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import GalleryGrid from '../components/GalleryGrid.vue'
import Lightbox from '../components/Lightbox.vue'
import { fetchGallery, type GalleryImage } from '../gallery'

const images = ref<GalleryImage[]>([])
const status = ref<'loading' | 'ready' | 'error'>('loading')
const active = ref<GalleryImage | null>(null)
const controller = new AbortController()

onMounted(async () => {
  try {
    images.value = await fetchGallery(controller.signal)
    status.value = 'ready'
  } catch {
    if (!controller.signal.aborted) status.value = 'error'
  }
})

onUnmounted(() => controller.abort())
</script>

<template>
  <h1>Gallery</h1>
  <p v-if="status === 'loading'" class="note">Loading…</p>
  <p v-else-if="status === 'error'" class="note">Could not load the gallery just now.</p>
  <p v-else-if="images.length === 0" class="note">Nothing here yet.</p>
  <GalleryGrid v-else :images="images" @select="active = $event" />
  <Lightbox v-if="active" :image="active" @close="active = null" />
</template>

<style scoped>
.note {
  color: #888;
}
</style>
