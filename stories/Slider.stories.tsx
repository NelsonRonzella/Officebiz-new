"use client"

import type { Meta, StoryObj } from "@storybook/react"
import * as React from "react"
import { Slider } from "@/components/ui/slider"

const meta: Meta<typeof Slider> = {
  title: "UI/Slider",
  component: Slider,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Slider defaultValue={[33]} max={100} step={1} className="w-64" />
  ),
}

export const Range: Story = {
  render: () => (
    <Slider defaultValue={[25, 75]} max={100} step={1} className="w-64" />
  ),
}

export const WithSteps: Story = {
  render: () => (
    <Slider defaultValue={[50]} max={100} step={10} className="w-64" />
  ),
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState([50])
    return (
      <div className="space-y-4 w-64">
        <Slider
          value={value}
          onValueChange={setValue}
          max={100}
          step={1}
        />
        <p className="text-sm text-muted-foreground">Value: {value[0]}</p>
      </div>
    )
  },
}

export const Disabled: Story = {
  render: () => (
    <Slider defaultValue={[40]} max={100} disabled className="w-64" />
  ),
}
