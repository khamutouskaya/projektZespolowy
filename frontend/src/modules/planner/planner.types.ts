export type PlannerTask = {
  id: string;
  title: string;
  important: boolean;
  completed: boolean;
  note: string;
  date: string | null;
  reminderDate: string | null;
};