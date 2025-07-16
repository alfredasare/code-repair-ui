"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, History, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";

const menuItems = [
  {
    title: "New Repair",
    icon: FileText,
    url: "/dashboard/new-repair",
  },
  {
    title: "Repair History",
    icon: History,
    url: "/dashboard/repair-history",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/dashboard/settings",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar
          variant="sidebar"
          collapsible="icon"
          className="bg-black border-r-0"
        >
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  className="text-white hover:bg-gray-800"
                >
                  <div className="bg-white text-black flex aspect-square size-8 items-center justify-center rounded-lg">
                    <FileText className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">CodeRepair</span>
                    <span className="truncate text-xs text-gray-400">
                      Assessment Tool
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent className="bg-black">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                        className="text-white hover:bg-gray-800 data-[active=true]:bg-gray-800 data-[active=true]:text-white"
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="bg-black border-t border-gray-800 pt-4">
            <NavUser
              user={{
                name: "John Doe",
                email: "john@example.com",
              }}
            />
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b border-zinc-900/7.5 bg-background px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <div className="flex-1 p-6">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
