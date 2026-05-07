import { apiClient } from "@/services/api/client";
import { PlannerTask } from "./planner.types";

export const plannerService = {
  getTasks: async (): Promise<PlannerTask[]> => {
    const { data } = await apiClient.get<any[]>("/planner");
    return data.map((dto) => mapDtoToTask(dto));
  },
  createTask: async (task: Omit<PlannerTask, "id">): Promise<PlannerTask> => {
    const dto = mapTaskToDto(task);
    const { data } = await apiClient.post<any>("/planner", dto);
    return mapDtoToTask(data);
  },
  updateTask: async (id: string, updates: Partial<PlannerTask>): Promise<PlannerTask> => {
    const { data: existingDto } = await apiClient.get<any>(`/planner/${id}`);
    const partialDto: any = {};
    if (updates.title !== undefined) partialDto.title = updates.title;
    if (updates.note !== undefined) partialDto.description = updates.note;
    if (updates.date !== undefined) partialDto.taskDate = updates.date ? new Date(updates.date).toISOString() : null;
    if (updates.completed !== undefined) partialDto.isCompleted = updates.completed;
    if (updates.important !== undefined) partialDto.priority = updates.important ? 2 : 0;
    if (updates.reminderDate !== undefined) partialDto.reminderTime = updates.reminderDate ? new Date(updates.reminderDate).toISOString() : null;
    if (updates.category !== undefined) partialDto.category = updates.category;
    const updatedDto = { ...existingDto, ...partialDto };
    const { data } = await apiClient.put<any>(`/planner/${id}`, updatedDto);
    return mapDtoToTask(data);
  },
  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/planner/${id}`);
  },
};

function mapDtoToTask(dto: any): PlannerTask {
  return {
    id: dto.id,
    title: dto.title || "",
    important: dto.priority === 2, // Assuming Priority 2 is High/Important
    completed: dto.isCompleted || false,
    note: dto.description || "",
    date: dto.taskDate ? new Date(dto.taskDate).toISOString() : null,
    reminderDate: dto.reminderTime ? new Date(dto.reminderTime).toISOString() : null,
    category: dto.category || null,
  };
}

function mapTaskToDto(task: PlannerTask): any {
  return {
    title: task.title,
    description: task.note,
    taskDate: task.date ? new Date(task.date).toISOString() : new Date().toISOString(),
    isCompleted: task.completed,
    priority: task.important ? 2 : 0, // High or Normal
    reminderTime: task.reminderDate ? new Date(task.reminderDate).toISOString() : null,
    category: task.category,
    hasTime: !!task.date && task.date.includes("T"),
    recurrence: 0,
    icon: null,
  };
}