"use client";
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { 
    FilePlus,
    FolderPlus,
    RefreshCw,
    ChevronsDownUp,
    File,
    Folder
} from 'lucide-react';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    onDeleteFile?: (filePath: string) => void
    onDeleteFolder?: (folderPath: string) => void
    onRenameFile?: (oldPath: string, newFilename: string, newExtension: string) => void
    onRenameFolder?: (oldPath: string, newFolderName: string) => void
}

const TemplateFileTree = ({
    data,
    onFileSelect,
    title = "File Tree",
    onAddFile,
    onDeleteFile,
    onDeleteFolder,
    onRenameFile,
    onRenameFolder,
    onAddFolder,}: TemplateFileTreeProps) => {   
        const isRootFolder = data && typeof data === "object" && 'items' in data;
        
        // State for inline input
        const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null);
        const [newItemName, setNewItemName] = useState("");
        const inputRef = useRef<HTMLInputElement>(null);

        // Focus input when creating
        useEffect(() => {
            if (isCreating && inputRef.current) {
                inputRef.current.focus();
            }
        }, [isCreating]);

        const handleCreateItem = () => {
            if (!newItemName.trim()) {
                setIsCreating(null);
                setNewItemName("");
                return;
            }

            if (isCreating === 'file') {
                // Parse filename and extension
                const lastDot = newItemName.lastIndexOf('.');
                let filename: string;
                let extension: string;
                
                if (lastDot > 0) {
                    filename = newItemName.substring(0, lastDot);
                    extension = newItemName.substring(lastDot + 1);
                } else {
                    filename = newItemName;
                    extension = "txt";
                }

                const newFile: TemplateFile = {
                    filename: filename.trim(),
                    fileExtension: extension.trim(),
                    content: ""
                };
                onAddFile?.(newFile, "");
            } else if (isCreating === 'folder') {
                const newFolder: TemplateFolder = {
                    folderName: newItemName.trim(),
                    items: []
                };
                onAddFolder?.(newFolder, "");
            }

            setIsCreating(null);
            setNewItemName("");
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                handleCreateItem();
            } else if (e.key === 'Escape') {
                setIsCreating(null);
                setNewItemName("");
            }
        };

        return (
            <Sidebar>
                <SidebarContent>
                    <SidebarGroup>
                        <div className="flex items-center justify-between px-2 py-2 border-b border-border">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {title}
                            </span>

                            <div className="flex items-center gap-1">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6"
                                    onClick={() => setIsCreating('file')}
                                    title="New File"
                                >
                                    <FilePlus className='h-4 w-4'/>
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6"
                                    onClick={() => setIsCreating('folder')}
                                    title="New Folder"
                                >
                                    <FolderPlus className='h-4 w-4'/>
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6"
                                    title="Refresh"
                                >
                                    <RefreshCw className='h-4 w-4'/>
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6"
                                    title="Collapse All"
                                >
                                    <ChevronsDownUp className='h-4 w-4'/>
                                </Button>
                            </div>
                        </div>

                        <SidebarGroupContent>
                            <div className="py-1">
                                {/* Inline input for creating new file/folder */}
                                {isCreating && (
                                    <div className="flex items-center gap-2 px-2 py-1">
                                        {isCreating === 'file' ? (
                                            <File className="h-4 w-4 text-muted-foreground shrink-0" />
                                        ) : (
                                            <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
                                        )}
                                        <Input
                                            ref={inputRef}
                                            value={newItemName}
                                            onChange={(e) => setNewItemName(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            onBlur={handleCreateItem}
                                            placeholder={isCreating === 'file' ? "filename.js" : "folder name"}
                                            className="h-6 text-sm py-0 px-1"
                                        />
                                    </div>
                                )}

                                {/* File tree items */}
                                {isRootFolder ? (
                                    (data as TemplateFolder).items.map((child, index) => (
                                        <TemplateNode
                                            key={index}
                                            item={child}
                                            level={0}
                                            path=""
                                            onFileSelect={onFileSelect}
                                            onAddFile={onAddFile}
                                            onAddFolder={onAddFolder}
                                            onDeleteFile={onDeleteFile}
                                            onDeleteFolder={onDeleteFolder}
                                            onRenameFile={onRenameFile}
                                            onRenameFolder={onRenameFolder}
                                        />
                                    ))
                                ) : (
                                    <TemplateNode
                                        item={data}
                                        onFileSelect={onFileSelect}
                                        level={0}
                                        path=""
                                        onAddFile={onAddFile}
                                        onAddFolder={onAddFolder}
                                        onDeleteFile={onDeleteFile}
                                        onDeleteFolder={onDeleteFolder}
                                        onRenameFile={onRenameFile}
                                        onRenameFolder={onRenameFolder}
                                    />
                                )}
                            </div>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        )
    
}
export default TemplateFileTree;