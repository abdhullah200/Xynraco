"use client"
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { usePlayground } from '@/features/playground/hooks/usePlayground';
import { Separator } from '@radix-ui/react-separator';
import { Sidebar } from 'lucide-react';
import { useParams } from 'next/navigation';
import React from 'react';

const Page = ()=>{
    const {id} =useParams<{id:string}>();
  // Custom hooks
  const { playgroundData, templateData, isLoading, error, saveTemplateData } =
    usePlayground(id);
    console.log(playgroundData);
    console.log(templateData);
    return (
        <div>
            <>
                {/**Template file tree */}
                <SidebarInset>
                    <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
                    <SidebarTrigger className='-ml-1'/>
                        <Separator orientation='vertical' className='mr-2 h-4'/>
                        <div className='flex flex-1 items-center gap-2'>
                            <div className='flex flex-col flex-1'>
                                {playgroundData?.title || 'Playground'}
                            </div>
                        </div>
                </header>
                </SidebarInset>
            </>
        </div>
    )
}

export default Page;