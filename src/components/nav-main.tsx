"use client";

import { usePathname } from "next/navigation";
import { type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    description: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname
              .toLowerCase()
              .includes(item.description.toLowerCase());

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  className={cn(
                    "cursor-pointer",
                    isActive
                      ? "!bg-blue-700/80 !text-white hover:!bg-blue-900/80"
                      : ""
                  )}
                >
                  {item.icon && <item.icon />}
                  <Link href={item.url}>{item.title}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
