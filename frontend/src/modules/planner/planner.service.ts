// ...existing code...
import { apiClient } from "../../services/api/client";
import { PlannerTask } from "./planner.types";

const mapToPlannerTask = (dto: any): PlannerTask => ({
  id: dto.id,
  title: dto.title,
  important: dto.priority === 1 || dto.priority === "High",
  completed: dto.isCompleted,
  note: dto.description || "",
  date: dto.taskDate,
  reminderDate: dto.reminderTime || null,
  category: dto.category || null,
});

export const plannerService = {
  async getTasks(): Promise<PlannerTask[]> {
    const res = await apiClient.get("/planner");
    return res.data.map(mapToPlannerTask);
  },

  async createTask(data: Partial<PlannerTask>): Promise<PlannerTask> {
    const payload = {
      title: data.title || "",
      description: data.note || null,
      taskDate: data.date || new Date().toISOString(),
      hasTime: !!data.date,
      reminderTime: data.reminderDate || null,
      category: data.category || null,
      priority: data.important ? 1 : 0,
      recurrence: 0,
    };
    const res = await apiClient.post("/planner", payload);
    return mapToPlannerTask(res.data);
  },

  async updateTask(id: string, data: Partial<PlannerTask>): Promise<PlannerTask> {
    const existingRes = await apiClient.get(`/planner/${id}`);
    const existing = existingRes.data;

    const payload = {
      title: data.title !== undefined ? data.title : existing.title,
      description: data.note !== undefined ? data.note : existing.description,
      taskDate: data.date !== undefined ? data.date : existing.taskDate,
      hasTime: existing.hasTime,
      reminderTime: data.reminderDate !== undefined ? data.reminderDate : existing.reminderTime,
      category: data.category !== undefined ? data.category : existing.category,
      priority: data.important !== undefined ? (data.important ? 1 : 0) : existing.priority,
      recurrence: existing.recurrence,
      isCompleted: data.completed !== undefined ? data.completed : existing.isCompleted,
    };

    const res = await apiClient.put(`/planner/${id}`, payload);
    return mapToPlannerTask(res.data);
  },

  async toggleComplete(id: string): Promise<PlannerTask> {
    const existingRes = await apiClient.get(`/planner/${id}`);
    const isCompleted = !existingRes.data.isCompleted;
    
    const res = await apiClient.patch(`/planner/${id}/complete?isCompleted=${isCompleted}`);
    return mapToPlannerTask(res.data);
  },

  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/planner/${id}`);
  }
};
// ...existing code...