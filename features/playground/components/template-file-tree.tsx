"use client"
import React from 'react'
import { TemplateFolder, TemplateItem, TemplateFile } from '../lib/path-to-json'
import { FilePlus, PlusIcon } from 'lucide-react'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel } from '@/components/ui/sidebar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import TemplateNode from './template-node'

interface TemplateFileTreeProps {
    data: TemplateItem
    onFileSelect ?: (file: TemplateFile) => void
    selectFile?: TemplateFile
    title?: string
    onAddFile?: (file: TemplateFile, parentPath: string) => void
    onAddFolder?: (folder: TemplateFolder, parentPath: string) => void
    onDeleteFolder?: (file: TemplateFolder, parentPath:string) => void
    onDeleteFile?: (file: TemplateFile, parentPath:string) => void
    onRenameFile?: (file:TemplateFile, newFilename:string,newExstion: string,parentPath:string) => void
    onRenameFolder?: (folder:TemplateFolder, newFoldername:string,parentPath:string) => void
}
const TemplateFileTree = ({
    data,
    onFileSelect,
    selectFile,
    title= "Files Explorer",
    onAddFile,
    onAddFolder,
    onDeleteFolder,
    onDeleteFile,
    onRenameFile,
    onRenameFolder,
}:TemplateFileTreeProps) => {

    const isRootFolder = data && typeof data === 'object' && 'folderName' in data;

  return (
        <Sidebar>
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>
                    {title}
                </SidebarGroupLabel>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarGroupAction>
                            <PlusIcon className='h-4 w-4'/>
                        </SidebarGroupAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={()=>{}} className="flex items-center">
                            <FilePlus className='mr-2 h-4 w-4'/>
                            New File
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={()=>{}} className="flex items-center">
                            <PlusIcon className='mr-2 h-4 w-4'/>
                            New Folder
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <SidebarGroupContent>
                    {data && (isRootFolder ? (
                        (data as TemplateFolder).items.map((child, index) => (
                            <TemplateNode
                                key={index}
                                item={child}
                                onFileSelect={onFileSelect}
                                selectFile={selectFile}
                                level={0}
                                path=""
                                onAddFile={onAddFile}
                                onAddFolder={onAddFolder}
                                onDeleteFolder={onDeleteFolder}
                                onDeleteFile={onDeleteFile}
                                onRenameFile={onRenameFile}
                                onRenameFolder={onRenameFolder}
                            />
                        ))
                    ) : (
                        <TemplateNode
                            item={data}
                            onFileSelect={onFileSelect}
                            selectFile={selectFile}
                            level={0}
                            path=""
                            onAddFile={onAddFile}
                            onAddFolder={onAddFolder}
                            onDeleteFolder={onDeleteFolder}
                            onDeleteFile={onDeleteFile}
                            onRenameFile={onRenameFile}
                            onRenameFolder={onRenameFolder}
                        />
                    ))}
                </SidebarGroupContent>
                
            </SidebarGroup>
        </SidebarContent>
    </Sidebar>
  )
}

export default TemplateFileTree
