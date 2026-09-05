export interface User {
  id: string;
  email: string;
  username?: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  memberships: Membership[];
  boards?: Board[];
}

export interface Membership {
  id: string;
  userId: string;
  organizationId: string;
  role: "ADMIN" | "MEMBER";
  user?: User;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  organization?: { id: string; name: string };
  sections?: Section[];
}

export interface Section {
  id: string;
  title: string;
  order: number;
  boardId: string;
}

export interface Issue {
  id: string;
  title: string;
  description?: string;
  order: number;
  sectionId: string;
  boardId: string;
  assignees: { id: string; userId: string; user: User }[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  comment: string;
  userId: string;
  issueId: string;
  user: User;
  createdAt: string;
}

export interface Invitation {
  id: string;
  email: string;
  status: string;
  organization: { id: string; name: string; description?: string };
  invitedBy: User;
}
