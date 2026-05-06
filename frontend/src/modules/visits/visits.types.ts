export type VisitStatus = "upcoming" | "completed" | "cancelled";

export interface Visit {
  id: string;
  psychologistId: string;
  psychologistName: string;
  psychologistTitle: string;
  psychologistSpecialty: string;
  psychologistAvatarColor: string;
  psychologistPhoto?: { uri: string } | number;
  date: string;
  time: string;
  duration: number;
  format: string;
  sessionType: "first" | "follow";
  price: number;
  status: VisitStatus;
  notes?: string;
}
