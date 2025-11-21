"use client";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { useParams } from "next/navigation";
import React from "react";

const Page=() => {
    const {id} = useParams<{id: string}>();
    return(
        <div>
            <>
            {/* TEMPLATE TREE */}
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-m1-1"/>
                        <Separator orientation="vertical" className="mr-2 h-4" />

                        <div className="flex flex-1 items-center gap-2">
                            <div className="flex flex-col flex-1">


                            </div>

                        </div>
                </header>
            </SidebarInset>
            </>
        </div>
    )
}
export default Page;