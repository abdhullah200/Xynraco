"use client";
import * as React from 'react';
import { 
    ChevronRight, 
    File, 
    Folder, 
    Plus, 
    FilePlus,
    MoreHorizontal,
    Trash2,
    Edit3,
    FolderPlus
} from 'lucide-react';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarRail,
} from '@/components/ui/sidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogDescription,
    DialogTitle,
    DialogFooter,
    DialogTrigger
 } from '@/components/ui/dialog';
import TemplateNode from './template-node';

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

interface TemplateFileTreeProps {
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

const TemplateFileTree = ({
    data,
    onFileSelect,
    title = "File Tree",
    onAddFile,
    onDeleteFile,
    onRenameFile,
    onRenameFolder,}: TemplateFileTreeProps) => {   
        const isRootFolder = data && typeof data === "object" && 'items' in data;
        return (
            <Sidebar>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>
                            {title}
                        </SidebarGroupLabel>

                        <DropdownMenu>

                            <DropdownMenuTrigger>
                                <SidebarGroupAction>
                                    <Plus className='h-4 w-4'/>
                                </SidebarGroupAction>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align='end'>

                                <DropdownMenuItem onClick={() => {}}>
                                    <FilePlus className='h-4 w-4 mr-2' />
                                    New File
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => {}}>
                                    <FolderPlus className='h-4 w-4 mr-2' />
                                    New Folder
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {}}>
                                    <Edit3 className='h-4 w-4 mr-2' />
                                    Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {}}>
                                    <Trash2 className='h-4 w-4 mr-2' />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <SidebarGroupContent>
                            <Sidebar>
                                {
                                    isRootFolder ? (
                                        (data as TemplateFolder).items.map((child, index) => (
                                            <TemplateNode
                                            key={index}
                                            item={child}
                                            level={0}
                                            path=""
                                            onAddFile={onAddFile}
                                            onDeleteFile={onDeleteFile}
                                            onRenameFile={onRenameFile}
                                            onRenameFolder={onRenameFolder}
                                            />
                                        )):(
                                            <TemplateNode
                                            item={data}
                                            onFileSelect={onFileSelect}
                                            level={0}
                                            path=""
                                            onAddFile={onAddFile}
                                            onDeleteFile={onDeleteFile}
                                            onDeleteFolder={onDeleteFile}
                                            onRenameFile={onRenameFile}
                                            onRenameFolder={onRenameFolder}
                                            />
                                        )
                                }
                            </Sidebar>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

            </Sidebar>
        )
    
}
export default TemplateFileTree;