import React, { useState } from 'react'
import { TemplateFolder, TemplateItem, TemplateFile } from '../lib/path-to-json'
import { ChevronRight, Edit3, File, FilePlus, Folder, MoreHorizontal, Trash2 } from 'lucide-react'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub } from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'


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
    const [isNewFileDialogOpen, setIsNewFileDialogOpen] = React.useState(false);
    const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = React.useState(false);
    const [isRenameDialogOpen, setIsRenameDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(level < 2)

    if (!isValidItem) return null;

    if (isFolder) {
        const folder = item as TemplateFolder;
        const folderPath = path ? `${path}/${folder.folderName}` : folder.folderName;
        
        const handleAddFile = () => {
            setIsNewFileDialogOpen(true);
        }
        
        const handleAddFolder = () => {
            setIsNewFolderDialogOpen(true);
        }
    
        const handleCreateFile = (filename: string, extension: string) => {
            if (onAddFile) {
                const newFile: TemplateFile = {
                    filename,
                    fileExtension: extension,
                    content: '',
                };
                onAddFile(newFile, folderPath);
            }
        }
        
        const handleCreateFolder = (folderName: string) => {
            if (onAddFolder) {
                const newFolder: TemplateFolder = {
                    folderName,
                    items: []
                };
                onAddFolder(newFolder, folderPath);
            }
        }

        
        const handleRename = () => {
            setIsRenameDialogOpen(true);
        }
        
        const handleDelete = () => {
            setIsDeleteDialogOpen(true);
        }
        
        const confirmDelete = () => {
            onDeleteFolder?.(folder, path);
            setIsDeleteDialogOpen(false);
        }

        const handleRenameSubmit = (newFoldername: string) => {
            onRenameFolder?.(folder, newFoldername, path);
            setIsRenameDialogOpen(false);
        }

        return (
            <SidebarMenuItem>
                <Collapsible open={isOpen}
                 onOpenChange={setIsOpen} 
                 className="group/collapsible [&[data-state=open]>div>button>svg:first-child]:rotate-90">
                    <div className="flex items-center">
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton className="flex-1">
                                <ChevronRight className="h-4 w-4 shrink-0 transition-transform" />
                                <Folder className="h-4 w-4 mr-2 shrink-0" />
                                <span>{folder.folderName}</span>
                                
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant={"ghost"} className='ml-2 h-6 w-6 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700'>
                                            <MoreHorizontal className='h-4 w-4'/>
                                        </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleAddFile}>
                                        <FilePlus className='mr-2 h-4 w-4'/>
                                            New File
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleAddFolder}>
                                        <Folder className='mr-2 h-4 w-4'/>
                                            New Folder
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem onClick={handleRename}>
                                        <Edit3 className='mr-2 h-4 w-4'/>
                                            Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem onClick={handleDelete} className='text-destructive'>
                                        <Trash2 className='mr-2 h-4 w-4'/>
                                            Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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
                
                {/* Folder Dialogs */}
                <NewFileDialog
                    isOpen={isNewFileDialogOpen}
                    onClose={() => setIsNewFileDialogOpen(false)}
                    onCreateFile={handleCreateFile}
                />
                
                <NewFolderDialog
                    isOpen={isNewFolderDialogOpen}
                    onClose={() => setIsNewFolderDialogOpen(false)}
                    onCreateFolder={handleCreateFolder}
                />
                
                <RenameFolderDialog
                    isOpen={isRenameDialogOpen}
                    onClose={() => setIsRenameDialogOpen(false)}
                    onRenameFolder={handleRenameSubmit}
                    currentName={folder.folderName}
                />
                
                <DeleteDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={confirmDelete}
                    itemName={folder.folderName}
                    itemType="folder"
                />
            </SidebarMenuItem>
        );
    }

    const file = item as TemplateFile;
    const fileName = `${file.filename}.${file.fileExtension}`;
    const isSelected = 
        selectFile && selectFile.filename === file.filename && selectFile.fileExtension === file.fileExtension;
    
    const handleRename = () => {
        setIsRenameDialogOpen(true);
    }
    
    const handleDelete = () => {
        setIsDeleteDialogOpen(true);
    }
    
    const confirmDelete = () => {
        onDeleteFile?.(file, path);
        setIsDeleteDialogOpen(false);
    }
    
    const handleRenameSubmit = (newFilename: string, newExtension: string) => {
        onRenameFile?.(file, newFilename, newExtension, path);
        setIsRenameDialogOpen(false);
    }
    
    return (
        <SidebarMenuItem>
            <div className='flex items-center group'>
                <SidebarMenuButton className='flex-1' onClick={() => onFileSelect?.(file)}>
                    <File className="h-4 w-4 mr-2 shrink-0"/>
                    <span>{fileName}</span>
                </SidebarMenuButton>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={"ghost"} className='ml-2 h-6 w-6 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700'>
                            <MoreHorizontal className='h-4 w-4'/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleRename}>
                            <Edit3 className='mr-2 h-4 w-4'/>
                                Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={handleDelete} className='text-destructive'>
                            <Trash2 className='mr-2 h-4 w-4'/>
                                Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            
            {/* File Dialogs */}
            <RenameFileDialog
                isOpen={isRenameDialogOpen}
                onClose={() => setIsRenameDialogOpen(false)}
                currentFilename={file.filename}
                currentExtension={file.fileExtension}
                onRename={handleRenameSubmit}
            />
            
            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                itemName={fileName}
                itemType="file"
            />
        </SidebarMenuItem>
    )
}

