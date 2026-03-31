import type { Meta, StoryObj } from "@storybook/react"
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command"
import {
  IconCalendar,
  IconMoodSmile,
  IconCalculator,
  IconUser,
  IconSettings,
  IconCreditCard,
} from "@tabler/icons-react"

const meta: Meta = {
  title: "UI/Command",
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-80">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <IconCalendar />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <IconMoodSmile />
            <span>Search Emoji</span>
          </CommandItem>
          <CommandItem>
            <IconCalculator />
            <span>Calculator</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <IconUser />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <IconCreditCard />
            <span>Billing</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <IconSettings />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}

export const Empty: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-80">
      <CommandInput placeholder="Search..." defaultValue="zzz no match" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Items">
          <CommandItem>Item 1</CommandItem>
          <CommandItem>Item 2</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}
