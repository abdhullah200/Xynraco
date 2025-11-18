export type Starmark = {
  isMarked?: boolean;
};

export type PlaygroundItem = {
  id: string;
  title: string;
  template?: string;
  Starmark?: Starmark[];
};

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
