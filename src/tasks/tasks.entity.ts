export enum TasksStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}
export class Task {
  id: number;
  title: string;
  description: string;
  status: TasksStatus;
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date;
}
