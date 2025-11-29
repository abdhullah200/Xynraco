"use server";

import { db } from "@/lib/db";

export type Starmark = {
  isMarked?: boolean;
};

export type PlaygroundItem = {
  id: string;
  title: string;
  template?: string;
  Starmark?: Starmark[];
  name?: string;
};

// Template file structures for different project types
const TEMPLATE_STRUCTURES: Record<string, any> = {
  REACT: {
    folderName: "Root",
    items: [
      { filename: "package", fileExtension: "json", content: `{
  "name": "react-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}` },
      { filename: "index", fileExtension: "html", content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>` },
      { filename: "vite.config", fileExtension: "js", content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})` },
      {
        folderName: "src",
        items: [
          { filename: "main", fileExtension: "jsx", content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)` },
          { filename: "App", fileExtension: "jsx", content: `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>React + Vite</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </div>
  )
}

export default App` },
          { filename: "App", fileExtension: "css", content: `.App {
  text-align: center;
  padding: 2rem;
}

.card {
  padding: 2em;
}

button {
  font-size: 1em;
  padding: 0.6em 1.2em;
  cursor: pointer;
}` },
          { filename: "index", fileExtension: "css", content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}` },
        ]
      },
      {
        folderName: "public",
        items: [
          { filename: "favicon", fileExtension: "ico", content: "" },
        ]
      }
    ]
  },
  NEXTJS: {
    folderName: "Root",
    items: [
      { filename: "package", fileExtension: "json", content: `{
  "name": "nextjs-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}` },
      { filename: "next.config", fileExtension: "js", content: `/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig` },
      {
        folderName: "app",
        items: [
          { filename: "layout", fileExtension: "tsx", content: `export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}` },
          { filename: "page", fileExtension: "tsx", content: `export default function Home() {
  return (
    <main>
      <h1>Welcome to Next.js!</h1>
    </main>
  )
}` },
          { filename: "globals", fileExtension: "css", content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}` },
        ]
      },
      {
        folderName: "public",
        items: [
          { filename: "favicon", fileExtension: "ico", content: "" },
        ]
      }
    ]
  },
  EXPRESS: {
    folderName: "Root",
    items: [
      { filename: "package", fileExtension: "json", content: `{
  "name": "express-app",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}` },
      { filename: "index", fileExtension: "js", content: `const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Express!' });
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express API!' });
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});` },
      {
        folderName: "routes",
        items: [
          { filename: "api", fileExtension: "js", content: `const express = require('express');
const router = express.Router();

router.get('/users', (req, res) => {
  res.json([{ id: 1, name: 'User 1' }]);
});

module.exports = router;` },
        ]
      }
    ]
  },
  VUE: {
    folderName: "Root",
    items: [
      { filename: "package", fileExtension: "json", content: `{
  "name": "vue-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "vue": "^3.3.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-vue": "^4.0.0"
  }
}` },
      { filename: "index", fileExtension: "html", content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Vue App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>` },
      {
        folderName: "src",
        items: [
          { filename: "main", fileExtension: "js", content: `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')` },
          { filename: "App", fileExtension: "vue", content: `<template>
  <div class="app">
    <h1>{{ message }}</h1>
    <button @click="count++">Count: {{ count }}</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello Vue!',
      count: 0
    }
  }
}
</script>

<style scoped>
.app {
  text-align: center;
  padding: 2rem;
}
</style>` },
        ]
      }
    ]
  }
};

// Default template for unsupported types
const DEFAULT_TEMPLATE = {
  folderName: "Root",
  items: [
    { filename: "README", fileExtension: "md", content: "# New Project\n\nStart building your project here!" },
    { filename: "index", fileExtension: "js", content: "// Start coding here\nconsole.log('Hello World!');" }
  ]
};

export async function getPlaygroundById(id: string): Promise<PlaygroundItem | null> {
  try {
    const playground = await db.playground.findUnique({
      where: { id },
      include: {
        Starmark: true,
      },
    });

    if (!playground) return null;

    return {
      id: playground.id,
      title: playground.title,
      name: playground.title,
      template: playground.template || undefined,
      Starmark: playground.Starmark.map(s => ({ isMarked: s.isMarked })),
    };
  } catch (error) {
    console.error("Error fetching playground:", error);
    return null;
  }
}

