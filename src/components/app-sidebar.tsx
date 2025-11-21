"use client";

import * as React from "react";
import {
  IconHome,
  IconInnerShadowTop,
  IconQuestionMark,
  IconWallet,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Home",
      description: "dashboard",
      url: "dashboard",
      icon: IconHome,
    },
    {
      title: "Wallets",
      url: "wallets",
      description: "#",
      icon: IconWallet,
    },
    {
      title: "FAQs",
      url: "faqs",
      description: "#",
      icon: IconQuestionMark,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    id: string;
    email: string;
    image?: string | null;
    name: string;
  };
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            avatar: user.image || "https://picsum.photos/200",
            ...user,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
