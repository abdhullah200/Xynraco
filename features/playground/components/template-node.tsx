import { DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub } from '@/components/ui/sidebar';
import { Button } from '@/templates/vite-shadcn/src/components/ui/button';
import { DropdownMenuItem, DropdownMenuTrigger } from '@/templates/vite-shadcn/src/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { DropdownMenu } from '@radix-ui/react-dropdown-menu';
import { ChevronRight, File, Folder, MoreHorizontal, Sidebar } from 'lucide-react';
import React, { useState } from 'react';
import { Chevron } from 'react-day-picker';

interface TemplateFile{
    filename: string;
    fileExtension: string;
    content: string;
}

interface TemplateFolder{
    folderName: string;
    items: (TemplateFile | TemplateFolder)[];
}

type TemplateItem = TemplateFile | TemplateFolder;


interface  TemplateNodeProps {
    data: TemplateItem
    onFileSelect: (file: TemplateFile) => void
    selectedFile?: TemplateFile
    level: number
    path?: string
    onAddFile?: (file: TemplateFile, parentPath: string) => void
    title?: string
    onAddFolder?: (folder: TemplateFolder, parentPath: string) => void
    onDeleteFile?: (folder: TemplateFolder, parentPath: string) => void
    onRenameFile?: (file: TemplateFile, newFilename: string, newExtension: string, parentPath: string) => void
    onRenameFolder?: (folder: TemplateFolder, newFolderName: string, parentPath: string) => void
}

const TemplateNode= ({item,
    onFileSelect,
    selectedFile,
    level,
    path="",
    onAddFile,
    onAddFolder,
    onDeleteFile,
    onRenameFile,
    onRenameFolder,}: TemplateNodeProps)=>{
        const isValidItem = item && typeof item === "object";
        const isFolder = isValidItem && 'items' in item;

        const  [isOpen, setIsOpen] = useState(level < 2)

        if (!isValidItem)  return null;

        if (isFolder) {
            const file= item  as TemplateFile;
            const fileName = `${file.filename}.${file.fileExtension}`;

            return(
                <SidebarMenuItem>
            <div className="flex items-center group">
                <SidebarMenuButton className='flex-1'>
                    <File className='h-4 w-4 mr-2 shrink-0' />
                    <span>{fileName}</span>
                </SidebarMenuButton>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={"ghost"} size={"icon"} className='h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity'>
                            <MoreHorizontal className='h-3 w-3'/>
                        </Button>
                    </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => {}}>
                                Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {}}>
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>

                </DropdownMenu>
            </div>
        </SidebarMenuItem>
    
            )

        }
        else{
            const folder= item  as TemplateFolder;
            const folderName = folder.folderName;
            const currentPath = path ? `${path}/${folderName}` : folderName;

            return(
                <SidebarMenu>
                    <Collapsible
                    open={isOpen}
                    onOpenChange={setIsOpen}
                    className='group/collapsible [&[data-state=open]>div>button>svg:first-child]:rotate-90'
                    >
                        <div className='flex items-center group'>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton className='flex-1'>
                                    <ChevronRight className='transition-transform'/>
                                    <Folder className='h-4 w-4 mr-2 shrink-0' />
                                    <span>{folderName}</span>
                                    </SidebarMenuButton>
                            </CollapsibleTrigger>

                        </div>

                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {folder.items.map((child, index) => (
                                    <TemplateNode
                                    key={index}
                                    item={child}
                                    level={level + 1}
                                    path={currentPath}
                                    onAddFile={onAddFile}
                                    onAddFolder={onAddFolder}
                                    onDeleteFile={onDeleteFile}
                                    onRenameFile={onRenameFile}
                                    onRenameFolder={onRenameFolder}
                                    />
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>

                    </Collapsible>
                </SidebarMenu>
            )
        }
    
}

export default TemplateNode;