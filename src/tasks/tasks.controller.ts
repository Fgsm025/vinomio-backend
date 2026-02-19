import { Controller, Get, Post, Patch, Delete, Param, Query, Body, ParseUUIDPipe } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CompleteTaskDto } from './dto/complete-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Query('farmId') farmId: string, @Query('cropCycleId') cropCycleId?: string) {
    if (!farmId) {
      throw new Error('farmId is required');
    }
    return this.tasksService.findAll(farmId, cropCycleId);
  }

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Post(':id/complete')
  complete(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CompleteTaskDto) {
    return this.tasksService.complete(id, dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.remove(id);
  }
}
