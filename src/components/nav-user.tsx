"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-juno-surface-200 data-[state=open]:text-juno-text hover:bg-juno-surface-200 gap-2"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-juno-accent text-juno-text font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-juno-text">{user.name}</span>
                <span className="truncate text-xs text-juno-muted-fg">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" strokeWidth={1.5} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-juno-lg bg-juno-surface-100 border border-juno-border"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-juno-accent text-juno-text font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-juno-text">{user.name}</span>
                  <span className="truncate text-xs text-juno-muted-fg">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-juno-border" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-juno-text hover:bg-juno-surface-200 gap-2">
                <Sparkles strokeWidth={1.5} />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-juno-border" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-juno-text hover:bg-juno-surface-200 gap-2">
                <BadgeCheck strokeWidth={1.5} />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-juno-text hover:bg-juno-surface-200 gap-2">
                <CreditCard strokeWidth={1.5} />
                Payment Methods
              </DropdownMenuItem>
              <DropdownMenuItem className="text-juno-text hover:bg-juno-surface-200 gap-2">
                <Bell strokeWidth={1.5} />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-juno-border" />
            <DropdownMenuItem className="text-juno-danger-fg hover:bg-juno-danger-bg gap-2">
              <LogOut strokeWidth={1.5} />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
