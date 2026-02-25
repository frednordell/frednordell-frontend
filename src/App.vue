<script setup lang="ts">
import Footer from './components/Footer.vue';
</script>

<template>
  <div>
    <img src="./assets/face.webp" class="headshot" alt="Picture of Fred">
  </div>
  <h1>Fred Nordell</h1>
  <p>
    Consultant at <a href="https://netlight.com" target="_blank" rel="noopener noreferrer">Netlight</a>
  </p>
  <p class="reach-out">Reach out at <a href="mailto:fred@nordells.nu">fred@nordells.nu</a></p>
  <Footer></Footer>
</template>

<style scoped>
.headshot {
  height: 16em;
  padding: 1.5em;
  border-radius: 14%;
}
.reach-out {
  color: #888;
}
</style>
