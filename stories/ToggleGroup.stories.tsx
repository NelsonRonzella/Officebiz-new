import type { Meta, StoryObj } from "@storybook/react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { IconBold, IconItalic, IconUnderline, IconAlignLeft, IconAlignCenter, IconAlignRight, IconAlignJustified } from "@tabler/icons-react"

const meta: Meta<typeof ToggleGroup> = {
  title: "UI/ToggleGroup",
  component: ToggleGroup,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ToggleGroup>
      <ToggleGroupItem value="bold" aria-label="Toggle bold"><IconBold /></ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic"><IconItalic /></ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline"><IconUnderline /></ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const SingleSelection: Story = {
  render: () => (
    <ToggleGroup defaultValue={["center"]}>
      <ToggleGroupItem value="left" aria-label="Left aligned"><IconAlignLeft /></ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Center aligned"><IconAlignCenter /></ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Right aligned"><IconAlignRight /></ToggleGroupItem>
      <ToggleGroupItem value="justify" aria-label="Justified"><IconAlignJustified /></ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Outline: Story = {
  render: () => (
    <ToggleGroup variant="outline">
      <ToggleGroupItem value="bold" aria-label="Bold"><IconBold /></ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic"><IconItalic /></ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline"><IconUnderline /></ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const WithText: Story = {
  render: () => (
    <ToggleGroup defaultValue={["monthly"]}>
      <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
      <ToggleGroupItem value="yearly">Yearly</ToggleGroupItem>
    </ToggleGroup>
  ),
}
