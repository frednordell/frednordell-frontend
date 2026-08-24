import "@vitest/browser/matchers";
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-vue'
import App from './App.vue'

test('should render name', async () => {
  const { getByText } = render(App)

  await expect.element(getByText('Fred Nordell')).toBeInTheDocument()
})

test('should render the navigation tabs', async () => {
  const { getByText } = render(App)

  await expect.element(getByText('About')).toBeInTheDocument()
  await expect.element(getByText('Gallery')).toBeInTheDocument()
})
