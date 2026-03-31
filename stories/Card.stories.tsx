import type { Meta, StoryObj } from "@storybook/react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here. Add your content inside this component.</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Action</Button>
      </CardFooter>
    </Card>
  ),
}

export const WithAction: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
        <CardAction>
          <Badge>New</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>This card has a header action element in the top right corner.</p>
      </CardContent>
    </Card>
  ),
}

export const SmallSize: Story = {
  render: () => (
    <Card className="w-72" size="sm">
      <CardHeader>
        <CardTitle>Small Card</CardTitle>
        <CardDescription>Compact card variant</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is a smaller card with reduced padding.</p>
      </CardContent>
    </Card>
  ),
}

export const Simple: Story = {
  render: () => (
    <Card className="w-72">
      <CardContent>
        <p>A minimal card with only content.</p>
      </CardContent>
    </Card>
  ),
}

export const WithFooterActions: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Your project will be deployed to our servers immediately.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  ),
}
