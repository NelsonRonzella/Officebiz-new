import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "@/components/ui/button"
import { IconLoader2, IconMail, IconTrash, IconSettings } from "@tabler/icons-react"

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "xs", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
  },
  args: {
    children: "Button",
    variant: "default",
    size: "default",
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center flex-wrap gap-2">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon"><IconSettings /></Button>
      <Button size="icon-xs"><IconSettings /></Button>
      <Button size="icon-sm"><IconSettings /></Button>
      <Button size="icon-lg"><IconSettings /></Button>
    </div>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button><IconMail /> Login with Email</Button>
      <Button variant="destructive"><IconTrash /> Delete</Button>
      <Button variant="outline"><IconSettings /> Settings</Button>
    </div>
  ),
}

export const Loading: Story = {
  render: () => (
    <Button disabled>
      <IconLoader2 className="animate-spin" /> Please wait
    </Button>
  ),
}

export const Disabled: Story = {
  args: { disabled: true, children: "Disabled" },
}