export async function getTemplateStructure(playgroundId: string) {
  try {
    // First check if there are saved files in the database
    const savedFiles = await db.templateFile.findMany({
      where: { playgroundId },
      orderBy: { path: 'asc' }
    });

    // If files exist in DB, rebuild the tree structure
    if (savedFiles.length > 0) {
      return buildTreeFromFiles(savedFiles);
    }

    // Otherwise, get the default template and save it
    const playground = await db.playground.findUnique({
      where: { id: playgroundId },
    });

    if (!playground) return DEFAULT_TEMPLATE;

    const templateType = playground.template;
    const templateStructure = TEMPLATE_STRUCTURES[templateType] || DEFAULT_TEMPLATE;

    // Save the default template to the database
    await saveTemplateToDb(playgroundId, templateStructure);

    return templateStructure;
  } catch (error) {
    console.error("Error fetching template structure:", error);
    return DEFAULT_TEMPLATE;
  }
}

// Helper to build tree structure from flat file list
function buildTreeFromFiles(files: any[]): any {
  const root: any = { folderName: "Root", items: [] };
  const folderMap: Record<string, any> = { "": root };

  // First pass: create all folders
  files.filter(f => f.isFolder).forEach(folder => {
    const folderObj = { folderName: folder.filename, items: [] };
    folderMap[folder.path] = folderObj;
  });

  // Second pass: organize folders into hierarchy
  files.filter(f => f.isFolder).forEach(folder => {
    const parent = folderMap[folder.parentPath || ""] || root;
    const folderObj = folderMap[folder.path];
    if (!parent.items.includes(folderObj)) {
      parent.items.push(folderObj);
    }
  });

  // Third pass: add files to their parent folders
  files.filter(f => !f.isFolder).forEach(file => {
    const parent = folderMap[file.parentPath || ""] || root;
    parent.items.push({
      filename: file.filename,
      fileExtension: file.extension,
      content: file.content
    });
  });

  return root;
}

// Helper to save template structure to DB
async function saveTemplateToDb(playgroundId: string, structure: any, parentPath: string = "") {
  const items = structure.items || [];
  
  for (const item of items) {
    if ('folderName' in item) {
      // It's a folder
      const folderPath = parentPath ? `${parentPath}/${item.folderName}` : item.folderName;
      
      await db.templateFile.create({
        data: {
          playgroundId,
          path: folderPath,
          filename: item.folderName,
          extension: "",
          content: "",
          isFolder: true,
          parentPath: parentPath || null
        }
      });
      
      // Recursively save children
      await saveTemplateToDb(playgroundId, item, folderPath);
    } else {
      // It's a file
      const filePath = parentPath ? `${parentPath}/${item.filename}.${item.fileExtension}` : `${item.filename}.${item.fileExtension}`;
      
      await db.templateFile.create({
        data: {
          playgroundId,
          path: filePath,
          filename: item.filename,
          extension: item.fileExtension,
          content: item.content || "",
          isFolder: false,
          parentPath: parentPath || null
        }
      });
    }
  }
}

