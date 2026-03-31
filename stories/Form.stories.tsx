"use client"

import type { Meta, StoryObj } from "@storybook/react"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const meta: Meta = {
  title: "UI/Form",
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string; password: string }>()
  return (
    <form onSubmit={handleSubmit((data) => console.log(data))} className="space-y-4 w-80">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register("password", { required: "Password is required", minLength: { value: 8, message: "Min 8 characters" } })}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full">Log in</Button>
    </form>
  )
}

export const Login: Story = {
  render: () => <LoginForm />,
}

function ProfileForm() {
  const { register, handleSubmit } = useForm<{ name: string; bio: string; role: string }>()
  return (
    <form onSubmit={handleSubmit((d) => console.log(d))} className="space-y-4 w-80">
      <div className="space-y-2">
        <Label htmlFor="pname">Full Name</Label>
        <Input id="pname" placeholder="John Doe" {...register("name")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pbio">Bio</Label>
        <Textarea id="pbio" placeholder="Tell us about yourself..." {...register("bio")} />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="notifications-form" />
        <Label htmlFor="notifications-form">Receive marketing emails</Label>
      </div>
      <Button type="submit">Update profile</Button>
    </form>
  )
}

export const Profile: Story = {
  render: () => <ProfileForm />,
}

function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<{ name: string; email: string; message: string }>()
  return (
    <form onSubmit={handleSubmit((d) => console.log(d))} className="space-y-4 w-96">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cfname">First name</Label>
          <Input id="cfname" {...register("name", { required: true })} />
          {errors.name && <p className="text-xs text-destructive">Required</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cflname">Last name</Label>
          <Input id="cflname" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="cfemail">Email</Label>
        <Input id="cfemail" type="email" {...register("email", { required: true })} />
        {errors.email && <p className="text-xs text-destructive">Required</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="cfmessage">Message</Label>
        <Textarea id="cfmessage" rows={4} {...register("message", { required: true })} />
        {errors.message && <p className="text-xs text-destructive">Required</p>}
      </div>
      <Button type="submit" className="w-full">Send message</Button>
    </form>
  )
}

export const Contact: Story = {
  render: () => <ContactForm />,
}
