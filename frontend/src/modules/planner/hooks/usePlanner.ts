import { useState, useEffect } from "react";
import { plannerService } from "../planner.service";
import { PlannerTask } from "../planner.types";
import { Alert } from "react-native";

export function usePlanner() {
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const data = await plannerService.getTasks();
      setTasks(data);
    } catch (e) {
      console.error("Failed to load tasks", e);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (task: Omit<PlannerTask, "id">) => {
    try {
      const created = await plannerService.createTask(task);
      setTasks((prev) => [created, ...prev]);
    } catch (e) {
      console.error("Failed to create task", e);
      Alert.alert("Błąd", "Nie udało się utworzyć zadania.");
    }
  };

  const updateExistingTask = async (id: string, updates: Partial<PlannerTask>) => {
    try {
      const updated = await plannerService.updateTask(id, updates as PlannerTask);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (e) {
      console.error("Failed to update task", e);
      Alert.alert("Błąd", "Nie udało się zaktualizować zadania.");
    }
  };

  const removeTask = async (id: string) => {
    try {
      await plannerService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.error("Failed to delete task", e);
      Alert.alert("Błąd", "Nie udało się usunąć zadania.");
    }
  };

  return {
    tasks,
    isLoading,
    addTask,
    updateTask: updateExistingTask,
    removeTask,
    refreshTasks: loadTasks,
  };
}
