<script setup lang="ts">
import { navigate, paths, route } from '../router'
</script>

<template>
  <nav>
    <a
      :class="{ active: route === 'home' }"
      :href="paths.home"
      @click.prevent="navigate(paths.home)"
    >About</a>
    <a
      :class="{ active: route === 'gallery' }"
      :href="paths.gallery"
      @click.prevent="navigate(paths.gallery)"
    >Gallery</a>
  </nav>
</template>

<style scoped>
nav {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 2rem;
  padding: 1rem 0 0.5rem;
}
a {
  color: #888;
  font-weight: 500;
  padding-bottom: 0.3rem;
  border-bottom: 2px solid transparent;
}
a:hover {
  color: rgba(255, 255, 255, 0.87);
}
a.active {
  color: rgba(255, 255, 255, 0.87);
  border-bottom-color: #646cff;
}
</style>
