import "@vitest/browser/matchers.d.ts";
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-vue'
import App from './App.vue'

test('should render name', async () => {
  const { getByText } = render(App)

  await expect.element(getByText('Fred Nordell')).toBeInTheDocument()
})

test("should match snapshot", async () => {
  const app = render(App);

  expect(app).toMatchSnapshot()
})