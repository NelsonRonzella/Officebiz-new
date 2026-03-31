import type { Meta, StoryObj } from "@storybook/react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const meta: Meta<typeof Switch> = {
  title: "UI/Switch",
  component: Switch,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Switch />,
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
}

export const Checked: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="notifications" defaultChecked />
      <Label htmlFor="notifications">Enable notifications</Label>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center space-x-2">
        <Switch id="disabled1" disabled />
        <Label htmlFor="disabled1">Disabled off</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="disabled2" disabled defaultChecked />
        <Label htmlFor="disabled2">Disabled on</Label>
      </div>
    </div>
  ),
}

export const SettingsExample: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      {[
        { id: "s1", label: "Email notifications", defaultChecked: true },
        { id: "s2", label: "Push notifications", defaultChecked: false },
        { id: "s3", label: "SMS alerts", defaultChecked: true },
        { id: "s4", label: "Weekly digest", defaultChecked: false },
      ].map((setting) => (
        <div key={setting.id} className="flex items-center justify-between">
          <Label htmlFor={setting.id}>{setting.label}</Label>
          <Switch id={setting.id} defaultChecked={setting.defaultChecked} />
        </div>
      ))}
    </div>
  ),
}
