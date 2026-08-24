import { computed, ref } from 'vue'

export type RouteName = 'home' | 'gallery'

const routes: Record<string, RouteName> = {
  '/': 'home',
  '/gallery': 'gallery',
}

export const paths: Record<RouteName, string> = {
  home: '/',
  gallery: '/gallery',
}

function readPath(): string {
  const trimmed = window.location.pathname.replace(/\/+$/, '')
  return trimmed === '' ? '/' : trimmed
}

const path = ref(readPath())

/** Unknown paths fall back to home, so a stale link never renders an empty page. */
export const route = computed<RouteName>(() => routes[path.value] ?? 'home')

export function navigate(to: string): void {
  if (to === path.value) return
  window.history.pushState({}, '', to)
  path.value = readPath()
}

window.addEventListener('popstate', () => {
  path.value = readPath()
})
