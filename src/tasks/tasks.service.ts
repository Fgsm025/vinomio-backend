import { Injectable } from '@nestjs/common';
import { TasksStatus } from './tasks.entity';

@Injectable()
export class TasksService {
  getTasks() {
    return [
      {
        id: 1,
        title: 'Task 1',
        description: 'Description 1',
        status: TasksStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: new Date(),
      },
    ];
  }
}
