"use client";
import { SidebarInset, SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";
import React from "react";
import TemplateFileTree from "@/features/playground/components/template-file-tree";

const Page = () => {
    const {id} = useParams<{id: string}>();

    return(
        <>
            <SidebarProvider suppressHydrationWarning>
            <TemplateFileTree />
            <div>
                <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-m1-1"/>
                    <Separator className="mr-2 h-4" />
                    <div className="flex flex-1 items-center gap-2">
                    <div className="flex flex-col flex-1">
                        <h1>Code Playground - {id}</h1>
                    </div>
                    </div>
                </header>
                </SidebarInset>
            </div>
            </SidebarProvider>
        </>
    )
}

export default Page;