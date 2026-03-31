import type { Meta, StoryObj } from "@storybook/react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

const meta: Meta<typeof Label> = {
  title: "UI/Label",
  component: Label,
  tags: ["autodocs"],
  args: {
    children: "Label text",
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithInput: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email-label">Your Email</Label>
      <Input type="email" id="email-label" placeholder="me@example.com" />
    </div>
  ),
}

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms2" />
      <Label htmlFor="terms2">Accept terms and conditions</Label>
    </div>
  ),
}

export const Required: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="required-field">
        Required Field <span className="text-destructive">*</span>
      </Label>
      <Input id="required-field" required />
    </div>
  ),
}
