"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deletePlaygroundById, editPlaygroundById, duplicateProjectById } from "@/features/dashboard/action";
import ProjectTable from "./project-table";
import type { Project } from "../types";

interface ClientProjectTableProps {
  projects: Project[];
}

export default function ClientProjectTable({ projects }: ClientProjectTableProps) {
  const router = useRouter();

  const handleDeleteProject = async (id: string) => {
    try {
      await deletePlaygroundById(id);
      toast.success("Project deleted successfully");
      router.refresh(); // Refresh to update the list
    } catch (error) {
      toast.error("Failed to delete project");
      console.error("Error deleting project:", error);
    }
  };

  const handleUpdateProject = async (id: string, data: { title: string; description: string }) => {
    try {
      await editPlaygroundById(id, data);
      toast.success("Project updated successfully");
      router.refresh(); // Refresh to update the list
    } catch (error) {
      toast.error("Failed to update project");
      console.error("Error updating project:", error);
    }
  };

  const handleDuplicateProject = async (id: string) => {
    try {
      await duplicateProjectById(id);
      toast.success("Project duplicated successfully");
      router.refresh(); // Refresh to update the list
    } catch (error) {
      toast.error("Failed to duplicate project");
      console.error("Error duplicating project:", error);
    }
  };

  return (
    <ProjectTable
      projects={projects}
      onDeleteProject={handleDeleteProject}
      onUpdateProject={handleUpdateProject}
      onDuplicateProject={handleDuplicateProject}
    />
  );
}