// Add a new file to the database
export async function addFileToPlayground(
  playgroundId: string, 
  filename: string, 
  extension: string, 
  content: string = "",
  parentPath: string = ""
) {
  try {
    const filePath = parentPath ? `${parentPath}/${filename}.${extension}` : `${filename}.${extension}`;
    
    await db.templateFile.create({
      data: {
        playgroundId,
        path: filePath,
        filename,
        extension,
        content,
        isFolder: false,
        parentPath: parentPath || null
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error adding file:", error);
    return { success: false, error: "Failed to add file" };
  }
}

// Add a new folder to the database
export async function addFolderToPlayground(
  playgroundId: string,
  folderName: string,
  parentPath: string = ""
) {
  try {
    const folderPath = parentPath ? `${parentPath}/${folderName}` : folderName;
    
    await db.templateFile.create({
      data: {
        playgroundId,
        path: folderPath,
        filename: folderName,
        extension: "",
        content: "",
        isFolder: true,
        parentPath: parentPath || null
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error adding folder:", error);
    return { success: false, error: "Failed to add folder" };
  }
}

// Update file content
export async function updateFileContent(
  playgroundId: string,
  filePath: string,
  content: string
) {
  try {
    await db.templateFile.updateMany({
      where: { playgroundId, path: filePath },
      data: { content, updatedAt: new Date() }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating file:", error);
    return { success: false, error: "Failed to update file" };
  }
}

// Delete a file or folder
export async function deleteFileFromPlayground(
  playgroundId: string,
  filePath: string
) {
  try {
    // Delete the file/folder and all children (for folders)
    await db.templateFile.deleteMany({
      where: {
        playgroundId,
        OR: [
          { path: filePath },
          { path: { startsWith: `${filePath}/` } }
        ]
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting file:", error);
    return { success: false, error: "Failed to delete file" };
  }
}

// Rename a file
export async function renameFileInPlayground(
  playgroundId: string,
  oldPath: string,
  newFilename: string,
  newExtension: string
) {
  try {
    const pathParts = oldPath.split('/');
    pathParts.pop(); // Remove old filename
    const parentPath = pathParts.join('/');
    const newPath = parentPath ? `${parentPath}/${newFilename}.${newExtension}` : `${newFilename}.${newExtension}`;

    await db.templateFile.updateMany({
      where: { playgroundId, path: oldPath },
      data: { 
        path: newPath,
        filename: newFilename,
        extension: newExtension,
        updatedAt: new Date()
      }
    });
    
    return { success: true, newPath };
  } catch (error) {
    console.error("Error renaming file:", error);
    return { success: false, error: "Failed to rename file" };
  }
}

// Rename a folder (and update all children paths)
export async function renameFolderInPlayground(
  playgroundId: string,
  oldPath: string,
  newFolderName: string
) {
  try {
    const pathParts = oldPath.split('/');
    pathParts.pop(); // Remove old folder name
    const parentPath = pathParts.join('/');
    const newPath = parentPath ? `${parentPath}/${newFolderName}` : newFolderName;

    // Update the folder itself
    await db.templateFile.updateMany({
      where: { playgroundId, path: oldPath },
      data: { 
        path: newPath,
        filename: newFolderName,
        updatedAt: new Date()
      }
    });

    // Update all children paths
    const children = await db.templateFile.findMany({
      where: { 
        playgroundId,
        path: { startsWith: `${oldPath}/` }
      }
    });

    for (const child of children) {
      const newChildPath = child.path.replace(oldPath, newPath);
      const newParentPath = child.parentPath?.replace(oldPath, newPath) || null;
      
      await db.templateFile.update({
        where: { id: child.id },
        data: { 
          path: newChildPath,
          parentPath: newParentPath,
          updatedAt: new Date()
        }
      });
    }
    
    return { success: true, newPath };
  } catch (error) {
    console.error("Error renaming folder:", error);
    return { success: false, error: "Failed to rename folder" };
  }
}

export async function getAllPlaygroundForUser(): Promise<PlaygroundItem[]> {
  return [
    {
      id: "pg-1",
      title: "Starter Playground",
      template: "REACT",
      Starmark: [{ isMarked: true }],
    },
    {
      id: "pg-2",
      title: "API Prototype",
      template: "EXPRESS",
      Starmark: [{ isMarked: false }],
    },
  ];
}

export async function deleteProjectById(id: string): Promise<void> {
  // Placeholder for delete functionality
  console.log(`Delete project with id: ${id}`);
}

export async function editProjectById(id: string, data: { title: string; description: string }): Promise<void> {
  // Placeholder for edit functionality
  console.log(`Edit project with id: ${id}`, data);
}

export async function duplicateProjectById(id: string): Promise<void> {
  // Placeholder for duplicate functionality
  console.log(`Duplicate project with id: ${id}`);
}

export async function createPlayground(template: string, name: string): Promise<PlaygroundItem | null> {
  // Placeholder for create functionality
  console.log(`Create playground with template: ${template}, name: ${name}`);
  
  // Return a mock created playground
  return {
    id: `pg-${Date.now()}`,
    title: name,
    template: template,
    Starmark: [{ isMarked: false }],
  };
}
