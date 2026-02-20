export interface Note {
  id: string;
  title: string;
  content: string;
  notebookId: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Notebook {
  id: string;
  name: string;
  color: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}
