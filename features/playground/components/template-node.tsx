import { DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { DropdownMenu } from '@radix-ui/react-dropdown-menu';
import { ChevronRight, File, Folder, MoreHorizontal, FilePlus, FolderPlus, Trash2, Edit3 } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';

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


interface TemplateNodeProps {
    item: TemplateItem
    onFileSelect?: (file: TemplateFile) => void
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

const TemplateNode = ({
    item,
    onFileSelect,
    selectedFile,
    level,
    path = "",
    onAddFile,
    onAddFolder,
    onDeleteFile,
    onDeleteFolder,
    onRenameFile,
    onRenameFolder,
}: TemplateNodeProps) => {
    const isValidItem = item && typeof item === "object";
    const isFolder = isValidItem && 'items' in item;

    const [isOpen, setIsOpen] = useState(level < 2);
    const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const [renameValue, setRenameValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const renameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isCreating && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isCreating]);

    useEffect(() => {
        if (isRenaming && renameInputRef.current) {
            renameInputRef.current.focus();
            renameInputRef.current.select();
        }
    }, [isRenaming]);

    if (!isValidItem) return null;

    // Handle FILE (not a folder)
    if (!isFolder) {
        const file = item as TemplateFile;
        const fileName = `${file.filename}.${file.fileExtension}`;
        const filePath = path ? `${path}/${fileName}` : fileName;

        const handleRename = () => {
            setRenameValue(fileName);
            setIsRenaming(true);
        };

        const handleRenameSubmit = () => {
            if (renameValue.trim() && renameValue !== fileName) {
                const lastDot = renameValue.lastIndexOf('.');
                let newFilename: string;
                let newExtension: string;
                
                if (lastDot > 0) {
                    newFilename = renameValue.substring(0, lastDot);
                    newExtension = renameValue.substring(lastDot + 1);
                } else {
                    newFilename = renameValue;
                    newExtension = file.fileExtension;
                }
                
                onRenameFile?.(filePath, newFilename, newExtension);
            }
            setIsRenaming(false);
            setRenameValue("");
        };

        const handleRenameKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                handleRenameSubmit();
            } else if (e.key === 'Escape') {
                setIsRenaming(false);
                setRenameValue("");
            }
        };

        if (isRenaming) {
            return (
                <SidebarMenuItem>
                    <div className="flex items-center gap-2 px-2 py-1">
                        <File className="h-4 w-4 text-muted-foreground shrink-0" />
                        <Input
                            ref={renameInputRef}
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={handleRenameKeyDown}
                            onBlur={handleRenameSubmit}
                            className="h-6 text-sm py-0 px-1"
                        />
                    </div>
                </SidebarMenuItem>
            );
        }

        return (
            <SidebarMenuItem>
                <div className="flex items-center group">
                    <SidebarMenuButton className='flex-1' onClick={() => onFileSelect?.(file)}>
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
                            <DropdownMenuItem onClick={handleRename}>
                                <Edit3 className='h-4 w-4 mr-2' />
                                Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => onDeleteFile?.(filePath)}
                                className="text-destructive"
                            >
                                <Trash2 className='h-4 w-4 mr-2' />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </SidebarMenuItem>
        );
    }
    
    // Handle FOLDER
    const folder = item as TemplateFolder;
    const folderName = folder.folderName;
    const currentPath = path ? `${path}/${folderName}` : folderName;

    const handleCreateItem = () => {
        if (!newItemName.trim()) {
            setIsCreating(null);
            setNewItemName("");
            return;
        }

        if (isCreating === 'file') {
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
            onAddFile?.(newFile, currentPath);
        } else if (isCreating === 'folder') {
            const newFolder: TemplateFolder = {
                folderName: newItemName.trim(),
                items: []
            };
            onAddFolder?.(newFolder, currentPath);
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

    const handleAddFile = () => {
        setIsOpen(true);
        setIsCreating('file');
    };

    const handleAddFolder = () => {
        setIsOpen(true);
        setIsCreating('folder');
    };

    const handleRenameFolder = () => {
        setRenameValue(folderName);
        setIsRenaming(true);
    };

    const handleRenameFolderSubmit = () => {
        if (renameValue.trim() && renameValue !== folderName) {
            onRenameFolder?.(currentPath, renameValue.trim());
        }
        setIsRenaming(false);
        setRenameValue("");
    };

    const handleRenameFolderKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRenameFolderSubmit();
        } else if (e.key === 'Escape') {
            setIsRenaming(false);
            setRenameValue("");
        }
    };

    if (isRenaming) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <div className="flex items-center gap-2 px-2 py-1">
                        <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
                        <Input
                            ref={renameInputRef}
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={handleRenameFolderKeyDown}
                            onBlur={handleRenameFolderSubmit}
                            className="h-6 text-sm py-0 px-1"
                        />
                    </div>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    return (
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
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={"ghost"} size={"icon"} className='h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity'>
                                <MoreHorizontal className='h-3 w-3'/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={handleAddFile}>
                                <FilePlus className='h-4 w-4 mr-2' />
                                New File
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleAddFolder}>
                                <FolderPlus className='h-4 w-4 mr-2' />
                                New Folder
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleRenameFolder}>
                                <Edit3 className='h-4 w-4 mr-2' />
                                Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => onDeleteFolder?.(currentPath)}
                                className="text-destructive"
                            >
                                <Trash2 className='h-4 w-4 mr-2' />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <CollapsibleContent>
                    <SidebarMenuSub>
                        {/* Inline input for creating new file/folder inside this folder */}
                        {isCreating && (
                            <SidebarMenuItem>
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
                            </SidebarMenuItem>
                        )}
                        
                        {folder.items.map((child, index) => (
                            <TemplateNode
                                key={index}
                                item={child}
                                level={level + 1}
                                path={currentPath}
                                onFileSelect={onFileSelect}
                                onAddFile={onAddFile}
                                onAddFolder={onAddFolder}
                                onDeleteFile={onDeleteFile}
                                onDeleteFolder={onDeleteFolder}
                                onRenameFile={onRenameFile}
                                onRenameFolder={onRenameFolder}
                            />
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenu>
    );
}

export default TemplateNode;