import {
  type Project as PrismaProject,
  type Task as PrismaTask,
  type User,
  type ProjectStatus as PrismaProjectStatus,
} from "@prisma/client";

export const TaskStatus = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export interface Project extends PrismaProject {
  tasks?: Task[];
  user?: User;
}

export interface Task extends PrismaTask {
  project?: Project;
}

export type ProjectWithRelations = Project & {
  tasks: Task[];
  user: User;
};

export type TaskWithRelations = Task & {
  project: Project;
};

export type ProjectStatus = PrismaProjectStatus;
