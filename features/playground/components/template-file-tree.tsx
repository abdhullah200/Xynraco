"use client"
import React from 'react'
import { TemplateFolder, TemplateItem, TemplateFile } from '../lib/path-to-json'
import { FilePlus, PlusIcon } from 'lucide-react'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarRail } from '@/components/ui/sidebar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import TemplateNode from './template-node'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { set } from 'zod'

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
    const [isNewFileModalOpen, setIsNewFileModalOpen] = React.useState(false);
    const [isNewFolderModalOpen, setIsNewFolderModalOpen] = React.useState(false);

    const handleAddRootFile = ()=>{
        setIsNewFileModalOpen(true);  
    }

    const handleAddRootFolder = ()=>{
        setIsNewFolderModalOpen(true);
    }

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
                        <DropdownMenuItem onClick={handleAddRootFile} className="flex items-center">
                            <FilePlus className='mr-2 h-4 w-4'/>
                            New File
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleAddRootFolder} className="flex items-center">
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
        <SidebarRail/>
        <NewFileDialog
        isOpen={isNewFileModalOpen}
        onClose={() => setIsNewFileModalOpen(false)}
        onCreateFile={() => {}}
        />
        <NewFolderDialog
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        onCreateFolder={() => {}}
        />

    </Sidebar>
  )
}

export default TemplateFileTree;

interface NewFileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateFile: (filename: string, fileExtension: string) => void;
}

export function NewFileDialog({ isOpen, onClose, onCreateFile }: NewFileDialogProps) {
    const [filename, setFilename] = React.useState('');
    const [fileExtension, setFileExtension] = React.useState('');

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (filename.trim()) {
            onCreateFile(filename.trim(), fileExtension.trim() || "js")
            setFilename('')
            setFileExtension('js')
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New File</DialogTitle>
                    <DialogDescription>Enter a name for the new file and select the file extension.</DialogDescription>
                    <form onSubmit={handleCreate}>
                        <div className="mt-4 flex flex-col gap-4">
                            <div className='grid grid-cols-2 gap-4'>
                                <Label htmlFor="filename" className='text-right'>
                                    Filename
                                    </Label>
                                    <Input
                                        id="filename"
                                        value={filename}
                                        onChange={(e) => setFilename(e.target.value)}
                                        className='col-span-2'
                                        autoFocus
                                        placeholder='mai'
                                    />
                            </div>
                            <div className='grid grid-cols-3 items-center gap-4'>
                                <Label htmlFor="fileExtension" className='text-right'>
                                    File Extension
                                </Label>
                                <Input
                                    id="fileExtension"
                                    value={fileExtension}
                                    onChange={(e) => setFileExtension(e.target.value)}
                                    className='col-span-2'
                                    placeholder='js'
                                />
                            </div>
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
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

interface NewFolderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateFolder: (folderName: string) => void;
} 

export function NewFolderDialog({ isOpen, onClose, onCreateFolder }: NewFolderDialogProps) {
    const [folderName, setFolderName] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (folderName.trim()) {
            onCreateFolder(folderName.trim())
            setFolderName('')
        }
    }
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                    <DialogDescription>Enter a name for the new folder.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="mt-4 flex flex-col gap-4">
                            <div className='grid grid-cols-2 gap-4'>
                                <Label htmlFor="folderName" className='text-right'>
                                    Folder Name
                                    </Label>
                                    <Input
                                        id="folderName"
                                        value={folderName}
                                        onChange={(e) => setFolderName(e.target.value)}
                                        className='col-span-2'
                                        autoFocus
                                        placeholder='NewFolder'
                                    />
                            </div>
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
    onRenameFile: (newFilename: string, newExtension: string) => void;
    currentFilename: string;
    currentExtension: string;
}
export function RenameFileDialog({ isOpen, onClose, onRenameFile, currentFilename, currentExtension }: RenameFileDialogProps) {
    const [filename, setFilename] = React.useState(currentFilename);
    const [fileExtension, setFileExtension] = React.useState(currentExtension);

    React.useEffect(() => {
        if (isOpen) {
            setFilename(currentFilename);
            setFileExtension(currentExtension);
        }
    }, [isOpen, currentFilename, currentExtension]);

    const handleRename = (e: React.FormEvent) => {
        e.preventDefault();
        if (filename.trim()) {
            onRenameFile(filename.trim(), fileExtension.trim() || "js");
        }
    }
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename File</DialogTitle>
                    <DialogDescription>Enter a new name for the file and select the file extension.</DialogDescription>
                    <form onSubmit={handleRename}>
                        <div className="mt-4 flex flex-col gap-4">
                            <div className='grid grid-cols-2 gap-4'>
                                <Label htmlFor="filename" className='text-right'>
                                    Filename
                                    </Label>
                                    <Input
                                        id="filename"
                                        value={filename}
                                        onChange={(e) => setFilename(e.target.value)}
                                        className='col-span-2'
                                        autoFocus
                                        placeholder='main'
                                    />
                            </div>
                            <div className='grid grid-cols-3 items-center gap-4'>
                                <Label htmlFor="fileExtension" className='text-right'>
                                    File Extension
                                </Label>
                                <Input
                                    id="fileExtension"
                                    value={fileExtension}
                                    onChange={(e) => setFileExtension(e.target.value)}
                                    className='col-span-2'
                                    placeholder='js'
                                />
                            </div>
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
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export function RenameFolderDialog({ isOpen, onClose, onRenameFolder, currentFolderName }: { isOpen: boolean; onClose: () => void; onRenameFolder: (newFolderName: string) => void; currentFolderName: string; }) {
    const [folderName, setFolderName] = React.useState(currentFolderName);
    React.useEffect(() => {
        if (isOpen) {
            setFolderName(currentFolderName);
        }
    }, [isOpen, currentFolderName]);

    const handleRename = (e: React.FormEvent) => {
        e.preventDefault();
        if (folderName.trim()) {
            onRenameFolder(folderName.trim());
        }
    }
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename Folder</DialogTitle>
                    <DialogDescription>Enter a new name for the folder.</DialogDescription>
                    <form onSubmit={handleRename}>
                        <div className="mt-4 flex flex-col gap-4">
                            <div className='grid grid-cols-2 gap-4'>
                                <Label htmlFor="folderName" className='text-right'>
                                    Folder Name
                                    </Label>
                                    <Input
                                        id="folderName"
                                        value={folderName}
                                        onChange={(e) => setFolderName(e.target.value)}
                                        className='col-span-2'
                                        autoFocus
                                        placeholder='NewFolder'
                                    />
                            </div>
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
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}