interface TemplateItem {
  filename: string;
  fileExtension: string;
  content: string;
  folderName?: string;
  items?: TemplateItem[];
}

interface WebContainerFile {
  file: {
    contents: string;
  };
}

interface WebContainerDirectory {
  directory: {
    [key: string]: WebContainerFile | WebContainerDirectory;
  };
}

type WebContainerFileSystem = Record<string, WebContainerFile | WebContainerDirectory>;

export function transformToWebContainerFormat(template: { folderName: string; items: TemplateItem[] }): WebContainerFileSystem {
  function processItem(item: TemplateItem): WebContainerFile | WebContainerDirectory {
    if (item.folderName && item.items) {
      // This is a directory
      const directoryContents: WebContainerFileSystem = {};
      
      item.items.forEach(subItem => {
        const key = subItem.fileExtension 
          ? `${subItem.filename}.${subItem.fileExtension}`
          : subItem.folderName!;
        directoryContents[key] = processItem(subItem);
      });

      return {
        directory: directoryContents
      };
    } else {
      // This is a file - ensure content is a valid string
      let fileContent = item.content || '';
      
      // Validate that content is actually a string
      if (typeof fileContent !== 'string') {
        console.warn(`Invalid content for ${item.filename}, converting to string`);
        fileContent = String(fileContent);
      }
      
      // Check for potential issues with large files
      if (fileContent.length > 5000000) {
        console.warn(`Very large file: ${item.filename} (${fileContent.length} bytes)`);
      }
      
      return {
        file: {
          contents: fileContent
        }
      };
    }
  }

  const result: WebContainerFileSystem = {};
  
  template.items.forEach(item => {
    const key = item.fileExtension 
      ? `${item.filename}.${item.fileExtension}`
      : item.folderName!;
    result[key] = processItem(item);
  });

  return result;
}