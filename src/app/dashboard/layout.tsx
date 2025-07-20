"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Settings, Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { NavUser } from "@/components/nav-user";
import { useAuthStore } from "@/lib/auth/auth-store";
import { useAssessments } from "@/hooks/use-assessment";
import { Spinner } from "@/components/ui/spinner";

const menuItems = [
  {
    title: "New Repair",
    icon: Plus,
    url: "/dashboard/new-repair",
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
  const { user } = useAuthStore();
  const { data: assessments, isLoading: assessmentsLoading, error: assessmentsError } = useAssessments();

  // Generate breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const currentItem = menuItems.find((item) => item.url === pathname);
    if (currentItem) {
      return (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentItem.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
    }

    // Check if it's a repair detail page
    const repairMatch = pathname.match(/\/dashboard\/repair\/([^/]+)/);
    if (repairMatch) {
      const assessmentId = repairMatch[1];
      // Find the assessment to get display name
      const assessment = assessments?.assessments.find(a => a.id === assessmentId);
      const displayName = assessment 
        ? `${assessment.cwe_id}-${assessment.cve_id}-${assessment.model_id}`
        : `Assessment ${assessmentId}`;
      
      return (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{displayName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
    }

    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar
          variant="sidebar"
          collapsible="icon"
          className="bg-black border-r-0"
        >
          <SidebarHeader className="bg-black">
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

          <SidebarContent className="bg-black flex flex-col">
            {/* Main Navigation - Always Visible */}
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

            <Separator className="bg-gray-800 my-2" />

            {/* Scrollable Repairs Section */}
            <SidebarGroup className="flex-1 min-h-0 group-data-[collapsible=icon]:hidden">
              <SidebarGroupLabel className="text-gray-400 text-xs font-medium px-2 py-1">
                Repairs
              </SidebarGroupLabel>
              <SidebarGroupContent className="flex-1 overflow-hidden">
                <div className="overflow-y-auto h-full">
                  {assessmentsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Spinner size="sm" color="white" />
                    </div>
                  ) : assessmentsError ? (
                    <div className="text-gray-400 text-sm px-2 py-4">
                      Failed to load repairs
                    </div>
                  ) : !assessments?.assessments || assessments.assessments.length === 0 ? (
                    <div className="text-gray-400 text-sm px-2 py-4">
                      No repairs yet
                    </div>
                  ) : (
                    <SidebarMenu>
                      {assessments.assessments.map((assessment) => {
                        const displayName = `${assessment.cwe_id}-${assessment.cve_id}-${assessment.model_id}`;
                        const url = `/dashboard/repair/${assessment.id}`;
                        
                        return (
                          <SidebarMenuItem key={assessment.id}>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname === url}
                              className="text-white hover:bg-gray-800 data-[active=true]:bg-gray-800 data-[active=true]:text-white"
                            >
                              <Link href={url}>
                                <span className="truncate">{displayName}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  )}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="bg-black border-t border-gray-800 pt-4">
            {user && (
              <NavUser
                user={{
                  username: user.username || "",
                  email: user.email,
                }}
              />
            )}
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-zinc-900/7.5 bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {getBreadcrumbs()}
          </header>
          <div className="flex-1 p-6">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
