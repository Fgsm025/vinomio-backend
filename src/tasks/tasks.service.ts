import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { getNextTask, getConditionOptionsForNode } from '../services/workflow-to-tasks';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaskDto) {
    const data: any = {
      title: dto.title,
      description: dto.description,
      status: dto.status || 'todo',
      sourceType: dto.sourceType || 'manual',
      farmId: dto.farmId,
    };

    if (dto.cropCycleId) data.cropCycleId = dto.cropCycleId;
    if (dto.workflowId) data.workflowId = dto.workflowId;
    if (dto.workflowName) data.workflowName = dto.workflowName;
    if (dto.cropCycleName) data.cropCycleName = dto.cropCycleName;
    if (dto.plotName) data.plotName = dto.plotName;
    if (dto.nodeId) data.nodeId = dto.nodeId;
    if (dto.nodeType) data.nodeType = dto.nodeType;
    if (dto.nodeData) data.nodeData = dto.nodeData;
    if (dto.conditionOptions) data.conditionOptions = dto.conditionOptions;
    if (dto.conditionAnswer) data.conditionAnswer = dto.conditionAnswer;
    if (dto.nextNodeIdOnYes) data.nextNodeIdOnYes = dto.nextNodeIdOnYes;
    if (dto.nextNodeIdOnNo) data.nextNodeIdOnNo = dto.nextNodeIdOnNo;
    if (dto.waitDays) data.waitDays = dto.waitDays;
    if (dto.stageIndex !== undefined) data.stageIndex = dto.stageIndex;
    if (dto.assignedTo) data.assignedTo = dto.assignedTo;
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);

    return this.prisma.task.create({ data });
  }

  async findAll(farmId: string, cropCycleId?: string, assignedTo?: string) {
    const where: Prisma.TaskWhereInput = { farmId };
    if (cropCycleId) where.cropCycleId = cropCycleId;
    if (assignedTo) where.assignedTo = assignedTo;
    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    const needEnrich = tasks.filter(
      (t) =>
        t.sourceType === 'workflow_node' &&
        t.workflowId &&
        t.nodeId &&
        (!t.conditionOptions || t.conditionOptions.length === 0) &&
        t.status !== 'done'
    );
    if (needEnrich.length === 0) return tasks;
    const workflowIds = [...new Set(needEnrich.map((t) => t.workflowId!).filter(Boolean))];
    const workflows = await this.prisma.workflow.findMany({
      where: { id: { in: workflowIds } },
    });
    const workflowMap = new Map(workflows.map((w) => [w.id, w]));
    return tasks.map((task) => {
      if (
        task.sourceType !== 'workflow_node' ||
        !task.workflowId ||
        !task.nodeId ||
        (task.conditionOptions && task.conditionOptions.length > 0)
      ) {
        return task;
      }
      const w = workflowMap.get(task.workflowId);
      if (!w) return task;
      const nodes = (w.nodes as any[]) || [];
      const edges = (w.edges as any[]) || [];
      const options = getConditionOptionsForNode(task.nodeId, nodes, edges);
      if (options.length === 0) return task;
      return { ...task, conditionOptions: options };
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });
    if (!task) {
      throw new NotFoundException(`Task with id "${id}" not found`);
    }
    if (
      task.sourceType === 'workflow_node' &&
      task.workflowId &&
      task.nodeId &&
      (!task.conditionOptions || task.conditionOptions.length === 0) &&
      task.status !== 'done'
    ) {
      const w = await this.prisma.workflow.findUnique({
        where: { id: task.workflowId },
      });
      if (w) {
        const nodes = (w.nodes as any[]) || [];
        const edges = (w.edges as any[]) || [];
        const options = getConditionOptionsForNode(task.nodeId, nodes, edges);
        if (options.length > 0) return { ...task, conditionOptions: options };
      }
    }
    return task;
  }

  async complete(id: string, dto: CompleteTaskDto) {
    const task = await this.findOne(id);

    const updateData: Prisma.TaskUpdateInput = {
      status: 'done',
    };
    if (dto.answer) {
      updateData.conditionAnswer = dto.answer;
    }

    const completedTask = await this.prisma.task.update({
      where: { id },
      data: updateData,
    });

    let nextTask: Prisma.TaskGetPayload<{}> | null = null;

    if (
      task.sourceType === 'workflow_node' &&
      task.workflowId &&
      task.nodeId
    ) {
      const workflow = await this.prisma.workflow.findUnique({
        where: { id: task.workflowId },
      });

      if (workflow) {
        const nodes = workflow.nodes as any[];
        const edges = workflow.edges as any[];

        const nextTaskData = getNextTask(
          task.nodeId,
          dto.answer,
          nodes,
          edges,
          task.cropCycleId || '',
          task.workflowId,
          task.workflowName || workflow.name,
          task.cropCycleName || '',
          task.plotName || '',
          task.stageIndex || 0,
          task.farmId,
        );

        if (nextTaskData) {
          nextTask = await this.prisma.task.create({ data: nextTaskData });
        }
      }
    }

    return {
      completed: completedTask,
      created: nextTask,
    };
  }

  async update(id: string, dto: UpdateTaskDto) {
    await this.findOne(id);

    const updateData: Prisma.TaskUpdateInput = {};
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.assignedTo !== undefined) updateData.assignedTo = dto.assignedTo;
    if (dto.dueDate !== undefined) updateData.dueDate = new Date(dto.dueDate);
    if (dto.nodeData !== undefined) updateData.nodeData = dto.nodeData as Prisma.InputJsonValue;
    if (dto.priority !== undefined) updateData.priority = dto.priority;

    return this.prisma.task.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.task.delete({ where: { id } });
  }
}
