export type NoteStatus = 'none' | 'active' | 'onHold' | 'completed' | 'dropped';

export interface Note {
  id: string;
  title: string;
  content: string;
  notebookId: string;
  tags: string[];
  status: NoteStatus;
  pinned: boolean;
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