// Dialog Components
interface NewFileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateFile: (filename: string, fileExtension: string) => void;
}

function NewFileDialog({ isOpen, onClose, onCreateFile }: NewFileDialogProps) {
    const [filename, setFilename] = React.useState('');
    const [fileExtension, setFileExtension] = React.useState('js');

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (filename.trim()) {
            onCreateFile(filename.trim(), fileExtension.trim() || "js");
            setFilename('');
            setFileExtension('js');
            onClose();
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New File</DialogTitle>
                    <DialogDescription>Enter a name for the new file and select the file extension.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className='space-y-2'>
                        <Label htmlFor="filename">
                            Filename
                        </Label>
                        <Input
                            id="filename"
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            autoFocus
                            placeholder='main'
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label htmlFor="fileExtension">
                            File Extension
                        </Label>
                        <Input
                            id="fileExtension"
                            value={fileExtension}
                            onChange={(e) => setFileExtension(e.target.value)}
                            placeholder='js'
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!filename.trim()}>
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

interface NewFolderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateFolder: (folderName: string) => void;
}

function NewFolderDialog({ isOpen, onClose, onCreateFolder }: NewFolderDialogProps) {
    const [folderName, setFolderName] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (folderName.trim()) {
            onCreateFolder(folderName.trim());
            setFolderName('');
            onClose();
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                    <DialogDescription>Enter a name for the new folder.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className='space-y-2'>
                        <Label htmlFor="folderName">
                            Folder Name
                        </Label>
                        <Input
                            id="folderName"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            autoFocus
                            placeholder='components'
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!folderName.trim()}>
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

interface RenameFileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentFilename: string;
    currentExtension: string;
    onRename: (newFilename: string, newExtension: string) => void;
}

function RenameFileDialog({ isOpen, onClose, currentFilename, currentExtension, onRename }: RenameFileDialogProps) {
    const [filename, setFilename] = React.useState(currentFilename);
    const [extension, setExtension] = React.useState(currentExtension);

    React.useEffect(() => {
        setFilename(currentFilename);
        setExtension(currentExtension);
    }, [currentFilename, currentExtension, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (filename.trim()) {
            onRename(filename.trim(), extension.trim());
            onClose();
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename File</DialogTitle>
                    <DialogDescription>Enter a new name for the file.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className='space-y-2'>
                        <Label htmlFor="rename-filename">
                            Filename
                        </Label>
                        <Input
                            id="rename-filename"
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label htmlFor="rename-extension">
                            Extension
                        </Label>
                        <Input
                            id="rename-extension"
                            value={extension}
                            onChange={(e) => setExtension(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!filename.trim()}>
                            Rename
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

interface RenameFolderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentName: string;
    onRenameFolder: (newName: string) => void;
}

function RenameFolderDialog({ isOpen, onClose, currentName, onRenameFolder }: RenameFolderDialogProps) {
    const [folderName, setFolderName] = React.useState(currentName);

    React.useEffect(() => {
        setFolderName(currentName);
    }, [currentName, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (folderName.trim()) {
            onRenameFolder(folderName.trim());
            onClose();
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename Folder</DialogTitle>
                    <DialogDescription>Enter a new name for the folder.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className='space-y-2'>
                        <Label htmlFor="rename-folder">
                            Folder Name
                        </Label>
                        <Input
                            id="rename-folder"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!folderName.trim()}>
                            Rename
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

interface DeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    itemType: 'file' | 'folder';
}

function DeleteDialog({ isOpen, onClose, onConfirm, itemName, itemType }: DeleteDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete {itemType === 'file' ? 'File' : 'Folder'}</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={onConfirm}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default TemplateNode
