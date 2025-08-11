"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-juno-surface-200 data-[state=open]:text-juno-text hover:bg-juno-surface-200 gap-2"
            >
              <div className="bg-juno-accent text-juno-text flex aspect-square size-8 items-center justify-center rounded-lg">
                <activeTeam.logo className="size-4" strokeWidth={1.5} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-juno-text">{activeTeam.name}</span>
                <span className="truncate text-xs text-juno-muted-fg">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" strokeWidth={1.5} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-juno-lg bg-juno-surface-100 border border-juno-border"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-juno-muted-fg text-xs font-medium">
              Profiles
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-2 p-2 text-juno-text hover:bg-juno-surface-200"
              >
                <div className="flex size-6 items-center justify-center rounded-md border border-juno-border bg-juno-surface-50">
                  <team.logo className="size-3.5 shrink-0" strokeWidth={1.5} />
                </div>
                <span className="font-medium">{team.name}</span>
                <DropdownMenuShortcut className="text-juno-muted-fg">⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-juno-border" />
            <DropdownMenuItem className="gap-2 p-2 text-juno-text hover:bg-juno-surface-200">
              <div className="flex size-6 items-center justify-center rounded-md border border-juno-border bg-juno-surface-50">
                <Plus className="size-4" strokeWidth={1.5} />
              </div>
              <div className="text-juno-muted-fg font-medium">Add Profile</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
