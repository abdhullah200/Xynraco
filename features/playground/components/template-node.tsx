import React, { useState } from 'react'
import { TemplateFolder, TemplateItem, TemplateFile } from '../lib/path-to-json'
import { ChevronRight, File, Folder } from 'lucide-react'
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub } from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'


interface TemplateNodeProps {
    item: TemplateItem
    onFileSelect ?: (file: TemplateFile) => void
    path?: string
    level : number;
    selectFile?: TemplateFile
    onAddFile?: (file: TemplateFile, parentPath: string) => void
    onAddFolder?: (folder: TemplateFolder, parentPath: string) => void
    onDeleteFolder?: (file: TemplateFolder, parentPath:string) => void
    onDeleteFile?: (file: TemplateFile, parentPath:string) => void
    onRenameFile?: (file:TemplateFile, newFilename:string,newExstion: string,parentPath:string) => void
    onRenameFolder?: (folder:TemplateFolder, newFoldername:string,parentPath:string) => void
}

const TemplateNode = ({
    item,
    onFileSelect,
    selectFile,
    level,
    path = '',
    onAddFile,
    onAddFolder,
    onDeleteFolder,
    onDeleteFile,
    onRenameFile,
    onRenameFolder,
}: TemplateNodeProps) => {
    const isValidItem = item && typeof item === "object";
    const isFolder = isValidItem && 'folderName' in item;

    const [isOpen, setIsOpen] = useState(level < 2)

    if (!isValidItem) return null;

    if (isFolder) {
        const folder = item as TemplateFolder;
        const folderPath = path ? `${path}/${folder.folderName}` : folder.folderName;
        
        return (
            <SidebarMenuItem>
                <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible [&[data-state=open]>div>button>svg:first-child]:rotate-90">
                    <div className="flex items-center">
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton className="flex-1">
                                <ChevronRight className="h-4 w-4 shrink-0 transition-transform" />
                                <Folder className="h-4 w-4 mr-2 shrink-0" />
                                <span>{folder.folderName}</span>
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {folder.items.map((child, index) => (
                                <TemplateNode
                                    key={index}
                                    item={child}
                                    onFileSelect={onFileSelect}
                                    selectFile={selectFile}
                                    level={level + 1}
                                    path={folderPath}
                                    onAddFile={onAddFile}
                                    onAddFolder={onAddFolder}
                                    onDeleteFolder={onDeleteFolder}
                                    onDeleteFile={onDeleteFile}
                                    onRenameFile={onRenameFile}
                                    onRenameFolder={onRenameFolder}
                                />
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </Collapsible>
            </SidebarMenuItem>
        )
    }

    const file = item as TemplateFile;
    const fileName = `${file.filename}.${file.fileExtension}`;
    return (
        <SidebarMenuItem>
            <div className='flex items-center group'>
                <SidebarMenuButton className='flex-1' onClick={() => onFileSelect?.(file)}>
                    <File className="h-4 w-4 mr-2 shrink-0"/>
                    <span>{fileName}</span>
                </SidebarMenuButton>
            </div>
        </SidebarMenuItem>
    )
}

export default TemplateNode
