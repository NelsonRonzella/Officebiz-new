import type { Meta, StoryObj } from "@storybook/react"
import { AspectRatio } from "@/components/ui/aspect-ratio"

const meta: Meta<typeof AspectRatio> = {
  title: "UI/AspectRatio",
  component: AspectRatio,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-72">
      <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800"
          alt="Photo by Drew Beamer"
          className="w-full h-full object-cover"
        />
      </AspectRatio>
    </div>
  ),
}

export const Square: Story = {
  render: () => (
    <div className="w-48">
      <AspectRatio ratio={1} className="bg-muted rounded-md overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=400"
          alt="Square photo"
          className="w-full h-full object-cover"
        />
      </AspectRatio>
    </div>
  ),
}

export const Portrait: Story = {
  render: () => (
    <div className="w-48">
      <AspectRatio ratio={3 / 4} className="bg-muted rounded-md overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=400"
          alt="Portrait photo"
          className="w-full h-full object-cover"
        />
      </AspectRatio>
    </div>
  ),
}

export const WithPlaceholder: Story = {
  render: () => (
    <div className="w-64">
      <AspectRatio ratio={16 / 9} className="bg-muted rounded-md flex items-center justify-center">
        <span className="text-muted-foreground text-sm">16:9 ratio</span>
      </AspectRatio>
    </div>
  ),
}
