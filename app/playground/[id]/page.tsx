"use client";
import { SidebarInset, SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import TemplateFileTree from "@/features/playground/components/template-file-tree";
import { 
    getPlaygroundById, 
    getTemplateStructure, 
    addFileToPlayground, 
    addFolderToPlayground,
    deleteFileFromPlayground,
    renameFileInPlayground,
    renameFolderInPlayground
} from "@/features/playground/actions";

interface TemplateFile {
    filename: string;
    fileExtension: string;
    content: string;
}

interface TemplateFolder {
    folderName: string;
    items: (TemplateFile | TemplateFolder)[];
}

const Page = () => {
    const {id} = useParams<{id: string}>();
    const [templateData, setTemplateData] = useState<TemplateFolder | null>(null);
    const [playgroundData, setPlaygroundData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<TemplateFile | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                
                // Load playground info
                const playground = await getPlaygroundById(id);
                setPlaygroundData(playground);

                // Load template structure
                const templateStructure = await getTemplateStructure(id);
                if (templateStructure) {
                    setTemplateData(templateStructure);
                } else {
                    // Fallback to empty structure
                    setTemplateData({ folderName: "Root", items: [] });
                }
            } catch (error) {
                console.error("Error loading playground:", error);
                setTemplateData({ folderName: "Root", items: [] });
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [id]);

    // Helper function to add item to nested folder
    const addItemToFolder = useCallback((
        folder: TemplateFolder, 
        targetPath: string, 
        item: TemplateFile | TemplateFolder,
        currentPath: string = ""
    ): TemplateFolder => {
        // If this is the target folder (empty path means root)
        if (currentPath === targetPath) {
            return {
                ...folder,
                items: [...folder.items, item]
            };
        }

        // Otherwise, search in children
        return {
            ...folder,
            items: folder.items.map(child => {
                if ('items' in child) {
                    const childPath = currentPath ? `${currentPath}/${child.folderName}` : child.folderName;
                    
                    // Check if target is this folder or inside it
                    if (targetPath === childPath || targetPath.startsWith(childPath + '/')) {
                        return addItemToFolder(child, targetPath, item, childPath);
                    }
                }
                return child;
            })
        };
    }, []);

    // Handle adding a new file
    const handleAddFile = useCallback(async (file: TemplateFile, parentPath: string) => {
        // Save to database
        await addFileToPlayground(id, file.filename, file.fileExtension, file.content, parentPath);
        
        // Update local state - add to correct nested location
        setTemplateData(prev => {
            if (!prev) return prev;
            return addItemToFolder(prev, parentPath, file);
        });
    }, [id, addItemToFolder]);

    // Handle adding a new folder
    const handleAddFolder = useCallback(async (folder: TemplateFolder, parentPath: string) => {
        // Save to database
        await addFolderToPlayground(id, folder.folderName, parentPath);
        
        // Update local state - add to correct nested location
        setTemplateData(prev => {
            if (!prev) return prev;
            return addItemToFolder(prev, parentPath, folder);
        });
    }, [id, addItemToFolder]);

    // Handle file selection
    const handleFileSelect = useCallback((file: TemplateFile) => {
        setSelectedFile(file);
        console.log("Selected file:", file);
    }, []);

    // Helper function to delete item from nested structure
    const deleteItemFromFolder = useCallback((
        folder: TemplateFolder,
        targetPath: string,
        currentPath: string = ""
    ): TemplateFolder => {
        return {
            ...folder,
            items: folder.items
                .filter(child => {
                    if ('items' in child) {
                        const childPath = currentPath ? `${currentPath}/${child.folderName}` : child.folderName;
                        return childPath !== targetPath;
                    } else {
                        const filePath = currentPath 
                            ? `${currentPath}/${child.filename}.${child.fileExtension}` 
                            : `${child.filename}.${child.fileExtension}`;
                        return filePath !== targetPath;
                    }
                })
                .map(child => {
                    if ('items' in child) {
                        const childPath = currentPath ? `${currentPath}/${child.folderName}` : child.folderName;
                        if (targetPath.startsWith(childPath + '/')) {
                            return deleteItemFromFolder(child, targetPath, childPath);
                        }
                    }
                    return child;
                })
        };
    }, []);

    // Handle deleting a file
    const handleDeleteFile = useCallback(async (filePath: string) => {
        await deleteFileFromPlayground(id, filePath);
        setTemplateData(prev => {
            if (!prev) return prev;
            return deleteItemFromFolder(prev, filePath);
        });
    }, [id, deleteItemFromFolder]);

    // Handle deleting a folder
    const handleDeleteFolder = useCallback(async (folderPath: string) => {
        await deleteFileFromPlayground(id, folderPath);
        setTemplateData(prev => {
            if (!prev) return prev;
            return deleteItemFromFolder(prev, folderPath);
        });
    }, [id, deleteItemFromFolder]);

    // Helper function to rename item in nested structure
    const renameItemInFolder = useCallback((
        folder: TemplateFolder,
        targetPath: string,
        newName: string,
        isFile: boolean,
        newExtension?: string,
        currentPath: string = ""
    ): TemplateFolder => {
        return {
            ...folder,
            items: folder.items.map(child => {
                if ('items' in child) {
                    const childPath = currentPath ? `${currentPath}/${child.folderName}` : child.folderName;
                    
                    if (childPath === targetPath && !isFile) {
                        return { ...child, folderName: newName };
                    }
                    
                    if (targetPath.startsWith(childPath + '/')) {
                        return renameItemInFolder(child, targetPath, newName, isFile, newExtension, childPath);
                    }
                } else {
                    const filePath = currentPath 
                        ? `${currentPath}/${child.filename}.${child.fileExtension}` 
                        : `${child.filename}.${child.fileExtension}`;
                    
                    if (filePath === targetPath && isFile) {
                        return { 
                            ...child, 
                            filename: newName,
                            fileExtension: newExtension || child.fileExtension
                        };
                    }
                }
                return child;
            })
        };
    }, []);

    // Handle renaming a file
    const handleRenameFile = useCallback(async (oldPath: string, newFilename: string, newExtension: string) => {
        await renameFileInPlayground(id, oldPath, newFilename, newExtension);
        setTemplateData(prev => {
            if (!prev) return prev;
            return renameItemInFolder(prev, oldPath, newFilename, true, newExtension);
        });
    }, [id, renameItemInFolder]);

    // Handle renaming a folder
    const handleRenameFolder = useCallback(async (oldPath: string, newFolderName: string) => {
        await renameFolderInPlayground(id, oldPath, newFolderName);
        setTemplateData(prev => {
            if (!prev) return prev;
            return renameItemInFolder(prev, oldPath, newFolderName, false);
        });
    }, [id, renameItemInFolder]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading playground...</div>
            </div>
        );
    }

    return(
        <>
            <SidebarProvider suppressHydrationWarning>
            {templateData && (
                <TemplateFileTree 
                    data={templateData}
                    onFileSelect={handleFileSelect}
                    level={0}
                    title={playgroundData?.name || "File Explorer"}
                    onAddFile={handleAddFile}
                    onAddFolder={handleAddFolder}
                    onDeleteFile={handleDeleteFile}
                    onDeleteFolder={handleDeleteFolder}
                    onRenameFile={handleRenameFile}
                    onRenameFolder={handleRenameFolder}
                />
            )}
            <div>
                <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-m1-1"/>
                    <Separator className="mr-2 h-4" />
                    <div className="flex flex-1 items-center gap-2">
                    <div className="flex flex-col flex-1">
                        <h1>Code Playground - {id}</h1>
                        {selectedFile && (
                            <span className="text-sm text-muted-foreground">
                                Editing: {selectedFile.filename}.{selectedFile.fileExtension}
                            </span>
                        )}
                    </div>
                    </div>
                </header>
                
                {/* File Content Area */}
                <div className="p-4">
                    {selectedFile ? (
                        <div className="border rounded-lg p-4">
                            <h3 className="font-medium mb-2">
                                {selectedFile.filename}.{selectedFile.fileExtension}
                            </h3>
                            <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-96">
                                {selectedFile.content || "// Empty file"}
                            </pre>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            Select a file to view its content
                        </div>
                    )}
                </div>
                </SidebarInset>
            </div>
            </SidebarProvider>
        </>
    )
}

export default Page;