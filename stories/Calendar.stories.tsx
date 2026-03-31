"use client"

import type { Meta, StoryObj } from "@storybook/react"
import * as React from "react"
import { Calendar } from "@/components/ui/calendar"

const meta: Meta<typeof Calendar> = {
  title: "UI/Calendar",
  component: Calendar,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    )
  },
}

export const Range: Story = {
  render: () => {
    const [range, setRange] = React.useState<{ from?: Date; to?: Date } | undefined>()
    return (
      <Calendar
        mode="range"
        selected={range}
        onSelect={setRange as any}
        className="rounded-md border"
      />
    )
  },
}

export const DropdownCaption: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        captionLayout="dropdown"
        className="rounded-md border"
      />
    )
  },
}

export const Multiple: Story = {
  render: () => {
    const [dates, setDates] = React.useState<Date[] | undefined>()
    return (
      <Calendar
        mode="multiple"
        selected={dates}
        onSelect={setDates}
        className="rounded-md border"
      />
    )
  },
}
