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
  updateTask: async (id: string, task: Partial<PlannerTask>): Promise<PlannerTask> => {
    // Requires mapping the partial fields or fetching current task first
    // In our case we always pass the full task on update in the UI but let's assume partial is possible
    const { data: existingDto } = await apiClient.get<any>(`/planner/${id}`);
    const updatedDto = { ...existingDto, ...mapTaskToDto(task as PlannerTask) };
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