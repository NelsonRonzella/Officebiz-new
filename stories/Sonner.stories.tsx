"use client"

import type { Meta, StoryObj } from "@storybook/react"
import { Toaster } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const meta: Meta = {
  title: "UI/Sonner",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div>
        <Story />
        <Toaster />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast("Event has been created", {
        description: "Sunday, December 03, 2023 at 9:00 AM",
      })}
    >
      Show Toast
    </Button>
  ),
}

export const Success: Story = {
  render: () => (
    <Button
      onClick={() => toast.success("Profile updated successfully")}
    >
      Success Toast
    </Button>
  ),
}

export const Error: Story = {
  render: () => (
    <Button
      variant="destructive"
      onClick={() => toast.error("Something went wrong")}
    >
      Error Toast
    </Button>
  ),
}

export const Warning: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.warning("Caution: This action cannot be undone")}
    >
      Warning Toast
    </Button>
  ),
}

export const Info: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.info("New update available")}
    >
      Info Toast
    </Button>
  ),
}

export const WithAction: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast("Event has been created", {
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        })
      }
    >
      Toast with Action
    </Button>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast("Default toast")}>Default</Button>
      <Button onClick={() => toast.success("Success!")}>Success</Button>
      <Button onClick={() => toast.error("Error!")}>Error</Button>
      <Button onClick={() => toast.warning("Warning!")}>Warning</Button>
      <Button onClick={() => toast.info("Info")}>Info</Button>
    </div>
  ),
}
