import type { Meta, StoryObj } from "@storybook/react"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress"

const meta: Meta<typeof Progress> = {
  title: "UI/Progress",
  component: Progress,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Progress value={60} className="w-64" />
  ),
}

export const WithLabel: Story = {
  render: () => (
    <Progress value={75} className="w-64">
      <ProgressLabel>Uploading</ProgressLabel>
      <ProgressValue />
    </Progress>
  ),
}

export const AllValues: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-64">
      <Progress value={0} />
      <Progress value={25} />
      <Progress value={50} />
      <Progress value={75} />
      <Progress value={100} />
    </div>
  ),
}

export const Loading: Story = {
  render: () => (
    <Progress value={null} className="w-64" />
  ),
}
