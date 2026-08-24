<script setup lang="ts">
import { computed } from 'vue'
import Footer from './components/Footer.vue'
import NavTabs from './components/NavTabs.vue'
import GalleryView from './views/GalleryView.vue'
import HomeView from './views/HomeView.vue'
import { route } from './router'

const view = computed(() => (route.value === 'gallery' ? GalleryView : HomeView))
</script>

<template>
  <NavTabs />
  <component :is="view" />
  <Footer />
</template>
