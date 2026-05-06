export type Specialization =
  | "CBT"
  | "Trauma"
  | "Relacje"
  | "Dzieci"
  | "Biznes"
  | "Mindfulness"
  | "EMDR"
  | "Depresja"
  | "Lęk"
  | "ADHD";

export type FilterCategory =
  | "Wszyscy"
  | "CBT"
  | "Trauma"
  | "Relacje"
  | "Dzieci"
  | "Biznes";

export interface Review {
  author: string;
  text: string;
  rating: number;
  date: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: number;
}

export interface Psychologist {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  specialty: string;
  bio: string;
  approach: string;
  experience: number;
  sessionsCount: number;
  rating: number;
  reviewsCount: number;
  pricePerSession: number;
  sessionDuration: number;
  sessionFormats: string[];
  languages: string[];
  specializations: Specialization[];
  certifications: string[];
  education: Education[];
  avatarColor: string;
  photo?: { uri: string } | number;
  nextAvailable: string;
  availableToday: boolean;
  filterCategory: FilterCategory;
  reviews: Review[];
}
