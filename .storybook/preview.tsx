import type { Preview } from "@storybook/react"
import "../app/globals.css"

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
    a11y: {
      test: "todo",
    },
  },
  decorators: [
    (Story) => (
      <div className="p-8 bg-background text-foreground min-h-screen">
        <Story />
      </div>
    ),
  ],
}

export default preview
