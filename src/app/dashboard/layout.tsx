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
import { useAssessments, useDeleteAssessment } from "@/hooks/use-assessment";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

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
  const {
    data: assessments,
    isLoading: assessmentsLoading,
    error: assessmentsError,
  } = useAssessments();
  const deleteAssessment = useDeleteAssessment();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<string | null>(
    null
  );

  const handleDeleteClick = (assessmentId: string) => {
    setAssessmentToDelete(assessmentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assessmentToDelete) return;

    try {
      await deleteAssessment.mutateAsync(assessmentToDelete);

      // Invalidate assessments list to refresh sidebar
      queryClient.invalidateQueries({ queryKey: ["assessments"] });

      // Show success toast
      toast("Repair deleted successfully", {
        description: "The assessment has been removed from your list.",
        action: {
          label: "Close",
          onClick: () => toast.dismiss(),
        },
      });

      // Close dialog
      setDeleteDialogOpen(false);
      setAssessmentToDelete(null);
    } catch (error) {
      console.error("Failed to delete assessment:", error);
      toast("Failed to delete repair", {
        description: "Please try again later.",
        action: {
          label: "Close",
          onClick: () => toast.dismiss(),
        },
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAssessmentToDelete(null);
  };

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
      const assessment = assessments?.assessments.find(
        (a) => a.id === assessmentId
      );
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
                      Code Repair Tool
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
                  ) : !assessments?.assessments ||
                    assessments.assessments.length === 0 ? (
                    <div className="text-gray-400 text-sm px-2 py-4">
                      No repairs yet
                    </div>
                  ) : (
                    <SidebarMenu>
                      {assessments.assessments
                        .sort(
                          (a, b) =>
                            new Date(b.date_created).getTime() -
                            new Date(a.date_created).getTime()
                        )
                        .map((assessment) => {
                          const displayName = `${assessment.cwe_id}-${assessment.cve_id}-${assessment.model_id}`;
                          const url = `/dashboard/repair/${assessment.id}`;

                          return (
                            <SidebarMenuItem key={assessment.id}>
                              <div className="flex items-center w-full relative hover:bg-gray-800 rounded-md transition-colors [&:hover_button]:opacity-100">
                                <SidebarMenuButton
                                  asChild
                                  isActive={pathname === url}
                                  className="text-white data-[active=true]:bg-gray-800 data-[active=true]:text-white flex-1 pr-8 hover:bg-transparent"
                                >
                                  <Link href={url}>
                                    <span className="truncate">
                                      {displayName}
                                    </span>
                                  </Link>
                                </SidebarMenuButton>

                                {/* Three dots menu - positioned absolutely */}
                                <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="opacity-0 transition-opacity text-white hover:bg-gray-700 h-6 w-6 p-0 cursor-pointer"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <MoreHorizontal className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      side="right"
                                      alignOffset={-10}
                                      sideOffset={5}
                                      className="w-40 bg-black border border-gray-800 shadow-lg"
                                    >
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleDeleteClick(assessment.id)
                                        }
                                        className="text-white hover:bg-gray-800 focus:bg-gray-800 cursor-pointer"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-black border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Repair</DialogTitle>
            <DialogDescription className="text-gray-300">
              Are you sure you want to delete this repair assessment? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              className="border-gray-800 text-white hover:bg-gray-800 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={deleteAssessment.isPending}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteAssessment.isPending ? (
                <>
                  <Spinner size="sm" color="white" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
