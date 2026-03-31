"use client"

import type { Meta, StoryObj } from "@storybook/react"
import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
}

export const Checked: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="checked" defaultChecked />
      <Label htmlFor="checked">Already checked</Label>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled1" disabled />
        <Label htmlFor="disabled1">Disabled unchecked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled2" disabled defaultChecked />
        <Label htmlFor="disabled2">Disabled checked</Label>
      </div>
    </div>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {["Receber notificações por email", "Receber atualizações por SMS", "Aceitar cookies"].map((item, i) => (
        <div key={i} className="flex items-center space-x-2">
          <Checkbox id={`item-${i}`} />
          <Label htmlFor={`item-${i}`}>{item}</Label>
        </div>
      ))}
    </div>
  ),
}
