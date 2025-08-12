"use client"

import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="text-juno-muted-fg font-medium">Financial Goals</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton 
              asChild
              className="text-juno-text hover:bg-juno-surface-200 hover:text-juno-text gap-2"
            >
              <a href={item.url}>
                <item.icon strokeWidth={2} className="text-juno-neutral-400" />
                <span className="font-medium">{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover className="text-juno-muted-fg hover:text-juno-text">
                  <MoreHorizontal strokeWidth={2} />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-juno-lg bg-juno-surface-100 border border-juno-border"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem className="text-juno-text hover:bg-juno-surface-200">
                  <Folder strokeWidth={2} />
                  <span>View Goal</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-juno-text hover:bg-juno-surface-200">
                  <Forward strokeWidth={2} />
                  <span>Share Goal</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-juno-border" />
                <DropdownMenuItem className="text-juno-danger-fg hover:bg-juno-danger-bg">
                  <Trash2 strokeWidth={2} />
                  <span>Delete Goal</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-juno-muted-fg hover:text-juno-text hover:bg-juno-surface-100 gap-2">
            <MoreHorizontal strokeWidth={2} />
            <span>View All Goals</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
