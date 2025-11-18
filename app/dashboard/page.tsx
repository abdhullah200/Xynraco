import AddNewButton from "@/features/dashboard/components/add-new-button";
import AddRepo from "@/features/dashboard/components/add-repo";
import title from "@/components/ui/empty-state";
import EmptyState from "@/components/ui/empty-state";
import React from "react";
import { get } from "http";
import { getAllPlaygroundForUser } from "@/features/dashboard/action";
import { deleteProjectById, editProjectById, duplicateProjectById } from "@/features/playground/actions";
import ProjectTable from "@/features/dashboard/components/project-table";

const DashboardMainPage = async () => {
  const playgrounds = await getAllPlaygroundForUser();
  return (
    <div className="flex flex-col justify-start items-center min-h-screen mx-auto max-w-7xl px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <AddNewButton />
        <AddRepo />
      </div>
      <div className="mt-10 flex flex-col justify-center items-center w-full">
        {playgrounds && playgrounds.length === 0 ? (
          
          <EmptyState title="No projects found" description="Create a new project to get started!" imageSrc='/empty-state.svg'/>
        ) : (
          <ProjectTable
          //@ts-ignore
            projects={playgrounds||[]}
            onDeleteProject={deleteProjectById}
            onUpdateProject={editProjectById}
            onDuplicateProject={duplicateProjectById}
        />
        )
}
      </div>
    </div>
  );
};

export default DashboardMainPage;