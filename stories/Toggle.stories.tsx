import type { Meta, StoryObj } from "@storybook/react"
import { Toggle } from "@/components/ui/toggle"
import { IconBold, IconItalic, IconUnderline } from "@tabler/icons-react"

const meta: Meta<typeof Toggle> = {
  title: "UI/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Toggle aria-label="Toggle bold">
      <IconBold />
    </Toggle>
  ),
}

export const Outline: Story = {
  render: () => (
    <Toggle variant="outline" aria-label="Toggle italic">
      <IconItalic />
    </Toggle>
  ),
}

export const WithText: Story = {
  render: () => (
    <Toggle aria-label="Toggle bold">
      <IconBold /> Bold
    </Toggle>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle size="sm" aria-label="small"><IconBold /></Toggle>
      <Toggle size="default" aria-label="default"><IconBold /></Toggle>
      <Toggle size="lg" aria-label="large"><IconBold /></Toggle>
    </div>
  ),
}

export const TextFormatting: Story = {
  render: () => (
    <div className="flex items-center gap-1">
      <Toggle aria-label="Toggle bold"><IconBold /></Toggle>
      <Toggle aria-label="Toggle italic"><IconItalic /></Toggle>
      <Toggle aria-label="Toggle underline"><IconUnderline /></Toggle>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Toggle disabled aria-label="Toggle bold">
      <IconBold /> Disabled
    </Toggle>
  ),
}
