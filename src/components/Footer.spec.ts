import "@vitest/browser/matchers.d.ts"
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-vue'
import Footer from './Footer.vue'

test('should have logos in the footer', async () => {
  const { getByAltText } = render(Footer)

  await expect.element(getByAltText("GitHub Logo")).toBeInTheDocument()
  await expect.element(getByAltText("LinkedIn Logo")).toBeInTheDocument()
})

test("should match snapshot", async () => {
  const app = render(Footer);

  expect(app).toMatchSnapshot()
})