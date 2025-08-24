"use client"

import * as React from "react"
import {
  Calculator,
  CreditCard,
  DollarSign,
  Home,
  LineChart,
  PieChart,
  Wallet,
  TrendingUp,
  User,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Juno app data - Financial management focused
const data = {
  user: {
    name: "Juno User",
    email: "user@juno.app",
    avatar: "/avatars/user.jpg",
  },
  teams: [
    {
      name: "Personal",
      logo: Wallet,
      plan: "Individual",
    },
    {
      name: "Family",
      logo: Home,
      plan: "Family Plan",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
        {
          title: "Budget",
          url: "/dashboard/budget/new",
        },
      ],
    },
    {
      title: "Transactions",
      url: "/dashboard/transactions",
      icon: CreditCard,
      items: [
        {
          title: "All Transactions",
          url: "/dashboard/transactions",
        },
        {
          title: "Add Transaction",
          url: "/dashboard/transactions/new",
        },
      ],
    },
    {
      title: "Categories",
      url: "/dashboard/categories",
      icon: PieChart,
      items: [
        {
          title: "Manage Categories",
          url: "/dashboard/categories",
        },
        {
          title: "Category Groups",
          url: "/dashboard/categories",
        },
      ],
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: LineChart,
      items: [
        {
          title: "Reports",
          url: "/dashboard/analytics",
        },
        {
          title: "Trends",
          url: "/dashboard/trends",
        },
        {
          title: "Tables",
          url: "/dashboard/tables",
        },
      ],
    },
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: User,
      items: [
        {
          title: "Account Settings",
          url: "/dashboard/profile",
        },
        {
          title: "Preferences",
          url: "/dashboard/settings",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Emergency Fund",
      url: "#",
      icon: DollarSign,
    },
    {
      name: "Investment Portfolio",
      url: "#", 
      icon: TrendingUp,
    },
    {
      name: "Monthly Budget",
      url: "#",
      icon: Calculator,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
